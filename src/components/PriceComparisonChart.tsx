
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface PriceData {
  exchange: string;
  pair: string;
  price: number;
}

interface PriceComparisonChartProps {
  data: PriceData[];
  pair: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-crypto-card p-3 border border-gray-800 rounded-md shadow-lg">
        <p className="font-medium text-white">{payload[0].payload.exchange}</p>
        <p className="text-sm text-gray-300">
          Price: <span className="text-crypto-burgundy font-medium">${payload[0].value.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  
  return null;
};

const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({ data, pair }) => {
  // Sort data by price
  const sortedData = [...data].sort((a, b) => a.price - b.price);
  
  // Calculate min and max values for the chart
  const minPrice = Math.floor(Math.min(...data.map(item => item.price)) * 0.999);
  const maxPrice = Math.ceil(Math.max(...data.map(item => item.price)) * 1.001);
  
  // Calculate domain padding
  const domainPadding = (maxPrice - minPrice) * 0.1;
  
  return (
    <Card className="bg-crypto-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-white">
          {pair} - Exchange Price Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
              barSize={40}
              layout="vertical"
            >
              <XAxis 
                type="number"
                domain={[minPrice - domainPadding, maxPrice + domainPadding]} 
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <YAxis 
                dataKey="exchange"
                type="category"
                tick={{ fill: '#9CA3AF' }} 
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="price" 
                fill="#a83251" 
                radius={[0, 4, 4, 0]}
              >
                <LabelList 
                  dataKey="price" 
                  position="right" 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  fill="#F9FAFB"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceComparisonChart;
