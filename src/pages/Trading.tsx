import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TradingSettings from '@/components/TradingSettings';
import { cryptoPairs } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';
import { useTradingContext } from '@/contexts/TradingContext';
import { formatDistanceToNow } from 'date-fns';
import TradingBotVisualizer from '@/components/TradingBotVisualizer';

const Trading = () => {
  const { toast } = useToast();
  const { 
    autoTrading, 
    setAutoTrading, 
    minProfit, 
    setMinProfit, 
    trades, 
    addTrade,
    balance,
    totalProfit,
    winRate
  } = useTradingContext();
  
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [tradingStats, setTradingStats] = useState({
    balance: balance,
    activeTrades: 0,
    totalProfit: totalProfit,
    winRate: winRate
  });
  
  // Update trading stats whenever trades change
  useEffect(() => {
    setTradingStats({
      balance: balance,
      activeTrades: trades.filter(t => t.status === 'pending').length,
      totalProfit: totalProfit,
      winRate: winRate
    });
  }, [trades, balance, totalProfit, winRate]);

  // Filter recent trades to include both manual and bot trades for the selected pair
  const recentTrades = trades
    .filter(trade => {
      if (autoTrading) {
        // When bot is active, show all trades regardless of pair
        return true;
      }
      // When bot is inactive, only show trades for selected pair
      return trade.pair === selectedPair;
    })
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Trading Dashboard</h1>
            <p className="text-gray-400">Configure and monitor your trading activities</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <Card className="bg-crypto-card border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-white">Trading Pair</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cryptoPairs.map(pair => (
                        <button
                          key={pair}
                          onClick={() => setSelectedPair(pair)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedPair === pair 
                              ? 'bg-crypto-burgundy text-white' 
                              : 'bg-crypto-light-card/30 text-gray-300 hover:bg-crypto-light-card/50'
                          }`}
                        >
                          {pair}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <TradingSettings 
                  autoTrading={autoTrading}
                  onAutoTradingChange={setAutoTrading}
                  minProfit={minProfit}
                  onMinProfitChange={setMinProfit}
                />
                
                {autoTrading && <TradingBotVisualizer isActive={autoTrading} minProfit={minProfit} />}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="bg-crypto-card border-gray-800 mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-white">Trading Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-crypto-light-card/30 p-4 rounded">
                      <p className="text-sm text-gray-400">Trading Balance</p>
                      <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
                    </div>
                    <div className="bg-crypto-light-card/30 p-4 rounded">
                      <p className="text-sm text-gray-400">Active Trades</p>
                      <p className="text-2xl font-bold">{tradingStats.activeTrades}</p>
                    </div>
                    <div className="bg-crypto-light-card/30 p-4 rounded">
                      <p className="text-sm text-gray-400">Total Profit</p>
                      <p className={`text-2xl font-bold ${tradingStats.totalProfit > 0 ? 'text-crypto-green' : tradingStats.totalProfit < 0 ? 'text-crypto-burgundy' : 'text-white'}`}>
                        ${tradingStats.totalProfit.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-crypto-light-card/30 p-4 rounded">
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold">{tradingStats.winRate.toFixed(0)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Trades */}
              <Card className="bg-crypto-card border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-white">
                    Recent Trades {autoTrading ? '(Including Bot Trades)' : ''}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTrades.length > 0 ? (
                    <div className="space-y-3">
                      {recentTrades.map((trade) => (
                        <div key={trade.id} className="bg-crypto-light-card/30 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                trade.type === 'buy' ? 'bg-crypto-green/20 text-crypto-green' : 'bg-crypto-burgundy/20 text-crypto-burgundy'
                              }`}>
                                {trade.type.toUpperCase()}
                              </span>
                              <span className="ml-2 font-medium">{trade.pair}</span>
                              {autoTrading && (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-crypto-purple/20 text-crypto-purple">
                                  Bot Trade
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatDistanceToNow(trade.timestamp, { addSuffix: true })}
                            </div>
                          </div>
                          <div className="mt-2 flex justify-between text-sm">
                            <div>
                              <span className="text-gray-500">Amount:</span> {trade.amount.toFixed(6)}
                            </div>
                            <div>
                              <span className="text-gray-500">Price:</span> ${trade.price.toFixed(2)}
                            </div>
                            {trade.profit !== undefined && (
                              <div className={trade.profit > 0 ? 'text-crypto-green' : 'text-crypto-burgundy'}>
                                ${trade.profit.toFixed(2)}
                              </div>
                            )}
                          </div>
                          {trade.exchange && (
                            <div className="mt-1 text-xs text-gray-400">
                              Exchange: {trade.exchange}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      No trades have been executed yet. Configure your settings and enable auto-trading to begin.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Trading;
