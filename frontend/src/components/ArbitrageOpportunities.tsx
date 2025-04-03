
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, TrendingUpIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTradingContext } from '@/contexts/TradingContext';

interface ArbitrageOpportunity {
  symbol: string;
  buy_exchange: string;
  sell_exchange: string;
  buy_price: number;
  sell_price: number;
  profit_percent: number;
  status: string;
  timestamp: string;
}

interface ArbitrageOpportunitiesProps {
  opportunities: ArbitrageOpportunity[];
}

const ArbitrageOpportunities: React.FC<ArbitrageOpportunitiesProps> = ({ opportunities }) => {
  const { toast } = useToast();
  const { addTrade } = useTradingContext();

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toFixed(2);
    } else if (price >= 1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(6);
    }
  };

  const getProfitColor = (percent: number) => {
    if (percent >= 3) return 'text-green-400';
    if (percent >= 1) return 'text-green-500';
    return 'text-yellow-500';
  };

  const handleExecuteTrade = (opportunity: ArbitrageOpportunity) => {
    // This would be connected to your backend API in a real implementation
    const amount = 0.1 + Math.random() * 0.4; // Random amount between 0.1 and 0.5
    const profit = (opportunity.sell_price - opportunity.buy_price) * amount;
    
    // Add trade to history
    addTrade({
      type: 'buy',
      pair: opportunity.symbol,
      amount,
      price: opportunity.buy_price,
      exchange: opportunity.buy_exchange,
      status: 'completed',
      profit
    });
    
    toast({
      title: "Trade Executed Successfully",
      description: `Bought ${amount.toFixed(6)} ${opportunity.symbol.split('/')[0]} on ${opportunity.buy_exchange} and sold on ${opportunity.sell_exchange} for ${opportunity.profit_percent.toFixed(2)}% profit`,
    });
  };

  return (
    <Card className="bg-crypto-card border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-medium text-white">Arbitrage Opportunities</span>
          <Badge variant="outline" className="bg-crypto-purple/20 text-crypto-purple">
            {opportunities.length} Found
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {opportunities.length > 0 ? (
              opportunities.map((opportunity, index) => (
                <div key={index} className="bg-crypto-light-card/20 rounded-md p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{opportunity.symbol}</span>
                    <Badge variant="outline" className={`${getProfitColor(opportunity.profit_percent)} border-none`}>
                      +{opportunity.profit_percent.toFixed(2)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="space-y-1">
                      <div>Buy on {opportunity.buy_exchange}</div>
                      <div className="text-white font-mono">{formatPrice(opportunity.buy_price)}</div>
                    </div>
                    
                    <ArrowRightIcon className="h-4 w-4 text-gray-500" />
                    
                    <div className="space-y-1 text-right">
                      <div>Sell on {opportunity.sell_exchange}</div>
                      <div className="text-white font-mono">{formatPrice(opportunity.sell_price)}</div>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full bg-crypto-purple hover:bg-crypto-purple/80"
                    onClick={() => handleExecuteTrade(opportunity)}
                  >
                    <TrendingUpIcon className="h-4 w-4 mr-1" />
                    Execute Trade
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No arbitrage opportunities currently available
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ArbitrageOpportunities;
