import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useHeadlines } from '../hooks/useHeadlines';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../services/api';
const mockGet = api.get as ReturnType<typeof vi.fn>;

const MOCK_HEADLINES = [
  { title: 'Tesla surges', url: 'https://x.com', publishedAt: '2024-01-01', source: 'Reuters', sentiment: 'positive', score: 0.6 },
];

describe('useHeadlines', () => {
  it('fetches headlines for topics', async () => {
    mockGet.mockResolvedValueOnce({ data: MOCK_HEADLINES });
    const { result } = renderHook(() => useHeadlines(['Tesla']));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.headlines).toHaveLength(1);
    expect(result.current.headlines[0].sentiment).toBe('positive');
  });

  it('returns empty array for empty topics', async () => {
    const { result } = renderHook(() => useHeadlines([]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.headlines).toHaveLength(0);
  });
});
