
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ArbitrageTypeProps = {
  onTypeChange: (type: string) => void;
  selectedType: string;
};

const ArbitrageType: React.FC<ArbitrageTypeProps> = ({ onTypeChange, selectedType }) => {
  return (
    <Card className="bg-crypto-card border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">Arbitrage Strategy</CardTitle>
        <CardDescription className="text-gray-400">
          Select your preferred arbitrage strategy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={selectedType} onValueChange={onTypeChange} className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-crypto-light-card/30">
            <TabsTrigger 
              value="simple" 
              className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
            >
              Simple
            </TabsTrigger>
            <TabsTrigger 
              value="triangular"
              className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
            >
              Triangular
            </TabsTrigger>
            <TabsTrigger 
              value="statistical"
              className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
            >
              Statistical
            </TabsTrigger>
          </TabsList>
          <div className="mt-4 text-sm text-gray-300">
            <TabsContent value="simple">
              <p>Simple arbitrage involves buying and selling the same asset on different exchanges to profit from price differences.</p>
            </TabsContent>
            <TabsContent value="triangular">
              <p>Triangular arbitrage exploits price discrepancies between three different cryptocurrencies on the same exchange.</p>
            </TabsContent>
            <TabsContent value="statistical">
              <p>Statistical arbitrage uses mathematical models to identify temporary price inefficiencies between related assets.</p>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ArbitrageType;
