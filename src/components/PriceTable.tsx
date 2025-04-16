
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceData {
  exchange: string;
  pair: string;
  price: number;
  volume: number;
  change24h: number;
}

interface PriceTableProps {
  data: PriceData[];
  title: string;
}

const PriceTable: React.FC<PriceTableProps> = ({ data, title }) => {
  // Ensure data is an array even if undefined is passed
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="rounded-lg bg-crypto-card p-4 shadow-md">
      <h2 className="mb-4 text-lg font-medium text-white">{title}</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-800">
              <TableHead className="text-left text-gray-400">Exchange</TableHead>
              <TableHead className="text-left text-gray-400">Pair</TableHead>
              <TableHead className="text-right text-gray-400">Price (USDT)</TableHead>
              <TableHead className="text-right text-gray-400">24h Volume</TableHead>
              <TableHead className="text-right text-gray-400">24h Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeData.length > 0 ? (
              safeData.map((item, index) => (
                <TableRow 
                  key={index} 
                  className="border-b border-gray-800 hover:bg-crypto-light-card/50"
                >
                  <TableCell className="font-medium">{item.exchange}</TableCell>
                  <TableCell>{item.pair}</TableCell>
                  <TableCell className="text-right font-mono">
                    {item.price !== undefined && !isNaN(item.price)
                      ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.volume !== undefined && !isNaN(item.volume)
                      ? (item.volume >= 1000000 
                          ? `$${(item.volume / 1000000).toFixed(2)}M` 
                          : `$${(item.volume / 1000).toFixed(0)}K`)
                      : "N/A"}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right flex items-center justify-end",
                    item.change24h > 0 ? "text-crypto-green" : "text-crypto-red"
                  )}>
                    {item.change24h !== undefined ? (
                      <>
                        {item.change24h > 0 ? (
                          <ArrowUpIcon className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="mr-1 h-4 w-4" />
                        )}
                        {Math.abs(item.change24h)}%
                      </>
                    ) : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  No price data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PriceTable;
