
# Cryptocurrency Arbitrage Trading System

A full-stack AI-powered cryptocurrency arbitrage system that fetches real-time prices from multiple exchanges, detects arbitrage opportunities, predicts future price gaps, and automates trading execution.

## 🔹 Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Flask
- **Databases**:
  - MongoDB (real-time prices)
  - PostgreSQL (trades & user data)
  - TimescaleDB (time-series data)
  - Redis (caching)
- **AI/ML**: Jupyter Notebook with scikit-learn
- **API Connections**: Binance, KuCoin, Bybit, OKX

## 🔹 Project Structure

```
crypto-arbitrage/
├── backend/               # Flask API
│   ├── app.py             # Main Flask application
│   ├── Dockerfile         # Backend Docker configuration
│   ├── requirements.txt   # Python dependencies
│   └── services/          # Service modules
│       ├── exchange_service.py    # Exchange API integration
│       ├── database_service.py    # Database operations
│       ├── arbitrage_service.py   # Arbitrage detection
│       └── prediction_service.py  # Price prediction
│
├── frontend/             # React Frontend
│   ├── src/              # React source code
│   │   ├── components/   # UI components
│   │   └── pages/        # Application pages
│   └── Dockerfile        # Frontend Docker configuration
│
├── ai_model/             # ML Model
│   └── arbitrage_prediction.ipynb  # Jupyter notebook
│
└── docker-compose.yml    # Docker configuration
```

## 🔹 Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js (for frontend development)
- Python 3.9+ (for backend development)
- Jupyter Notebook (for AI model development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/crypto-arbitrage.git
   cd crypto-arbitrage
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Development Setup

For frontend development:
```
cd frontend
npm install
npm start
```

For backend development:
```
cd backend
pip install -r requirements.txt
python app.py
```

For AI model development:
```
cd ai_model
jupyter notebook
```

## 🔹 API Documentation

### Main Endpoints

- `GET /api/exchanges` - Get list of supported exchanges
- `GET /api/pairs` - Get list of supported trading pairs
- `GET /api/prices` - Get current prices from all exchanges
- `GET /api/opportunities` - Get current arbitrage opportunities
- `GET /api/predictions` - Get price predictions for specific pair
- `POST /api/execute_trade` - Execute arbitrage trade

## 🔹 Database Schema

### MongoDB (Real-time Price Storage)

```
live_prices:
- symbol: String (BTC/USDT, ETH/USDT, etc.)
- exchange: String (Binance, KuCoin, etc.)
- price: Float
- timestamp: DateTime
```

### PostgreSQL (Trade & Arbitrage Data)

```
users:
- user_id: UUID (Primary Key)
- email: String
- password_hash: String
- api_keys: JSONB (Encrypted API keys for trading)

arbitrage_trades:
- trade_id: UUID (Primary Key)
- user_id: UUID (Foreign Key)
- symbol: String
- buy_exchange: String
- sell_exchange: String
- buy_price: Float
- sell_price: Float
- profit: Float
- status: String
- trade_timestamp: DateTime
```

### TimescaleDB (Historical Data for AI Predictions)

```
historical_prices:
- timestamp: DateTime (Primary Key)
- symbol: String
- exchange: String
- price: Float
- volume: Float
```

### Redis (Caching for Fast Access)

```
recent_arbitrage_opportunities: Stores latest arbitrage gaps for quick retrieval
```

## 🔹 License

This project is licensed under the MIT License - see the LICENSE file for details.
