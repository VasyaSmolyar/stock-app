'use client';

import { useState } from 'react';
import { StockQuote } from '@/services/stocks/types';

interface StockScreenerTableProps {
  initialStocks: StockQuote[];
}

export default function StockScreenerTable({ initialStocks }: StockScreenerTableProps) {
  const [stocks] = useState(initialStocks);
  const [filters, setFilters] = useState({
    minChangePercent: -100,
    maxChangePercent: 100,
    minVolume: 0,
  });

  console.log(stocks);
  const filteredStocks = stocks.filter(stock => 
    stock.changePercent >= filters.minChangePercent &&
    stock.changePercent <= filters.maxChangePercent &&
    stock.volume >= filters.minVolume
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Min Change %</label>
          <input
            type="number"
            name="minChangePercent"
            value={filters.minChangePercent}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            min="-100"
            max="100"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Max Change %</label>
          <input
            type="number"
            name="maxChangePercent"
            value={filters.maxChangePercent}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            min="-100"
            max="100"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Min Volume</label>
          <input
            type="number"
            name="minVolume"
            value={filters.minVolume}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            min="0"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStocks.map((stock) => (
              <tr key={stock.symbol} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{stock.symbol}</td>
                <td className="px-6 py-4 whitespace-nowrap">${stock.price.toFixed(2)}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change.toFixed(2)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.changePercent.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{stock.volume.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">${(stock.marketCap / 1e9).toFixed(2)}B</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
} 