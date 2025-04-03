import psycopg2

def create_timescaledb_extension():
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host="localhost",
            database="crypto_arbitrage",
            user="postgres",
            password="root123"
        )
        cursor = conn.cursor()
        
        # Create TimescaleDB extension
        cursor.execute("CREATE EXTENSION IF NOT EXISTS timescaledb;")
        conn.commit()
        print("TimescaleDB extension created successfully.")
        
    except Exception as e:
        print(f"Error creating TimescaleDB extension: {str(e)}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_timescaledb_extension()
