import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { PriceQuote, HistoryPoint, Headline, TimeRange } from '../types';
import { PriceChart } from '../components/PriceChart';
import { SentimentBadge } from '../components/SentimentBadge';

const RANGES: TimeRange[] = ['1D', '1W', '1M', '3M'];

export function AssetDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') ?? 'stock';
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [range, setRange] = useState<TimeRange>('1M');
  const [headlines, setHeadlines] = useState<Headline[]>([]);

  useEffect(() => {
    if (!symbol) return;
    api.get<PriceQuote>(`/prices/${symbol}?type=${type}`).then(r => setQuote(r.data)).catch(() => {});
    api.get<Headline[]>(`/news?topics=${symbol}`).then(r => setHeadlines(r.data)).catch(() => {});
  }, [symbol, type]);

  useEffect(() => {
    if (!symbol) return;
    api.get<HistoryPoint[]>(`/prices/history/${symbol}?type=${type}&range=${range}`).then(r => setHistory(r.data)).catch(() => {});
  }, [symbol, type, range]);

  if (!symbol) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Link to="/dashboard" className="text-green-400 text-sm hover:underline">← Dashboard</Link>

      {quote ? (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">{symbol}</h1>
              <p className="text-xs text-gray-500 uppercase mt-1">{type}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold text-white">${quote.price.toLocaleString()}</p>
              <p className={`text-sm mt-1 ${quote.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {quote.changePct >= 0 ? '+' : ''}{quote.changePct.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <span>24h High: ${quote.high.toLocaleString()}</span>
            <span>24h Low: ${quote.low.toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 h-32 flex items-center justify-center text-gray-500">Loading…</div>
      )}

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex gap-2 mb-4">
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs rounded font-medium transition ${range === r ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>
        <PriceChart data={history} />
      </div>

      {/* Related news */}
      {headlines.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-300 mb-3">Related News</h2>
          <div className="space-y-3">
            {headlines.slice(0, 8).map((h, i) => (
              <a key={i} href={h.url} target="_blank" rel="noopener noreferrer"
                className="block bg-card border border-border rounded-xl px-4 py-3 hover:border-green-400 transition">
                <div className="flex items-start gap-3">
                  <SentimentBadge sentiment={h.sentiment} />
                  <div>
                    <p className="text-white text-sm leading-snug">{h.title}</p>
                    <p className="text-gray-500 text-xs mt-1">{h.source} · {new Date(h.publishedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
