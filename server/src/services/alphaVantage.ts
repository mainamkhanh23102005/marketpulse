import fetch from 'node-fetch';
import { PriceQuote, HistoryPoint, TimeRange } from '../types/prices';

const BASE = 'https://www.alphavantage.co/query';

function key(): string {
  return process.env.ALPHA_VANTAGE_API_KEY ?? '';
}

function checkRateLimit(data: Record<string, unknown>, context: string): void {
  const note = data['Note'] as string | undefined;
  const info = data['Information'] as string | undefined;
  if (note) {
    console.error(`[alphaVantage] Rate limit note for ${context}:`, note);
    throw new Error('Alpha Vantage rate limit reached. Try again in 1 minute.');
  }
  if (info) {
    console.error(`[alphaVantage] API limit info for ${context}:`, info);
    throw new Error(`Alpha Vantage API limit reached: ${info}`);
  }
}

async function safeFetch(url: string): Promise<Awaited<ReturnType<typeof fetch>>> {
  try {
    return await fetch(url);
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : String(err);
    throw new Error(raw.replace(/apikey=[^&\s]*/gi, 'apikey=[REDACTED]'));
  }
}

export async function getStockQuote(symbol: string): Promise<PriceQuote> {
  const url = `${BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key()}`;
  const res = await safeFetch(url);
  const data = await res.json() as Record<string, unknown>;

  checkRateLimit(data, symbol);

  const q = data['Global Quote'] as Record<string, string> | undefined;
  if (!q || !q['05. price']) {
    console.error(`[alphaVantage] getStockQuote raw response for ${symbol}:`, JSON.stringify(data).slice(0, 500));
    throw new Error(`No data for ${symbol}`);
  }

  return {
    symbol: q['01. symbol'] ?? symbol,
    type: 'stock',
    price: parseFloat(q['05. price']),
    change: parseFloat(q['09. change'] ?? '0'),
    changePct: parseFloat((q['10. change percent'] ?? '0%').replace('%', '')),
    high: parseFloat(q['03. high'] ?? '0'),
    low: parseFloat(q['04. low'] ?? '0'),
  };
}

export async function getStockHistory(symbol: string, range: TimeRange): Promise<HistoryPoint[]> {
  const url = `${BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${key()}`;
  const res = await safeFetch(url);
  const data = await res.json() as Record<string, unknown>;

  checkRateLimit(data, symbol);

  const series = data['Time Series (Daily)'] as Record<string, Record<string, string>> | undefined;
  if (!series) {
    console.error(`[alphaVantage] getStockHistory raw response for ${symbol}:`, JSON.stringify(data).slice(0, 500));
    throw new Error(`No history for ${symbol}`);
  }

  const days = range === '1D' ? 1 : range === '1W' ? 7 : range === '1M' ? 30 : 90;
  return Object.entries(series)
    .sort(([a], [b]) => b.localeCompare(a))
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
