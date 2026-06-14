import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PriceQuote, WatchlistAsset } from '../types';

interface Props {
  asset: WatchlistAsset;
  quote: PriceQuote | undefined;
}

export function AssetCard({ asset, quote }: Props) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPrice = useRef<number | undefined>();

  useEffect(() => {
    if (!quote) return;
    if (prevPrice.current !== undefined && prevPrice.current !== quote.price) {
      setFlash(quote.price > prevPrice.current ? 'up' : 'down');
      const t = setTimeout(() => setFlash(null), 600);
      prevPrice.current = quote.price;
      return () => clearTimeout(t);
    }
    prevPrice.current = quote.price;
  }, [quote?.price]);

  const up = (quote?.changePct ?? 0) >= 0;

  return (
    <Link
      to={`/asset/${asset.symbol}?type=${asset.type}`}
      className={`block bg-card border rounded-xl p-4 hover:border-green-400 transition ${
        flash === 'up' ? 'border-green-400' : flash === 'down' ? 'border-red-400' : 'border-border'
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="font-bold text-white text-lg">{asset.symbol}</span>
        <span className="text-xs text-gray-500 uppercase">{asset.type}</span>
      </div>
      {quote ? (
        <>
          <p className="text-2xl font-semibold text-white mt-1">${quote.price.toLocaleString()}</p>
          <p className={`text-sm mt-1 ${up ? 'text-green-400' : 'text-red-400'}`}>
            {up ? '+' : ''}{quote.changePct.toFixed(2)}%
          </p>
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            <span>H: ${quote.high.toLocaleString()}</span>
            <span>L: ${quote.low.toLocaleString()}</span>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm mt-2">Loading…</p>
      )}
    </Link>
  );
}
