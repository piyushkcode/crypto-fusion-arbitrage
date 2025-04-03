
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
    });
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Settings</h1>
            <p className="text-gray-400">Configure your application preferences</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                    <Input
                      defaultValue="user123"
                      className="bg-crypto-light-card/30 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <Input
                      defaultValue="user@example.com"
                      className="bg-crypto-light-card/30 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <Button 
                      className="bg-crypto-burgundy hover:bg-crypto-burgundy/80"
                      onClick={handleSaveSettings}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive email alerts for important events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-400">Receive browser notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Price Alerts</p>
                      <p className="text-sm text-gray-400">Get notified about significant price changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Arbitrage Opportunities</p>
                      <p className="text-sm text-gray-400">Get notified about new arbitrage opportunities</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Binance API Key</label>
                    <Input
                      type="password"
                      defaultValue="••••••••••••••••••••"
                      className="bg-crypto-light-card/30 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Binance API Secret</label>
                    <Input
                      type="password"
                      defaultValue="••••••••••••••••••••"
                      className="bg-crypto-light-card/30 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <Button 
                      className="bg-crypto-burgundy hover:bg-crypto-burgundy/80"
                      onClick={handleSaveSettings}
                    >
                      Save API Keys
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Trading Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto Trading</p>
                      <p className="text-sm text-gray-400">Automatically execute trades based on strategies</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Default Trading Amount (USDT)</label>
                    <Input
                      type="number"
                      defaultValue="100"
                      className="bg-crypto-light-card/30 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Minimum Profit Threshold (%)</label>
                    <Input
                      type="number"
                      defaultValue="1.0"
                      className="bg-crypto-light-card/30 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <Button 
                      className="bg-crypto-burgundy hover:bg-crypto-burgundy/80"
                      onClick={handleSaveSettings}
                    >
                      Save Preferences
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

export default Settings;
