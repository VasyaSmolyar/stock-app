import { Suspense } from 'react';
import { StockQuote } from '@/services/stocks/types';
import StockScreenerTable from './StockScreenerTable';

async function getStocks(): Promise<StockQuote[]> {
  const res = await fetch('http://localhost:3000/api/stocks', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch stocks');
  }
  return res.json();
}

export default async function StockScreener() {
  const stocks = await getStocks();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stock Screener</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <StockScreenerTable initialStocks={stocks} />
      </Suspense>
    </div>
  );
} 