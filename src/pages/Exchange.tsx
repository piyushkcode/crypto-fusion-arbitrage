
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cryptoPairs, exchanges } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

const Exchange = () => {
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [selectedExchange, setSelectedExchange] = useState('Binance');
  const [amount, setAmount] = useState('');
  
  const handleExchange = (type: 'buy' | 'sell') => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to exchange",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: type === 'buy' ? "Buy Order Placed" : "Sell Order Placed",
      description: `${type === 'buy' ? 'Buying' : 'Selling'} ${amount} ${selectedPair.split('/')[0]} on ${selectedExchange}`,
    });
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Exchange</h1>
            <p className="text-gray-400">Buy and sell cryptocurrencies across exchanges</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Exchange Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Select Exchange</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {exchanges.map(exchange => (
                        <button
                          key={exchange}
                          onClick={() => setSelectedExchange(exchange)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedExchange === exchange 
                              ? 'bg-crypto-burgundy text-white' 
                              : 'bg-crypto-light-card/30 text-gray-300 hover:bg-crypto-light-card/50'
                          }`}
                        >
                          {exchange}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Trading Pair</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cryptoPairs.map(pair => (
                        <button
                          key={pair}
                          onClick={() => setSelectedPair(pair)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedPair === pair 
                              ? 'bg-crypto-burgundy text-white' 
                              : 'bg-crypto-light-card/30 text-gray-300 hover:bg-crypto-light-card/50'
                          }`}
                        >
                          {pair}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                    <Input
                      type="number"
                      placeholder={`Amount in ${selectedPair.split('/')[0]}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-crypto-light-card/30 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button 
                      className="flex-1 bg-crypto-green hover:bg-crypto-green/80"
                      onClick={() => handleExchange('buy')}
                    >
                      Buy
                    </Button>
                    <Button 
                      className="flex-1 bg-crypto-burgundy hover:bg-crypto-burgundy/80"
                      onClick={() => handleExchange('sell')}
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-400 py-16">
                  No order history available. Place your first order to see it here.
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Exchange;
