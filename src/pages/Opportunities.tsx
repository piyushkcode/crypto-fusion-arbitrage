
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateArbitrageOpportunities, generateAllPriceData } from '@/utils/mockData';
import ArbitrageOpportunities from '@/components/ArbitrageOpportunities';

const Opportunities = () => {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = React.useState(generateArbitrageOpportunities(generateAllPriceData()));
  const [minProfit, setMinProfit] = React.useState(0.5);
  const [isLoading, setIsLoading] = React.useState(false);

  // Simulate fetching data
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setTimeout(() => {
        const data = generateArbitrageOpportunities(generateAllPriceData());
        setOpportunities(data);
        setIsLoading(false);
      }, 500);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [minProfit]);

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Arbitrage Opportunities</h1>
            <p className="text-gray-400">Monitor all available arbitrage opportunities across exchanges</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Active Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <ArbitrageOpportunities 
                  opportunities={opportunities.filter(opp => opp.status === 'active')} 
                />
              </CardContent>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Executed Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <ArbitrageOpportunities 
                  opportunities={opportunities.filter(opp => opp.status === 'executed')} 
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Opportunities;
