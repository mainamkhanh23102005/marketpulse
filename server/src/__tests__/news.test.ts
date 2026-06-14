import fetch from 'node-fetch';
import { getHeadlines } from '../services/newsApi';
import { getCachedHeadlines } from '../services/newsCache';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const MOCK_ARTICLES = [
  { title: 'Tesla stock surges on strong earnings', url: 'https://example.com/1', publishedAt: '2024-01-01T00:00:00Z', source: { name: 'Reuters' } },
  { title: 'EV market faces headwinds', url: 'https://example.com/2', publishedAt: '2024-01-01T01:00:00Z', source: { name: 'Bloomberg' } },
];

describe('newsApi', () => {
  beforeEach(() => {
    process.env.NEWS_API_KEY = 'test_key';
  });

  it('returns normalized headlines', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ articles: MOCK_ARTICLES }) } as unknown as ReturnType<typeof fetch>);
    const headlines = await getHeadlines(['Tesla']);
    expect(headlines).toHaveLength(2);
    expect(headlines[0].source).toBe('Reuters');
  });
});

describe('newsCache', () => {
  it('appends sentiment to headlines', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ articles: MOCK_ARTICLES }) } as unknown as ReturnType<typeof fetch>);
    const scored = await getCachedHeadlines(['Tesla']);
    expect(scored[0]).toHaveProperty('sentiment');
    expect(['positive', 'neutral', 'negative']).toContain(scored[0].sentiment);
    expect(typeof scored[0].score).toBe('number');
  });
});
