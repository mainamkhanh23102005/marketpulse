import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './db';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import watchlistRoutes from './routes/watchlist';
import pricesRoutes from './routes/prices';
import newsRoutes from './routes/news';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/news', newsRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

export default app;
