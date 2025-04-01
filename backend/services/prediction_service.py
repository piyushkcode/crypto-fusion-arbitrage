
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
import pickle
import os

logger = logging.getLogger(__name__)

class PredictionService:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_dir = "models"
        
        # Create models directory if it doesn't exist
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)
            
    def _prepare_features(self, df):
        """Prepare features for prediction model"""
        # Add time-based features
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        
        # Add lag features
        for lag in [1, 3, 6, 12, 24]:
            df[f'price_lag_{lag}'] = df['price'].shift(lag)
            
        # Add rolling statistics
        for window in [6, 12, 24]:
            df[f'price_mean_{window}'] = df['price'].rolling(window=window).mean()
            df[f'price_std_{window}'] = df['price'].rolling(window=window).std()
            
        # Add price differences
        df['price_diff_1'] = df['price'].diff(1)
        df['price_diff_24'] = df['price'].diff(24)
        
        # Fill missing values
        df = df.fillna(method='bfill')
        
        return df
        
    def train_model(self, symbol, database_service):
        """Train prediction model for a specific symbol"""
        logger.info(f"Training model for {symbol}")
        
        # Get historical data for the past 30 days
        # For simplicity, we'll use a single exchange (e.g., Binance)
        history = database_service.get_historical_prices('binance', symbol, days=30)
        
        if not history:
            logger.error(f"No historical data found for {symbol}")
            return None
            
        # Convert to DataFrame
        df = pd.DataFrame(history)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Prepare features
        df = self._prepare_features(df)
        
        # Define features and target
        feature_columns = [col for col in df.columns if col not in ['timestamp', 'price', 'volume']]
        X = df[feature_columns].values
        y = df['price'].values
        
        # Scale features
        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train a Random Forest model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_scaled, y)
        
        # Save model and scaler
        self.models[symbol] = model
        self.scalers[symbol] = scaler
        
        # Save to disk
        with open(f"{self.model_dir}/{symbol.replace('/', '_')}_model.pkl", 'wb') as f:
            pickle.dump(model, f)
        with open(f"{self.model_dir}/{symbol.replace('/', '_')}_scaler.pkl", 'wb') as f:
            pickle.dump(scaler, f)
            
        logger.info(f"Model trained and saved for {symbol}")
        return model
        
    def load_model(self, symbol):
        """Load saved model for a symbol"""
        model_path = f"{self.model_dir}/{symbol.replace('/', '_')}_model.pkl"
        scaler_path = f"{self.model_dir}/{symbol.replace('/', '_')}_scaler.pkl"
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            with open(scaler_path, 'rb') as f:
                scaler = pickle.load(f)
                
            self.models[symbol] = model
            self.scalers[symbol] = scaler
            return model
        else:
            logger.warning(f"No saved model found for {symbol}")
            return None
        
    def predict_prices(self, symbol, hours=24, database_service=None):
        """Predict prices for the next hours"""
        # Load or train model if not available
        if symbol not in self.models:
            model = self.load_model(symbol)
            if model is None and database_service:
                model = self.train_model(symbol, database_service)
            if model is None:
                return {'error': 'No model available and cannot train new model'}
                
        model = self.models[symbol]
        scaler = self.scalers[symbol]
        
        # Get recent data for prediction
        if database_service:
            history = database_service.get_historical_prices('binance', symbol, days=2)
            
            if not history:
                return {'error': 'No recent data available for prediction'}
                
            # Convert to DataFrame
            df = pd.DataFrame(history)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            
            # Prepare features
            df = self._prepare_features(df)
            
            # Get the most recent data point
            last_row = df.iloc[-1:].copy()
            
            # Create prediction dataframe
            pred_df = pd.DataFrame()
            pred_df['timestamp'] = [last_row['timestamp'].iloc[0] + timedelta(hours=i+1) for i in range(hours)]
            pred_df['price'] = np.nan
            
            # Add time features
            pred_df['hour'] = pred_df['timestamp'].dt.hour
            pred_df['day_of_week'] = pred_df['timestamp'].dt.dayofweek
            
            # Make predictions iteratively
            predictions = []
            current_price = last_row['price'].iloc[0]
            
            for i in range(hours):
                # Update prediction dataframe with previous predictions
                if i > 0:
                    for lag in range(1, min(i+1, 24)+1):
                        lag_idx = i - lag
                        pred_df.loc[i, f'price_lag_{lag}'] = predictions[lag_idx]
                else:
                    # For the first prediction, use historical values
                    for lag in range(1, 25):
                        if lag <= len(df):
                            pred_df.loc[0, f'price_lag_{lag}'] = df['price'].iloc[-lag]
                        else:
                            pred_df.loc[0, f'price_lag_{lag}'] = df['price'].iloc[0]
                
                # Fill in other features (simplified)
                for window in [6, 12, 24]:
                    pred_df.loc[i, f'price_mean_{window}'] = current_price
                    pred_df.loc[i, f'price_std_{window}'] = 0.01 * current_price
                
                pred_df.loc[i, 'price_diff_1'] = 0
                pred_df.loc[i, 'price_diff_24'] = 0
                
                # Extract features for prediction
                feature_columns = [col for col in pred_df.columns if col not in ['timestamp', 'price']]
                X_pred = pred_df.loc[i:i, feature_columns].values
                
                # Scale features
                X_pred_scaled = scaler.transform(X_pred)
                
                # Make prediction
                prediction = model.predict(X_pred_scaled)[0]
                predictions.append(prediction)
                
                # Update current price for next iteration
                current_price = prediction
            
            # Format results
            result = []
            for i, timestamp in enumerate(pred_df['timestamp']):
                result.append({
                    'timestamp': timestamp.isoformat(),
                    'price': float(predictions[i])
                })
            
            return result
        else:
            return {'error': 'Database service required for prediction'}
