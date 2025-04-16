
import ccxt
import asyncio
import websockets
import json
import logging
import time
import random
from datetime import datetime

logger = logging.getLogger(__name__)

class ExchangeService:
    def __init__(self, api_key=None, api_secret=None, api_passphrase=None):
        self.api_key = api_key
        self.api_secret = api_secret
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
        
        self.binance = ccxt.binance({'enableRateLimit': True})
        self.bybit = ccxt.bybit({'enableRateLimit': True})
        self.okx = ccxt.okx({'enableRateLimit': True})
        
        # WebSocket URLs
        self.binance_ws_url = 'wss://stream.binance.com:9443/ws'
        self.bybit_ws_url = 'wss://stream.bybit.com/realtime'
        self.kucoin_ws_base = 'wss://push-v2.kucoin.com'  # Need to fetch token
        self.okx_ws_url = 'wss://ws.okx.com:8443/ws/v5/public'
        
        # Initialize price cache
        self.price_cache = {}
        self.initialized = False
        
    def get_supported_exchanges(self):
        """Return list of supported exchanges"""
        return ['Binance', 'KuCoin', 'Bybit', 'OKX']
        
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
            {'name': 'KuCoin', 'instance': self.kucoin},
            {'name': 'Bybit', 'instance': self.bybit},
            {'name': 'OKX', 'instance': self.okx}
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
                
                # Fetch from Bybit with rate limiting
                for pair in supported_pairs:
                    try:
                        ticker = self.bybit.fetch_ticker(pair)
                        ticker_item = {
                            'exchange': 'Bybit',
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
                        self.price_cache[f"Bybit_{pair}"] = ticker_item
                        await asyncio.sleep(0.2)  # Rate limiting
                    except Exception as e:
                        logger.error(f"Error fetching {pair} from Bybit: {str(e)}")
                        # Use cached data if available
                        if f"Bybit_{pair}" in self.price_cache:
                            ticker_data.append(self.price_cache[f"Bybit_{pair}"])
                
                # Fetch from OKX with rate limiting
                for pair in supported_pairs:
                    try:
                        ticker = self.okx.fetch_ticker(pair)
                        ticker_item = {
                            'exchange': 'OKX',
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
                        self.price_cache[f"OKX_{pair}"] = ticker_item
                        await asyncio.sleep(0.2)  # Rate limiting
                    except Exception as e:
                        logger.error(f"Error fetching {pair} from OKX: {str(e)}")
                        # Use cached data if available
                        if f"OKX_{pair}" in self.price_cache:
                            ticker_data.append(self.price_cache[f"OKX_{pair}"])
                
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
        
        url = f"{self.binance_ws_url}/stream?streams={'/'.join(streams)}"
        
        while True:
            try:
                logger.info(f"Connecting to Binance WebSocket: {url}")
                async with websockets.connect(url) as websocket:
                    logger.info("Connected to Binance WebSocket")
                    
                    while True:
                        try:
                            response = await websocket.recv()
                            data = json.loads(response)
                            
                            # Extract ticker data
                            if 'data' in data:
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
                        except Exception as e:
                            logger.error(f"Error processing Binance WebSocket message: {str(e)}")
                            break
                            
            except Exception as e:
                logger.error(f"Binance WebSocket error: {str(e)}")
                
            # Wait before reconnecting
            await asyncio.sleep(5)

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
        await self.register_client(websocket)
        try:
            async for message in websocket:
                data = json.loads(message)
                
                if data.get('type') == 'ping':
                    # Respond to heartbeat ping
                    await websocket.send(json.dumps({
                        'type': 'pong',
                        'timestamp': datetime.now().isoformat()
                    }))
                elif data.get('type') == 'subscribe':
                    # Handle subscription requests
                    if 'pair' in data:
                        self.subscribe_to_pair(data['pair'])
        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}")
        finally:
            await self.unregister_client(websocket)

    async def run_services(self):
        """Run all WebSocket services"""
        # Initialize price cache
        await self.initialize_price_cache()
        
        # Start tasks
        tasks = [
            self.fetch_ticker_data(),
            self.listen_to_binance_websocket()
        ]
        
        await asyncio.gather(*tasks)

    def start(self):
        """Start the WebSocket server and data fetching"""
        async def run():
            server = await websockets.serve(self.start_websocket_server, '0.0.0.0', 8765)
            logger.info("WebSocket server started on port 8765")
            
            # Start services
            await self.run_services()
            
            await server.wait_closed()

        # Run the event loop
        asyncio.run(run())
