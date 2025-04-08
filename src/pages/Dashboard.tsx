
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import PriceTable from '@/components/PriceTable';
import ArbitrageOpportunities from '@/components/ArbitrageOpportunities';
import PriceComparisonChart from '@/components/PriceComparisonChart';
import { Activity, TrendingUp, Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTradingContext } from '@/contexts/TradingContext';
import { generateArbitrageOpportunities, getMostActivePairs, cryptoPairs } from '@/utils/mockData';
import { useWebSocket } from '@/hooks/use-websocket';

const Dashboard = () => {
  const { toast } = useToast();
  const { autoTrading, minProfit } = useTradingContext();
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [supportedPairs, setSupportedPairs] = useState(cryptoPairs);
  const [mostActivePairs, setMostActivePairs] = useState<string[]>([]);
  
  // Use WebSocket for real-time data
  const { isConnected, tickerData } = useWebSocket();
  
  // Generate arbitrage opportunities from real-time data
  const [opportunities, setOpportunities] = useState<any[]>([]);
  
  // Update opportunities when ticker data changes
  useEffect(() => {
    if (tickerData && tickerData.length > 0) {
      setLastUpdateTime(new Date());
      
      // Generate arbitrage opportunities from real ticker data
      const newOpportunities = generateArbitrageOpportunities(tickerData, minProfit);
      setOpportunities(newOpportunities);
      
      // Update most active pairs
      const activePairs = getMostActivePairs(tickerData);
      setMostActivePairs(activePairs);
      
      // Show notification if we detect a high profit opportunity
      const highProfitOpp = newOpportunities.find(opp => opp.profitPercent > 2);
      if (highProfitOpp) {
        toast({
          title: "High Profit Opportunity!",
          description: `${highProfitOpp.profitPercent.toFixed(2)}% on ${highProfitOpp.pair} (${highProfitOpp.buyExchange} → ${highProfitOpp.sellExchange})`,
        });
      }
    }
  }, [tickerData, minProfit, toast]);
  
  // Function to manually refresh data (in case WebSocket is not connected)
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Manual Refresh Attempted",
        description: isConnected 
          ? "Real-time data is already streaming through WebSocket" 
          : "WebSocket connection failed. Using mock data instead.",
      });
    }, 500);
  };

  // Filter price data for the selected pair
  const filteredPriceData = tickerData?.filter(data => data.symbol === selectedPair) || [];
  
  // Get stats for dashboard
  const totalOpportunities = opportunities.length;
  const activeOpportunities = opportunities.filter(opp => opp.status === 'active').length;
  const avgProfit = opportunities.length 
    ? (opportunities.reduce((sum, opp) => sum + opp.profitPercent, 0) / opportunities.length).toFixed(2) 
    : '0.00';

  // Format the last update time
  const formatLastUpdateTime = () => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 1000);
    
    if (diffInSeconds < 5) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Arbitrage Dashboard</h1>
            <p className="text-gray-400">Monitor real-time prices and arbitrage opportunities</p>
            
            {/* WebSocket status indicator */}
            <div className="mt-2 text-sm">
              <span className="flex items-center">
                Connection: 
                {isConnected ? (
                  <span className="text-crypto-green ml-2 flex items-center">
                    <span className="inline-block w-2 h-2 bg-crypto-green rounded-full animate-pulse mr-2"></span>
                    Live Data Streaming
                  </span>
                ) : (
                  <span className="text-crypto-burgundy ml-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    WebSocket Disconnected - Using Mock Data
                  </span>
                )}
              </span>
            </div>
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
            <div 
              onClick={refreshData}
              className="grid-item cursor-pointer hover:bg-crypto-light-card/70 transition-colors"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-400">Last Update</h3>
                <RefreshCw className={`h-5 w-5 text-crypto-purple ${isLoading ? "animate-spin" : ""}`} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{formatLastUpdateTime()}</p>
                <div className="text-xs bg-crypto-light-card text-gray-300 px-2 py-1 rounded">
                  {isLoading ? "Refreshing..." : "Click to refresh"}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price comparison chart */}
            <div className="lg:col-span-2">
              <div className="bg-crypto-card rounded-lg p-4 mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {supportedPairs.map(pair => (
                    <button
                      key={pair}
                      onClick={() => setSelectedPair(pair)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedPair === pair 
                          ? 'bg-crypto-purple text-white' 
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
              {/* Auto Trading Status */}
              {autoTrading && (
                <Card className="bg-crypto-card border-gray-800 border-green-500 border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-white flex items-center">
                      <span className="mr-2">Auto Trading</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">ACTIVE</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 mb-3">
                      The trading bot is actively monitoring for opportunities with a minimum profit of {minProfit}%
                    </p>
                    <div className="flex items-center">
                      <div className="animate-pulse w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs text-gray-400">Trades will execute automatically</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Most active pairs */}
              <Card className="bg-crypto-card border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-white">Most Active Pairs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mostActivePairs.length > 0 ? (
                      mostActivePairs.map((pair, index) => (
                        <div 
                          key={pair}
                          onClick={() => setSelectedPair(pair)}
                          className="flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-crypto-light-card/30"
                        >
                          <div className="flex items-center">
                            <span className="h-6 w-6 rounded-full bg-crypto-light-card flex items-center justify-center text-xs mr-2">
                              {index + 1}
                            </span>
                            <span className={selectedPair === pair ? "text-crypto-purple" : "text-white"}>
                              {pair}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            View
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Waiting for volume data...
                      </div>
                    )}
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
