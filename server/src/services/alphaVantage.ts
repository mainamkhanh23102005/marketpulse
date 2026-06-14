import fetch from 'node-fetch';
import { PriceQuote, HistoryPoint, TimeRange } from '../types/prices';

const BASE = 'https://www.alphavantage.co/query';

function key(): string {
  return process.env.ALPHA_VANTAGE_API_KEY ?? '';
}

export async function getStockQuote(symbol: string): Promise<PriceQuote> {
  const url = `${BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key()}`;
  const res = await fetch(url);
  const data = await res.json() as Record<string, unknown>;
  const q = data['Global Quote'] as Record<string, string> | undefined;
  if (!q || !q['05. price']) throw new Error(`No data for ${symbol}`);
  return {
    symbol: q['01. symbol'],
    type: 'stock',
    price: parseFloat(q['05. price']),
    change: parseFloat(q['09. change']),
    changePct: parseFloat(q['10. change percent'].replace('%', '')),
    high: parseFloat(q['03. high']),
    low: parseFloat(q['04. low']),
  };
}

export async function getStockHistory(symbol: string, range: TimeRange): Promise<HistoryPoint[]> {
  const url = `${BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${key()}`;
  const res = await fetch(url);
  const data = await res.json() as Record<string, unknown>;
  const series = data['Time Series (Daily)'] as Record<string, Record<string, string>> | undefined;
  if (!series) throw new Error(`No history for ${symbol}`);

  const days = range === '1D' ? 1 : range === '1W' ? 7 : range === '1M' ? 30 : 90;
  return Object.entries(series)
    .slice(0, days)
    .map(([date, v]) => ({
      time: date,
      open: parseFloat(v['1. open']),
      high: parseFloat(v['2. high']),
      low: parseFloat(v['3. low']),
      close: parseFloat(v['4. close']),
    }))
    .reverse();
}
