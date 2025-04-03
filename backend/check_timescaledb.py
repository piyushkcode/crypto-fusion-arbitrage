
import psycopg2

def check_database():
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host="localhost",
            database="crypto_arbitrage",
            user="postgres",
            password="root123"
        )
        cursor = conn.cursor()
        
        # Check if the database is available
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        if version:
            print("PostgreSQL database is available.")
            print(f"Version: {version[0]}")
        else:
            print("Failed to retrieve database version.")
        
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    check_database()
