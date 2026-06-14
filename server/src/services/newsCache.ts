import { getHeadlines, RawHeadline } from './newsApi';
import { score } from './sentiment';

export interface ScoredHeadline extends RawHeadline {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}

const cache = new Map<string, { data: ScoredHeadline[]; expiresAt: number }>();
const TTL = 5 * 60 * 1000;

export async function getCachedHeadlines(topics: string[]): Promise<ScoredHeadline[]> {
  const cacheKey = [...topics].sort().join(',');
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return hit.data;

  const raw = await getHeadlines(topics);
  const data = raw.map(h => {
    const { label, score: s } = score(h.title);
    return { ...h, sentiment: label, score: s };
  });
  cache.set(cacheKey, { data, expiresAt: Date.now() + TTL });
  return data;
}
