import { useState, useEffect, useRef, useCallback } from 'react';
import { generateAllPriceData } from '@/utils/mockData';

// WebSocket server URL - should be configurable for different environments
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8765';

// Connection states for more granular tracking
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error' | 'using-mock-data';

export type WebSocketMessage = {
  type: string;
  data: any;
};

export const useWebSocket = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [tickerData, setTickerData] = useState<any[]>([]);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<Date | null>(null);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  // Add a log with timestamp
  const addConnectionLog = useCallback((message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Console logging
    if (level === 'info') console.info(logMessage);
    else if (level === 'warn') console.warn(logMessage);
    else if (level === 'error') console.error(logMessage);
    
    // Add to connection logs (keep last 50)
    setConnectionLogs(prevLogs => [...prevLogs.slice(-49), logMessage]);
  }, []);

  const closeWebSocket = useCallback(() => {
    if (websocketRef.current) {
      addConnectionLog('Closing WebSocket connection', 'info');
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    // Clear heartbeat interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, [addConnectionLog]);

  // Send heartbeat ping
  const sendHeartbeat = useCallback(() => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      try {
        websocketRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        addConnectionLog('Ping heartbeat sent', 'info');
      } catch (error) {
        addConnectionLog(`Failed to send heartbeat: ${error}`, 'error');
      }
    }
  }, [addConnectionLog]);

  // Check if connection is stale (no heartbeat response)
  const checkConnectionHealth = useCallback(() => {
    if (connectionState === 'connected') {
      const now = new Date();
      if (lastHeartbeatTime) {
        const timeSinceLastHeartbeat = now.getTime() - lastHeartbeatTime.getTime();
        if (timeSinceLastHeartbeat > 30000) { // 30 seconds
          addConnectionLog('Connection appears stale (no heartbeat for 30s). Reconnecting...', 'warn');
          closeWebSocket();
          attemptReconnect();
        }
      }
    }
  }, [connectionState, lastHeartbeatTime, closeWebSocket, addConnectionLog]);

  const initializeConnection = useCallback(() => {
    // Clear any existing connection
    closeWebSocket();
    
    try {
      addConnectionLog(`Attempting to connect to WebSocket server at: ${WS_URL}`, 'info');
      setConnectionState('connecting');
      
      const socket = new WebSocket(WS_URL);
      websocketRef.current = socket;

      socket.addEventListener('open', () => {
        addConnectionLog('WebSocket connected successfully', 'info');
        setConnectionState('connected');
        reconnectAttempts.current = 0;
        
        // Subscribe to ticker updates
        socket.send(JSON.stringify({
          type: 'subscribe',
          channel: 'tickers',
        }));
        
        // Set up heartbeat interval (every 15 seconds)
        heartbeatIntervalRef.current = setInterval(() => {
          sendHeartbeat();
          
          // Check connection health
          checkConnectionHealth();
        }, 15000);
      });

      socket.addEventListener('message', (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle pong response
          if (message.type === 'pong') {
            setLastHeartbeatTime(new Date());
            addConnectionLog('Received pong heartbeat', 'info');
            return;
          }
          
          // Handle ticker updates
          if (message.type === 'ticker_update') {
            setTickerData(message.data);
          }
        } catch (error) {
          addConnectionLog(`Error parsing WebSocket message: ${error}`, 'error');
        }
      });

      socket.addEventListener('close', (event) => {
        addConnectionLog(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason || 'Unknown'}`, 'warn');
        setConnectionState('disconnected');
        attemptReconnect();
      });

      socket.addEventListener('error', (event) => {
        addConnectionLog(`WebSocket error: ${event}`, 'error');
        setConnectionState('error');
        attemptReconnect();
      });

    } catch (error) {
      addConnectionLog(`Error initializing WebSocket: ${error}`, 'error');
      setConnectionState('error');
      attemptReconnect();
    }
  }, [closeWebSocket, sendHeartbeat, checkConnectionHealth, addConnectionLog]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      const attempt = reconnectAttempts.current + 1;
      addConnectionLog(`Attempting to reconnect (${attempt}/${maxReconnectAttempts})...`, 'info');
      
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
      addConnectionLog('Max reconnect attempts reached. Using mock data.', 'warn');
      setConnectionState('using-mock-data');
      // Use mock data as fallback
      setTickerData(generateAllPriceData());
    }
  }, [initializeConnection, addConnectionLog]);

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
    if (connectionState === 'using-mock-data') {
      const interval = setInterval(() => {
        setTickerData(generateAllPriceData());
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [connectionState]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    lastMessage,
    tickerData,
    reconnect: initializeConnection,
    lastHeartbeatTime,
    connectionLogs
  };
};
