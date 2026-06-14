import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Headline } from '../types';

const POLL_INTERVAL = 5 * 60_000;

export function useHeadlines(topics: string[]) {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchHeadlines() {
    if (topics.length === 0) { setLoading(false); return; }
    try {
      const { data } = await api.get<Headline[]>(`/news?topics=${topics.join(',')}`);
      setHeadlines(data);
    } catch {
      // silently keep previous headlines on transient error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHeadlines();
    timerRef.current = setInterval(fetchHeadlines, POLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [JSON.stringify(topics)]);

  return { headlines, loading };
}
