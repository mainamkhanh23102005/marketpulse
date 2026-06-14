import { useEffect, useState, FormEvent } from 'react';
import api from '../services/api';
import { Watchlist, AssetType } from '../types';
import { useToast } from '../components/Toast';

export function Settings() {
  const [watchlist, setWatchlist] = useState<Watchlist>({ assets: [], topics: [] });
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [topic, setTopic] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    api.get<Watchlist>('/watchlist').then(r => setWatchlist(r.data)).catch(() => {});
  }, []);

  async function addAsset(e: FormEvent) {
    e.preventDefault();
    if (!assetSymbol.trim()) return;
    try {
      const { data } = await api.put<Watchlist>('/watchlist/assets', { symbol: assetSymbol.trim().toUpperCase(), type: assetType });
      setWatchlist(data);
      setAssetSymbol('');
      showToast('Asset added', 'success');
    } catch { showToast('Failed to add asset'); }
  }

  async function removeAsset(symbol: string) {
    setWatchlist(prev => ({ ...prev, assets: prev.assets.filter(a => a.symbol !== symbol) }));
    try {
      const { data } = await api.delete<Watchlist>(`/watchlist/assets/${symbol}`);
      setWatchlist(data);
    } catch { showToast('Failed to remove asset'); }
  }

  async function addTopic(e: FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    try {
      const { data } = await api.put<Watchlist>('/watchlist/topics', { topic: topic.trim() });
      setWatchlist(data);
      setTopic('');
      showToast('Topic added', 'success');
    } catch { showToast('Failed to add topic'); }
  }

  async function removeTopic(name: string) {
    setWatchlist(prev => ({ ...prev, topics: prev.topics.filter(t => t !== name) }));
    try {
      const { data } = await api.delete<Watchlist>(`/watchlist/topics/${encodeURIComponent(name)}`);
      setWatchlist(data);
    } catch { showToast('Failed to remove topic'); }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-2xl font-bold text-white">Watchlist Settings</h1>

      {/* Assets */}
      <section>
        <h2 className="text-lg font-semibold text-gray-300 mb-3">Assets</h2>
        <form onSubmit={addAsset} className="flex gap-2 mb-4">
          <input value={assetSymbol} onChange={e => setAssetSymbol(e.target.value)} placeholder="Symbol e.g. AAPL"
            className="flex-1 bg-surface border border-border rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-400 uppercase" />
          <select value={assetType} onChange={e => setAssetType(e.target.value as AssetType)}
            className="bg-surface border border-border rounded px-3 py-2 text-white focus:outline-none">
            <option value="stock">Stock</option>
            <option value="crypto">Crypto</option>
          </select>
          <button type="submit" className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 rounded transition">Add</button>
        </form>
        {watchlist.assets.length === 0 ? (
          <p className="text-gray-500 text-sm">No assets yet.</p>
        ) : (
          <ul className="space-y-2">
            {watchlist.assets.map(a => (
              <li key={a.symbol} className="flex justify-between items-center bg-card border border-border rounded-lg px-4 py-2">
                <div>
                  <span className="text-white font-medium">{a.symbol}</span>
                  <span className="text-xs text-gray-500 ml-2">{a.type}</span>
                </div>
                <button onClick={() => removeAsset(a.symbol)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Topics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-300 mb-3">News Topics</h2>
        <form onSubmit={addTopic} className="flex gap-2 mb-4">
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Tesla, Fed rates"
            className="flex-1 bg-surface border border-border rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-400" />
          <button type="submit" className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 rounded transition">Add</button>
        </form>
        {watchlist.topics.length === 0 ? (
          <p className="text-gray-500 text-sm">No topics yet.</p>
        ) : (
          <ul className="space-y-2">
            {watchlist.topics.map(t => (
              <li key={t} className="flex justify-between items-center bg-card border border-border rounded-lg px-4 py-2">
                <span className="text-white">{t}</span>
                <button onClick={() => removeTopic(t)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
