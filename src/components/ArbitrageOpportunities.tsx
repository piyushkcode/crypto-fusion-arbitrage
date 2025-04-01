
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArbitrageOpportunity {
  id: string;
  buyExchange: string;
  sellExchange: string;
  pair: string;
  priceDiff: number;
  profitPercent: number;
  timestamp: Date;
  status: 'active' | 'executed' | 'expired';
}

interface ArbitrageOpportunitiesProps {
  opportunities: ArbitrageOpportunity[];
}

const ArbitrageOpportunities: React.FC<ArbitrageOpportunitiesProps> = ({ opportunities }) => {
  // Function to format timestamp to readable time
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to get badge color based on status
  const getBadgeVariant = (status: 'active' | 'executed' | 'expired'): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'executed':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card className="bg-crypto-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-white">Arbitrage Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {opportunities.length > 0 ? (
            opportunities.map((opportunity) => (
              <div 
                key={opportunity.id} 
                className="rounded-md bg-crypto-light-card/30 p-3 hover:bg-crypto-light-card/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-white">{opportunity.pair}</div>
                  <Badge variant={getBadgeVariant(opportunity.status)} className="capitalize bg-crypto-burgundy">
                    {opportunity.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center text-gray-300">
                    <span className="text-crypto-blue">{opportunity.buyExchange}</span>
                    <ArrowRightIcon className="mx-2 h-3 w-3 text-gray-500" />
                    <span className="text-crypto-green">{opportunity.sellExchange}</span>
                  </div>
                  <div className="text-gray-400">{formatTime(opportunity.timestamp)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Diff: ${opportunity.priceDiff.toFixed(2)}
                  </span>
                  <span className={cn(
                    "font-medium",
                    opportunity.profitPercent > 1 ? "text-crypto-green" : "text-crypto-burgundy"
                  )}>
                    {opportunity.profitPercent.toFixed(2)}% Profit
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No arbitrage opportunities available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbitrageOpportunities;
