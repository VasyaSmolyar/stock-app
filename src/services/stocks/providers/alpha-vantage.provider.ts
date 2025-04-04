import { StockProvider, StockQuote, HistoricalQuote } from '../types';
import { formatMarketCap } from '../utils';

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
      `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }

    const data = await response.json();
    const timeSeries = data['Time Series (Daily)'];
    const dates = Object.keys(timeSeries).sort();
    const latestDate = dates[0];
    const previousDate = dates[1];
    const latestData = timeSeries[latestDate];
    const previousData = timeSeries[previousDate];

    const currentPrice = parseFloat(latestData['4. close']);
    const previousClose = parseFloat(previousData['4. close']);
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: symbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      previousClose: previousClose,
      open: parseFloat(latestData['1. open']),
      dayHigh: parseFloat(latestData['2. high']),
      dayLow: parseFloat(latestData['3. low']),
      volume: parseFloat(latestData['5. volume']),
      marketCap: formatMarketCap(currentPrice, parseFloat(latestData['5. volume'])),
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