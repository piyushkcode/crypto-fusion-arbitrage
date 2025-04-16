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

export function generatePriceData(exchange: string, symbol: string): PriceData {
  const now = new Date();
  const last = 100 + Math.random() * 10;
  const bid = last - Math.random() * 0.1;
  const ask = last + Math.random() * 0.1;
  const volume = 1000 + Math.random() * 100;
  const change24h = Math.random() * 2 - 1;

  return {
    exchange: exchange,
    symbol: symbol,
    last: last,
    bid: bid,
    ask: ask,
    volume: volume,
    change24h: change24h,
    timestamp: now
  };
}

export function generateAllPriceData(): any[] {
  const exchanges = ['Binance', 'KuCoin', 'Bybit', 'OKX'];
  const symbols = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT'];
  const data: any[] = [];

  exchanges.forEach(exchange => {
    symbols.forEach(symbol => {
      data.push(generatePriceData(exchange, symbol));
    });
  });

  return data;
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
    const exchanges = ['Binance', 'KuCoin', 'Bybit', 'OKX'];
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
    const pairs = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT'];
    const exchanges = ['Binance', 'KuCoin', 'Bybit', 'OKX'];
    
    // Generate exchange combinations
    for (let i = 0; i < exchanges.length; i++) {
      for (let j = i + 1; j < exchanges.length; j++) {
        pairs.forEach(pair => {
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
