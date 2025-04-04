import { StockProvider, StockQuote, HistoricalQuote } from '../types';

export class AlphaVantageProvider implements StockProvider {
  private readonly baseUrl = 'https://www.alphavantage.co/query';
  private readonly apiKey: string;
  private lastRequestTime: number = 0;
  private readonly requestDelay = 200; // delay between requests

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    await this.waitForRateLimit();

    const response = await fetch(
      `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }

    const data = await response.json();
    
    if (data['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      throw new Error(`No data available for ${symbol}`);
    }

    // Get the latest available quote
    const dates = Object.keys(timeSeries);
    const latestDate = dates[0];
    const previousDate = dates[1];
    const latestQuote = timeSeries[latestDate];
    const previousQuote = timeSeries[previousDate];

    return {
      symbol: symbol,
      price: parseFloat(latestQuote['4. close']),
      change: parseFloat(latestQuote['4. close']) - parseFloat(previousQuote['4. close']),
      changePercent: ((parseFloat(latestQuote['4. close']) - parseFloat(previousQuote['4. close'])) / parseFloat(previousQuote['4. close'])) * 100,
      previousClose: parseFloat(previousQuote['4. close']),
      open: parseFloat(latestQuote['1. open']),
      dayHigh: parseFloat(latestQuote['2. high']),
      dayLow: parseFloat(latestQuote['3. low']),
      volume: parseInt(latestQuote['5. volume']),
      marketCap: 0,
      timestamp: new Date(latestDate)
    };
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes: StockQuote[] = [];
    const errors: { symbol: string; error: string }[] = [];
    
    for (const symbol of symbols) {
      try {
        const quote = await this.getQuote(symbol);
        quotes.push(quote);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ symbol, error: errorMessage });
        console.warn(`Failed to fetch quote for ${symbol}:`, errorMessage);
      }
    }

    if (errors.length > 0) {
      console.warn('Failed to fetch quotes for symbols:', errors.map(e => e.symbol).join(', '));
    }
    
    return quotes;
  }

  async getHistoricalQuotes(symbol: string, from: Date, to: Date): Promise<HistoricalQuote[]> {
    await this.waitForRateLimit();

    const response = await fetch(
      `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch historical data for ${symbol}`);
    }

    const data = await response.json();
    
    if (data['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    console.log(data);

    const timeSeries = data['Time Series (Daily)'];

    if (!timeSeries) {
      throw new Error(`No historical data available for ${symbol}`);
    }

    return Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => {
        const [year, month, day] = date.split('-').map(Number);
        return {
          date: new Date(year, month - 1, day),
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        };
      })
      .filter(quote => quote.date >= from && quote.date <= to)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
} 