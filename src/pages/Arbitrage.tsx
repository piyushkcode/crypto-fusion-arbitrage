
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArbitrageType from '@/components/ArbitrageType';
import { Button } from '@/components/ui/button';
import { cryptoPairs } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

const Arbitrage = () => {
  const { toast } = useToast();
  const [arbitrageType, setArbitrageType] = useState('simple');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  
  const handleArbitrageTypeChange = (type: string) => {
    setArbitrageType(type);
    toast({
      title: "Strategy Changed",
      description: `Switched to ${type} arbitrage strategy`,
    });
  };
  
  const handleRunArbitrage = () => {
    toast({
      title: "Arbitrage Strategy Running",
      description: `Analyzing opportunities for ${selectedPair} using ${arbitrageType} strategy`,
    });
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Arbitrage Strategies</h1>
            <p className="text-gray-400">Configure and run automatic arbitrage strategies</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {/* Strategy Configuration */}
              <div className="space-y-6">
                <ArbitrageType 
                  onTypeChange={handleArbitrageTypeChange}
                  selectedType={arbitrageType}
                />
                
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
                
                <Button 
                  className="w-full bg-crypto-burgundy hover:bg-crypto-burgundy/80"
                  onClick={handleRunArbitrage}
                >
                  Run Arbitrage Strategy
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {/* Results and Visualization */}
              <Card className="bg-crypto-card border-gray-800 mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-white">Strategy Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-400 py-16">
                    Select a strategy and click "Run Arbitrage Strategy" to see performance metrics.
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-crypto-card border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-white">Strategy Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-400 py-8">
                    Advanced strategy settings will be available in a future update.
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

export default Arbitrage;
