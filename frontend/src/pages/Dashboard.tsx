
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import PriceTable from '@/components/PriceTable';
import ArbitrageOpportunities from '@/components/ArbitrageOpportunities';
import PriceComparisonChart from '@/components/PriceComparisonChart';
import { Activity, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { toast } = useToast();
  const [priceData, setPriceData] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [isLoading, setIsLoading] = useState(true);
  const [mostActivePairs, setMostActivePairs] = useState([]);
  const [supportedPairs, setSupportedPairs] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds

  // Fetch data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get supported pairs
        const pairsResponse = await axios.get(`${API_BASE_URL}/pairs`);
        setSupportedPairs(pairsResponse.data);
        
        // Get initial price data
        await fetchPriceData();
        
        // Get arbitrage opportunities
        await fetchOpportunities();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to the API server.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Set up regular data refresh
  useEffect(() => {
    const refreshData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchPriceData(),
        fetchOpportunities()
      ]);
      setIsLoading(false);
    };

    const interval = setInterval(refreshData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval, selectedPair]);

  const fetchPriceData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/prices?pair=${selectedPair}`);
      setPriceData(response.data);
      
      // Find most active pairs based on volume
      if (response.data.length > 0) {
        const exchanges = [...new Set(response.data.map(item => item.exchange))];
        const pairs = [...new Set(response.data.map(item => item.symbol))];
        
        // Get volume data for all pairs
        const volumeData = {};
        for (const pair of pairs) {
          volumeData[pair] = response.data
            .filter(item => item.symbol === pair)
            .reduce((sum, item) => sum + (item.volume || 0), 0);
        }
        
        // Sort pairs by volume
        const activePairs = Object.entries(volumeData)
          .sort((a, b) => b[1] - a[1])
          .map(item => item[0])
          .slice(0, 5);
          
        setMostActivePairs(activePairs);
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/opportunities?min_profit=0.5`);
      setOpportunities(response.data);
      
      // Notify of high-profit opportunities
      const highProfitOpps = response.data.filter(opp => opp.profit_percent > 2);
      if (highProfitOpps.length > 0) {
        toast({
          title: 'High Profit Opportunity!',
          description: `${highProfitOpps[0].profit_percent.toFixed(2)}% on ${highProfitOpps[0].symbol}`,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  // Filter price data for the selected pair
  const filteredPriceData = priceData.filter(data => data.symbol === selectedPair);
  
  // Get stats for dashboard
  const totalOpportunities = opportunities.length;
  const activeOpportunities = opportunities.filter(opp => opp.status === 'active').length;
  const avgProfit = opportunities.length 
    ? (opportunities.reduce((sum, opp) => sum + opp.profit_percent, 0) / opportunities.length).toFixed(2) 
    : '0.00';

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Arbitrage Dashboard</h1>
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
              value={isLoading ? "Updating..." : "Just now"} 
              icon={<RefreshCw className={`h-5 w-5 text-crypto-purple ${isLoading ? "animate-spin" : ""}`} />}
            />
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
                          <span className={selectedPair === pair ? "text-crypto-purple" : "text-white"}>
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
