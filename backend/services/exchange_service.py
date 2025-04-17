import ccxt
import asyncio
import websockets
import json
import logging
import time
import random
from datetime import datetime
from dotenv import load_dotenv
import os

logger = logging.getLogger(__name__)

class ExchangeService:
    def __init__(self, api_key=None, api_secret=None, api_passphrase=None):
        # Load environment variables
        load_dotenv()
        
        # Use environment variables if not provided
        self.api_key = api_key or os.getenv('BINANCE_API_KEY')
        self.api_secret = api_secret or os.getenv('BINANCE_API_SECRET')
        self.api_passphrase = api_passphrase
        
        self.connected_clients = set()
        self.last_ticker_update = {}
        
        # Initialize exchange connections
        self.kucoin = ccxt.kucoin({
            'apiKey': self.api_key,
            'secret': self.api_secret,
            'password': self.api_passphrase,
            'enableRateLimit': True
        }) if all([self.api_key, self.api_secret, self.api_passphrase]) else ccxt.kucoin({'enableRateLimit': True})
        
        # Initialize Binance with API credentials
        binance_config = {
            'enableRateLimit': True,
            'apiKey': self.api_key,
            'secret': self.api_secret
        }
        self.binance = ccxt.binance(binance_config)
        
        # WebSocket URLs
        self.binance_ws_base = 'wss://fstream.binance.com'
        self.binance_ws_private_url = f"{self.binance_ws_base}/ws"
        self.kucoin_ws_base = 'wss://ws-api-spot.kucoin.com'
        
        # Initialize price cache
        self.price_cache = {}
        self.initialized = False
        self.last_ping_time = 0
        self.kucoin_ws_token = None
        self.kucoin_ws_endpoint = None
        
    def get_supported_exchanges(self):
        """Return list of supported exchanges"""
        return ['Binance', 'KuCoin']
        
    def get_supported_pairs(self):
        """Return list of supported trading pairs"""
        return ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT']

    async def initialize_price_cache(self):
        """Initialize price cache with data from all exchanges"""
        if self.initialized:
            return
            
        logger.info("Initializing price cache from exchanges...")
        exchanges = [
            {'name': 'Binance', 'instance': self.binance},
            {'name': 'KuCoin', 'instance': self.kucoin}
        ]
        
        pairs = self.get_supported_pairs()
        
        for exchange in exchanges:
            try:
                # Fetch tickers for all pairs
                for pair in pairs:
                    try:
                        ticker = exchange['instance'].fetch_ticker(pair)
                        
                        key = f"{exchange['name']}_{pair}"
                        self.price_cache[key] = {
                            'exchange': exchange['name'],
                            'symbol': pair,
                            'last': ticker['last'],
                            'bid': ticker['bid'],
                            'ask': ticker['ask'],
                            'volume': ticker['quoteVolume'],
                            'change24h': ticker['percentage'],
                            'timestamp': datetime.now().isoformat()
                        }
                        logger.info(f"Initialized cache for {key}: Last price: {ticker['last']}")
                    except Exception as e:
                        logger.error(f"Error fetching {pair} from {exchange['name']}: {str(e)}")
                        
                        # Add fallback data if fetch fails
                        key = f"{exchange['name']}_{pair}"
                        base_price = self._get_base_price_for_pair(pair)
                        variation = random.uniform(-0.05, 0.05) * base_price  # ±5% variation
                        price = base_price + variation
                        
                        self.price_cache[key] = {
                            'exchange': exchange['name'],
                            'symbol': pair,
                            'last': price,
                            'bid': price * 0.999,  # Slightly lower
                            'ask': price * 1.001,  # Slightly higher
                            'volume': random.uniform(10000, 100000),
                            'change24h': random.uniform(-5, 5),
                            'timestamp': datetime.now().isoformat(),
                            'is_mock': True
                        }
                        logger.warning(f"Using fallback mock data for {key}")
                        
                # Rate limiting
                await asyncio.sleep(1)
            except Exception as e:
                logger.error(f"Error initializing cache for {exchange['name']}: {str(e)}")
        
        self.initialized = True
        logger.info("Price cache initialization complete")

    def _get_base_price_for_pair(self, pair):
        """Get base price for a specific trading pair"""
        base_prices = {
            'BTC/USDT': 60000,
            'ETH/USDT': 3000,
            'XRP/USDT': 0.5,
            'SOL/USDT': 150,
            'ADA/USDT': 0.35
        }
        return base_prices.get(pair, 1.0)  # Default to 1.0 if pair not found

    def fetch_public_token(self):
        """Fetch KuCoin public websocket token"""
        try:
            response = self.kucoin.private_post_bullet_public()
            return response['data']['token'], response['data']['instanceServers']
        except Exception as e:
            logger.error(f"Error fetching KuCoin public token: {str(e)}")
            return None, None

    async def register_client(self, websocket):
        """Register a new client connection"""
        self.connected_clients.add(websocket)
        logger.info(f"Client registered. Total clients: {len(self.connected_clients)}")
        
    async def unregister_client(self, websocket):
        """Unregister a client connection"""
        self.connected_clients.remove(websocket)
        logger.info(f"Client unregistered. Total clients: {len(self.connected_clients)}")
        
    async def broadcast(self, message):
        """Broadcast a message to all connected clients"""
        if not self.connected_clients:
            return
            
        disconnected_clients = set()
        for websocket in self.connected_clients:
            try:
                await websocket.send(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to client: {str(e)}")
                disconnected_clients.add(websocket)
                
        # Remove disconnected clients
        for websocket in disconnected_clients:
            await self.unregister_client(websocket)

    async def fetch_ticker_data(self):
        """Fetch ticker data from all exchanges"""
        # Initialize cache if needed
        if not self.initialized:
            await self.initialize_price_cache()
        
        while True:
            try:
                ticker_data = []
                current_time = time.time()
                supported_pairs = self.get_supported_pairs()
                
                # First check cache and add any recent data
                for key, data in self.price_cache.items():
                    # Add cached data to ticker_data if it's fresh (less than 60 seconds old)
                    if 'timestamp' in data and not data.get('is_mock', False):
                        cache_time = datetime.fromisoformat(data['timestamp']).timestamp()
                        if current_time - cache_time < 60:  # 60 seconds freshness
                            ticker_data.append(data)
                
                # Fetch from Binance
                for pair in supported_pairs:
                    try:
                        ticker = self.binance.fetch_ticker(pair)
                        ticker_item = {
                            'exchange': 'Binance',
                            'symbol': pair,
                            'last': ticker['last'],
                            'bid': ticker['bid'],
                            'ask': ticker['ask'],
                            'volume': ticker['quoteVolume'],
                            'change24h': ticker['percentage'],
                            'timestamp': datetime.now().isoformat()
                        }
                        ticker_data.append(ticker_item)
                        
                        # Update cache
                        self.price_cache[f"Binance_{pair}"] = ticker_item
                    except Exception as e:
                        logger.error(f"Error fetching {pair} from Binance: {str(e)}")
                        # Use cached data if available
                        if f"Binance_{pair}" in self.price_cache:
                            ticker_data.append(self.price_cache[f"Binance_{pair}"])
                
                # Fetch from KuCoin with rate limiting
                for pair in supported_pairs:
                    try:
                        ticker = self.kucoin.fetch_ticker(pair)
                        ticker_item = {
                            'exchange': 'KuCoin',
                            'symbol': pair,
                            'last': ticker['last'],
                            'bid': ticker['bid'],
                            'ask': ticker['ask'],
                            'volume': ticker['quoteVolume'],
                            'change24h': ticker['percentage'],
                            'timestamp': datetime.now().isoformat()
                        }
                        ticker_data.append(ticker_item)
                        
                        # Update cache
                        self.price_cache[f"KuCoin_{pair}"] = ticker_item
                        await asyncio.sleep(0.2)  # Rate limiting
                    except Exception as e:
                        logger.error(f"Error fetching {pair} from KuCoin: {str(e)}")
                        # Use cached data if available
                        if f"KuCoin_{pair}" in self.price_cache:
                            ticker_data.append(self.price_cache[f"KuCoin_{pair}"])
                
                # Broadcast ticker data to all connected clients
                await self.broadcast({'type': 'ticker_update', 'data': ticker_data})
                
                # Store last update time for monitoring
                self.last_ticker_update = {
                    'timestamp': datetime.now().isoformat(),
                    'ticker_count': len(ticker_data)
                }
                
                logger.debug(f"Broadcast {len(ticker_data)} ticker items to {len(self.connected_clients)} clients")
                
            except Exception as e:
                logger.error(f"Error in fetch_ticker_data: {str(e)}")
                
            # Sleep for 5 seconds before next update
            await asyncio.sleep(5)

    async def listen_to_binance_websocket(self):
        """Listen to Binance WebSocket for real-time price updates"""
        symbols = [pair.replace('/', '').lower() for pair in self.get_supported_pairs()]
        streams = [f"{symbol}@ticker" for symbol in symbols]
        
        # Create combined stream URL
        combined_streams = '/'.join(streams)
        public_url = f"{self.binance_ws_base}/stream?streams={combined_streams}"
        
        logger.info(f"Binance WebSocket streams: {streams}")
        logger.info(f"Binance WebSocket URL: {public_url}")
        
        while True:
            try:
                # Connect to public streams
                logger.info(f"Attempting to connect to Binance WebSocket...")
                async with websockets.connect(public_url, ping_interval=180, ping_timeout=600) as websocket:
                    logger.info("Successfully connected to Binance WebSocket (public streams)")
                    
                    # Send initial ping to verify connection
                    await websocket.send(json.dumps({"method": "ping"}))
                    logger.info("Sent initial ping to Binance WebSocket")
                    
                    while True:
                        try:
                            response = await websocket.recv()
                            logger.debug(f"Received Binance WebSocket message: {response[:200]}...")  # Log first 200 chars
                            
                            data = json.loads(response)
                            
                            # Handle ping/pong
                            if isinstance(data, dict) and 'ping' in data:
                                await websocket.send(json.dumps({'pong': data['ping']}))
                                logger.debug("Sent pong response to Binance")
                                continue
                            
                            # Extract ticker data
                            if 'stream' in data and 'data' in data:
                                ticker_data = data['data']
                                symbol = ticker_data['s']
                                
                                # Convert to standard format
                                standard_symbol = f"{symbol[:-4]}/{symbol[-4:]}" if symbol.endswith('USDT') else symbol
                                
                                # Update price cache
                                cache_key = f"Binance_{standard_symbol}"
                                self.price_cache[cache_key] = {
                                    'exchange': 'Binance',
                                    'symbol': standard_symbol,
                                    'last': float(ticker_data['c']),
                                    'bid': float(ticker_data['b']),
                                    'ask': float(ticker_data['a']),
                                    'volume': float(ticker_data['v']),
                                    'change24h': float(ticker_data['p']),
                                    'timestamp': datetime.now().isoformat()
                                }
                                
                                logger.info(f"Updated Binance price for {standard_symbol}: {ticker_data['c']}")
                                
                                # Broadcast update to connected clients
                                await self.broadcast({
                                    'type': 'price_update',
                                    'data': self.price_cache[cache_key]
                                })
                                logger.debug(f"Broadcasted price update for {standard_symbol}")
                            else:
                                logger.warning(f"Unexpected Binance WebSocket message format: {data}")
                                
                        except Exception as e:
                            logger.error(f"Error processing Binance WebSocket message: {str(e)}")
                            break
                            
            except Exception as e:
                logger.error(f"Binance WebSocket connection error: {str(e)}")
                
            # Wait before reconnecting
            logger.info("Waiting 5 seconds before reconnecting to Binance WebSocket...")
            await asyncio.sleep(5)

    async def _handle_private_messages(self, websocket):
        """Handle private WebSocket messages from Binance"""
        try:
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                
                # Handle ping/pong
                if isinstance(data, dict) and 'ping' in data:
                    await websocket.send(json.dumps({'pong': data['ping']}))
                    continue
                
                if 'e' in data:  # Event type
                    event_type = data['e']
                    
                    if event_type == 'executionReport':  # Order updates
                        await self.broadcast({
                            'type': 'order_update',
                            'data': data
                        })
                    elif event_type == 'outboundAccountPosition':  # Account updates
                        await self.broadcast({
                            'type': 'account_update',
                            'data': data
                        })
                    elif event_type == 'balanceUpdate':  # Balance updates
                        await self.broadcast({
                            'type': 'balance_update',
                            'data': data
                        })
                        
        except Exception as e:
            logger.error(f"Error handling private Binance messages: {str(e)}")

    def subscribe_to_pair(self, pair):
        """Subscribe to updates for a specific trading pair."""
        logger.info(f'Subscribed to updates for pair: {pair}')
        
        async def send_updates():
            while True:
                try:
                    # Get the latest cached data for this pair across all exchanges
                    ticker_data = []
                    for exchange in self.get_supported_exchanges():
                        cache_key = f"{exchange}_{pair}"
                        if cache_key in self.price_cache:
                            ticker_data.append(self.price_cache[cache_key])
                    
                    if ticker_data:
                        await self.broadcast({'type': 'ticker_update', 'data': ticker_data})
                except Exception as e:
                    logger.error(f"Error sending updates for {pair}: {str(e)}")
                
                await asyncio.sleep(3)  # Update every 3 seconds

        # Start sending updates in the background
        asyncio.create_task(send_updates())

    async def start_websocket_server(self, websocket, path):
        """Handle WebSocket connections"""
        client_id = id(websocket)
        logger.info(f"New WebSocket client connected: {client_id}")
        
        await self.register_client(websocket)
        try:
            async for message in websocket:
                logger.debug(f"Received message from client {client_id}: {message}")
                
                data = json.loads(message)
                
                if data.get('type') == 'ping':
                    # Respond to heartbeat ping
                    response = {
                        'type': 'pong',
                        'timestamp': datetime.now().isoformat()
                    }
                    await websocket.send(json.dumps(response))
                    logger.debug(f"Sent pong to client {client_id}")
                elif data.get('type') == 'subscribe':
                    # Handle subscription requests
                    if 'pair' in data:
                        logger.info(f"Client {client_id} subscribed to pair: {data['pair']}")
                        self.subscribe_to_pair(data['pair'])
        except Exception as e:
            logger.error(f"WebSocket error for client {client_id}: {str(e)}")
        finally:
            await self.unregister_client(websocket)
            logger.info(f"WebSocket client disconnected: {client_id}")

    async def fetch_kucoin_public_token(self):
        """Fetch KuCoin public WebSocket token and server endpoint"""
        try:
            # Make request to get public token
            response = await self.kucoin.public_get_bullet_public()
            if response and 'data' in response:
                self.kucoin_ws_token = response['data']['token']
                if response['data']['instanceServers']:
                    server = response['data']['instanceServers'][0]
                    self.kucoin_ws_endpoint = server['endpoint']
                    logger.info(f"KuCoin WebSocket token fetched successfully. Endpoint: {self.kucoin_ws_endpoint}")
                    return True
            return False
        except Exception as e:
            logger.error(f"Error fetching KuCoin public token: {str(e)}")
            return False

    async def listen_to_kucoin_websocket(self):
        """Listen to KuCoin WebSocket for real-time price updates"""
        if not self.kucoin_ws_token or not self.kucoin_ws_endpoint:
            logger.info("Fetching new KuCoin WebSocket token...")
            if not await self.fetch_kucoin_public_token():
                logger.error("Failed to get KuCoin WebSocket token")
                return

        symbols = [pair.replace('/', '-').lower() for pair in self.get_supported_pairs()]
        topics = [f"/market/ticker:{symbol}" for symbol in symbols]
        
        logger.info(f"KuCoin WebSocket topics: {topics}")
        
        # Create subscription message
        subscribe_message = {
            "id": int(time.time() * 1000),
            "type": "subscribe",
            "topic": topics,
            "privateChannel": False,
            "response": True
        }
        
        logger.info(f"KuCoin subscription message: {json.dumps(subscribe_message)}")
        
        while True:
            try:
                # Connect to WebSocket with token
                ws_url = f"{self.kucoin_ws_endpoint}?token={self.kucoin_ws_token}"
                logger.info(f"Connecting to KuCoin WebSocket: {ws_url}")
                
                async with websockets.connect(ws_url, ping_interval=180, ping_timeout=600) as websocket:
                    logger.info("Connected to KuCoin WebSocket")
                    
                    # Send subscription message
                    await websocket.send(json.dumps(subscribe_message))
                    logger.info("Sent subscription message to KuCoin WebSocket")
                    
                    while True:
                        try:
                            response = await websocket.recv()
                            logger.debug(f"Received KuCoin WebSocket message: {response[:200]}...")  # Log first 200 chars
                            
                            data = json.loads(response)
                            
                            # Handle ping/pong
                            if data.get('type') == 'ping':
                                await websocket.send(json.dumps({'type': 'pong'}))
                                logger.debug("Sent pong response to KuCoin")
                                continue
                            
                            # Handle subscription response
                            if data.get('type') == 'welcome':
                                logger.info("KuCoin WebSocket subscription successful")
                                continue
                            
                            # Handle ticker data
                            if data.get('type') == 'message' and 'topic' in data:
                                ticker_data = data.get('data', {})
                                symbol = ticker_data.get('symbol', '').replace('-', '/')
                                
                                if symbol:
                                    # Update price cache
                                    cache_key = f"KuCoin_{symbol}"
                                    self.price_cache[cache_key] = {
                                        'exchange': 'KuCoin',
                                        'symbol': symbol,
                                        'last': float(ticker_data.get('price', 0)),
                                        'bid': float(ticker_data.get('bestBid', 0)),
                                        'ask': float(ticker_data.get('bestAsk', 0)),
                                        'volume': float(ticker_data.get('volume', 0)),
                                        'change24h': float(ticker_data.get('changeRate', 0)),
                                        'timestamp': datetime.now().isoformat()
                                    }
                                    
                                    logger.info(f"Updated KuCoin price for {symbol}: {ticker_data.get('price', 0)}")
                                    
                                    # Broadcast update to connected clients
                                    await self.broadcast({
                                        'type': 'price_update',
                                        'data': self.price_cache[cache_key]
                                    })
                                    logger.debug(f"Broadcasted price update for {symbol}")
                            else:
                                logger.warning(f"Unexpected KuCoin WebSocket message format: {data}")
                            
                        except Exception as e:
                            logger.error(f"Error processing KuCoin WebSocket message: {str(e)}")
                            break
                            
            except Exception as e:
                logger.error(f"KuCoin WebSocket connection error: {str(e)}")
                
            # Wait before reconnecting and refresh token
            logger.info("Waiting 5 seconds before reconnecting to KuCoin WebSocket...")
            await asyncio.sleep(5)
            await self.fetch_kucoin_public_token()

    async def run_services(self):
        """Run all WebSocket services"""
        # Initialize price cache
        await self.initialize_price_cache()
        
        # Start tasks
        tasks = [
            self.fetch_ticker_data(),
            self.listen_to_binance_websocket(),
            self.listen_to_kucoin_websocket()
        ]
        
        await asyncio.gather(*tasks)

    async def run(self):
        """Run the WebSocket server"""
        try:
            # Check if server is already running
            if hasattr(self, '_server') and self._server:
                logger.warning("WebSocket server is already running")
                return
                
            # Try to start WebSocket server on port 9000
            self._server = await websockets.serve(self.start_websocket_server, '0.0.0.0', 9000)
            logger.info("WebSocket server started on port 9000")
            await self._server.wait_closed()
        except Exception as e:
            logger.error(f"Error starting WebSocket server: {str(e)}")
            # Try alternative port if 9000 is in use
            try:
                self._server = await websockets.serve(self.start_websocket_server, '0.0.0.0', 9001)
                logger.info("WebSocket server started on port 9001")
                await self._server.wait_closed()
            except Exception as e2:
                logger.error(f"Error starting WebSocket server on alternative port: {str(e2)}")
                raise

    def start(self):
        """Start the WebSocket server and data fetching"""
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        logger.info("Starting WebSocket server and services...")
        
        try:
            asyncio.run(self.run())
        except Exception as e:
            logger.error(f"Error starting WebSocket server: {str(e)}")
            raise
