import fetch from 'node-fetch';

export interface RawHeadline {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
}

export async function getHeadlines(topics: string[]): Promise<RawHeadline[]> {
  const key = process.env.NEWS_API_KEY;
  if (!key) throw new Error('NEWS_API_KEY not set');
  const q = encodeURIComponent(topics.join(' OR '));
  const url = `https://newsapi.org/v2/everything?q=${q}&sortBy=publishedAt&pageSize=20&apiKey=${key}`;
  const res = await fetch(url);
  const data = await res.json() as { articles?: Array<{ title: string; url: string; publishedAt: string; source: { name: string } }> };
  return (data.articles ?? []).map(a => ({
    title: a.title,
    url: a.url,
    publishedAt: a.publishedAt,
    source: a.source.name,
  }));
}
