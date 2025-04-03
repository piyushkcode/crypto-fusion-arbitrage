import pymongo
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_mongo_connection():
    try:
        # Connect to MongoDB
        mongo_client = pymongo.MongoClient("mongodb+srv://pkinekar2004:root1234@cluster0.uwapo.mongodb.net/")
        mongo_db = mongo_client["crypto_arbitrage"]
        
        # Check if the connection is successful by listing the collections
        collections = mongo_db.list_collection_names()
        logger.info(f"Connected to MongoDB. Collections: {collections}")
        
    except pymongo.errors.ConnectionError as e:
        logger.error(f"MongoDB connection error: {str(e)}")

if __name__ == "__main__":
    test_mongo_connection()
