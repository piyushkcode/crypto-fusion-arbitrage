
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TradingSettings from '@/components/TradingSettings';
import { cryptoPairs } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

const Trading = () => {
  const { toast } = useToast();
  const [autoTrading, setAutoTrading] = useState(false);
  const [minProfit, setMinProfit] = useState(1.0);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  
  const handleAutoTradingChange = (enabled: boolean) => {
    setAutoTrading(enabled);
    toast({
      title: enabled ? "Auto Trading Enabled" : "Auto Trading Disabled",
      description: enabled ? "Our trading bot will execute trades automatically" : "Manual trade confirmation required",
    });
  };

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
              {/* Trading Settings */}
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
                  onAutoTradingChange={handleAutoTradingChange}
                  minProfit={minProfit}
                  onMinProfitChange={setMinProfit}
                />
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {/* Trading Overview */}
              <Card className="bg-crypto-card border-gray-800 mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-white">Trading Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-crypto-light-card/30 p-4 rounded">
                      <p className="text-sm text-gray-400">Trading Balance</p>
                      <p className="text-2xl font-bold">$10,000.00</p>
                    </div>
                    <div className="bg-crypto-light-card/30 p-4 rounded">
                      <p className="text-sm text-gray-400">Active Trades</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <div className="bg-crypto-light-card/30 p-4 rounded">
                      <p className="text-sm text-gray-400">Total Profit</p>
                      <p className="text-2xl font-bold text-crypto-green">$0.00</p>
                    </div>
                    <div className="bg-crypto-light-card/30 p-4 rounded">
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold">0%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Trades */}
              <Card className="bg-crypto-card border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-white">Recent Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-400 py-8">
                    No trades have been executed yet. Configure your settings and enable auto-trading to begin.
                  </div>
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
