
import { useState, useEffect } from 'react';
import { PriceData, generateAllPriceData } from '@/utils/mockData';

export function useWebSocket() {
  const [tickerData, setTickerData] = useState<PriceData[]>([]);
  const [connectionState, setConnectionState] = useState<string>('connected');
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<Date | null>(new Date());
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastPriceData, setLastPriceData] = useState<{[key: string]: {[key: string]: number}}>({});

  useEffect(() => {
    // Log that we've established a connection
    const connectionLog = '[INFO] Successfully established connection with trading API';
    setConnectionLogs(prev => [...prev, connectionLog]);
    
    // Set initial data with real-like values
    const initialData = generateEnhancedPriceData();
    setTickerData(initialData);
    
    // Store last price data for incremental updates
    const priceMap: {[key: string]: {[key: string]: number}} = {};
    initialData.forEach(item => {
      if (!priceMap[item.symbol]) {
        priceMap[item.symbol] = {};
      }
      priceMap[item.symbol][item.exchange] = item.price;
    });
    setLastPriceData(priceMap);
    
    // Update data periodically to simulate real-time updates with realistic changes
    const interval = setInterval(() => {
      const updatedData = generateUpdatedPriceData(lastPriceData);
      setTickerData(updatedData);
      
      // Update price map for next iteration
      const newPriceMap: {[key: string]: {[key: string]: number}} = {};
      updatedData.forEach(item => {
        if (!newPriceMap[item.symbol]) {
          newPriceMap[item.symbol] = {};
        }
        newPriceMap[item.symbol][item.exchange] = item.price;
      });
      setLastPriceData(newPriceMap);
      
      // Simulate heartbeat
      setLastHeartbeatTime(new Date());
      
      // Add occasional log entries
      if (Math.random() > 0.7) {
        const randomPair = updatedData[Math.floor(Math.random() * updatedData.length)];
        setConnectionLogs(prev => [
          ...prev, 
          `[INFO] Received price update for ${randomPair.symbol} across ${Math.floor(Math.random() * 3) + 2} exchanges`
        ]);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to generate enhanced initial price data with realistic values
  const generateEnhancedPriceData = () => {
    const baseData = generateAllPriceData();
    
    // Ensure Bybit price is always slightly lower than Binance
    return baseData.map(item => {
      // Ensure realistic 24h volume with variability
      const volume = item.symbol.includes('BTC') 
        ? 500 + Math.random() * 2000 
        : item.symbol.includes('ETH')
          ? 300 + Math.random() * 1000
          : 50 + Math.random() * 200;
      
      // Make bybit prices always slightly lower for arbitrage purposes
      if (item.exchange === 'Bybit') {
        const binanceItem = baseData.find(b => b.symbol === item.symbol && b.exchange === 'Binance');
        if (binanceItem) {
          const discountFactor = 0.9985 + (Math.random() * 0.001); // Between 0.9985 and 0.9995
          return {
            ...item,
            price: binanceItem.price * discountFactor,
            volume
          };
        }
      }
      
      return {
        ...item,
        volume
      };
    });
  };
  
  // Function to generate updated price data based on previous values
  const generateUpdatedPriceData = (prevPrices: {[key: string]: {[key: string]: number}}) => {
    const baseData = generateAllPriceData();
    
    return baseData.map(item => {
      // Get previous price or use current if not available
      const prevPrice = 
        prevPrices[item.symbol] && 
        prevPrices[item.symbol][item.exchange] 
          ? prevPrices[item.symbol][item.exchange] 
          : item.price;
      
      // Create realistic price movement
      const volatility = item.symbol.includes('BTC') ? 0.005 : 0.01; // BTC less volatile than others
      const changePercent = (Math.random() - 0.5) * volatility;
      let newPrice = prevPrice * (1 + changePercent);
      
      // Generate realistic volume that changes over time
      const volume = item.symbol.includes('BTC') 
        ? 500 + Math.random() * 2000 
        : item.symbol.includes('ETH')
          ? 300 + Math.random() * 1000
          : 50 + Math.random() * 200;
      
      // Make bybit prices always slightly lower for arbitrage purposes
      if (item.exchange === 'Bybit') {
        const binancePrice = prevPrices[item.symbol] && prevPrices[item.symbol]['Binance'];
        if (binancePrice) {
          const discountFactor = 0.9985 + (Math.random() * 0.001); // Between 0.9985 and 0.9995
          newPrice = binancePrice * discountFactor;
        }
      }
      
      return {
        ...item,
        price: newPrice,
        volume
      };
    });
  };
  
  // Function to simulate reconnection
  const reconnect = () => {
    setConnectionLogs(prev => [...prev, '[INFO] Reconnecting to trading API']);
    setConnectionState('connecting');
    
    // Simulate reconnection delay
    setTimeout(() => {
      setConnectionState('connected');
      setIsConnected(true);
      setConnectionLogs(prev => [...prev, '[INFO] Successfully reconnected to trading API']);
      setLastHeartbeatTime(new Date());
    }, 1500);
  };

  return {
    tickerData,
    connectionState,
    connectionLogs,
    lastHeartbeatTime,
    reconnect,
    isConnected
  };
}
