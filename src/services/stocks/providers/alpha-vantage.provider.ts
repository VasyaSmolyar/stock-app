import { StockProvider, StockQuote } from '../types';

export class AlphaVantageProvider implements StockProvider {
  private readonly baseUrl = 'https://www.alphavantage.co/query';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const response = await fetch(
      `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }

    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote) {
      throw new Error(`No data available for ${symbol}`);
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      previousClose: parseFloat(quote['08. previous close']),
      open: parseFloat(quote['02. open']),
      dayHigh: parseFloat(quote['03. high']),
      dayLow: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume']),
      marketCap: 0, // Alpha Vantage doesn't provide market cap in the global quote
      timestamp: new Date()
    };
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes = await Promise.all(
      symbols.map(symbol => this.getQuote(symbol))
    );
    return quotes;
  }
} 