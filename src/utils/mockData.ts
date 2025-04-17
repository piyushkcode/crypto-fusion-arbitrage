
// Define types for our data structures
export interface PriceData {
  exchange: string;
  symbol: string;
  last: number;
  bid: number;
  ask: number;
  volume: number;
  change24h: number;
  timestamp: Date;
  price: number; // Changed from optional to required
}

export interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  priceDiff?: number;
  profitPercent: number;
  timestamp: Date;
  status: 'active' | 'executed' | 'expired';
  type?: string;
  exchange?: string;
  path?: string;
  finalAmount?: number;
  zScore?: number;
}

// Define base prices for different cryptocurrencies
const basePrices: Record<string, number> = {
  'BTC/USDT': 85138, 
  'ETH/USDT': 1612.87,
  'XRP/USDT': 2.10,
  'SOL/USDT': 135.43,
  'ADA/USDT': 0.6289
};

// Price overrides for Bybit (based on the specific prices provided)
const bybitPrices: Record<string, number> = {
  'BTC/USDT': 85138 * 1.01, // Only slightly higher (1%)
  'ETH/USDT': 1612.87 * 1.02,
  'XRP/USDT': 2.10 * 1.02,
  'SOL/USDT': 135.43 * 1.03,
  'ADA/USDT': 0.6289 * 1.015
};

// Define list of exchanges
export const exchanges = ['Binance', 'Bybit', 'KuCoin', 'OKX'];

// Define cryptocurrency pairs
export const cryptoPairs = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT'];

export function generatePriceData(exchange: string, symbol: string): PriceData {
  const now = new Date();
  let basePrice: number;
  
  // Select base price based on exchange with more subtle variations
  if (exchange === 'Bybit') {
    // Reduce the price difference, now only about 1-3% different from Binance
    basePrice = bybitPrices[symbol] || basePrices[symbol] * (1 + (Math.random() * 0.03 - 0.015));
  } else {
    basePrice = basePrices[symbol];
  }
  
  // Add small random variation (±0.5%) for different exchanges
  const variationPercent = (Math.random() * 1 - 0.5) / 100;
  const last = basePrice * (1 + variationPercent);
  
  // Generate bid and ask with tight spread
  const spreadPercent = 0.0002; // 0.02% spread
  const bid = last * (1 - spreadPercent);
  const ask = last * (1 + spreadPercent);
  
  // Generate realistic and dynamic volume
  const baseVolume = {
    'BTC/USDT': 1000,
    'ETH/USDT': 5000,
    'XRP/USDT': 20000,
    'SOL/USDT': 8000,
    'ADA/USDT': 50000
  }[symbol] || 1000;
  
  // More dynamic volume: ±30% variation and independent for each generation
  const volume = baseVolume * (0.7 + Math.random() * 0.6);
  
  // More dynamic 24h change: between -5% and +5%
  const change24h = (Math.random() * 10 - 5);

  return {
    exchange,
    symbol,
    last,
    bid,
    ask,
    volume,
    change24h,
    timestamp: now,
    price: last // Always set price equal to last
  };
}

export function generateAllPriceData(): PriceData[] {
  const allPriceData: PriceData[] = [];
  
  // For each exchange and symbol combination
  for (const exchange of exchanges) {
    for (const symbol of cryptoPairs) {
      allPriceData.push(generatePriceData(exchange, symbol));
    }
  }
  
  return allPriceData;
}

export function getMostActivePairs(priceData: PriceData[]): string[] {
  // Find pairs with highest volume
  const volumeByPair: Record<string, number> = {};
  
  for (const data of priceData) {
    if (!volumeByPair[data.symbol]) {
      volumeByPair[data.symbol] = 0;
    }
    volumeByPair[data.symbol] += data.volume;
  }
  
  // Sort pairs by volume and take top 5
  return Object.entries(volumeByPair)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pair]) => pair);
}

export function generateArbitrageOpportunities(
  priceData: PriceData[], 
  minProfit: number = 0.5, 
  strategyType: string = 'simple'
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  
  if (!priceData || priceData.length === 0) {
    return opportunities;
  }
  
  // Group price data by symbol
  const pricesBySymbol: Record<string, PriceData[]> = {};
  
  for (const data of priceData) {
    const symbol = data.symbol || 'BTC/USDT';
    if (!pricesBySymbol[symbol]) {
      pricesBySymbol[symbol] = [];
    }
    pricesBySymbol[symbol].push(data);
  }
  
  // For each symbol, find arbitrage opportunities
  for (const [symbol, prices] of Object.entries(pricesBySymbol)) {
    // For simple cross-exchange arbitrage
    if (strategyType === 'simple' || strategyType === 'all') {
      // Find min and max prices across exchanges
      for (let i = 0; i < prices.length; i++) {
        for (let j = 0; j < prices.length; j++) {
          if (i === j) continue;
          
          const buyExchange = prices[i].exchange;
          const sellExchange = prices[j].exchange;
          const buyPrice = prices[i].last || prices[i].price || 0;
          const sellPrice = prices[j].last || prices[j].price || 0;
          
          // Calculate profit percentage
          const profitPercent = ((sellPrice - buyPrice) / buyPrice) * 100;
          
          // Add opportunity if profit meets minimum threshold
          if (profitPercent >= minProfit) {
            opportunities.push({
              id: `${symbol}-${buyExchange}-${sellExchange}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
              pair: symbol,
              buyExchange,
              sellExchange,
              buyPrice,
              sellPrice,
              priceDiff: sellPrice - buyPrice,
              profitPercent,
              timestamp: new Date(),
              status: Math.random() > 0.7 ? 'active' : (Math.random() > 0.5 ? 'executed' : 'expired'),
              type: 'simple'
            });
          }
        }
      }
    }
    
    // Add some triangular arbitrage opportunities
    if (strategyType === 'triangular' || strategyType === 'all') {
      const exchanges = [...new Set(prices.map(p => p.exchange))];
      
      for (const exchange of exchanges) {
        // Simulate a triangular arbitrage opportunity
        if (Math.random() > 0.7) {
          const profitPercent = minProfit + Math.random() * 2;
          
          opportunities.push({
            id: `triangular-${exchange}-${symbol}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
            pair: symbol,
            buyExchange: exchange, // Ensure we have buyExchange
            sellExchange: exchange, // Ensure we have sellExchange
            buyPrice: 0,
            sellPrice: 0,
            profitPercent,
            timestamp: new Date(),
            status: Math.random() > 0.6 ? 'active' : (Math.random() > 0.5 ? 'executed' : 'expired'),
            type: 'triangular',
            path: `${symbol.split('/')[0]} → BTC → ${symbol.split('/')[1]}`,
            finalAmount: 1 + (profitPercent / 100),
            exchange
          });
        }
      }
    }
    
    // Add some statistical arbitrage opportunities
    if (strategyType === 'statistical' || strategyType === 'all') {
      const exchangePairs = [
        ['Binance', 'Bybit'],
        ['KuCoin', 'OKX'],
        ['Binance', 'KuCoin'],
        ['Bybit', 'OKX']
      ];
      
      for (const [exchange1, exchange2] of exchangePairs) {
        if (Math.random() > 0.7) {
          const profitPercent = minProfit + Math.random() * 1.5;
          const zScore = (Math.random() * 4 - 2).toFixed(2);
          
          opportunities.push({
            id: `stat-${exchange1}-${exchange2}-${symbol}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
            pair: symbol,
            buyExchange: exchange1,
            sellExchange: exchange2,
            buyPrice: prices[0]?.last * 0.995 || 100,
            sellPrice: prices[0]?.last * 1.005 || 101,
            profitPercent,
            timestamp: new Date(),
            status: Math.random() > 0.6 ? 'active' : (Math.random() > 0.5 ? 'executed' : 'expired'),
            type: 'statistical',
            zScore: parseFloat(zScore)
          });
        }
      }
    }
  }
  
  // Sort by profit percentage in descending order
  return opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
}
