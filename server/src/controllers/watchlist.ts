import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { Watchlist } from '../models/Watchlist';
import { createError } from '../middleware/errorHandler';

const assetSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  type: z.enum(['stock', 'crypto']),
});

const topicSchema = z.object({ topic: z.string().min(1) });

async function getOrCreate(userId: string) {
  let wl = await Watchlist.findOne({ userId });
  if (!wl) wl = await Watchlist.create({ userId, assets: [], topics: [] });
  return wl;
}

export async function getWatchlist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const wl = await getOrCreate(req.user!.id);
    res.json({ assets: wl.assets, topics: wl.topics });
  } catch (e) { next(e); }
}

export async function addAsset(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const parsed = assetSchema.safeParse(req.body);
  if (!parsed.success) return next(createError(parsed.error.errors[0].message, 400));
  try {
    const { symbol, type } = parsed.data;
    const wl = await getOrCreate(req.user!.id);
    const exists = wl.assets.some(a => a.symbol === symbol && a.type === type);
    if (!exists) { wl.assets.push({ symbol, type }); await wl.save(); }
    res.json({ assets: wl.assets, topics: wl.topics });
  } catch (e) { next(e); }
}

export async function removeAsset(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const wl = await getOrCreate(req.user!.id);
    wl.assets = wl.assets.filter(a => a.symbol !== symbol);
    await wl.save();
    res.json({ assets: wl.assets, topics: wl.topics });
  } catch (e) { next(e); }
}

export async function addTopic(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const parsed = topicSchema.safeParse(req.body);
  if (!parsed.success) return next(createError(parsed.error.errors[0].message, 400));
  try {
    const { topic } = parsed.data;
    const wl = await getOrCreate(req.user!.id);
    if (!wl.topics.includes(topic)) { wl.topics.push(topic); await wl.save(); }
    res.json({ assets: wl.assets, topics: wl.topics });
  } catch (e) { next(e); }
}

export async function removeTopic(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const name = req.params.name;
    const wl = await getOrCreate(req.user!.id);
    wl.topics = wl.topics.filter(t => t !== name);
    await wl.save();
    res.json({ assets: wl.assets, topics: wl.topics });
  } catch (e) { next(e); }
}
