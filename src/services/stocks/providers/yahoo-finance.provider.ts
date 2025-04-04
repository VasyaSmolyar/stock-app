import { StockProvider, StockQuote, HistoricalQuote } from '../types';
import { formatMarketCap } from '../utils';

export class YahooFinanceProvider implements StockProvider {
  private readonly baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';

  async getQuote(symbol: string): Promise<StockQuote> {
    const response = await fetch(`${this.baseUrl}/${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const meta = result.meta;
    const previousClose = result.meta.previousClose;
    const currentPrice = result.meta.regularMarketPrice;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: symbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      previousClose: previousClose,
      open: meta.regularMarketOpen,
      dayHigh: meta.regularMarketDayHigh,
      dayLow: meta.regularMarketDayLow,
      volume: meta.regularMarketVolume,
      marketCap: formatMarketCap(currentPrice, meta.regularMarketVolume),
      timestamp: new Date(meta.regularMarketTime * 1000)
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
    const fromTimestamp = Math.floor(from.getTime() / 1000);
    const toTimestamp = Math.floor(to.getTime() / 1000);
    
    const response = await fetch(
      `${this.baseUrl}/${symbol}?interval=1d&period1=${fromTimestamp}&period2=${toTimestamp}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch historical data for ${symbol}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];

    return timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000),
      open: quotes.open[index],
      high: quotes.high[index],
      low: quotes.low[index],
      close: quotes.close[index],
      volume: quotes.volume[index]
    }));
  }
} 