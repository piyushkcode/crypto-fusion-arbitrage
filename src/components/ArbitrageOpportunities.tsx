
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRightIcon, TriangleIcon, BarChartIcon, ZapIcon } from 'lucide-react';
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
      case 'AI prediction':
        return <ZapIcon className="h-3 w-3 mr-1" />;
      default: // simple
        return <ArrowRightIcon className="h-3 w-3 mr-1" />;
    }
  };

  // Function to get strategy badge style
  const getStrategyBadgeClass = (type: string): string => {
    switch (type) {
      case 'triangular':
        return 'bg-crypto-light-card/30 text-green-400';
      case 'statistical':
        return 'bg-crypto-light-card/30 text-purple-400';
      case 'AI prediction':
        return 'bg-crypto-light-card/30 text-yellow-400';
      default: // simple
        return 'bg-crypto-light-card/30 text-blue-400';
    }
  };

  return (
    <Card className="bg-crypto-card border-gray-700 shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-medium text-white">
          <span>Arbitrage Opportunities</span>
          <Badge variant="outline" className="bg-crypto-burgundy/20 text-crypto-burgundy border-crypto-burgundy">
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
                className="rounded-md bg-crypto-light-card/20 p-3 hover:bg-crypto-light-card/30 transition-colors border border-gray-700"
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
                    <Badge variant={getBadgeVariant(opportunity.status)} className="capitalize bg-blue-600">
                      {opportunity.status}
                    </Badge>
                  </div>
                </div>
                
                {/* Render exchange route based on arbitrage type */}
                <div className="flex items-center justify-between text-sm mb-2">
                  {(opportunity.type === 'triangular') ? (
                    <div className="flex items-center text-gray-300">
                      <span className="text-blue-400">{opportunity.exchange || 'Unknown'}</span>
                      <span className="mx-2 text-xs text-gray-400">Triangular</span>
                      <span className="text-green-400">{opportunity.path || 'Multiple Pairs'}</span>
                    </div>
                  ) : opportunity.type === 'statistical' ? (
                    <div className="flex items-center text-gray-300">
                      <span className="text-blue-400">{opportunity.buyExchange}</span>
                      <ArrowRightIcon className="mx-2 h-3 w-3 text-gray-400" />
                      <span className="text-green-400">{opportunity.sellExchange}</span>
                      <span className="ml-2 text-xs text-gray-400">Z-Score: {opportunity.zScore || 'N/A'}</span>
                    </div>
                  ) : opportunity.type === 'AI prediction' ? (
                    <div className="flex items-center text-gray-300">
                      <span className="text-yellow-400">AI Confidence: {(Math.random() * 30 + 70).toFixed(1)}%</span>
                      <ArrowRightIcon className="mx-2 h-3 w-3 text-gray-400" />
                      <span className="text-green-400">Pred. Gap: {(Math.random() * 1.5 + 0.5).toFixed(2)}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-300">
                      <span className="text-blue-400">{opportunity.buyExchange}</span>
                      <ArrowRightIcon className="mx-2 h-3 w-3 text-gray-400" />
                      <span className="text-green-400">{opportunity.sellExchange}</span>
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
                    opportunity.profitPercent > 1 ? "text-green-500" : "text-red-500"
                  )}>
                    {opportunity.profitPercent.toFixed(2)}% Profit
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400">
              No arbitrage opportunities available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArbitrageOpportunities;
