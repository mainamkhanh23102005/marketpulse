import fetch from 'node-fetch';
import { PriceQuote, HistoryPoint, TimeRange } from '../types/prices';

const BASE = 'https://api.coingecko.com/api/v3';

const RANGE_DAYS: Record<TimeRange, number> = { '1D': 1, '1W': 7, '1M': 30, '3M': 90 };

const SYMBOL_TO_ID: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  xrp: 'ripple',
  bnb: 'binancecoin',
};

function resolveId(symbolOrId: string): string {
  const key = symbolOrId.toLowerCase();
  return SYMBOL_TO_ID[key] ?? key;
}

export async function getCryptoQuote(id: string): Promise<PriceQuote> {
  const resolvedId = resolveId(id);
  const url = `${BASE}/coins/${resolvedId}?localization=false&tickers=false&community_data=false&developer_data=false`;
  const res = await fetch(url);
  const data = await res.json() as Record<string, unknown>;
  const market = data['market_data'] as Record<string, Record<string, number>> | undefined;
  if (!market) throw new Error(`No data for ${resolvedId}`);

  const price = market['current_price']['usd'];
  const change = market['price_change_24h']['usd'] ?? market['price_change_24h'] as unknown as number;
  const changePct = market['price_change_percentage_24h'] as unknown as number;
  const high = market['high_24h']['usd'];
  const low = market['low_24h']['usd'];

  return {
    symbol: resolvedId,
    type: 'crypto',
    price,
    change: typeof change === 'number' ? change : 0,
    changePct: typeof changePct === 'number' ? changePct : 0,
    high,
    low,
  };
}

export async function getCryptoHistory(id: string, range: TimeRange): Promise<HistoryPoint[]> {
  const resolvedId = resolveId(id);
  const days = RANGE_DAYS[range];
  const url = `${BASE}/coins/${resolvedId}/market_chart?vs_currency=usd&days=${days}`;
  const res = await fetch(url);
  const data = await res.json() as { prices: number[][] };
  return data.prices.map(([ts, price]) => ({
    time: new Date(ts).toISOString().split('T')[0],
    open: price,
    high: price,
    low: price,
    close: price,
  }));
}
