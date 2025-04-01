
import ccxt
import asyncio
import websockets
import json
import logging
from datetime import datetime
import pandas as pd
import numpy as np
import time
import threading

logger = logging.getLogger(__name__)

class ExchangeService:
    def __init__(self):
        self.exchanges = {
            'binance': {
                'rest': ccxt.binance(),
                'ws_url': 'wss://stream.binance.com:9443/ws',
                'markets': {}
            },
            'kucoin': {
                'rest': ccxt.kucoin(),
                'ws_url': 'wss://push-private.kucoin.com/endpoint',
                'markets': {}
            },
            'bybit': {
                'rest': ccxt.bybit(),
                'ws_url': 'wss://stream.bybit.com/realtime',
                'markets': {}
            },
            'okx': {
                'rest': ccxt.okx(),
                'ws_url': 'wss://ws.okx.com:8443/ws/v5/public',
                'markets': {}
            }
        }
        
        # Common trading pairs to monitor
        self.trading_pairs = [
            'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 
            'XRP/USDT', 'ADA/USDT', 'DOGE/USDT', 'AVAX/USDT'
        ]
        
        # Initialize markets for each exchange
        self.initialize_markets()
        
        # Data collection threads
        self.ws_threads = {}
        self.collecting = False

    def initialize_markets(self):
        """Initialize market data for each exchange"""
        for exchange_id, exchange in self.exchanges.items():
            try:
                exchange['rest'].load_markets()
                exchange['markets'] = exchange['rest'].markets
                logger.info(f"Initialized markets for {exchange_id}")
            except Exception as e:
                logger.error(f"Error initializing {exchange_id} markets: {str(e)}")

    def get_supported_exchanges(self):
        """Return list of supported exchanges"""
        return list(self.exchanges.keys())

    def get_supported_pairs(self):
        """Return list of supported trading pairs"""
        return self.trading_pairs

    def get_ticker(self, exchange_id, symbol):
        """Get ticker data from specific exchange"""
        try:
            exchange = self.exchanges[exchange_id]['rest']
            ticker = exchange.fetch_ticker(symbol)
            return {
                'exchange': exchange_id,
                'symbol': symbol,
                'bid': ticker['bid'],
                'ask': ticker['ask'],
                'last': ticker['last'],
                'volume': ticker['volume'],
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching ticker from {exchange_id} for {symbol}: {str(e)}")
            return None

    def get_orderbook(self, exchange_id, symbol, limit=10):
        """Get order book from specific exchange"""
        try:
            exchange = self.exchanges[exchange_id]['rest']
            orderbook = exchange.fetch_order_book(symbol, limit=limit)
            return {
                'exchange': exchange_id,
                'symbol': symbol,
                'bids': orderbook['bids'],
                'asks': orderbook['asks'],
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching orderbook from {exchange_id} for {symbol}: {str(e)}")
            return None

    async def _websocket_listener(self, exchange_id):
        """Listen to websocket for real-time data"""
        exchange_info = self.exchanges[exchange_id]
        
        # Implementation varies by exchange
        if exchange_id == 'binance':
            await self._binance_websocket_listener()
        elif exchange_id == 'kucoin':
            await self._kucoin_websocket_listener()
        elif exchange_id == 'bybit':
            await self._bybit_websocket_listener()
        elif exchange_id == 'okx':
            await self._okx_websocket_listener()

    async def _binance_websocket_listener(self):
        """Binance-specific websocket implementation"""
        ws_url = self.exchanges['binance']['ws_url']
        
        # Format symbols for Binance websocket (lowercase, no slash)
        symbols = [pair.replace('/', '').lower() for pair in self.trading_pairs]
        streams = [f"{symbol}@ticker" for symbol in symbols]
        
        connection_url = f"{ws_url}/{'@'.join(streams)}"
        
        try:
            async with websockets.connect(connection_url) as websocket:
                logger.info("Connected to Binance websocket")
                
                while self.collecting:
                    response = await websocket.recv()
                    data = json.loads(response)
                    
                    # Process the ticker data
                    symbol = data['s']
                    formatted_symbol = f"{symbol[:3]}/{symbol[3:]}" if len(symbol) == 6 else symbol
                    
                    ticker_data = {
                        'exchange': 'binance',
                        'symbol': formatted_symbol,
                        'bid': float(data['b']),
                        'ask': float(data['a']),
                        'last': float(data['c']),
                        'volume': float(data['v']),
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    # Here you would save this data to your database
                    # For example: database_service.save_ticker(ticker_data)
                    
        except Exception as e:
            logger.error(f"Binance websocket error: {str(e)}")
            # Attempt to reconnect after a delay
            if self.collecting:
                await asyncio.sleep(5)
                await self._binance_websocket_listener()

    # Similar implementations for other exchanges
    async def _kucoin_websocket_listener(self):
        # Kucoin requires a token from REST API first
        pass
        
    async def _bybit_websocket_listener(self):
        pass
        
    async def _okx_websocket_listener(self):
        pass
    
    def _run_websocket_loop(self, exchange_id):
        """Run the websocket in its own thread"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self._websocket_listener(exchange_id))
        
    def start_data_collection(self):
        """Start data collection from all exchanges"""
        if self.collecting:
            return
            
        self.collecting = True
        
        # Start websocket connections in separate threads
        for exchange_id in self.exchanges:
            thread = threading.Thread(
                target=self._run_websocket_loop,
                args=(exchange_id,)
            )
            thread.daemon = True
            thread.start()
            self.ws_threads[exchange_id] = thread
            logger.info(f"Started data collection for {exchange_id}")
            
    def stop_data_collection(self):
        """Stop data collection"""
        self.collecting = False
        logger.info("Stopped data collection")
