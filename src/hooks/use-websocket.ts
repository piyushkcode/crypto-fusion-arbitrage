
import { useState, useEffect, useRef } from 'react';

// WebSocket server URL
const WS_URL = 'ws://localhost:8765';

export type WebSocketMessage = {
  type: string;
  data: any;
};

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [tickerData, setTickerData] = useState<any[]>([]);
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const socket = new WebSocket(WS_URL);
    websocketRef.current = socket;

    // Connection opened
    socket.addEventListener('open', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
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
    socket.addEventListener('close', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Connection error
    socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
    });

    // Clean up on unmount
    return () => {
      socket.close();
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

  return {
    isConnected,
    lastMessage,
    sendMessage,
    tickerData
  };
};
