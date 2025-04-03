
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  pair: string;
  amount: number;
  price: number;
  exchange: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  profit?: number;
}

interface TradingContextType {
  autoTrading: boolean;
  setAutoTrading: (value: boolean) => void;
  minProfit: number;
  setMinProfit: (value: number) => void;
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'timestamp'>) => void;
  balance: number;
  totalProfit: number;
  winRate: number;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [autoTrading, setAutoTrading] = useState(false);
  const [minProfit, setMinProfit] = useState(1.0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balance, setBalance] = useState(10000); // Starting balance

  // Calculate total profit
  const totalProfit = trades.reduce((sum, trade) => {
    if (trade.profit) {
      return sum + trade.profit;
    }
    return sum;
  }, 0);

  // Calculate win rate
  const successfulTrades = trades.filter(trade => 
    trade.status === 'completed' && (trade.profit ? trade.profit > 0 : false)
  ).length;
  const winRate = trades.length ? (successfulTrades / trades.length) * 100 : 0;

  // Add a new trade
  const addTrade = (tradeData: Omit<Trade, 'id' | 'timestamp'>) => {
    const newTrade: Trade = {
      ...tradeData,
      id: `trade-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    };
    
    setTrades(prevTrades => [newTrade, ...prevTrades]);
    
    // Update balance based on trade
    if (tradeData.status === 'completed') {
      if (tradeData.type === 'buy') {
        setBalance(prev => prev - (tradeData.amount * tradeData.price));
      } else {
        setBalance(prev => prev + (tradeData.amount * tradeData.price));
      }
      
      // If it's a profit from arbitrage
      if (tradeData.profit) {
        setBalance(prev => prev + tradeData.profit);
      }
    }
  };

  return (
    <TradingContext.Provider 
      value={{ 
        autoTrading, 
        setAutoTrading, 
        minProfit, 
        setMinProfit, 
        trades, 
        addTrade,
        balance,
        totalProfit,
        winRate
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTradingContext = () => {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTradingContext must be used within a TradingProvider');
  }
  return context;
};
