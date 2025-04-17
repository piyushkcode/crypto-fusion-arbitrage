import React, { useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const [priceData, setPriceData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9000');

    ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPriceData(prevData => [...prevData, data]);
    };

    ws.onerror = (error) => {
      setError('WebSocket Error: ' + error.message);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Crypto Fusion Arbitrage</h1>
        {error && <div className="error">{error}</div>}
        <div className="price-data">
          {priceData.map((data, index) => (
            <div key={index} className="price-item">
              <p>Exchange: {data.exchange}</p>
              <p>Symbol: {data.symbol}</p>
              <p>Price: {data.price}</p>
              <p>Timestamp: {new Date(data.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
};

export default App; 