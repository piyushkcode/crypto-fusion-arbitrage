
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArbitrageOpportunities from '@/components/ArbitrageOpportunities';
import { generateArbitrageOpportunities, generateAllPriceData } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

const Opportunities = () => {
  const { toast } = useToast();
  const priceData = generateAllPriceData();
  const opportunities = generateArbitrageOpportunities(priceData);

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Arbitrage Opportunities</h1>
            <p className="text-gray-400">Find and analyze potential arbitrage opportunities across exchanges</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                <CardTitle className="text-lg font-medium text-white">Historical Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <ArbitrageOpportunities 
                  opportunities={opportunities.filter(opp => opp.status !== 'active')} 
                />
              </CardContent>
            </Card>
          </div>

          <Card className="bg-crypto-card border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-white">Opportunity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 py-8">
                Detailed opportunity analysis and historical trends will be available soon.
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Opportunities;
