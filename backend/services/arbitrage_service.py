
import logging
import uuid
import json
from datetime import datetime
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

class ArbitrageService:
    def __init__(self, database_service):
        self.db = database_service
        self.min_profit = 0.2  # Minimum profit percentage to consider
        self.fee_rate = 0.001  # Assumed trading fee (0.1%)
        
    def find_opportunities(self, min_profit=None, symbol='all'):
        """Find arbitrage opportunities across exchanges"""
        if min_profit is None:
            min_profit = self.min_profit
            
        # Get latest prices for all exchanges
        prices = self.db.get_latest_prices(exchange='all', symbol=symbol)
        
        # Group by symbol and find min ask (buy) and max bid (sell) prices
        opportunities = []
        
        # Group prices by symbol
        symbols = {}
        for price in prices:
            if price['symbol'] not in symbols:
                symbols[price['symbol']] = []
            symbols[price['symbol']].append(price)
        
        # Find arbitrage opportunities for each symbol
        for symbol, symbol_prices in symbols.items():
            # Find min ask (buy) price
            buy_exchange = None
            min_ask = float('inf')
            
            # Find max bid (sell) price
            sell_exchange = None
            max_bid = 0
            
            for price in symbol_prices:
                if 'ask' in price and price['ask'] is not None and price['ask'] < min_ask:
                    min_ask = price['ask']
                    buy_exchange = price['exchange']
                    
                if 'bid' in price and price['bid'] is not None and price['bid'] > max_bid:
                    max_bid = price['bid']
                    sell_exchange = price['exchange']
            
            # Calculate profit percentage
            if buy_exchange and sell_exchange and buy_exchange != sell_exchange:
                # Calculate profit accounting for fees on both sides
                profit_percent = ((max_bid - min_ask) / min_ask) * 100 - (self.fee_rate * 200)
                
                if profit_percent >= min_profit:
                    opportunity = {
                        'symbol': symbol,
                        'buy_exchange': buy_exchange,
                        'sell_exchange': sell_exchange,
                        'buy_price': min_ask,
                        'sell_price': max_bid,
                        'price_difference': max_bid - min_ask,
                        'profit_percent': profit_percent,
                        'timestamp': datetime.now().isoformat(),
                        'status': 'active'
                    }
                    
                    # Save opportunity to Redis
                    self.db.save_arbitrage_opportunity(opportunity)
                    opportunities.append(opportunity)
        
        # Sort by profit percentage (descending)
        opportunities.sort(key=lambda x: x['profit_percent'], reverse=True)
        return opportunities
        
    def execute_trade(self, user_id, buy_exchange, sell_exchange, pair, amount):
        """Execute an arbitrage trade"""
        # Get current prices to ensure opportunity still exists
        buy_price_data = self.db.get_latest_prices(exchange=buy_exchange, symbol=pair)
        sell_price_data = self.db.get_latest_prices(exchange=sell_exchange, symbol=pair)
        
        if not buy_price_data or not sell_price_data:
            return {'error': 'Could not get current prices'}
            
        buy_price = buy_price_data[0]['ask']
        sell_price = sell_price_data[0]['bid']
        
        # Verify opportunity still exists
        profit_percent = ((sell_price - buy_price) / buy_price) * 100 - (self.fee_rate * 200)
        
        if profit_percent < self.min_profit:
            return {
                'error': 'Opportunity no longer profitable',
                'current_profit': profit_percent
            }
        
        # In a real system, you would execute the trades on the exchanges here
        # This is a simplified implementation
        
        # Record the trade
        trade_id = str(uuid.uuid4())
        trade_data = {
            'trade_id': trade_id,
            'user_id': user_id,
            'symbol': pair,
            'buy_exchange': buy_exchange,
            'sell_exchange': sell_exchange,
            'buy_price': buy_price,
            'sell_price': sell_price,
            'amount': amount,
            'profit': (sell_price - buy_price) * amount,
            'status': 'executed'
        }
        
        self.db.save_trade(trade_data)
        
        return {
            'status': 'success',
            'trade_id': trade_id,
            'profit': trade_data['profit'],
            'profit_percent': profit_percent
        }
        
    def get_trade_history(self, user_id):
        """Get trade history for a user"""
        return self.db.get_user_trades(user_id)
