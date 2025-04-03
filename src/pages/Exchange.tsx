
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cryptoPairs, exchanges } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';
import { useTradingContext } from '@/contexts/TradingContext';
import { formatDistanceToNow } from 'date-fns';

const Exchange = () => {
  const { toast } = useToast();
  const { trades, addTrade } = useTradingContext();
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [selectedExchange, setSelectedExchange] = useState('Binance');
  const [amount, setAmount] = useState('');
  
  // Filter only exchange trades (not arbitrage trades)
  const exchangeTrades = trades.filter(trade => 
    !trade.profit && (trade.type === 'buy' || trade.type === 'sell')
  );
  
  const handleExchange = (type: 'buy' | 'sell') => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to exchange",
        variant: "destructive",
      });
      return;
    }
    
    // Get current price for the selected pair from mock data
    const pairBase = selectedPair.split('/')[0];
    const price = type === 'buy' ? 
      60000 * (1 + Math.random() * 0.01) : // Slightly random price
      60000 * (1 - Math.random() * 0.01);
    
    // Add trade to history
    addTrade({
      type,
      pair: selectedPair,
      amount: Number(amount),
      price,
      exchange: selectedExchange,
      status: 'completed'
    });
    
    toast({
      title: type === 'buy' ? "Buy Order Placed" : "Sell Order Placed",
      description: `${type === 'buy' ? 'Buying' : 'Selling'} ${amount} ${pairBase} on ${selectedExchange}`,
    });
    
    // Reset amount
    setAmount('');
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
                {exchangeTrades.length > 0 ? (
                  <div className="space-y-4">
                    {exchangeTrades.map(trade => (
                      <div 
                        key={trade.id} 
                        className="bg-crypto-light-card/20 rounded-md p-3 flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center">
                            <span className={`font-medium ${trade.type === 'buy' ? 'text-crypto-green' : 'text-crypto-burgundy'}`}>
                              {trade.type === 'buy' ? 'Buy' : 'Sell'}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="text-sm text-gray-300">{trade.pair}</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {trade.amount.toFixed(6)} @ ${trade.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-300">{trade.exchange}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(trade.timestamp, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-16">
                    No order history available. Place your first order to see it here.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Exchange;
