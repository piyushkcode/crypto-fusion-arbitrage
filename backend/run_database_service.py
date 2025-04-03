import logging
from services.database_service import DatabaseService

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    db_service = DatabaseService()
    db_service.reinitialize_databases()
