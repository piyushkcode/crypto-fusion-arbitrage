
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Triangle, ArrowRightLeft, BarChart3 } from 'lucide-react';

type ArbitrageTypeProps = {
  onTypeChange: (type: string) => void;
  selectedType: string;
};

const ArbitrageType: React.FC<ArbitrageTypeProps> = ({ onTypeChange, selectedType }) => {
  useEffect(() => {
    // When the component mounts, ensure the strategy type is set
    onTypeChange(selectedType);
  }, []);

  return (
    <Card className="bg-crypto-card border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">Arbitrage Strategy</CardTitle>
        <CardDescription className="text-gray-400">
          Select your preferred arbitrage strategy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedType} onValueChange={onTypeChange} className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-crypto-light-card/30">
            <TabsTrigger 
              value="simple" 
              className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                <span>Simple</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="triangular"
              className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <Triangle className="h-4 w-4 mr-2" />
                <span>Triangular</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="statistical"
              className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
            >
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span>Statistical</span>
              </div>
            </TabsTrigger>
          </TabsList>
          <div className="mt-4 text-sm text-gray-300">
            <TabsContent value="simple">
              <div>
                <h3 className="text-white font-medium mb-1">Simple Arbitrage</h3>
                <p>Simple arbitrage involves buying and selling the same asset on different exchanges to profit from price differences.</p>
                <ul className="list-disc pl-5 mt-2 text-gray-400">
                  <li>Low risk, most common strategy</li>
                  <li>Detects price gaps between exchanges</li>
                  <li>Typically 0.5-3% profit margins</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="triangular">
              <div>
                <h3 className="text-white font-medium mb-1">Triangular Arbitrage</h3>
                <p>Triangular arbitrage exploits price discrepancies between three different cryptocurrencies on the same exchange.</p>
                <ul className="list-disc pl-5 mt-2 text-gray-400">
                  <li>Trade A → B → C → A</li>
                  <li>Single exchange execution</li>
                  <li>Higher potential returns (2-8%)</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="statistical">
              <div>
                <h3 className="text-white font-medium mb-1">Statistical Arbitrage</h3>
                <p>Statistical arbitrage uses mathematical models to identify temporary price inefficiencies between related assets.</p>
                <ul className="list-disc pl-5 mt-2 text-gray-400">
                  <li>Based on mean reversion</li>
                  <li>Uses historical data analysis</li>
                  <li>Potentially higher but delayed returns</li>
                </ul>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ArbitrageType;
