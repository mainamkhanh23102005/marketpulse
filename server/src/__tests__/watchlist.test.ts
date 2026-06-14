import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from '../middleware/errorHandler';
import watchlistRoutes from '../routes/watchlist';
import { signAccessToken } from '../utils/auth';

jest.mock('../models/Watchlist');
import { Watchlist } from '../models/Watchlist';
const MockWatchlist = Watchlist as jest.Mocked<typeof Watchlist>;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/watchlist', watchlistRoutes);
app.use(errorHandler);

const token = signAccessToken('user123');
const authHeader = { Authorization: `Bearer ${token}` };

const mockWL = {
  userId: 'user123',
  assets: [{ symbol: 'AAPL', type: 'stock' }],
  topics: ['Tesla'],
  save: jest.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockWL.assets = [{ symbol: 'AAPL', type: 'stock' }];
  mockWL.topics = ['Tesla'];
});

describe('GET /api/watchlist', () => {
  it('returns watchlist for authenticated user', async () => {
    (MockWatchlist.findOne as jest.Mock).mockResolvedValue(mockWL);
    const res = await request(app).get('/api/watchlist').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.assets).toHaveLength(1);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/watchlist');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/watchlist/assets', () => {
  it('adds an asset idempotently', async () => {
    (MockWatchlist.findOne as jest.Mock).mockResolvedValue(mockWL);
    const res = await request(app).put('/api/watchlist/assets').set(authHeader).send({ symbol: 'MSFT', type: 'stock' });
    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid type', async () => {
    (MockWatchlist.findOne as jest.Mock).mockResolvedValue(mockWL);
    const res = await request(app).put('/api/watchlist/assets').set(authHeader).send({ symbol: 'MSFT', type: 'invalid' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/watchlist/assets/:symbol', () => {
  it('removes an asset', async () => {
    (MockWatchlist.findOne as jest.Mock).mockResolvedValue(mockWL);
    const res = await request(app).delete('/api/watchlist/assets/AAPL').set(authHeader);
    expect(res.status).toBe(200);
  });
});
