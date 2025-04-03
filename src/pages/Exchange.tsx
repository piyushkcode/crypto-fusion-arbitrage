
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Exchange = () => {
  const { toast } = useToast();
  const [exchanges, setExchanges] = React.useState([
    { name: 'Binance', connected: true, apiKey: '•••••••••••••••••' },
    { name: 'Coinbase', connected: false, apiKey: '' },
    { name: 'Kraken', connected: false, apiKey: '' },
    { name: 'KuCoin', connected: true, apiKey: '•••••••••••••••••' },
    { name: 'Bybit', connected: false, apiKey: '' },
  ]);

  const handleConnect = (index: number) => {
    const newExchanges = [...exchanges];
    newExchanges[index].connected = true;
    newExchanges[index].apiKey = '•••••••••••••••••';
    setExchanges(newExchanges);
    
    toast({
      title: `Connected to ${exchanges[index].name}`,
      description: "API keys saved securely",
    });
  };

  const handleDisconnect = (index: number) => {
    const newExchanges = [...exchanges];
    newExchanges[index].connected = false;
    newExchanges[index].apiKey = '';
    setExchanges(newExchanges);
    
    toast({
      title: `Disconnected from ${exchanges[index].name}`,
      description: "API keys have been removed",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Exchange Connections</h1>
            <p className="text-gray-400">Manage your exchange API connections</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exchanges.map((exchange, index) => (
              <Card key={exchange.name} className="bg-crypto-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-white">{exchange.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exchange.connected ? (
                      <>
                        <div className="bg-crypto-light-card/30 p-4 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Status</span>
                            <span className="text-sm text-crypto-green">Connected</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">API Key</span>
                            <span className="text-sm text-white">{exchange.apiKey}</span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => handleDisconnect(index)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor={`${exchange.name}-api-key`}>API Key</Label>
                          <Input 
                            id={`${exchange.name}-api-key`}
                            placeholder="Enter API key"
                            className="bg-crypto-light-card/30 border-gray-700"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`${exchange.name}-api-secret`}>API Secret</Label>
                          <Input 
                            id={`${exchange.name}-api-secret`}
                            type="password"
                            placeholder="Enter API secret"
                            className="bg-crypto-light-card/30 border-gray-700"
                          />
                        </div>
                        
                        <Button 
                          className="w-full bg-crypto-burgundy hover:bg-crypto-light-burgundy"
                          onClick={() => handleConnect(index)}
                        >
                          Connect
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Exchange;
