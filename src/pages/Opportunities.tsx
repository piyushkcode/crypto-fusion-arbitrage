
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArbitrageOpportunities from '@/components/ArbitrageOpportunities';
import ArbitrageType from '@/components/ArbitrageType';
import { generateAllPriceData, generateArbitrageOpportunities, PriceData } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { useTradingContext } from '@/contexts/TradingContext';
import { useWebSocket } from '@/hooks/use-websocket';
import { Badge } from '@/components/ui/badge';

const Opportunities = () => {
  const { toast } = useToast();
  const { minProfit } = useTradingContext();
  const { connectionState, tickerData } = useWebSocket();
  const [priceData, setPriceData] = useState<PriceData[]>(generateAllPriceData());
  const [opportunities, setOpportunities] = useState(generateArbitrageOpportunities(priceData, minProfit));
  const [isLoading, setIsLoading] = useState(false);
  const [localMinProfit, setLocalMinProfit] = useState(0.5);
  const [selectedStrategyType, setSelectedStrategyType] = useState('simple');
  const [selectedPair, setSelectedPair] = useState('all');
  const [apiData, setApiData] = useState(false);

  // Effect to update opportunities when new ticker data arrives
  useEffect(() => {
    if (tickerData && tickerData.length > 0) {
      setPriceData(tickerData);
      fetchOpportunities();
    }
  }, [tickerData]);

  // Additional effect to filter opportunities when pair or strategy changes
  useEffect(() => {
    if (priceData.length > 0) {
      const filteredData = selectedPair === 'all' 
        ? priceData 
        : priceData.filter(item => item.symbol === selectedPair);
        
      const newOpportunities = generateArbitrageOpportunities(
        filteredData, 
        localMinProfit,
        selectedStrategyType
      );
      
      setOpportunities(newOpportunities);
    }
  }, [selectedPair, selectedStrategyType, localMinProfit]);

  // Fetch opportunities
  const fetchOpportunities = async () => {
    setIsLoading(true);
    
    try {
      // Filter price data based on selected pair
      const filteredData = selectedPair === 'all' 
        ? tickerData 
        : tickerData.filter(item => item.symbol === selectedPair);
      
      // Generate arbitrage opportunities with the selected strategy and threshold
      const newOpportunities = generateArbitrageOpportunities(
        filteredData, 
        localMinProfit,
        selectedStrategyType
      );
      
      setOpportunities(newOpportunities);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating opportunities:", error);
      setIsLoading(false);
    }
  };

  // Function to refresh data
  const refreshData = () => {
    fetchOpportunities();
    
    toast({
      title: "Opportunities Refreshed",
      description: `Analyzing ${selectedPair === 'all' ? 'all pairs' : selectedPair} using ${selectedStrategyType} strategy`,
    });
  };

  // Filter opportunities by status
  const activeOpportunities = opportunities.filter(opp => opp.status === 'active');
  const historicalOpportunities = opportunities.filter(opp => opp.status !== 'active');

  // Filter by profit threshold
  const handleProfitFilterChange = (value: number) => {
    setLocalMinProfit(value);
  };
  
  // Filter by pair
  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    
    // Show toast to indicate filtering
    if (pair !== 'all') {
      toast({
        title: "Pair Filter Applied",
        description: `Showing opportunities for ${pair} only`,
      });
    } else {
      toast({
        title: "All Pairs Selected",
        description: "Showing opportunities across all trading pairs",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-gray-800">Arbitrage Opportunities</h1>
              <p className="text-gray-600">Find and analyze potential arbitrage opportunities across exchanges</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={refreshData} 
                variant="outline" 
                className="border-gray-300 hover:bg-gray-100 text-gray-800"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <ArbitrageType 
                onTypeChange={setSelectedStrategyType} 
                selectedType={selectedStrategyType}
              />
            </div>
            
            <div>
              <Card className="bg-white border-gray-200 shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-800">Trading Pair</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handlePairChange('all')}
                      variant={selectedPair === 'all' ? 'default' : 'outline'}
                      className={selectedPair === 'all' ? 'bg-blue-600' : 'bg-gray-100'}
                    >
                      All Pairs
                    </Button>
                    <Button
                      onClick={() => handlePairChange('BTC/USDT')}
                      variant={selectedPair === 'BTC/USDT' ? 'default' : 'outline'}
                      className={selectedPair === 'BTC/USDT' ? 'bg-blue-600' : 'bg-gray-100'}
                    >
                      BTC/USDT
                    </Button>
                    <Button
                      onClick={() => handlePairChange('ETH/USDT')}
                      variant={selectedPair === 'ETH/USDT' ? 'default' : 'outline'}
                      className={selectedPair === 'ETH/USDT' ? 'bg-blue-600' : 'bg-gray-100'}
                    >
                      ETH/USDT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="bg-white border-gray-200 shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-800">Profit Threshold</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[0.5, 1.0, 1.5, 2.0, 3.0].map(profit => (
                      <button
                        key={profit}
                        onClick={() => handleProfitFilterChange(profit)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          localMinProfit === profit 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {profit}% Min
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-800">Active Opportunities</h2>
                <Badge variant="outline" className="bg-blue-100 text-blue-600 border-blue-200">
                  {activeOpportunities.length} Active
                </Badge>
              </div>
              <ArbitrageOpportunities opportunities={activeOpportunities} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-800">Historical Opportunities</h2>
                <Badge variant="outline" className="bg-purple-100 text-purple-600 border-purple-200">
                  {historicalOpportunities.length} Past
                </Badge>
              </div>
              <ArbitrageOpportunities opportunities={historicalOpportunities} />
            </div>
          </div>

          <Card className="bg-white border-gray-200 shadow">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-800">Opportunity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="text-sm text-gray-600 mb-1">Average Profit Potential</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {opportunities.length > 0 
                      ? (opportunities.reduce((sum, opp) => sum + opp.profitPercent, 0) / opportunities.length).toFixed(2) 
                      : '0.00'}%
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="text-sm text-gray-600 mb-1">Statistical Arbitrage Formula</h3>
                  <p className="text-md font-bold capitalize text-gray-800">
                    Z-Score Method
                  </p>
                  <p className="text-xs text-gray-600">Calculating price deviations using mean-reversion</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="text-sm text-gray-600 mb-1">Best Pair</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {opportunities.length > 0 
                      ? opportunities.reduce((max, opp) => max.profitPercent > opp.profitPercent ? max : opp).pair
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Opportunities;
