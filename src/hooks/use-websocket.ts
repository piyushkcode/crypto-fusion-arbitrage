
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateAllPriceData } from '@/utils/mockData';

// WebSocket server URL - should be configurable for different environments
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8765';

export type WebSocketMessage = {
  type: string;
  data: any;
};

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [tickerData, setTickerData] = useState<any[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  const closeWebSocket = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  }, []);

  const initializeConnection = useCallback(() => {
    // Clear any existing connection
    closeWebSocket();

    try {
      console.log('Attempting to connect to WebSocket server at:', WS_URL);
      const socket = new WebSocket(WS_URL);
      websocketRef.current = socket;

      socket.addEventListener('open', () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Subscribe to ticker updates
        socket.send(JSON.stringify({
          type: 'subscribe',
          channel: 'tickers',
        }));
      });

      socket.addEventListener('message', (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          if (message.type === 'ticker_update') {
            setTickerData(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      socket.addEventListener('close', (event) => {
        console.info('WebSocket disconnected', event);
        setIsConnected(false);
        attemptReconnect();
      });

      socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        setIsConnected(false);
        attemptReconnect();
      });

    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setIsConnected(false);
      attemptReconnect();
    }
  }, [closeWebSocket]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
      
      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Set timeout for reconnection (with exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        initializeConnection();
      }, delay);
    } else {
      console.log('Max reconnect attempts reached. Using mock data.');
      // Use mock data as fallback
      setTickerData(generateAllPriceData());
    }
  }, [initializeConnection]);

  // Initialize connection on component mount
  useEffect(() => {
    initializeConnection();

    // Cleanup on unmount
    return () => {
      closeWebSocket();
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeConnection, closeWebSocket]);

  // Periodic mock data update if not connected
  useEffect(() => {
    if (!isConnected && reconnectAttempts.current >= maxReconnectAttempts) {
      const interval = setInterval(() => {
        setTickerData(generateAllPriceData());
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return {
    isConnected,
    lastMessage,
    tickerData,
    reconnect: initializeConnection
  };
};
