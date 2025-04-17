export interface PriceData {
  exchange: string;
  symbol: string;
  last: number;
  bid: number;
  ask: number;
  volume: number;
  change24h: number;
  timestamp: Date;
}

// Updated ArbitrageOpportunity type
export interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange?: string;
  sellExchange?: string;
  buyPrice?: number;
  sellPrice?: number;
  priceDiff?: number;
  profitPercent: number;
  timestamp: Date;
  status: 'active' | 'executed' | 'expired';
  type?: 'simple' | 'triangular' | 'statistical';
  exchange?: string;
  finalAmount?: number;
  path?: any;
  zScore?: number;
}

// Add these missing exports
export const cryptoPairs = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT'];
export const exchanges = ['Binance', 'KuCoin', 'Bybit', 'OKX'];

// Base prices for each pair (Binance data as reference)
const basePrices = {
  'BTC/USDT': 85138,
  'ETH/USDT': 1612.87,
  'XRP/USDT': 2.10,
  'SOL/USDT': 135.43,
  'ADA/USDT': 0.6289
};

// Special prices for Bybit (when available)
const bybitPrices = {
  'BTC/USDT': 97500,
  'ETH/USDT': 2656,
  'XRP/USDT': 2.35,
  'SOL/USDT': 206.28,
  'ADA/USDT': 0.6289  // Using Binance price as fallback
};

export function generatePriceData(exchange: string, symbol: string): PriceData {
  const now = new Date();
  let basePrice: number;
  
  // Select base price based on exchange
  if (exchange === 'Bybit') {
    basePrice = bybitPrices[symbol];
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
  
  // Generate realistic volume
  const baseVolume = {
    'BTC/USDT': 1000,
    'ETH/USDT': 5000,
    'XRP/USDT': 20000,
    'SOL/USDT': 8000,
    'ADA/USDT': 50000
  }[symbol] || 1000;
  
  const volume = baseVolume * (0.8 + Math.random() * 0.4); // ±20% volume variation
  
  // Calculate 24h change (between -2% and +2%)
  const change24h = (Math.random() * 4 - 2);

  return {
    exchange,
    symbol,
    last,
    bid,
    ask,
    volume,
    change24h,
    timestamp: now
  };
}

export function generateAllPriceData(): any[] {
  const data: any[] = [];

  exchanges.forEach(exchange => {
    cryptoPairs.forEach(symbol => {
      data.push(generatePriceData(exchange, symbol));
    });
  });

  return data;
}

// Add getMostActivePairs function
export function getMostActivePairs(priceData: any[]): string[] {
  if (!priceData || priceData.length === 0) {
    return cryptoPairs.slice(0, 5);
  }

  const volumeByPair: Record<string, number> = {};
  
  priceData.forEach(price => {
    if (!volumeByPair[price.symbol]) {
      volumeByPair[price.symbol] = 0;
    }
    volumeByPair[price.symbol] += price.volume || 0;
  });
  
  return Object.entries(volumeByPair)
    .sort(([, a], [, b]) => b - a)
    .map(([pair]) => pair)
    .slice(0, 5);
}

// Update to generateArbitrageOpportunities to include different arbitrage types
export function generateArbitrageOpportunities(
  priceData: any[], 
  minProfit: number = 0.5, 
  strategyType: string = 'simple'
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  const now = new Date();
  
  if (strategyType === 'triangular') {
    // Generate triangular arbitrage opportunities
    const triangularPaths = [
      {step1: 'BTC/USDT', step2: 'ETH/BTC', step3: 'ETH/USDT'},
      {step1: 'ETH/USDT', step2: 'XRP/ETH', step3: 'XRP/USDT'},
      {step1: 'BTC/USDT', step2: 'XRP/BTC', step3: 'XRP/USDT'},
    ];
    
    exchanges.forEach(exchange => {
      triangularPaths.forEach(path => {
        // Generate a random profit percentage above the minimum profit
        const profitPercent = minProfit + Math.random() * 5;
        
        // Calculate a plausible final amount based on profit
        const initialAmount = 1; // Starting with 1 USDT
        const finalAmount = initialAmount * (1 + profitPercent/100);
        
        // Determine if opportunity should be active, executed, or expired
        const statusRandom = Math.random();
        let status: 'active' | 'executed' | 'expired';
        
        if (statusRandom < 0.7) {
          status = 'active';
        } else if (statusRandom < 0.9) {
          status = 'executed';
        } else {
          status = 'expired';
        }
        
        opportunities.push({
          id: `triangular-${exchange}-${path.step1}-${Date.now()}-${Math.random()}`,
          pair: `${path.step1} → ${path.step2} → ${path.step3}`,
          exchange: exchange,
          profitPercent: profitPercent,
          timestamp: new Date(now.getTime() - Math.random() * 3600000), // Random time within last hour
          status: status,
          type: 'triangular',
          finalAmount: finalAmount,
          path: path
        });
      });
    });
  } 
  else if (strategyType === 'statistical') {
    // Generate statistical arbitrage opportunities
    
    // Generate exchange combinations
    for (let i = 0; i < exchanges.length; i++) {
      for (let j = i + 1; j < exchanges.length; j++) {
        cryptoPairs.forEach(pair => {
          // Only create opportunity if random check passes (to avoid too many opportunities)
          if (Math.random() < 0.3) {
            const profitPercent = minProfit + Math.random() * 3;
            const zScore = Math.random() * 6 - 3; // z-score between -3 and 3
            
            // Determine buy/sell exchanges based on z-score
            const buyExchange = zScore < 0 ? exchanges[i] : exchanges[j];
            const sellExchange = zScore < 0 ? exchanges[j] : exchanges[i];
            
            // Determine if opportunity should be active, executed, or expired
            const statusRandom = Math.random();
            let status: 'active' | 'executed' | 'expired';
            
            if (statusRandom < 0.7) {
              status = 'active';
            } else if (statusRandom < 0.9) {
              status = 'executed';
            } else {
              status = 'expired';
            }
            
            opportunities.push({
              id: `statistical-${pair}-${Date.now()}-${Math.random()}`,
              pair: pair,
              buyExchange: buyExchange,
              sellExchange: sellExchange,
              profitPercent: profitPercent,
              timestamp: new Date(now.getTime() - Math.random() * 3600000), // Random time within last hour
              status: status,
              type: 'statistical',
              zScore: Math.round(zScore * 100) / 100
            });
          }
        });
      }
    }
  }
  else {
    // Original simple arbitrage opportunities
    
    // Group price data by trading pair
    const pairPrices: { [key: string]: any[] } = {};
    
    priceData.forEach((price: any) => {
      if (!pairPrices[price.symbol]) {
        pairPrices[price.symbol] = [];
      }
      pairPrices[price.symbol].push(price);
    });
    
    // Find arbitrage opportunities in each trading pair
    Object.keys(pairPrices).forEach(pair => {
      const prices = pairPrices[pair];
      
      // Find min ask (buy) price and max bid (sell) price
      let minAsk = Number.MAX_VALUE;
      let maxBid = 0;
      let buyExchange = '';
      let sellExchange = '';
      
      prices.forEach(price => {
        if (price.ask && price.ask < minAsk) {
          minAsk = price.ask;
          buyExchange = price.exchange;
        }
        
        if (price.bid && price.bid > maxBid) {
          maxBid = price.bid;
          sellExchange = price.exchange;
        }
      });
      
      // Check if there's a profitable opportunity
      if (buyExchange && sellExchange && buyExchange !== sellExchange) {
        const priceDiff = maxBid - minAsk;
        const profitPercent = (priceDiff / minAsk) * 100;
        
        if (profitPercent >= minProfit) {
          // Determine if opportunity should be active, executed, or expired
          const statusRandom = Math.random();
          let status: 'active' | 'executed' | 'expired';
          
          if (statusRandom < 0.7) {
            status = 'active';
          } else if (statusRandom < 0.9) {
            status = 'executed';
          } else {
            status = 'expired';
          }
          
          opportunities.push({
            id: `simple-${pair}-${Date.now()}-${Math.random()}`,
            pair: pair,
            buyExchange: buyExchange,
            sellExchange: sellExchange,
            buyPrice: minAsk,
            sellPrice: maxBid,
            priceDiff: priceDiff,
            profitPercent: profitPercent,
            timestamp: new Date(now.getTime() - Math.random() * 3600000), // Random time within last hour
            status: status,
            type: 'simple'
          });
        }
      }
    });
  }
  
  // Sort opportunities by profit percentage (descending)
  return opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
}
