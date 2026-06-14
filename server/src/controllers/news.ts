import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getCachedHeadlines } from '../services/newsCache';

export async function getNews(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const topicsParam = req.query.topics as string | undefined;
    const topics = topicsParam ? topicsParam.split(',').map(t => t.trim()).filter(Boolean) : [];
    if (topics.length === 0) { res.json([]); return; }
    const headlines = await getCachedHeadlines(topics);
    res.json(headlines);
  } catch (e) { next(e); }
}
