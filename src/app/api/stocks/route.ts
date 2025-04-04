import { NextResponse } from 'next/server';
import { StocksService } from '@/services/stocks/stocks.service';
import { YahooFinanceProvider } from '@/services/stocks/providers/yahoo-finance.provider';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const symbol = searchParams.get('symbol');

    const provider = new YahooFinanceProvider();
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