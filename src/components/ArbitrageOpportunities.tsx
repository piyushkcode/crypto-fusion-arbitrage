
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRightIcon, TriangleIcon, BarChartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArbitrageOpportunity } from '@/utils/mockData';

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

  // Function to render the strategy icon
  const getStrategyIcon = (type: string) => {
    switch (type) {
      case 'triangular':
        return <TriangleIcon className="h-3 w-3 mr-1" />;
      case 'statistical':
        return <BarChartIcon className="h-3 w-3 mr-1" />;
      default: // simple
        return <ArrowRightIcon className="h-3 w-3 mr-1" />;
    }
  };

  // Function to get strategy badge style
  const getStrategyBadgeClass = (type: string): string => {
    switch (type) {
      case 'triangular':
        return 'bg-crypto-blue/20 text-crypto-blue';
      case 'statistical':
        return 'bg-crypto-green/20 text-crypto-green';
      default: // simple
        return 'bg-crypto-purple/20 text-crypto-purple';
    }
  };

  return (
    <Card className="bg-crypto-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-medium text-white">
          <span>Arbitrage Opportunities</span>
          <Badge variant="outline" className="bg-crypto-purple/20 text-crypto-purple">
            {opportunities.length} Found
          </Badge>
        </CardTitle>
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
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={cn("capitalize", getStrategyBadgeClass(opportunity.type || 'simple'))}
                    >
                      <span className="flex items-center">
                        {getStrategyIcon(opportunity.type || 'simple')}
                        {opportunity.type || 'Simple'}
                      </span>
                    </Badge>
                    <Badge variant={getBadgeVariant(opportunity.status)} className="capitalize bg-crypto-burgundy">
                      {opportunity.status}
                    </Badge>
                  </div>
                </div>
                
                {/* Render exchange route based on arbitrage type */}
                <div className="flex items-center justify-between text-sm mb-2">
                  {(opportunity.type === 'triangular') ? (
                    <div className="flex items-center text-gray-300">
                      <span className="text-crypto-blue">{opportunity.exchange || 'Unknown'}</span>
                      <span className="mx-2 text-xs text-gray-500">Triangular</span>
                      <span className="text-crypto-green">{opportunity.path || 'Multiple Pairs'}</span>
                    </div>
                  ) : opportunity.type === 'statistical' ? (
                    <div className="flex items-center text-gray-300">
                      <span className="text-crypto-blue">{opportunity.buyExchange}</span>
                      <ArrowRightIcon className="mx-2 h-3 w-3 text-gray-500" />
                      <span className="text-crypto-green">{opportunity.sellExchange}</span>
                      <span className="ml-2 text-xs text-gray-500">Z-Score: {opportunity.zScore || 'N/A'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-300">
                      <span className="text-crypto-blue">{opportunity.buyExchange}</span>
                      <ArrowRightIcon className="mx-2 h-3 w-3 text-gray-500" />
                      <span className="text-crypto-green">{opportunity.sellExchange}</span>
                    </div>
                  )}
                  <div className="text-gray-400">{formatTime(opportunity.timestamp)}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {opportunity.priceDiff !== undefined ? 
                      `Diff: $${opportunity.priceDiff.toFixed(2)}` : 
                      opportunity.type === 'triangular' ? 
                        `Initial: 1 USDT → Final: ${opportunity.finalAmount?.toFixed(4) || 'N/A'} USDT` :
                        'Custom Strategy'
                    }
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
