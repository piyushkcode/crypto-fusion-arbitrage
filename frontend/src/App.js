
import React, { useState } from 'react';
import './App.css';
import { useWebSocket } from '../src/hooks/use-websocket';

const App = () => {
  const [error, setError] = useState(null);
  const { tickerData, connectionState } = useWebSocket();

  // Display connection status message
  const getConnectionStatus = () => {
    switch(connectionState) {
      case 'connected':
        return <div className="connected-status">Connected to WebSocket</div>;
      case 'connecting':
        return <div className="connecting-status">Connecting to WebSocket...</div>;
      case 'error':
        return <div className="error-status">WebSocket connection error</div>;
      case 'using-mock-data':
        return <div className="mock-status">Using simulated data</div>;
      default:
        return <div className="disconnected-status">Disconnected from WebSocket</div>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Crypto Fusion Arbitrage</h1>
        {getConnectionStatus()}
        {error && <div className="error">{error}</div>}
        <div className="price-data">
          {tickerData.map((data, index) => (
            <div key={index} className="price-item">
              <p>Exchange: {data.exchange}</p>
              <p>Symbol: {data.symbol || data.pair}</p>
              <p>Price: {data.price}</p>
              <p>Timestamp: {new Date(data.timestamp || Date.now()).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
};

export default App;
