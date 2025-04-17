
import React, { useState } from 'react';
import './App.css';
import { useWebSocket } from '../src/hooks/use-websocket';

const App = () => {
  const [error, setError] = useState(null);
  const { tickerData } = useWebSocket();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Crypto Fusion Arbitrage</h1>
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
