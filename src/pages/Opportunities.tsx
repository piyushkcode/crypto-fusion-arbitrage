import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArbitrageOpportunities from '@/components/ArbitrageOpportunities';
import ArbitrageType from '@/components/ArbitrageType';
import { generateAllPriceData, generateArbitrageOpportunities, PriceData } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useTradingContext } from '@/contexts/TradingContext';
import { useWebSocket } from '@/hooks/use-websocket';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      // tickerData is already in PriceData format after our useWebSocket update
      setPriceData(tickerData);
      fetchOpportunities();
    }
  }, [tickerData]);

  // Fetch opportunities from backend API
  const fetchOpportunities = async () => {
    setIsLoading(true);
    
    try {
      const url = new URL('/api/opportunities', window.location.origin);
      url.searchParams.append('min_profit', localMinProfit.toString());
      url.searchParams.append('pair', selectedPair);
      url.searchParams.append('strategy', selectedStrategyType);
      
      const response = await fetch(url.toString());
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          // Transform backend data to frontend model
          const formattedOpportunities = data.map((opp, index) => ({
            id: opp.id || `opp-${index}-${Date.now()}`,
            pair: opp.symbol,
            buyExchange: opp.buy_exchange,
            sellExchange: opp.sell_exchange,
            buyPrice: opp.buy_price,
            sellPrice: opp.sell_price,
            priceDiff: opp.price_difference,
            profitPercent: opp.profit_percent,
            timestamp: new Date(opp.timestamp),
            status: opp.status,
            type: opp.type,
            exchange: opp.exchange,
            finalAmount: opp.final_amount,
            path: opp.path,
            zScore: opp.z_score
          }));
          
          setOpportunities(formattedOpportunities);
          setApiData(true);
        } else {
          // Fallback to mock data if API doesn't return proper format
          const newPriceData = generateAllPriceData();
          setPriceData(newPriceData);
          setOpportunities(generateArbitrageOpportunities(newPriceData, localMinProfit, selectedStrategyType));
          setApiData(false);
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      // Console log the error, but do not show any UI messages about mock data
      console.error("Error fetching opportunities:", error);
      // Fallback to mock data silently
      const newPriceData = generateAllPriceData();
      setPriceData(newPriceData);
      setOpportunities(generateArbitrageOpportunities(newPriceData, localMinProfit, selectedStrategyType));
      setApiData(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh data
  const refreshData = () => {
    fetchOpportunities();
    
    toast({
      title: "Opportunities Refreshed",
      description: `Analyzing ${selectedPair} using ${selectedStrategyType} strategy`,
    });
  };

  // Effect to refresh data when strategy type or pair changes
  useEffect(() => {
    fetchOpportunities();
  }, [selectedStrategyType, selectedPair]);

  // Filter opportunities by status
  const activeOpportunities = opportunities.filter(opp => opp.status === 'active');
  const historicalOpportunities = opportunities.filter(opp => opp.status !== 'active');

  // Filter by profit threshold
  const handleProfitFilterChange = (value: number) => {
    setLocalMinProfit(value);
    fetchOpportunities();
  };
  
  // Filter by pair
  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
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
            <div className="flex space-x-3">
              {/* Removed: mock data notification */}
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <ArbitrageType 
                onTypeChange={setSelectedStrategyType} 
                selectedType={selectedStrategyType}
              />
            </div>
            
            <div>
              <Card className="bg-crypto-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-white">Trading Pair</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handlePairChange('all')}
                      variant={selectedPair === 'all' ? 'default' : 'outline'}
                      className={selectedPair === 'all' ? 'bg-crypto-purple' : 'bg-crypto-light-card/30'}
                    >
                      All Pairs
                    </Button>
                    <Button
                      onClick={() => handlePairChange('BTC/USDT')}
                      variant={selectedPair === 'BTC/USDT' ? 'default' : 'outline'}
                      className={selectedPair === 'BTC/USDT' ? 'bg-crypto-purple' : 'bg-crypto-light-card/30'}
                    >
                      BTC/USDT
                    </Button>
                    <Button
                      onClick={() => handlePairChange('ETH/USDT')}
                      variant={selectedPair === 'ETH/USDT' ? 'default' : 'outline'}
                      className={selectedPair === 'ETH/USDT' ? 'bg-crypto-purple' : 'bg-crypto-light-card/30'}
                    >
                      ETH/USDT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
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
                <h2 className="text-xl font-semibold">Active Opportunities</h2>
                <Badge variant="outline" className="bg-crypto-burgundy/20 text-crypto-burgundy">
                  {activeOpportunities.length} Active
                </Badge>
              </div>
              <ArbitrageOpportunities opportunities={activeOpportunities} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Historical Opportunities</h2>
                <Badge variant="outline" className="bg-crypto-blue/20 text-crypto-blue">
                  {historicalOpportunities.length} Past
                </Badge>
              </div>
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
                  <h3 className="text-sm text-gray-400 mb-1">Most Profitable Strategy</h3>
                  <p className="text-2xl font-bold capitalize">
                    {opportunities.length > 0 
                      ? (opportunities.reduce((max, opp) => max.profitPercent > opp.profitPercent ? max : opp).type || 'Simple')
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-crypto-light-card/20 p-4 rounded-md">
                  <h3 className="text-sm text-gray-400 mb-1">Best Pair</h3>
                  <p className="text-2xl font-bold">
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
