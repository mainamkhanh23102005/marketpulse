import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getStockQuote, getStockHistory } from '../services/alphaVantage';
import { getCryptoQuote, getCryptoHistory } from '../services/coinGecko';
import { getMarketSummary } from '../services/marketSummaryCache';
import { TimeRange } from '../types/prices';
import { createError } from '../middleware/errorHandler';

const VALID_RANGES = new Set<TimeRange>(['1D', '1W', '1M', '3M']);

export async function getQuote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { symbol } = req.params;
    const type = req.query.type as string;
    if (type !== 'stock' && type !== 'crypto') return next(createError('type must be stock or crypto', 400));
    const quote = type === 'stock' ? await getStockQuote(symbol) : await getCryptoQuote(symbol);
    res.json(quote);
  } catch (e) { next(e); }
}

export async function getHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { symbol } = req.params;
    const type = req.query.type as string;
    const range = (req.query.range as TimeRange) ?? '1M';
    if (!VALID_RANGES.has(range)) return next(createError('Invalid range', 400));
    if (type !== 'stock' && type !== 'crypto') return next(createError('type must be stock or crypto', 400));
    const history = type === 'stock'
      ? await getStockHistory(symbol, range)
      : await getCryptoHistory(symbol, range);
    res.json(history);
  } catch (e) { next(e); }
}

export async function marketSummary(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const summary = await getMarketSummary();
    res.json(summary);
  } catch (e) { next(e); }
}
