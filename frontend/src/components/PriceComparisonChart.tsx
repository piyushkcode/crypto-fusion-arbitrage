
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PriceData {
  exchange: string;
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  timestamp: string;
}

interface PriceComparisonChartProps {
  data: PriceData[];
  pair: string;
}

const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({ data, pair }) => {
  // Process data for the chart
  const formatChartData = () => {
    // Group data by exchange
    const exchangeMap = {};
    
    data.forEach(item => {
      if (!exchangeMap[item.exchange]) {
        exchangeMap[item.exchange] = {
          name: item.exchange,
          price: item.price,
          timestamp: new Date(item.timestamp)
        };
      }
    });
    
    // Convert to array format for chart
    return Object.values(exchangeMap);
  };

  const chartData = formatChartData();
  
  // Generate colors for different exchanges
  const exchangeColors = {
    'binance': '#F0B90B',
    'kucoin': '#26A17B',
    'bybit': '#FFCC00',
    'okx': '#8DC647',
    'default': '#8884d8'
  };
  
  const getExchangeColor = (exchange) => {
    return exchangeColors[exchange.toLowerCase()] || exchangeColors.default;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis 
            dataKey="exchange" 
            tick={{ fill: '#999' }} 
            tickLine={{ stroke: '#444' }}
            axisLine={{ stroke: '#444' }}
          />
          <YAxis 
            tick={{ fill: '#999' }} 
            tickLine={{ stroke: '#444' }}
            axisLine={{ stroke: '#444' }}
            domain={['dataMin - 1', 'dataMax + 1']}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1d2b', borderColor: '#333', color: '#fff' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          {Object.keys(exchangeMap).map((exchange) => (
            <Area
              key={exchange}
              type="monotone"
              dataKey="price"
              data={[exchangeMap[exchange]]}
              name={exchange}
              stroke={getExchangeColor(exchange)}
              fill={`${getExchangeColor(exchange)}33`}
              activeDot={{ r: 8 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceComparisonChart;
