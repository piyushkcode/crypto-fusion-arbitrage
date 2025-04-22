
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, LineChart, ArrowRight, Check } from 'lucide-react';

interface TradingBotVisualizerProps {
  isActive: boolean;
  minProfit: number;
}

const TradingBotVisualizer: React.FC<TradingBotVisualizerProps> = ({ isActive, minProfit }) => {
  const [currentAction, setCurrentAction] = useState<string>('Scanning markets');
  const [logs, setLogs] = useState<string[]>([]);
  const [trades, setTrades] = useState<{pair: string, profit: number, time: string}[]>([]);
  const [balance, setBalance] = useState(10000);
  
  useEffect(() => {
    if (!isActive) {
      setCurrentAction('Idle');
      return;
    }
    
    // Reset logs when activated
    setLogs(['System initialized', 'Connecting to exchange APIs', 'Monitoring price feeds']);
    
    const actions = [
      'Scanning markets',
      'Analyzing price patterns',
      'Calculating arbitrage opportunities',
      'Evaluating market depth',
      'Running AI prediction models',
      'Checking order books',
      'Calculating execution costs',
      'Performing volatility analysis'
    ];
    
    // Rotate through different actions
    const actionInterval = setInterval(() => {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setCurrentAction(randomAction);
      
      // Occasionally add logs
      if (Math.random() > 0.7) {
        const newLog = `${randomAction} - ${new Date().toLocaleTimeString()}`;
        setLogs(prev => [newLog, ...prev].slice(0, 20));
      }
      
      // Occasionally execute trades
      if (Math.random() > 0.9) {
        executeTrade();
      }
    }, 3000);
    
    return () => clearInterval(actionInterval);
  }, [isActive]);
  
  const executeTrade = () => {
    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT'];
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    const randomProfit = +(minProfit + Math.random() * 0.5).toFixed(2);
    const timestamp = new Date().toLocaleTimeString();
    
    // Add trade to history
    const newTrade = {
      pair: randomPair,
      profit: randomProfit,
      time: timestamp
    };
    setTrades(prev => [newTrade, ...prev].slice(0, 10));
    
    // Update balance
    const tradeAmount = Math.random() * 500 + 100;
    const profitAmount = tradeAmount * (randomProfit / 100);
    setBalance(prev => +(prev + profitAmount).toFixed(2));
    
    // Add to logs
    setLogs(prev => [
      `Executed trade: ${randomPair} - Profit: ${randomProfit}%`,
      ...prev
    ].slice(0, 20));
  };
  
  if (!isActive) {
    return null;
  }

  return (
    <Card className="bg-crypto-card border-gray-700 mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-white flex items-center">
            <Bot className="h-5 w-5 mr-2 text-crypto-burgundy" />
            Trading Bot Activity
          </CardTitle>
          <div className="flex items-center">
            <div className="animate-pulse w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs text-green-400">Active</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 bg-crypto-dark rounded-md p-3">
          <div className="text-sm text-gray-300 mb-1">Current Action</div>
          <div className="text-white font-medium flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-crypto-purple" />
            {currentAction}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-crypto-dark rounded-md p-3">
            <div className="text-sm text-gray-300 mb-1">Current Balance</div>
            <div className="text-white font-medium">${balance.toLocaleString()}</div>
          </div>
          <div className="bg-crypto-dark rounded-md p-3">
            <div className="text-sm text-gray-300 mb-1">Trades Executed</div>
            <div className="text-white font-medium">{trades.length}</div>
          </div>
        </div>
        
        {trades.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-300 mb-2">Recent Trades</div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {trades.map((trade, i) => (
                <div key={i} className="bg-crypto-dark/50 rounded-md p-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <Check className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-white">{trade.pair}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-green-400">+{trade.profit}%</span>
                    <span className="text-xs text-gray-500 ml-2">{trade.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <div className="text-sm text-gray-300 mb-2">Execution Logs</div>
          <div className="bg-crypto-dark rounded-md p-2 max-h-32 overflow-y-auto text-xs space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="py-1">
                <span className="text-gray-400">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingBotVisualizer;
