import psycopg2

def check_timescaledb():
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host="localhost",
            database="crypto_arbitrage",
            user="postgres",
            password="root123"
        )
        cursor = conn.cursor()
        
        # Check if TimescaleDB extension is available
        cursor.execute("SELECT * FROM pg_available_extensions WHERE name = 'timescaledb';")
        result = cursor.fetchone()
        
        if result:
            print("TimescaleDB extension is available.")
            
            # Check if the historical_prices table exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.tables 
                    WHERE table_name = 'historical_prices'
                );
            """)
            table_exists = cursor.fetchone()[0]
            
            if not table_exists:
                # Create the historical_prices table if it does not exist
                cursor.execute("""
                    CREATE TABLE historical_prices (
                        id SERIAL,
                        price NUMERIC NOT NULL,
                        timestamp TIMESTAMPTZ NOT NULL,
                        PRIMARY KEY (id, timestamp)  -- Ensure timestamp is part of the primary key
                    );
                """)
                print("Table 'historical_prices' created successfully.")
            
            # Attempt to create hypertable
            cursor.execute("""
                SELECT create_hypertable('historical_prices', 'timestamp', if_not_exists => TRUE);
            """)
            print("Hypertable created successfully.")
        else:
            print("TimescaleDB extension is not available.")
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    check_timescaledb()
