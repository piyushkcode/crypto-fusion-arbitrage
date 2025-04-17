
import { useState, useEffect } from 'react';
import { mockPriceData } from '@/utils/mockData';

interface TickerData {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: string;
}

export function useWebSocket() {
  const [tickerData, setTickerData] = useState<TickerData[]>([]);
  const [connectionState, setConnectionState] = useState<string>('using-mock-data');
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<Date | null>(null);

  useEffect(() => {
    // Log that we're using mock data
    const mockLog = '[INFO] Using mock data instead of WebSocket connection';
    setConnectionLogs(prev => [...prev, mockLog]);
    
    // Set initial mock data
    setTickerData(mockPriceData);
    
    // Update mock data periodically to simulate real-time updates
    const interval = setInterval(() => {
      const updatedMockData = mockPriceData.map(item => ({
        ...item,
        price: item.price * (1 + (Math.random() * 0.02 - 0.01)), // Random price fluctuation ±1%
        timestamp: new Date().toISOString()
      }));
      setTickerData(updatedMockData);
      
      // Simulate heartbeat
      setLastHeartbeatTime(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to simulate reconnection
  const reconnect = () => {
    setConnectionLogs(prev => [...prev, '[INFO] Reconnect requested, continuing with mock data']);
    // We're already using mock data, so nothing to reconnect to
  };

  return {
    tickerData,
    connectionState,
    connectionLogs,
    lastHeartbeatTime,
    reconnect
  };
}
