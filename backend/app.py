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
import threading

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize services
exchange_service = ExchangeService(
    api_key=os.environ.get('KUCOIN_API_KEY', '67ed8abd71c378000192926b'),
    api_secret=os.environ.get('KUCOIN_API_SECRET', '8541e8aa-5b0b-4a81-b004-156359a36f44'),
    api_passphrase=os.environ.get('KUCOIN_API_PASSPHRASE', 'kucoinapicrypto')
)

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

@socketio.on('subscribe_tickers')
def handle_subscribe_tickers(data):
    logger.info(f'Client subscribed to tickers: {data}')
    # Here we can implement logic to send ticker updates to the client
    # For example, we can call a method from the exchange_service to start sending updates
    if 'pair' in data:
        # Subscribe to specific trading pair updates
        exchange_service.subscribe_to_pair(data['pair'])
    else:
        logger.warning('No trading pair specified for subscription.')

# REST API endpoints
@app.route('/api/exchanges', methods=['GET'])
def get_exchanges():
    """Get list of supported exchanges"""
    try:
        return jsonify(exchange_service.get_supported_exchanges())
    except Exception as e:
        logger.error(f"Error fetching exchanges: {str(e)}")
        return jsonify({'error': 'Failed to fetch exchanges'}), 500

@app.route('/api/pairs', methods=['GET'])
def get_pairs():
    """Get list of supported trading pairs"""
    return jsonify(exchange_service.get_supported_pairs())

@app.route('/api/prices', methods=['GET'])
def get_prices():
    """Get current prices from all exchanges"""
    exchange = request.args.get('exchange', 'all')
    pair = request.args.get('pair', 'BTC/USDT')
    
    try:
        prices = database_service.get_latest_prices(exchange, pair)
        return jsonify(prices)
    except Exception as e:
        logger.error(f"Error fetching prices: {str(e)}")
        return jsonify({'error': 'Failed to fetch prices'}), 500

@app.route('/api/opportunities', methods=['GET'])
def get_opportunities():
    """Get current arbitrage opportunities"""
    min_profit = float(request.args.get('min_profit', 0.5))
    pair = request.args.get('pair', 'all')
    strategy = request.args.get('strategy', 'simple')  # Default to simple arbitrage
    
    try:
        opportunities = arbitrage_service.find_opportunities(min_profit, pair, strategy)
        return jsonify(opportunities)
    except Exception as e:
        logger.error(f"Error fetching opportunities: {str(e)}")
        return jsonify({'error': 'Failed to fetch opportunities'}), 500

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
    
    # Get strategy type from request
    strategy_type = data.get('strategy_type', 'simple')
    
    result = arbitrage_service.execute_trade(
        user_id=data['user_id'],
        buy_exchange=data['buy_exchange'],
        sell_exchange=data['sell_exchange'],
        pair=data['pair'],
        amount=data['amount'],
        strategy_type=strategy_type
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

@app.route('/api/connection_status', methods=['GET'])
def get_connection_status():
    """Get current connection status information"""
    try:
        status = {
            'connected': True,
            'exchanges': {
                'Binance': exchange_service.binance.has['publicAPI'],
                'KuCoin': exchange_service.kucoin.has['publicAPI'],
                'Bybit': exchange_service.bybit.has['publicAPI'],
                'OKX': exchange_service.okx.has['publicAPI']
            },
            'last_update': exchange_service.last_ticker_update,
            'cache_size': len(exchange_service.price_cache),
            'timestamp': datetime.now().isoformat()
        }
        return jsonify(status)
    except Exception as e:
        logger.error(f"Error getting connection status: {str(e)}")
        return jsonify({'error': 'Failed to get connection status'}), 500

def start_websocket_thread():
    """Start the WebSocket server in a separate thread"""
    try:
        exchange_service.start()
    except Exception as e:
        logger.error(f"Error starting WebSocket server: {str(e)}")

if __name__ == '__main__':
    # Start WebSocket server in a background thread
    if not hasattr(app, 'websocket_thread'):
        app.websocket_thread = threading.Thread(target=start_websocket_thread)
        app.websocket_thread.daemon = True
        app.websocket_thread.start()
    
    # Start the Flask app with SocketIO
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
