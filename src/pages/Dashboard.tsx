
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import PriceTable from '@/components/PriceTable';
import ArbitrageOpportunities from '@/components/ArbitrageOpportunities';
import PriceComparisonChart from '@/components/PriceComparisonChart';
import ArbitrageType from '@/components/ArbitrageType';
import TradingSettings from '@/components/TradingSettings';
import { Activity, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { generateAllPriceData, generateArbitrageOpportunities, getMostActivePairs, cryptoPairs } from '@/utils/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { toast } = useToast();
  const [priceData, setPriceData] = useState(generateAllPriceData());
  const [opportunities, setOpportunities] = useState(generateArbitrageOpportunities(priceData));
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [isLoading, setIsLoading] = useState(false);
  const [arbitrageType, setArbitrageType] = useState('simple');
  const [autoTrading, setAutoTrading] = useState(false);
  const [minProfit, setMinProfit] = useState(1.0);

  // Update data every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      
      setTimeout(() => {
        const newPriceData = generateAllPriceData();
        setPriceData(newPriceData);
        setOpportunities(generateArbitrageOpportunities(newPriceData));
        setIsLoading(false);
      }, 500);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handle arbitrage type change
  const handleArbitrageTypeChange = (type: string) => {
    setArbitrageType(type);
    toast({
      title: "Strategy Changed",
      description: `Switched to ${type} arbitrage strategy`,
    });
  };

  // Handle auto trading change
  const handleAutoTradingChange = (enabled: boolean) => {
    setAutoTrading(enabled);
    toast({
      title: enabled ? "Auto Trading Enabled" : "Auto Trading Disabled",
      description: enabled ? "Our trading bot will execute trades automatically" : "Manual trade confirmation required",
    });
  };

  // Filter price data for the selected pair
  const filteredPriceData = priceData.filter(data => data.pair === selectedPair);
  
  // Get stats for dashboard
  const totalOpportunities = opportunities.length;
  const activeOpportunities = opportunities.filter(opp => opp.status === 'active').length;
  const avgProfit = opportunities.length 
    ? (opportunities.reduce((sum, opp) => sum + opp.profitPercent, 0) / opportunities.length).toFixed(2) 
    : '0.00';
  const mostActivePairs = getMostActivePairs(priceData);

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">CryptoVantage Dashboard</h1>
            <p className="text-gray-400">Monitor real-time prices and arbitrage opportunities</p>
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              title="Total Opportunities" 
              value={totalOpportunities} 
              icon={<Activity className="h-5 w-5 text-crypto-blue" />}
              trend={{ value: 5.2, isPositive: true }}
            />
            <StatsCard 
              title="Active Opportunities" 
              value={activeOpportunities} 
              icon={<TrendingUp className="h-5 w-5 text-crypto-green" />}
              trend={{ value: 2.1, isPositive: true }}
            />
            <StatsCard 
              title="Average Profit" 
              value={`${avgProfit}%`} 
              icon={<Zap className="h-5 w-5 text-crypto-yellow" />}
              trend={{ value: 0.5, isPositive: true }}
            />
            <StatsCard 
              title="Last Update" 
              value="Just now" 
              icon={<RefreshCw className={`h-5 w-5 text-crypto-burgundy ${isLoading ? "animate-spin" : ""}`} />}
            />
          </div>
          
          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price comparison chart */}
            <div className="lg:col-span-2">
              <div className="bg-crypto-card rounded-lg p-4 mb-6">
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
                <PriceComparisonChart data={filteredPriceData} pair={selectedPair} />
              </div>
              
              {/* Price table */}
              <PriceTable data={filteredPriceData} title={`${selectedPair} Prices`} />
            </div>
            
            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Arbitrage Type Selector */}
              <ArbitrageType 
                onTypeChange={handleArbitrageTypeChange}
                selectedType={arbitrageType}
              />
              
              {/* Trading Settings */}
              <TradingSettings 
                autoTrading={autoTrading}
                onAutoTradingChange={handleAutoTradingChange}
                minProfit={minProfit}
                onMinProfitChange={setMinProfit}
              />
              
              {/* Most active pairs */}
              <Card className="bg-crypto-card border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-white">Most Active Pairs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mostActivePairs.map((pair, index) => (
                      <div 
                        key={pair}
                        onClick={() => setSelectedPair(pair)}
                        className="flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-crypto-light-card/30"
                      >
                        <div className="flex items-center">
                          <span className="h-6 w-6 rounded-full bg-crypto-light-card flex items-center justify-center text-xs mr-2">
                            {index + 1}
                          </span>
                          <span className={selectedPair === pair ? "text-crypto-burgundy" : "text-white"}>
                            {pair}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          View
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Arbitrage opportunities */}
              <ArbitrageOpportunities opportunities={opportunities} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
