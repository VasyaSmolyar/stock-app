'use client';

import { useState, useEffect } from 'react';
import { StockQuote, HistoricalQuote } from '@/services/stocks/types';

interface StockScreenerTableProps {
  initialStocks: StockQuote[];
}

export default function StockScreenerTable({ initialStocks }: StockScreenerTableProps) {
  const [stocks, setStocks] = useState(initialStocks);
  const [historicalData, setHistoricalData] = useState<HistoricalQuote[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [filters, setFilters] = useState({
    minChangePercent: -100,
    maxChangePercent: 100,
    minVolume: 0,
  });

  const fetchHistoricalData = async () => {
    if (!selectedSymbol || !dateRange.from || !dateRange.to) return;

    try {
      const response = await fetch(
        `/api/stocks?symbol=${selectedSymbol}&from=${dateRange.from}&to=${dateRange.to}`
      );
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    }
  };

  useEffect(() => {
    if (selectedSymbol && dateRange.from && dateRange.to) {
      fetchHistoricalData();
    }
  }, [selectedSymbol, dateRange]);

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  console.log(historicalData)

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Symbol</label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Symbol</option>
            {stocks.map(stock => (
              <option key={stock.symbol} value={stock.symbol}>{stock.symbol}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">From Date</label>
          <input
            type="date"
            name="from"
            value={dateRange.from}
            onChange={handleDateChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">To Date</label>
          <input
            type="date"
            name="to"
            value={dateRange.to}
            onChange={handleDateChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      

      {historicalData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Historical Data for {selectedSymbol}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historicalData.map((quote) => (
                  <tr key={quote.date.toISOString()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{quote.date.toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${quote.open.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${quote.high.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${quote.low.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${quote.close.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{quote.volume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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