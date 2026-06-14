import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Watchlist, PriceQuote } from '../types';
import { usePriceFeed } from '../hooks/usePriceFeed';
import { useHeadlines } from '../hooks/useHeadlines';
import { AssetCard } from '../components/AssetCard';
import { SentimentBadge } from '../components/SentimentBadge';

interface MarketSummary { gainers: PriceQuote[]; losers: PriceQuote[] }

export function Dashboard() {
  const [watchlist, setWatchlist] = useState<Watchlist>({ assets: [], topics: [] });
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const { quotes, loading: priceLoading } = usePriceFeed(watchlist.assets);
  const { headlines } = useHeadlines(watchlist.topics);

  useEffect(() => {
    api.get<Watchlist>('/watchlist').then(r => setWatchlist(r.data)).catch(() => {});
    api.get<MarketSummary>('/prices/summary').then(r => setSummary(r.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

      {/* Market Summary */}
      {summary && (
        <section>
          <h2 className="text-lg font-semibold text-gray-300 mb-3">Market Summary</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-green-400 uppercase mb-2 font-medium">Top Gainers</p>
              <div className="space-y-2">
                {summary.gainers.map(q => (
                  <div key={q.symbol} className="flex justify-between text-sm bg-card border border-border rounded-lg px-3 py-2">
                    <span className="text-white font-medium">{q.symbol}</span>
                    <span className="text-green-400">+{q.changePct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-red-400 uppercase mb-2 font-medium">Top Losers</p>
              <div className="space-y-2">
                {summary.losers.map(q => (
                  <div key={q.symbol} className="flex justify-between text-sm bg-card border border-border rounded-lg px-3 py-2">
                    <span className="text-white font-medium">{q.symbol}</span>
                    <span className="text-red-400">{q.changePct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Watchlist */}
      <section>
        <h2 className="text-lg font-semibold text-gray-300 mb-3">My Watchlist</h2>
        {watchlist.assets.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No assets yet. <Link to="/settings" className="text-green-400 hover:underline">Add some →</Link>
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {watchlist.assets.map(a => (
              <AssetCard key={a.symbol} asset={a} quote={priceLoading ? undefined : quotes[a.symbol]} />
            ))}
          </div>
        )}
      </section>

      {/* News */}
      <section>
        <h2 className="text-lg font-semibold text-gray-300 mb-3">Latest News</h2>
        {watchlist.topics.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No topics saved. <Link to="/settings" className="text-green-400 hover:underline">Add topics →</Link>
          </p>
        ) : headlines.length === 0 ? (
          <p className="text-gray-500 text-sm">Loading headlines…</p>
        ) : (
          <div className="space-y-3">
            {headlines.map((h, i) => (
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
        )}
      </section>
    </div>
  );
}
