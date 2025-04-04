import { NextResponse } from 'next/server';
import { StocksService } from '@/services/stocks/stocks.service';
import { AlphaVantageProvider } from '@/services/stocks/providers/alpha-vantage.provider';

export async function GET(request: Request) {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Alpha Vantage API key is not configured');
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const symbol = searchParams.get('symbol');

    const provider = new AlphaVantageProvider(apiKey);
    const service = new StocksService(provider);

    if (from && to && symbol) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const historicalQuotes = await provider.getHistoricalQuotes(symbol, fromDate, toDate);
      return NextResponse.json(historicalQuotes);
    }

    const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT'];
    const quotes = await service.getQuotes(popularSymbols);
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
} 