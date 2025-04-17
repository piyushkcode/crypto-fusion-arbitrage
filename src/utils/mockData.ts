
export function generatePriceData(exchange: string, symbol: string): PriceData {
  const now = new Date();
  let basePrice: number;
  
  // Select base price based on exchange with more subtle variations
  if (exchange === 'Bybit') {
    // Reduce the price difference, now only about 2-3% different from Binance
    basePrice = basePrices[symbol] * (1 + (Math.random() * 0.03 - 0.015));
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
    timestamp: now
  };
}
