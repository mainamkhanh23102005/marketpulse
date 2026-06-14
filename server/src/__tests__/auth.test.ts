import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorHandler } from '../middleware/errorHandler';
import authRoutes from '../routes/auth';

jest.mock('../models/User');
jest.mock('../models/Watchlist');

import { User } from '../models/User';
import { Watchlist } from '../models/Watchlist';

const MockUser = User as jest.Mocked<typeof User>;
const MockWatchlist = Watchlist as jest.Mocked<typeof Watchlist>;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use('/api/auth', authRoutes);
app.use(errorHandler);

const VALID_USER = {
  _id: 'user_id_123',
  id: 'user_id_123',
  email: 'test@example.com',
  passwordHash: '',
  refreshTokens: [] as string[],
  save: jest.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  jest.clearAllMocks();
  VALID_USER.refreshTokens = [];
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns accessToken', async () => {
    (MockUser.findOne as jest.Mock).mockResolvedValue(null);
    (MockUser.create as jest.Mock).mockResolvedValue(VALID_USER);
    (MockWatchlist.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 409 for duplicate email', async () => {
    (MockUser.findOne as jest.Mock).mockResolvedValue(VALID_USER);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(409);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 401 for unknown email', async () => {
    (MockUser.findOne as jest.Mock).mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for wrong password', async () => {
    const userWithHash = { ...VALID_USER, passwordHash: '$2a$12$invalid_hash' };
    (MockUser.findOne as jest.Mock).mockResolvedValue(userWithHash);
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out');
  });
});
