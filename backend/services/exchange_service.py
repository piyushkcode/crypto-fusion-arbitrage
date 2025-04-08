
import ccxt
import asyncio
import websockets
import json
import logging
import time
from datetime import datetime

logger = logging.getLogger(__name__)

class ExchangeService:
    def __init__(self, api_key=None, api_secret=None, api_passphrase=None):
        self.api_key = api_key
        self.api_secret = api_secret
        self.api_passphrase = api_passphrase
        self.connected_clients = set()
        
        # Initialize exchange connections
        self.kucoin = ccxt.kucoin({
            'apiKey': self.api_key,
            'secret': self.api_secret,
            'password': self.api_passphrase,
        }) if all([self.api_key, self.api_secret, self.api_passphrase]) else ccxt.kucoin()
        
        self.bybit = ccxt.bybit({
            'apiKey': self.api_key,
            'secret': self.api_secret,
        })
        
        self.binance = ccxt.binance()
        self.okx = ccxt.okx()
        
        # WebSocket URLs
        self.bybit.websocket_url = 'wss://stream.bybit.com/realtime'
        
    def get_supported_exchanges(self):
        """Return list of supported exchanges"""
        return ['Binance', 'KuCoin', 'Bybit', 'OKX']
        
    def get_supported_pairs(self):
        """Return list of supported trading pairs"""
        return ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT']

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
        while True:
            try:
                ticker_data = []
                supported_pairs = self.get_supported_pairs()
                
                # Fetch from Binance
                for pair in supported_pairs:
                    try:
                        ticker = self.binance.fetch_ticker(pair)
                        ticker_data.append({
                            'exchange': 'Binance',
                            'symbol': pair,
                            'last': ticker['last'],
                            'bid': ticker['bid'],
                            'ask': ticker['ask'],
                            'volume': ticker['quoteVolume'],
                            'change24h': ticker['percentage'],
                            'timestamp': datetime.now().isoformat()
                        })
                    except Exception as e:
                        logger.error(f"Error fetching {pair} from Binance: {str(e)}")
                
                # Fetch from KuCoin
                for pair in supported_pairs:
                    try:
                        ticker = self.kucoin.fetch_ticker(pair)
                        ticker_data.append({
                            'exchange': 'KuCoin',
                            'symbol': pair,
                            'last': ticker['last'],
                            'bid': ticker['bid'],
                            'ask': ticker['ask'],
                            'volume': ticker['quoteVolume'],
                            'change24h': ticker['percentage'],
                            'timestamp': datetime.now().isoformat()
                        })
                    except Exception as e:
                        logger.error(f"Error fetching {pair} from KuCoin: {str(e)}")
                
                # Fetch from Bybit
                for pair in supported_pairs:
                    try:
                        ticker = self.bybit.fetch_ticker(pair)
                        ticker_data.append({
                            'exchange': 'Bybit',
                            'symbol': pair,
                            'last': ticker['last'],
                            'bid': ticker['bid'],
                            'ask': ticker['ask'],
                            'volume': ticker['quoteVolume'],
                            'change24h': ticker['percentage'],
                            'timestamp': datetime.now().isoformat()
                        })
                    except Exception as e:
                        logger.error(f"Error fetching {pair} from Bybit: {str(e)}")
                
                # Fetch from OKX
                for pair in supported_pairs:
                    try:
                        ticker = self.okx.fetch_ticker(pair)
                        ticker_data.append({
                            'exchange': 'OKX',
                            'symbol': pair,
                            'last': ticker['last'],
                            'bid': ticker['bid'],
                            'ask': ticker['ask'],
                            'volume': ticker['quoteVolume'],
                            'change24h': ticker['percentage'],
                            'timestamp': datetime.now().isoformat()
                        })
                    except Exception as e:
                        logger.error(f"Error fetching {pair} from OKX: {str(e)}")
                
                # Broadcast ticker data to all connected clients
                await self.broadcast({'type': 'ticker_update', 'data': ticker_data})
                
            except Exception as e:
                logger.error(f"Error in fetch_ticker_data: {str(e)}")
                
            # Sleep for 5 seconds before next update
            await asyncio.sleep(5)

    async def start_websocket_server(self, websocket, path):
        """Handle WebSocket connections"""
        await self.register_client(websocket)
        try:
            async for message in websocket:
                data = json.loads(message)
                if data.get('type') == 'subscribe':
                    # Handle subscription requests if needed
                    pass
        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}")
        finally:
            await self.unregister_client(websocket)

    async def fetch_all_data():
    tasks = [self.fetch_binance(), self.fetch_kucoin(),self.fetch_bybit,self.fetch_okx()]
    return await asyncio.gather(*tasks)

    async for message in websocket:
    data = json.loads(message)
    if data.get('type') == 'ping':
        await websocket.send(json.dumps({'type': 'pong'}))
    elif data.get('type') == 'subscribe':
        # Handle subscription
        pass
        
    def start(self):
        """Start the WebSocket server and data fetching"""
        loop = asyncio.get_event_loop()
        
        # Start WebSocket server
        start_server = websockets.serve(self.start_websocket_server, '0.0.0.0', 8765)
        
        # Schedule ticker data fetching
        loop.create_task(self.fetch_ticker_data())
        
        # Start the server
        loop.run_until_complete(start_server)
        loop.run_forever()
