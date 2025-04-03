import pymongo
import os

def test_mongo_connection():
    try:
        # Connect to MongoDB
        mongo_client = pymongo.MongoClient("mongodb+srv://pkinekar2004:root1234@cluster0.uwapo.mongodb.net/")
        
        # Create the database if it does not exist
        db = mongo_client["crypto_arbitrage"]
        
        # Attempt to get the server information
        server_info = mongo_client.server_info()
        print("Connected to MongoDB Atlas!")
        print("Server Info:", server_info)
        
        # Check if the database exists
        if "crypto_arbitrage" in mongo_client.list_database_names():
            print("Database 'crypto_arbitrage' exists.")
        else:
            print("Database 'crypto_arbitrage' does not exist. It will be created.")
            # Create a collection to ensure the database is created
            db.create_collection("test_collection")
            print("Database 'crypto_arbitrage' has been created.")
            
    except Exception as e:
        print("Failed to connect to MongoDB Atlas.")
        print("Error:", str(e))

if __name__ == "__main__":
    test_mongo_connection()
