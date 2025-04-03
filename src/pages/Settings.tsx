
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState(true);
  const [autoTrading, setAutoTrading] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(true);
  const [email, setEmail] = React.useState('user@example.com');
  const [minProfit, setMinProfit] = React.useState('1.0');

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated",
    });
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
            <p className="text-gray-400">Manage your account preferences</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-crypto-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid grid-cols-4 w-full bg-crypto-light-card/30">
                    <TabsTrigger 
                      value="general" 
                      className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
                    >
                      General
                    </TabsTrigger>
                    <TabsTrigger 
                      value="trading"
                      className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
                    >
                      Trading
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notifications"
                      className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
                    >
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger 
                      value="security"
                      className="data-[state=active]:bg-crypto-burgundy data-[state=active]:text-white"
                    >
                      Security
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-crypto-light-card/30 border-gray-700" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                      </div>
                      <Switch 
                        id="dark-mode" 
                        checked={darkMode} 
                        onCheckedChange={setDarkMode}
                        className="data-[state=checked]:bg-crypto-burgundy"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="trading" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="auto-trading">Automated Trading</Label>
                      </div>
                      <Switch 
                        id="auto-trading" 
                        checked={autoTrading} 
                        onCheckedChange={setAutoTrading}
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
                  </TabsContent>
                  
                  <TabsContent value="notifications" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="notifications">Email Notifications</Label>
                      </div>
                      <Switch 
                        id="notifications" 
                        checked={notifications} 
                        onCheckedChange={setNotifications}
                        className="data-[state=checked]:bg-crypto-burgundy"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="security" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input 
                        id="current-password" 
                        type="password"
                        className="bg-crypto-light-card/30 border-gray-700" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password"
                        className="bg-crypto-light-card/30 border-gray-700" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        className="bg-crypto-light-card/30 border-gray-700" 
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="pt-6">
                  <Button 
                    onClick={handleSaveSettings}
                    className="bg-crypto-burgundy hover:bg-crypto-light-burgundy"
                  >
                    Save Settings
                  </Button>
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
