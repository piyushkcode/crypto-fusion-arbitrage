
import logging
import uuid
import json
from datetime import datetime
import numpy as np
import pandas as pd
from collections import defaultdict

logger = logging.getLogger(__name__)

class ArbitrageService:
    def __init__(self, database_service):
        self.db = database_service
        self.min_profit = 0.2  # Minimum profit percentage to consider
        self.fee_rate = 0.001  # Assumed trading fee (0.1%)
        
    def find_opportunities(self, min_profit=None, symbol='all', strategy_type='simple'):
        """Find arbitrage opportunities across exchanges based on selected strategy"""
        if min_profit is None:
            min_profit = self.min_profit

        # Select the appropriate strategy method
        if strategy_type == 'triangular':
            opportunities = self.find_triangular_opportunities(min_profit, symbol)
        elif strategy_type == 'statistical':
            opportunities = self.find_statistical_opportunities(min_profit, symbol)
        else:  # Default to simple
            opportunities = self.find_simple_opportunities(min_profit, symbol)
            
        # Sort by profit percentage (descending)
        opportunities.sort(key=lambda x: x['profit_percent'], reverse=True)
        return opportunities
        
    def find_simple_opportunities(self, min_profit, symbol='all'):
        """Find simple arbitrage opportunities across exchanges"""
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
                        'status': 'active',
                        'type': 'simple'
                    }
                    
                    # Save opportunity to database
                    self.db.save_arbitrage_opportunity(opportunity)
                    opportunities.append(opportunity)
        
        return opportunities

    def find_triangular_opportunities(self, min_profit, symbol='all'):
        """Find triangular arbitrage opportunities within the same exchange"""
        opportunities = []
        exchanges = ['Binance', 'KuCoin', 'Bybit', 'OKX']
        
        for exchange in exchanges:
            # Get latest prices for current exchange
            prices = self.db.get_latest_prices(exchange=exchange)
            if not prices:
                continue
                
            # Create price dictionary for faster lookup
            price_dict = {}
            for price in prices:
                if 'symbol' in price and 'bid' in price and 'ask' in price:
                    price_dict[price['symbol']] = {'bid': price['bid'], 'ask': price['ask']}
            
            # Define triangular paths to check
            # For example: BTC/USDT -> ETH/BTC -> ETH/USDT
            triangular_paths = [
                {'step1': 'BTC/USDT', 'step2': 'ETH/BTC', 'step3': 'ETH/USDT'},
                {'step1': 'ETH/USDT', 'step2': 'XRP/ETH', 'step3': 'XRP/USDT'},
                {'step1': 'BTC/USDT', 'step2': 'XRP/BTC', 'step3': 'XRP/USDT'},
                {'step1': 'SOL/USDT', 'step2': 'SOL/BTC', 'step3': 'BTC/USDT'},
                {'step1': 'ADA/USDT', 'step2': 'ADA/BTC', 'step3': 'BTC/USDT'}
            ]
            
            for path in triangular_paths:
                # Check if all required pairs exist
                if (path['step1'] not in price_dict or 
                    path['step2'] not in price_dict or 
                    path['step3'] not in price_dict):
                    continue
                    
                # Extract prices for each step
                step1 = price_dict[path['step1']]
                step2 = price_dict[path['step2']]
                step3 = price_dict[path['step3']]
                
                # Calculate triangular arbitrage profit
                # Starting with 1 USDT:
                # 1. Buy first asset using USDT (e.g., BTC)
                # 2. Trade first asset for second asset (e.g., ETH)
                # 3. Sell second asset for USDT
                
                step1_amount = 1 / step1['ask']  # Buy BTC with USDT
                step2_amount = step1_amount * step2['bid']  # Sell BTC for ETH
                final_amount = step2_amount * step3['bid']  # Sell ETH for USDT
                
                # Calculate profit percentage
                profit_percent = (final_amount - 1) * 100 - (self.fee_rate * 300)  # Account for 3 trades
                
                if profit_percent >= min_profit:
                    opportunity = {
                        'symbol': f"{path['step1']}->{path['step2']}->{path['step3']}",
                        'exchange': exchange,
                        'initial_amount': 1,
                        'final_amount': final_amount,
                        'profit_percent': profit_percent,
                        'timestamp': datetime.now().isoformat(),
                        'status': 'active',
                        'type': 'triangular',
                        'path': path
                    }
                    
                    # Save opportunity
                    self.db.save_arbitrage_opportunity(opportunity)
                    opportunities.append(opportunity)
        
        return opportunities
            
    def find_statistical_opportunities(self, min_profit, symbol='all'):
        """Find statistical arbitrage opportunities using mean reversion"""
        opportunities = []
        
        # Get historical price data for analysis
        try:
            # For each symbol, check across exchanges
            symbols = self.db.get_supported_pairs() if symbol == 'all' else [symbol]
            exchanges = ['Binance', 'KuCoin', 'Bybit', 'OKX']
            
            for symbol in symbols:
                price_series = {}
                
                # Get historical prices for each exchange
                for exchange in exchanges:
                    historical_data = self.db.get_historical_prices(exchange, symbol, days=7)
                    if historical_data and len(historical_data) > 10:  # Need enough data points
                        # Extract closing prices
                        prices = [float(item['close']) for item in historical_data if 'close' in item]
                        price_series[exchange] = prices
                
                # Need at least 2 exchanges with price data
                if len(price_series) < 2:
                    continue
                    
                # Calculate price ratio between exchanges
                for exchange1, prices1 in price_series.items():
                    for exchange2, prices2 in price_series.items():
                        if exchange1 >= exchange2:  # Avoid duplicates
                            continue
                            
                        # Make sure we have equal length data
                        min_length = min(len(prices1), len(prices2))
                        if min_length < 10:
                            continue
                            
                        ratio_series = [prices1[i] / prices2[i] for i in range(min_length)]
                        
                        # Calculate mean and standard deviation of ratio
                        mean_ratio = np.mean(ratio_series)
                        std_ratio = np.std(ratio_series)
                        
                        # Get current prices
                        current_prices1 = self.db.get_latest_prices(exchange1, symbol)
                        current_prices2 = self.db.get_latest_prices(exchange2, symbol)
                        
                        if not current_prices1 or not current_prices2:
                            continue
                            
                        current_price1 = current_prices1[0]['last'] if 'last' in current_prices1[0] else None
                        current_price2 = current_prices2[0]['last'] if 'last' in current_prices2[0] else None
                        
                        if not current_price1 or not current_price2:
                            continue
                            
                        current_ratio = current_price1 / current_price2
                        
                        # Calculate z-score (how many standard deviations from mean)
                        z_score = (current_ratio - mean_ratio) / std_ratio if std_ratio > 0 else 0
                        
                        # Check for statistical arbitrage opportunity
                        # If z-score is too negative, buy on exchange1, sell on exchange2
                        # If z-score is too positive, buy on exchange2, sell on exchange1
                        threshold = 2.0  # Standard deviations
                        
                        if abs(z_score) >= threshold:
                            # Calculate expected profit when ratio reverts to mean
                            expected_profit_percent = abs((mean_ratio / current_ratio - 1) * 100) - (self.fee_rate * 200)
                            
                            if expected_profit_percent >= min_profit:
                                if z_score < 0:
                                    buy_exchange = exchange1
                                    sell_exchange = exchange2
                                else:
                                    buy_exchange = exchange2
                                    sell_exchange = exchange1
                                
                                opportunity = {
                                    'symbol': symbol,
                                    'buy_exchange': buy_exchange,
                                    'sell_exchange': sell_exchange,
                                    'z_score': round(z_score, 2),
                                    'mean_ratio': round(mean_ratio, 4),
                                    'current_ratio': round(current_ratio, 4),
                                    'profit_percent': round(expected_profit_percent, 2),
                                    'timestamp': datetime.now().isoformat(),
                                    'status': 'active',
                                    'type': 'statistical'
                                }
                                
                                # Save opportunity
                                self.db.save_arbitrage_opportunity(opportunity)
                                opportunities.append(opportunity)
        
        except Exception as e:
            logger.error(f"Error in statistical arbitrage calculation: {str(e)}")
            
        return opportunities
        
    def execute_trade(self, user_id, buy_exchange, sell_exchange, pair, amount, strategy_type='simple'):
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
            'profit_percent': profit_percent,
            'strategy_type': strategy_type,
            'status': 'executed'
        }
        
        self.db.save_trade(trade_data)
        
        return {
            'status': 'success',
            'trade_id': trade_id,
            'profit': trade_data['profit'],
            'profit_percent': profit_percent,
            'strategy_type': strategy_type
        }
        
    def get_trade_history(self, user_id):
        """Get trade history for a user"""
        return self.db.get_user_trades(user_id)
