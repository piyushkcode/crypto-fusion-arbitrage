
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cryptoPairs } from '@/utils/mockData';

const Arbitrage = () => {
  const { toast } = useToast();
  const [arbitrageType, setArbitrageType] = React.useState('simple');
  const [selectedPair, setSelectedPair] = React.useState('BTC/USDT');
  const [amount, setAmount] = React.useState('0.01');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleArbitrageTypeChange = (type: string) => {
    setArbitrageType(type);
    toast({
      title: "Strategy Changed",
      description: `Switched to ${type} arbitrage strategy`,
    });
  };

  const handleExecute = () => {
    setIsLoading(true);
    toast({
      title: "Searching for opportunities",
      description: "This may take a moment...",
    });

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Arbitrage Opportunity Found",
        description: `You can earn 1.2% on ${selectedPair}`,
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Execute Arbitrage</h1>
            <p className="text-gray-400">Choose your strategy and execute trades</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-crypto-card border-gray-800 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Arbitrage Strategy</CardTitle>
                <CardDescription className="text-gray-400">
                  Select your preferred arbitrage method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={arbitrageType} onValueChange={handleArbitrageTypeChange} className="w-full">
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
                  
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pair">Trading Pair</Label>
                      <Select value={selectedPair} onValueChange={setSelectedPair}>
                        <SelectTrigger className="bg-crypto-light-card/30 border-gray-700">
                          <SelectValue placeholder="Select a trading pair" />
                        </SelectTrigger>
                        <SelectContent className="bg-crypto-card border-gray-700">
                          {cryptoPairs.map(pair => (
                            <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input 
                        id="amount" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="bg-crypto-light-card/30 border-gray-700" 
                      />
                    </div>
                    
                    <Button 
                      onClick={handleExecute}
                      disabled={isLoading}
                      className="w-full bg-crypto-burgundy hover:bg-crypto-light-burgundy"
                    >
                      {isLoading ? "Searching..." : "Find and Execute Arbitrage"}
                    </Button>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Strategy Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {arbitrageType === 'simple' && (
                    <p className="text-gray-300">
                      Simple arbitrage involves buying and selling the same asset on different 
                      exchanges to profit from price differences.
                    </p>
                  )}
                  
                  {arbitrageType === 'triangular' && (
                    <p className="text-gray-300">
                      Triangular arbitrage exploits price discrepancies between three different 
                      cryptocurrencies on the same exchange.
                    </p>
                  )}
                  
                  {arbitrageType === 'statistical' && (
                    <p className="text-gray-300">
                      Statistical arbitrage uses mathematical models to identify temporary price 
                      inefficiencies between related assets.
                    </p>
                  )}
                  
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="font-medium text-white mb-2">Current Market Conditions</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volatility</span>
                        <span className="text-crypto-green">Medium</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volume</span>
                        <span className="text-crypto-yellow">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Arbitrage Potential</span>
                        <span className="text-crypto-burgundy">Good</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Arbitrage;
