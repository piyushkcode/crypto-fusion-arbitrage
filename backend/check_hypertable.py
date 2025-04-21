
import logging
import psycopg2
import os
import sys
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_connection():
    """Test TimescaleDB connection and hypertable setup"""
    try:
        # Read environment variables or use defaults from docker-compose
        db_host = os.getenv('TIMESCALE_HOST', 'localhost')
        db_port = int(os.getenv('TIMESCALE_PORT', '5433'))  # Default to 5433 as in docker-compose
        db_name = os.getenv('TIMESCALE_DB', 'timescale_db')
        db_user = os.getenv('TIMESCALE_USER', 'postgres')
        db_password = os.getenv('TIMESCALE_PASSWORD', 'your_password')
        
        logger.info(f"Attempting to connect to TimescaleDB at {db_host}:{db_port}")
        
        # Connect to TimescaleDB
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        
        logger.info("Connection successful!")
        
        # Create cursor
        cur = conn.cursor()
        
        # Check if TimescaleDB extension is installed
        cur.execute("SELECT extname FROM pg_extension WHERE extname = 'timescaledb';")
        if cur.fetchone():
            logger.info("TimescaleDB extension is installed.")
        else:
            logger.warning("TimescaleDB extension is NOT installed!")
            logger.info("Attempting to create TimescaleDB extension...")
            try:
                cur.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;")
                conn.commit()
                logger.info("TimescaleDB extension created successfully.")
            except Exception as e:
                logger.error(f"Failed to create TimescaleDB extension: {str(e)}")
                return False
        
        # Check if historical_prices table exists and create it if not
        cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'historical_prices');")
        if not cur.fetchone()[0]:
            logger.info("Creating historical_prices table...")
            cur.execute("""
                CREATE TABLE historical_prices (
                    timestamp TIMESTAMPTZ NOT NULL,
                    symbol VARCHAR(20) NOT NULL,
                    exchange VARCHAR(50) NOT NULL,
                    price NUMERIC(20, 8) NOT NULL,
                    volume NUMERIC(20, 8)
                );
            """)
            
            # Create hypertable
            cur.execute("""
                SELECT create_hypertable('historical_prices', 'timestamp');
            """)
            conn.commit()
            logger.info("Table and hypertable created successfully.")
            
            # Insert some sample data
            logger.info("Inserting sample data...")
            now = datetime.now()
            symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']
            exchanges = ['binance', 'kucoin', 'bybit', 'okx']
            
            for i in range(100):
                for symbol in symbols:
                    for exchange in exchanges:
                        base_price = 60000 if symbol == 'BTC/USDT' else 3000 if symbol == 'ETH/USDT' else 100
                        # Add some random variation
                        price = base_price * (1 + (i * 0.001)) * (0.98 + 0.04 * (exchanges.index(exchange) / len(exchanges)))
                        volume = 100000 + (i * 1000)
                        
                        timestamp = now - timedelta(hours=i)
                        
                        cur.execute("""
                            INSERT INTO historical_prices (timestamp, symbol, exchange, price, volume)
                            VALUES (%s, %s, %s, %s, %s);
                        """, (timestamp, symbol, exchange, price, volume))
            
            conn.commit()
            logger.info("Sample data inserted successfully.")
        else:
            logger.info("historical_prices table already exists.")
            
            # Check if it's a hypertable
            cur.execute("SELECT * FROM timescaledb_information.hypertables WHERE hypertable_name = 'historical_prices';")
            if cur.fetchone():
                logger.info("historical_prices is a hypertable.")
            else:
                logger.warning("historical_prices exists but is NOT a hypertable!")
        
        # Verify data exists
        cur.execute("SELECT COUNT(*) FROM historical_prices;")
        count = cur.fetchone()[0]
        logger.info(f"historical_prices table contains {count} records.")
        
        # Test a query
        if count > 0:
            cur.execute("""
                SELECT timestamp, symbol, exchange, price, volume
                FROM historical_prices
                ORDER BY timestamp DESC
                LIMIT 5;
            """)
            rows = cur.fetchall()
            logger.info("Sample data from historical_prices:")
            for row in rows:
                logger.info(f"  {row[0]} | {row[1]} | {row[2]} | ${row[3]:.2f} | {row[4]}")
        
        # Close connections
        cur.close()
        conn.close()
        logger.info("Connection closed.")
        return True
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = check_connection()
    sys.exit(0 if success else 1)
