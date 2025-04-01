
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
import json
import os
from datetime import datetime
import pandas as pd
import numpy as np
import logging
from services.exchange_service import ExchangeService
from services.arbitrage_service import ArbitrageService
from services.database_service import DatabaseService
from services.prediction_service import PredictionService

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize services
exchange_service = ExchangeService()
database_service = DatabaseService()
arbitrage_service = ArbitrageService(database_service)
prediction_service = PredictionService()

# WebSocket events
@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

# REST API endpoints
@app.route('/api/exchanges', methods=['GET'])
def get_exchanges():
    """Get list of supported exchanges"""
    return jsonify(exchange_service.get_supported_exchanges())

@app.route('/api/pairs', methods=['GET'])
def get_pairs():
    """Get list of supported trading pairs"""
    return jsonify(exchange_service.get_supported_pairs())

@app.route('/api/prices', methods=['GET'])
def get_prices():
    """Get current prices from all exchanges"""
    exchange = request.args.get('exchange', 'all')
    pair = request.args.get('pair', 'BTC/USDT')
    
    prices = database_service.get_latest_prices(exchange, pair)
    return jsonify(prices)

@app.route('/api/opportunities', methods=['GET'])
def get_opportunities():
    """Get current arbitrage opportunities"""
    min_profit = float(request.args.get('min_profit', 0.5))
    pair = request.args.get('pair', 'all')
    
    opportunities = arbitrage_service.find_opportunities(min_profit, pair)
    return jsonify(opportunities)

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    """Get price predictions for specific pair"""
    pair = request.args.get('pair', 'BTC/USDT')
    hours = int(request.args.get('hours', 24))
    
    predictions = prediction_service.predict_prices(pair, hours)
    return jsonify(predictions)

@app.route('/api/execute_trade', methods=['POST'])
def execute_trade():
    """Execute arbitrage trade"""
    data = request.json
    
    # Validate request
    required_fields = ['user_id', 'buy_exchange', 'sell_exchange', 'pair', 'amount']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    result = arbitrage_service.execute_trade(
        user_id=data['user_id'],
        buy_exchange=data['buy_exchange'],
        sell_exchange=data['sell_exchange'],
        pair=data['pair'],
        amount=data['amount']
    )
    
    return jsonify(result)

@app.route('/api/historical_data', methods=['GET'])
def get_historical():
    """Get historical price data"""
    pair = request.args.get('pair', 'BTC/USDT')
    exchange = request.args.get('exchange', 'binance')
    days = int(request.args.get('days', 7))
    
    data = database_service.get_historical_prices(exchange, pair, days)
    return jsonify(data)

if __name__ == '__main__':
    # Start data collection service
    exchange_service.start_data_collection()
    
    # Start the Flask app with SocketIO
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
