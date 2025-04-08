
// Mock data generation for crypto prices
export const exchanges = ['Binance', 'KuCoin', 'Bybit', 'OKX'];
export const cryptoPairs = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT'];

// Interface for price data (works with both mock and real data)
export interface PriceData {
  exchange: string;
  symbol?: string; // Used in real API
  pair?: string;   // Used in mock data
  price?: number;  // Used in mock data
  last?: number;   // Used in real API
  volume: number;
  change24h?: number; // Used in mock data
  percentage?: number; // Used in real API
  bid?: number;
  ask?: number;
  timestamp?: string | Date;
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

// Base prices for crypto pairs (used as fallback when API is not available)
const basePrices = {
  'BTC/USDT': 70000,  // Updated to a more current price point
  'ETH/USDT': 3800,
  'XRP/USDT': 0.6,
  'SOL/USDT': 180,
  'ADA/USDT': 0.55,
};

// Improved price generation with more significant variations
export const generatePrice = (basePrice: number): number => {
  // Introduce more substantial price variations
  const volatility = 0.05; // 5% potential price swing
  const variation = basePrice * volatility * (Math.random() * 2 - 1);
  return +(basePrice + variation).toFixed(2);
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
        symbol: pair,
        price: generatePrice(basePrice),
        last: generatePrice(basePrice),
        volume: +(Math.random() * 1000000).toFixed(0),
        change24h: +(Math.random() * 10 - 5).toFixed(2),
        percentage: +(Math.random() * 10 - 5).toFixed(2),
      });
    });
  });

  return allData;
};

// Generate mock arbitrage opportunities
export const generateArbitrageOpportunities = (priceData: PriceData[], minProfitThreshold: number = 0.2): ArbitrageOpportunity[] => {
  const opportunities: ArbitrageOpportunity[] = [];
  const statuses: ('active' | 'executed' | 'expired')[] = ['active', 'executed', 'expired'];

  // Normalize price data to handle both API and mock data formats
  const normalizedData = priceData.map(data => ({
    exchange: data.exchange,
    pair: data.pair || data.symbol || 'Unknown',
    price: data.price || data.last || 0,
    volume: data.volume || 0,
    change24h: data.change24h || data.percentage || 0,
  }));

  // Group price data by pair
  const pairGroups: Record<string, any[]> = {};
  normalizedData.forEach(data => {
    if (!pairGroups[data.pair]) {
      pairGroups[data.pair] = [];
    }
    pairGroups[data.pair].push(data);
  });

  // For each pair, find potential arbitrage opportunities
  Object.entries(pairGroups).forEach(([pair, prices]) => {
    // Sort by price (ascending)
    prices.sort((a, b) => a.price - b.price);
    
    // Need at least 2 prices to compare
    if (prices.length < 2) return;
    
    // Take the lowest and highest price for each pair
    const lowestPrice = prices[0];
    const highestPrice = prices[prices.length - 1];
    
    // Calculate price difference and profit percentage
    const priceDiff = highestPrice.price - lowestPrice.price;
    const profitPercent = (priceDiff / lowestPrice.price) * 100;
    
    // Only include if profit is significant enough (> minProfitThreshold)
    if (profitPercent > minProfitThreshold) {
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
  // Normalize data to handle both API and mock data formats
  const normalizedData = priceData.map(data => ({
    pair: data.pair || data.symbol || 'Unknown',
    volume: data.volume || 0,
  }));

  // Group and sum volumes by pair
  const volumeByPair: Record<string, number> = {};
  normalizedData.forEach(data => {
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
