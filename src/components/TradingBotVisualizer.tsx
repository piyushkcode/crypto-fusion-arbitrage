
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, LineChart, ArrowRight, Check, RefreshCw, TrendingUp, Zap } from 'lucide-react';
import { useTradingContext } from '@/contexts/TradingContext';
import { useToast } from '@/hooks/use-toast';

interface TradingBotVisualizerProps {
  isActive: boolean;
  minProfit: number;
}

const TradingBotVisualizer: React.FC<TradingBotVisualizerProps> = ({ isActive, minProfit }) => {
  const { addTrade, balance, setBalance } = useTradingContext();
  const { toast } = useToast();
  const [currentAction, setCurrentAction] = useState<string>('Scanning markets');
  const [currentStrategy, setCurrentStrategy] = useState<string>('simple');
  const [logs, setLogs] = useState<string[]>([]);
  const [trades, setTrades] = useState<{pair: string, profit: number, time: string, strategy: string}[]>([]);
  const [localBalance, setLocalBalance] = useState(balance);
  
  useEffect(() => {
    setLocalBalance(balance);
  }, [balance]);
  
  useEffect(() => {
    if (!isActive) {
      setCurrentAction('Idle');
      return;
    }
    
    // Reset logs when activated
    setLogs(['System initialized', 'Connecting to exchange APIs', 'Monitoring price feeds']);
    
    // All four arbitrage strategy types
    const strategies = ['simple', 'triangular', 'statistical', 'AI prediction'];
    
    const actionsMap: Record<string, string[]> = {
      'simple': [
        'Scanning for cross-exchange price gaps',
        'Analyzing exchange price differences',
        'Monitoring exchange order books',
        'Calculating cross-exchange fees',
        'Evaluating price arbitrage opportunities'
      ],
      'triangular': [
        'Searching for triangular trade paths',
        'Calculating three-way conversion rates',
        'Analyzing market depth on same exchange',
        'Evaluating triangular trade opportunities',
        'Computing cross-currency exchange rates'
      ],
      'statistical': [
        'Calculating Z-scores for price pairs',
        'Running mean reversion analysis',
        'Computing cointegration statistics',
        'Analyzing statistical arbitrage signals',
        'Running pair correlation tests'
      ],
      'AI prediction': [
        'Running LSTM price prediction models',
        'Analyzing historical price patterns',
        'Training XGBoost statistical model',
        'Computing prediction confidence scores',
        'Running time-series prediction analysis'
      ]
    };
    
    // Rotate through different strategies more frequently
    const strategyInterval = setInterval(() => {
      const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
      setCurrentStrategy(randomStrategy);
      
      const strategyActions = actionsMap[randomStrategy] || actionsMap['simple'];
      const randomAction = strategyActions[Math.floor(Math.random() * strategyActions.length)];
      setCurrentAction(randomAction);
      
      // Add logs for current strategy
      const newLog = `[${randomStrategy}] ${randomAction} - ${new Date().toLocaleTimeString()}`;
      setLogs(prev => [newLog, ...prev].slice(0, 20));
      
    }, 3000);
    
    // Execute trades with each strategy
    const tradeInterval = setInterval(() => {
      if (Math.random() > 0.6) { // Increased chance of executing trades
        executeTrade();
      }
    }, 5000);
    
    return () => {
      clearInterval(strategyInterval);
      clearInterval(tradeInterval);
    };
  }, [isActive, minProfit]);
  
  const executeTrade = () => {
    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'ADA/USDT'];
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    // Vary profit more to show different results
    const randomProfit = +(minProfit + Math.random() * 1.5).toFixed(2);
    const timestamp = new Date().toLocaleTimeString();
    const tradeStrategy = currentStrategy;
    
    // Calculate trade details with always positive profit
    const amount = Math.random() * 0.5 + 0.1;
    const buyPrice = getBasePriceForPair(randomPair) * (1 - (randomProfit / 200));
    const sellPrice = getBasePriceForPair(randomPair) * (1 + (randomProfit / 200));
    
    // Ensure profit is always positive for bot trades
    const profit = Math.abs(amount * (sellPrice - buyPrice));
    
    // Create a trade in the context
    addTrade({
      type: 'buy',
      pair: randomPair,
      amount,
      price: buyPrice,
      exchange: getRandomExchange(tradeStrategy),
      status: 'completed',
      profit: profit  // Always positive profit for bot trades
    });
    
    // Add trade to local state for visualization
    const newTrade = {
      pair: randomPair,
      profit: randomProfit,
      time: timestamp,
      strategy: tradeStrategy
    };
    setTrades(prev => [newTrade, ...prev].slice(0, 10));
    
    // Update local balance mirror to ensure it stays consistent with the context
    setLocalBalance(prev => prev + profit);
    
    // Directly update the balance in context to ensure consistency
    // Fix: Instead of using functional update, calculate the new balance and pass it directly
    const newBalance = balance + profit;
    setBalance(newBalance);
    
    // Notify user of significant profits
    if (profit > 100) {
      toast({
        title: "High Profit Trade!",
        description: `The trading bot made $${profit.toFixed(2)} on ${randomPair}`,
      });
    }
    
    // Add to logs
    setLogs(prev => [
      `[${tradeStrategy}] Executed trade: ${randomPair} - Profit: ${randomProfit}% ($${profit.toFixed(2)})`,
      ...prev
    ].slice(0, 20));
  };
  
  // Helper function to get appropriate exchange based on strategy
  const getRandomExchange = (strategy: string): string => {
    const exchanges = ['Binance', 'Bybit', 'KuCoin', 'OKX'];
    if (strategy === 'triangular') {
      // For triangular arbitrage, only use a single exchange
      return exchanges[Math.floor(Math.random() * exchanges.length)];
    }
    // For other strategies, return random exchange
    return exchanges[Math.floor(Math.random() * exchanges.length)];
  };
  
  // Helper function to get base price for pairs
  const getBasePriceForPair = (pair: string): number => {
    switch(pair) {
      case 'BTC/USDT': return 87000 + Math.random() * 1900; // 87000-88900
      case 'ETH/USDT': return 1530 + Math.random() * 60;    // 1530-1590
      case 'XRP/USDT': return 2.06 + Math.random() * 0.03;  // 2.06-2.09
      case 'SOL/USDT': return 134.72 + Math.random() * 6.58; // 134.72-141.30
      case 'ADA/USDT': return 0.6192 + Math.random() * 0.0288; // 0.6192-0.648
      default: return 100;
    }
  };
  
  const getStrategyIcon = (strategy: string) => {
    switch(strategy) {
      case 'simple': return <ArrowRight className="h-3 w-3 text-blue-500" />;
      case 'triangular': return <RefreshCw className="h-3 w-3 text-green-500" />;
      case 'statistical': return <TrendingUp className="h-3 w-3 text-purple-500" />;
      case 'AI prediction': return <Zap className="h-3 w-3 text-yellow-500" />;
      default: return <Check className="h-3 w-3 text-green-500" />;
    }
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
          <div className="text-sm text-gray-300 mb-1">Current Strategy: <span className="text-crypto-purple capitalize">{currentStrategy}</span></div>
          <div className="text-white font-medium flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-crypto-purple" />
            {currentAction}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-crypto-dark rounded-md p-3">
            <div className="text-sm text-gray-300 mb-1">Current Balance</div>
            <div className="text-white font-medium">${localBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
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
                    {getStrategyIcon(trade.strategy)}
                    <span className="text-xs text-white ml-1">{trade.pair}</span>
                    <span className="text-xs text-gray-500 ml-2 capitalize">{trade.strategy}</span>
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
