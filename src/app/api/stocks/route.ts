import { NextResponse } from 'next/server';
import { StocksService } from '@/services/stocks/stocks.service';
import { AlphaVantageProvider } from '@/services/stocks/providers/alpha-vantage.provider';

export async function GET() {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Alpha Vantage API key is not configured');
    }

    const provider = new AlphaVantageProvider(apiKey);
    const service = new StocksService(provider);
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