
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Settings } from 'lucide-react';

type TradingSettingsProps = {
  autoTrading: boolean;
  onAutoTradingChange: (enabled: boolean) => void;
  minProfit: number;
  onMinProfitChange: (value: number) => void;
};

const TradingSettings: React.FC<TradingSettingsProps> = ({
  autoTrading,
  onAutoTradingChange,
  minProfit,
  onMinProfitChange
}) => {
  return (
    <Card className="bg-crypto-card border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-white">Trading Settings</CardTitle>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          Configure automated trading parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-crypto-burgundy" />
            <Label htmlFor="auto-trading" className="text-white">Automated Trading</Label>
          </div>
          <Switch 
            id="auto-trading" 
            checked={autoTrading} 
            onCheckedChange={onAutoTradingChange}
            className="data-[state=checked]:bg-crypto-burgundy"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="min-profit" className="text-sm text-gray-300">
            Minimum Profit Threshold ({minProfit}%)
          </Label>
          <Slider 
            id="min-profit"
            min={0.1} 
            max={5} 
            step={0.1} 
            value={[minProfit]} 
            onValueChange={value => onMinProfitChange(value[0])}
            className="[&>[data-state=checked]]:bg-crypto-burgundy"
          />
        </div>
        
        <div className="pt-2">
          <Button 
            className="w-full bg-crypto-burgundy hover:bg-crypto-light-burgundy"
          >
            {autoTrading ? 'Trading Bot Active' : 'Activate Trading Bot'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingSettings;
