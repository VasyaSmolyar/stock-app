import { StockProvider, StockQuote } from './types';

export class StocksService {
  constructor(private readonly provider: StockProvider) {}

  async getQuote(symbol: string): Promise<StockQuote> {
    return this.provider.getQuote(symbol);
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    return this.provider.getQuotes(symbols);
  }
} 