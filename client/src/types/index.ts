export type AssetType = 'stock' | 'crypto';

export interface PriceQuote {
  symbol: string;
  type: AssetType;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
}

export interface HistoryPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type TimeRange = '1D' | '1W' | '1M' | '3M';

export interface Headline {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}

export interface WatchlistAsset {
  symbol: string;
  type: AssetType;
}

export interface Watchlist {
  assets: WatchlistAsset[];
  topics: string[];
}
