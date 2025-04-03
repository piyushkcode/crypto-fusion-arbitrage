
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArbitrageOpportunities from '@/components/ArbitrageOpportunities';
import { generateAllPriceData, generateArbitrageOpportunities } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { useTradingContext } from '@/contexts/TradingContext';

const Opportunities = () => {
  const { toast } = useToast();
  const { minProfit } = useTradingContext();
  const [priceData, setPriceData] = useState(generateAllPriceData());
  const [opportunities, setOpportunities] = useState(generateArbitrageOpportunities(priceData, minProfit));
  const [isLoading, setIsLoading] = useState(false);
  const [localMinProfit, setLocalMinProfit] = useState(0.5);

  // Function to refresh data
  const refreshData = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const newPriceData = generateAllPriceData();
      setPriceData(newPriceData);
      setOpportunities(generateArbitrageOpportunities(newPriceData, localMinProfit));
      setIsLoading(false);
      
      toast({
        title: "Opportunities Refreshed",
        description: "Latest arbitrage opportunities have been loaded",
      });
    }, 500);
  };

  // Filter opportunities by status
  const activeOpportunities = opportunities.filter(opp => opp.status === 'active');
  const historicalOpportunities = opportunities.filter(opp => opp.status !== 'active');

  // Filter by profit threshold
  const handleProfitFilterChange = (value: number) => {
    setLocalMinProfit(value);
    setOpportunities(generateArbitrageOpportunities(priceData, value));
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">Arbitrage Opportunities</h1>
              <p className="text-gray-400">Find and analyze potential arbitrage opportunities across exchanges</p>
            </div>
            <Button 
              onClick={refreshData} 
              variant="outline" 
              className="border-gray-700 hover:bg-gray-800"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          
          <div className="mb-6">
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Profit Threshold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[0.5, 1.0, 1.5, 2.0, 3.0].map(profit => (
                    <button
                      key={profit}
                      onClick={() => handleProfitFilterChange(profit)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        localMinProfit === profit 
                          ? 'bg-crypto-purple text-white' 
                          : 'bg-crypto-light-card/30 text-gray-300 hover:bg-crypto-light-card/50'
                      }`}
                    >
                      {profit}% Minimum
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Active Opportunities</h2>
              <ArbitrageOpportunities opportunities={activeOpportunities} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Historical Opportunities</h2>
              <ArbitrageOpportunities opportunities={historicalOpportunities} />
            </div>
          </div>

          <Card className="bg-crypto-card border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-white">Opportunity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-crypto-light-card/20 p-4 rounded-md">
                  <h3 className="text-sm text-gray-400 mb-1">Average Profit Potential</h3>
                  <p className="text-2xl font-bold text-crypto-green">
                    {opportunities.length > 0 
                      ? (opportunities.reduce((sum, opp) => sum + opp.profitPercent, 0) / opportunities.length).toFixed(2) 
                      : '0.00'}%
                  </p>
                </div>
                <div className="bg-crypto-light-card/20 p-4 rounded-md">
                  <h3 className="text-sm text-gray-400 mb-1">Most Profitable Pair</h3>
                  <p className="text-2xl font-bold">
                    {opportunities.length > 0 
                      ? opportunities.reduce((max, opp) => max.profitPercent > opp.profitPercent ? max : opp).pair
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-crypto-light-card/20 p-4 rounded-md">
                  <h3 className="text-sm text-gray-400 mb-1">Best Exchange Route</h3>
                  <p className="text-lg font-bold">
                    {opportunities.length > 0 
                      ? `${opportunities.reduce((max, opp) => max.profitPercent > opp.profitPercent ? max : opp).buyExchange} → 
                         ${opportunities.reduce((max, opp) => max.profitPercent > opp.profitPercent ? max : opp).sellExchange}`
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
