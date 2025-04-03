import logging
import pymongo
import psycopg2
import redis
import json
from datetime import datetime, timedelta
import pandas as pd
import os  # Import os for environment variables

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        # MongoDB connection for real-time price data
        try:
            self.mongo_client = pymongo.MongoClient("mongodb+srv://pkinekar2004:root1234@cluster0.uwapo.mongodb.net/")
            self.mongo_db = self.mongo_client["crypto_arbitrage"]
            self.prices_collection = self.mongo_db["live_prices"]
        except pymongo.errors.ConnectionError as e:
            logger.error(f"MongoDB connection error: {str(e)}")
            raise
        
        # PostgreSQL connection for user and trade data
        self.pg_conn = psycopg2.connect(
            host="localhost",
            database="crypto_arbitrage",
            user="postgres",
            password="root123"
        )
        self.pg_cursor = self.pg_conn.cursor()
        
        # TimescaleDB connection (using PostgreSQL connection)
        self.timescale_conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="timescale_db",
            user="postgres",
            password="root123"
        )
        self.timescale_cursor = self.timescale_conn.cursor()
        
        # Redis connection for caching
        self.redis_client = redis.Redis(host="localhost", port=6379, db=0)
        
        # Initialize database tables/collections
        self._initialize_databases()
        
    def _initialize_databases(self):
        """Initialize database tables and indexes"""
        # MongoDB indexes
        self.prices_collection.create_index([("symbol", pymongo.ASCENDING), ("exchange", pymongo.ASCENDING)])
        self.prices_collection.create_index("timestamp")
        
        # PostgreSQL tables
        self.pg_cursor.execute(""" 
            CREATE TABLE IF NOT EXISTS users (
                user_id UUID PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                api_keys JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.pg_cursor.execute(""" 
            CREATE TABLE IF NOT EXISTS arbitrage_trades (
                trade_id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(user_id),
                symbol VARCHAR(20) NOT NULL,
                buy_exchange VARCHAR(50) NOT NULL,
                sell_exchange VARCHAR(50) NOT NULL,
                buy_price NUMERIC(20, 8) NOT NULL,
                sell_price NUMERIC(20, 8) NOT NULL,
                amount NUMERIC(20, 8) NOT NULL,
                profit NUMERIC(20, 8) NOT NULL,
                status VARCHAR(20) NOT NULL,
                trade_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        self.pg_conn.commit()
        
        # TimescaleDB tables
        self.timescale_cursor.execute(""" 
            CREATE TABLE IF NOT EXISTS historical_prices (
                timestamp TIMESTAMPTZ NOT NULL,
                symbol VARCHAR(20) NOT NULL,
                exchange VARCHAR(50) NOT NULL,
                price NUMERIC(20, 8) NOT NULL,
                volume NUMERIC(20, 8)
            )
        """)
        
        # Convert to hypertable if not already
        try:
            self.timescale_cursor.execute(""" 
                SELECT create_hypertable('historical_prices', 'timestamp', if_not_exists => TRUE)
            """)
        except Exception as e:
            logger.error(f"Error creating hypertable: {str(e)}")
            
        self.timescale_conn.commit()
        
    def save_ticker(self, ticker_data):
        """Save ticker data to MongoDB and TimescaleDB"""
        # Save to MongoDB for real-time access
        self.prices_collection.insert_one(ticker_data)
        
        # Save to TimescaleDB for historical analysis
        self.timescale_cursor.execute(""" 
            INSERT INTO historical_prices (timestamp, symbol, exchange, price, volume)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            datetime.fromisoformat(ticker_data['timestamp']),
            ticker_data['symbol'],
            ticker_data['exchange'],
            ticker_data['last'],
            ticker_data['volume']
        ))
        self.timescale_conn.commit()
        
        # Update Redis cache for fast access
        cache_key = f"price:{ticker_data['exchange']}:{ticker_data['symbol']}"
        self.redis_client.set(cache_key, json.dumps({
            'price': ticker_data['last'],
            'bid': ticker_data['bid'],
            'ask': ticker_data['ask'],
            'timestamp': ticker_data['timestamp']
        }))
        self.redis_client.expire(cache_key, 60)  # Expire after 60 seconds
        
    def get_latest_prices(self, exchange='all', symbol='BTC/USDT'):
        """Get latest prices from MongoDB"""
        query = {}
        if exchange != 'all':
            query['exchange'] = exchange
        if symbol != 'all':
            query['symbol'] = symbol
            
        # Try Redis cache first
        if exchange != 'all' and symbol != 'all':
            cache_key = f"price:{exchange}:{symbol}"
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        
        # Query MongoDB
        cursor = self.prices_collection.find(
            query,
            sort=[("timestamp", pymongo.DESCENDING)],
            limit=100
        )
        
        prices = list(cursor)
        for price in prices:
            price['_id'] = str(price['_id'])  # Convert ObjectId to string
            
        return prices
        
    def get_historical_prices(self, exchange, symbol, days=7):
        """Get historical price data from TimescaleDB"""
        self.timescale_cursor.execute(""" 
            SELECT timestamp, price, volume
            FROM historical_prices
            WHERE exchange = %s AND symbol = %s AND timestamp > NOW() - INTERVAL %s DAY
            ORDER BY timestamp
        """, (exchange, symbol, days))
        
        results = self.timescale_cursor.fetchall()
        
        # Format as list of dictionaries
        history = [
            {
                'timestamp': ts.isoformat(),
                'price': float(price),
                'volume': float(volume) if volume else None
            }
            for ts, price, volume in results
        ]
        
        return history
        
    def save_arbitrage_opportunity(self, opportunity_data):
        """Save arbitrage opportunity to Redis"""
        opportunity_id = f"arb:{opportunity_data['buy_exchange']}:{opportunity_data['sell_exchange']}:{opportunity_data['symbol']}"
        self.redis_client.set(opportunity_id, json.dumps(opportunity_data))
        self.redis_client.expire(opportunity_id, 300)  # Expire after 5 minutes
        
        # Add to recent opportunities list
        self.redis_client.lpush("recent_arbitrage_opportunities", json.dumps(opportunity_data))
        self.redis_client.ltrim("recent_arbitrage_opportunities", 0, 99)  # Keep only 100 most recent
        
    def get_recent_opportunities(self, min_profit=0.5):
        """Get recent arbitrage opportunities from Redis"""
        opportunities = []
        
        # Get the list of recent opportunities
        recent = self.redis_client.lrange("recent_arbitrage_opportunities", 0, 99)
        
        for opp_json in recent:
            opp = json.loads(opp_json)
            if opp['profit_percent'] >= min_profit:
                opportunities.append(opp)
                
        return opportunities
        
    def save_trade(self, trade_data):
        """Save executed trade to PostgreSQL"""
        self.pg_cursor.execute(""" 
            INSERT INTO arbitrage_trades (
                trade_id, user_id, symbol, buy_exchange, sell_exchange,
                buy_price, sell_price, amount, profit, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            trade_data['trade_id'],
            trade_data['user_id'],
            trade_data['symbol'],
            trade_data['buy_exchange'],
            trade_data['sell_exchange'],
            trade_data['buy_price'],
            trade_data['sell_price'],
            trade_data['amount'],
            trade_data['profit'],
            trade_data['status']
        ))
        self.pg_conn.commit()
        
    def get_user_trades(self, user_id):
        """Get all trades for a specific user"""
        self.pg_cursor.execute(""" 
            SELECT * FROM arbitrage_trades
            WHERE user_id = %s
            ORDER BY trade_timestamp DESC
        """, (user_id,))
        
        columns = [desc[0] for desc in self.pg_cursor.description]
        results = self.pg_cursor.fetchall()
        
        trades = []
        for row in results:
            trade = dict(zip(columns, row))
            # Convert decimal and datetime types to JSON-serializable formats
            for key, value in trade.items():
                if isinstance(value, (decimal.Decimal)):
                    trade[key] = float(value)
                elif isinstance(value, datetime):
                    trade[key] = value.isoformat()
                    
            trades.append(trade)
            
        return trades
