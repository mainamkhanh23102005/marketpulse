import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { PriceQuote, WatchlistAsset } from '../types';

const POLL_INTERVAL = 30_000;

export function usePriceFeed(assets: WatchlistAsset[]) {
  const [quotes, setQuotes] = useState<Record<string, PriceQuote>>({});
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchAll() {
    if (assets.length === 0) { setLoading(false); return; }
    const results = await Promise.allSettled(
      assets.map(a => api.get<PriceQuote>(`/prices/${a.symbol}?type=${a.type}`))
    );
    setQuotes(prev => {
      const next = { ...prev };
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') next[assets[i].symbol] = r.value.data;
      });
      return next;
    });
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    timerRef.current = setInterval(fetchAll, POLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [JSON.stringify(assets)]);

  return { quotes, loading };
}
