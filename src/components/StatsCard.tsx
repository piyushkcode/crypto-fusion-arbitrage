
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  className 
}) => {
  return (
    <Card className={cn("bg-crypto-card border-gray-800", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
            {trend && (
              <p className={cn(
                "text-xs mt-1",
                trend.isPositive ? "text-crypto-green" : "text-crypto-red"
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className="p-2 rounded-md bg-crypto-light-card/30">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
