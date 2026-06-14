import mongoose, { Document, Schema } from 'mongoose';
import { AssetType } from '../types/prices';

export interface WatchlistAsset {
  symbol: string;
  type: AssetType;
}

export interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId;
  assets: WatchlistAsset[];
  topics: string[];
}

const WatchlistSchema = new Schema<IWatchlist>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  assets: {
    type: [{ symbol: { type: String, required: true }, type: { type: String, enum: ['stock', 'crypto'], required: true } }],
    default: [],
  },
  topics: { type: [String], default: [] },
});

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);
