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

interface CoinGeckoMarketData {
  current_price?: { usd?: number };
  price_change_24h?: number;
  price_change_percentage_24h?: number;
  high_24h?: { usd?: number };
  low_24h?: { usd?: number };
}

export async function getCryptoQuote(id: string): Promise<PriceQuote> {
  const resolvedId = resolveId(id);
  const url = `${BASE}/coins/${resolvedId}?localization=false&tickers=false&community_data=false&developer_data=false`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`CoinGecko HTTP ${res.status} for ${resolvedId}`);
  }

  const data = await res.json() as { market_data?: CoinGeckoMarketData };
  const market = data.market_data;

  if (!market) {
    console.error(`[coinGecko] getCryptoQuote no market_data for ${resolvedId}:`, JSON.stringify(data).slice(0, 500));
    throw new Error(`No data for ${resolvedId}`);
  }

  const price = market.current_price?.usd;
  if (price == null) {
    console.error(`[coinGecko] getCryptoQuote missing current_price.usd for ${resolvedId}:`, JSON.stringify(market).slice(0, 500));
    throw new Error(`No price data for ${resolvedId}`);
  }

  return {
    symbol: resolvedId,
    type: 'crypto',
    price,
    change: market.price_change_24h ?? 0,
    changePct: market.price_change_percentage_24h ?? 0,
    high: market.high_24h?.usd ?? price,
    low: market.low_24h?.usd ?? price,
  };
}

export async function getCryptoHistory(id: string, range: TimeRange): Promise<HistoryPoint[]> {
  const resolvedId = resolveId(id);
  const days = RANGE_DAYS[range];
  const url = `${BASE}/coins/${resolvedId}/market_chart?vs_currency=usd&days=${days}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`CoinGecko HTTP ${res.status} for ${resolvedId} history`);
  }

  const data = await res.json() as { prices?: number[][] };

  if (!data.prices || !Array.isArray(data.prices)) {
    console.error(`[coinGecko] getCryptoHistory no prices for ${resolvedId}:`, JSON.stringify(data).slice(0, 500));
    throw new Error(`No price history for ${resolvedId}`);
  }

  return data.prices.map(([ts, price]) => ({
    time: new Date(ts).toISOString().split('T')[0],
    open: price,
    high: price,
    low: price,
    close: price,
  }));
}
