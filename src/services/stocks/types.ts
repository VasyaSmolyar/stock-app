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
  marketCap: string;
  timestamp: Date;
}

export interface HistoricalQuote {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockProvider {
  getQuote(symbol: string): Promise<StockQuote>;
  getQuotes(symbols: string[]): Promise<StockQuote[]>;
  getHistoricalQuotes(symbol: string, from: Date, to: Date): Promise<HistoricalQuote[]>;
} 