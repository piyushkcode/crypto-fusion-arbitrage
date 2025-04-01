
// Mock data generation for crypto prices
export const exchanges = ['Binance', 'KuCoin', 'Bybit', 'OKX'];
export const cryptoPairs = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT'];

interface PriceData {
  exchange: string;
  pair: string;
  price: number;
  volume: number;
  change24h: number;
}

export interface ArbitrageOpportunity {
  id: string;
  buyExchange: string;
  sellExchange: string;
  pair: string;
  priceDiff: number;
  profitPercent: number;
  timestamp: Date;
  status: 'active' | 'executed' | 'expired';
}

// Generate random price with small variations
export const generatePrice = (basePrice: number): number => {
  const variation = basePrice * 0.02 * (Math.random() - 0.5);
  return +(basePrice + variation).toFixed(2);
};

// Base prices for crypto pairs
const basePrices = {
  'BTC/USDT': 60000,
  'ETH/USDT': 3500,
  'XRP/USDT': 0.5,
  'SOL/USDT': 150,
  'ADA/USDT': 0.45,
};

// Generate mock price data for all exchanges and pairs
export const generateAllPriceData = (): PriceData[] => {
  const allData: PriceData[] = [];

  exchanges.forEach(exchange => {
    cryptoPairs.forEach(pair => {
      const basePrice = basePrices[pair as keyof typeof basePrices];
      allData.push({
        exchange,
        pair,
        price: generatePrice(basePrice),
        volume: +(Math.random() * 1000000).toFixed(0),
        change24h: +(Math.random() * 10 - 5).toFixed(2),
      });
    });
  });

  return allData;
};

// Generate mock arbitrage opportunities
export const generateArbitrageOpportunities = (priceData: PriceData[]): ArbitrageOpportunity[] => {
  const opportunities: ArbitrageOpportunity[] = [];
  const statuses: ('active' | 'executed' | 'expired')[] = ['active', 'executed', 'expired'];

  // Group price data by pair
  const pairGroups: Record<string, PriceData[]> = {};
  priceData.forEach(data => {
    if (!pairGroups[data.pair]) {
      pairGroups[data.pair] = [];
    }
    pairGroups[data.pair].push(data);
  });

  // For each pair, find potential arbitrage opportunities
  Object.entries(pairGroups).forEach(([pair, prices]) => {
    // Sort by price (ascending)
    prices.sort((a, b) => a.price - b.price);
    
    // Take the lowest and highest price for each pair
    const lowestPrice = prices[0];
    const highestPrice = prices[prices.length - 1];
    
    // Calculate price difference and profit percentage
    const priceDiff = highestPrice.price - lowestPrice.price;
    const profitPercent = (priceDiff / lowestPrice.price) * 100;
    
    // Only include if profit is significant enough (>0.2%)
    if (profitPercent > 0.2) {
      opportunities.push({
        id: `arb-${Math.random().toString(36).substring(2, 10)}`,
        buyExchange: lowestPrice.exchange,
        sellExchange: highestPrice.exchange,
        pair,
        priceDiff,
        profitPercent,
        timestamp: new Date(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }
  });

  return opportunities;
};

// Get the most active crypto pairs based on volume
export const getMostActivePairs = (priceData: PriceData[]): string[] => {
  // Group and sum volumes by pair
  const volumeByPair: Record<string, number> = {};
  priceData.forEach(data => {
    if (!volumeByPair[data.pair]) {
      volumeByPair[data.pair] = 0;
    }
    volumeByPair[data.pair] += data.volume;
  });
  
  // Sort pairs by volume and take top 3
  return Object.entries(volumeByPair)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
};
