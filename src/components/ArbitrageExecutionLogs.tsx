
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, ArrowRight, AlertTriangle } from 'lucide-react';

const strategies = {
  simple: [
    "Initializing simple arbitrage strategy",
    "Scanning for price differences between exchanges",
    "Monitoring BTC/USDT across exchanges",
    "Evaluating liquidity for BTC/USDT on Binance",
    "Checking transaction costs for BTC/USDT",
    "Calculating total fees for potential arbitrage",
    "Found potential opportunity: BTC/USDT (Binance → Bybit)",
    "Verifying price gap persistence",
    "Executing BTC purchase on Binance",
    "Transfer of BTC to Bybit wallet initiated",
    "Selling BTC on Bybit at higher price",
    "Trade completed: 0.87% profit after fees"
  ],
  triangular: [
    "Initializing triangular arbitrage strategy",
    "Analyzing price relationships between BTC, ETH and USDT",
    "Checking triangular opportunities on Binance",
    "Calculating potential profit for BTC→ETH→USDT→BTC loop",
    "Evaluating order book depth for all pairs",
    "Computing fees for multi-trade execution",
    "Verifying sufficient liquidity for minimum trade size",
    "Found viable triangular path: BTC→ETH→USDT→BTC",
    "Expected profit after fees: 0.92%",
    "Executing first trade: BTC→ETH",
    "Executing second trade: ETH→USDT",
    "Executing final trade: USDT→BTC",
    "Triangular arbitrage complete: 0.85% net profit"
  ],
  statistical: [
    "Initializing statistical arbitrage strategy",
    "Loading historical price correlation data",
    "Calculating z-scores for paired assets",
    "Analyzing mean-reversion potential",
    "Monitoring price divergence between correlated assets",
    "Detected significant divergence between ETH and BNB",
    "Calculating optimal trade ratio based on cointegration",
    "Verifying statistical significance (p-value: 0.023)",
    "Long ETH / Short BNB position initiated",
    "Monitoring spread for convergence",
    "Price spread narrowing as predicted",
    "Closing positions as convergence occurs",
    "Statistical arbitrage trade completed: 1.25% profit"
  ]
};

interface ArbitrageExecutionLogsProps {
  strategyType: 'simple' | 'triangular' | 'statistical';
  isRunning: boolean;
}

const ArbitrageExecutionLogs: React.FC<ArbitrageExecutionLogsProps> = ({ 
  strategyType, 
  isRunning 
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    if (!isRunning) {
      setLogs([]);
      setCurrentStep(0);
      return;
    }
    
    const strategyLogs = strategies[strategyType] || [];
    
    // Add logs one by one
    const interval = setInterval(() => {
      if (currentStep < strategyLogs.length) {
        setLogs(prev => [...prev, strategyLogs[currentStep]]);
        setCurrentStep(prev => prev + 1);
      } else {
        clearInterval(interval);
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isRunning, strategyType, currentStep]);

  return (
    <Card className="bg-crypto-card border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center">
          <Terminal className="h-5 w-5 mr-2 text-crypto-green" />
          Execution Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-crypto-dark rounded-md p-3 h-80 overflow-y-auto text-sm">
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className="text-gray-300 border-l-2 border-crypto-green pl-3 py-1 animate-fade-in"
                >
                  {log}
                </div>
              ))}
              {isRunning && currentStep < strategies[strategyType].length && (
                <div className="flex items-center text-gray-400">
                  <span className="animate-pulse">●</span>
                  <span className="ml-2">Processing...</span>
                </div>
              )}
            </div>
          ) : isRunning ? (
            <div className="text-gray-400 animate-pulse">
              Initializing strategy...
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <AlertTriangle className="h-12 w-12 text-gray-600 mb-3" />
              <p className="text-gray-500">Run an arbitrage strategy to see execution logs</p>
              <p className="text-sm text-gray-600 mt-2">Select a strategy and click "Run Strategy" to begin</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbitrageExecutionLogs;
