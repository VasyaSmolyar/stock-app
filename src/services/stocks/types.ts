export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  timestamp: Date;
}

export interface StockProvider {
  getQuote(symbol: string): Promise<StockQuote>;
  getQuotes(symbols: string[]): Promise<StockQuote[]>;
} 