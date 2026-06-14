import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  default: { get: vi.fn() },
}));

import api from '../services/api';
import { usePriceFeed } from '../hooks/usePriceFeed';
import { WatchlistAsset } from '../types';

const mockGet = api.get as ReturnType<typeof vi.fn>;

const ASSETS: WatchlistAsset[] = [
  { symbol: 'AAPL', type: 'stock' },
  { symbol: 'bitcoin', type: 'crypto' },
];

describe('usePriceFeed', () => {
  it('fetches quotes for all assets', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { symbol: 'AAPL', type: 'stock', price: 185, change: 1, changePct: 0.5, high: 187, low: 183 } })
      .mockResolvedValueOnce({ data: { symbol: 'bitcoin', type: 'crypto', price: 45000, change: -500, changePct: -1.1, high: 46000, low: 44000 } });

    const { result } = renderHook(() => usePriceFeed(ASSETS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.quotes['AAPL'].price).toBe(185);
    expect(result.current.quotes['bitcoin'].price).toBe(45000);
  });

  it('returns empty quotes for empty asset list', async () => {
    const { result } = renderHook(() => usePriceFeed([]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(Object.keys(result.current.quotes)).toHaveLength(0);
  });
});
