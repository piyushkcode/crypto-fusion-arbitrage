
import { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Function to initialize connection
    const initializeConnection = () => {
      try {
        // Create WebSocket connection
        console.log('Attempting to connect to WebSocket server at:', WS_URL);
        const socket = new WebSocket(WS_URL);
        websocketRef.current = socket;

        // Connection opened
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

        // Listen for messages
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

        // Connection closed
        socket.addEventListener('close', (event) => {
          console.info('WebSocket disconnected', event);
          setIsConnected(false);
          attemptReconnect();
        });

        // Connection error
        socket.addEventListener('error', (event) => {
          console.error('WebSocket error:', event);
          // Don't set isConnected to false here, let the close event handle that
        });

      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        setIsConnected(false);
        attemptReconnect();
      }
    };

    // Function to attempt reconnection
    const attemptReconnect = () => {
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
        const mockData = generateAllPriceData();
        setTickerData(mockData);
        
        // Schedule periodic mock data updates
        const mockDataInterval = setInterval(() => {
          setTickerData(generateAllPriceData());
        }, 5000);
        
        return () => clearInterval(mockDataInterval);
      }
    };

    // Initialize connection
    initializeConnection();

    // Clean up on unmount
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Send a message through the WebSocket
  const sendMessage = (message: object) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  // If not connected and have retried max attempts, provide mock data
  useEffect(() => {
    if (!isConnected && reconnectAttempts.current >= maxReconnectAttempts && tickerData.length === 0) {
      console.log('Using mock data as fallback');
      setTickerData(generateAllPriceData());
      
      // Update mock data periodically
      const interval = setInterval(() => {
        setTickerData(generateAllPriceData());
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected, tickerData.length]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    tickerData
  };
};
