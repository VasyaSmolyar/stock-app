import { StockProvider, StockQuote } from '../types';

export class YahooFinanceProvider implements StockProvider {
  private readonly baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';

  async getQuote(symbol: string): Promise<StockQuote> {
    const response = await fetch(`${this.baseUrl}/${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }

    const data = await response.json();
    const quote = data.chart.result[0].meta;

    return {
      symbol: symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      previousClose: quote.previousClose,
      open: quote.regularMarketOpen,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      timestamp: new Date(quote.regularMarketTime * 1000)
    };
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes = await Promise.all(
      symbols.map(symbol => this.getQuote(symbol))
    );
    return quotes;
  }
} 