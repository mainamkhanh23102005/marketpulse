import { getStockQuote } from './alphaVantage';
import { getCryptoQuote } from './coinGecko';
import { PriceQuote } from '../types/prices';

const TRACKED_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ'];
const TRACKED_CRYPTO = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple'];

interface Summary { gainers: PriceQuote[]; losers: PriceQuote[] }

let cached: { data: Summary; expiresAt: number } | null = null;
const TTL = 60 * 1000;

export async function getMarketSummary(): Promise<Summary> {
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const results = await Promise.allSettled([
    ...TRACKED_STOCKS.map(s => getStockQuote(s)),
    ...TRACKED_CRYPTO.map(s => getCryptoQuote(s)),
  ]);

  const quotes = results
    .filter((r): r is PromiseFulfilledResult<PriceQuote> => r.status === 'fulfilled')
    .map(r => r.value)
    .sort((a, b) => b.changePct - a.changePct);

  const data: Summary = {
    gainers: quotes.slice(0, 5),
    losers: quotes.slice(-5).reverse(),
  };
  cached = { data, expiresAt: Date.now() + TTL };
  return data;
}
