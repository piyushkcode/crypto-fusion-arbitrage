
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cryptoPairs } from '@/utils/mockData';

const Trading = () => {
  const { toast } = useToast();
  const [autoTrading, setAutoTrading] = React.useState(false);
  const [minProfit, setMinProfit] = React.useState('1.0');
  const [selectedPair, setSelectedPair] = React.useState('BTC/USDT');
  const [tradeAmount, setTradeAmount] = React.useState('0.01');

  const handleAutoTradingChange = (enabled: boolean) => {
    setAutoTrading(enabled);
    toast({
      title: enabled ? "Auto Trading Enabled" : "Auto Trading Disabled",
      description: enabled ? "Our trading bot will execute trades automatically" : "Manual trade confirmation required",
    });
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Trading Dashboard</h1>
            <p className="text-gray-400">Configure and monitor your trading activities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-crypto-card border-gray-800 col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Trading Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="auto" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full bg-crypto-light-card/30">
                    <TabsTrigger 
                      value="auto" 
                      className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
                    >
                      Automated Trading
                    </TabsTrigger>
                    <TabsTrigger 
                      value="manual"
                      className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
                    >
                      Manual Trading
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="auto" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="auto-trading">Automated Trading Bot</Label>
                      </div>
                      <Switch 
                        id="auto-trading" 
                        checked={autoTrading} 
                        onCheckedChange={handleAutoTradingChange}
                        className="data-[state=checked]:bg-crypto-burgundy"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="min-profit">Minimum Profit Threshold (%)</Label>
                      <Input 
                        id="min-profit"
                        value={minProfit} 
                        onChange={e => setMinProfit(e.target.value)}
                        className="bg-crypto-light-card/30 border-gray-700"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        className="w-full bg-crypto-burgundy hover:bg-crypto-light-burgundy"
                      >
                        {autoTrading ? 'Update Bot Configuration' : 'Activate Trading Bot'}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="manual" className="space-y-4 mt-4">
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
                      <Label htmlFor="trade-amount">Trade Amount</Label>
                      <Input 
                        id="trade-amount" 
                        value={tradeAmount}
                        onChange={e => setTradeAmount(e.target.value)}
                        className="bg-crypto-light-card/30 border-gray-700" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Button 
                        className="w-full bg-crypto-green hover:bg-crypto-green/80"
                      >
                        Buy
                      </Button>
                      <Button 
                        className="w-full bg-crypto-red hover:bg-crypto-red/80"
                      >
                        Sell
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Trading Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-crypto-light-card/30 p-4 rounded-lg">
                    <h3 className="text-sm text-gray-400 mb-1">Total Trades</h3>
                    <p className="text-2xl font-bold text-white">24</p>
                  </div>
                  
                  <div className="bg-crypto-light-card/30 p-4 rounded-lg">
                    <h3 className="text-sm text-gray-400 mb-1">Average Profit</h3>
                    <p className="text-2xl font-bold text-crypto-green">1.8%</p>
                  </div>
                  
                  <div className="bg-crypto-light-card/30 p-4 rounded-lg">
                    <h3 className="text-sm text-gray-400 mb-1">Successful Trades</h3>
                    <p className="text-2xl font-bold text-white">21 <span className="text-sm text-crypto-green">(87.5%)</span></p>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full text-gray-300 border-gray-700 hover:bg-crypto-light-card/50"
                    >
                      View Trade History
                    </Button>
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

export default Trading;
