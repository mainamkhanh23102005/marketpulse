# MarketPulse

A real-time market dashboard for retail traders and investors. Track live stock and crypto prices, read sentiment-scored news headlines, and monitor your personal watchlist — all in one dark-themed web app.

![MarketPulse Dashboard](https://placehold.co/1200x630/1a1d27/4ade80?text=MarketPulse+Dashboard)

---

## Screenshots

| Dashboard | Asset Detail | News Feed |
|-----------|-------------|-----------|
| ![Dashboard](https://placehold.co/380x220/1a1d27/9ca3af?text=Watchlist+%2B+Market+Summary) | ![Asset Detail](https://placehold.co/380x220/1a1d27/9ca3af?text=Price+Chart+%2B+Analytics) | ![News](https://placehold.co/380x220/1a1d27/9ca3af?text=Sentiment-Scored+Headlines) |

---

## Features

- **Live price feed** — polls stocks (Alpha Vantage) and crypto (CoinGecko) every 30 seconds; shows price, change %, 24h high/low
- **Market summary** — top 5 gainers and losers refreshed every 60 seconds
- **Interactive charts** — line charts with 1D / 1W / 1M / 3M time range selector built with Recharts
- **7-day Simple Moving Average** — SMA overlay drawn in orange directly on the price chart
- **Linear regression trendline** — best-fit trendline across the full chart window in dashed indigo
- **Price prediction** — tomorrow's predicted price extrapolated from the regression slope, shown as a badge above the chart
- **Sentiment-scored news** — headlines fetched from NewsAPI and scored server-side with VADER; each card shows a Positive / Neutral / Negative badge
- **Personal watchlist** — add and remove stocks or crypto assets and news topics; persisted per user in MongoDB
- **JWT authentication** — access token (15 min) + HTTP-only refresh token cookie (7 days) with server-side rotation
- **Rate limiting & security** — `express-rate-limit`, `helmet`, bcrypt password hashing, and Zod request validation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite |
| Styling | Tailwind CSS (dark mode) |
| Charts | Recharts 2 |
| Routing | React Router v6 |
| HTTP client | Axios |
| Backend | Node.js 20 + Express + TypeScript |
| Database | MongoDB + Mongoose (Atlas free tier) |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Sentiment | `vader-sentiment` (npm — no external API) |
| Stock data | Alpha Vantage REST API |
| Crypto data | CoinGecko REST API (no key required) |
| News | NewsAPI |
| Security | `helmet`, `express-rate-limit`, `bcryptjs`, `zod` |
| Testing | Jest + Supertest (server), Vitest + React Testing Library (client) |

---

## Project Structure

```
marketpulse/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── components/         # PriceChart, AssetCard, SentimentBadge, Navbar
│       ├── pages/              # Dashboard, AssetDetail, Login, Register, Settings
│       ├── context/            # AuthContext (useReducer)
│       ├── hooks/              # usePriceFeed, useHeadlines
│       ├── services/           # Axios instance + typed API helpers
│       └── types/              # Shared TypeScript interfaces
├── server/                     # Express API
│   └── src/
│       ├── routes/             # auth, prices, news, watchlist, market
│       ├── controllers/        # Thin handlers delegating to services
│       ├── models/             # Mongoose: User, Watchlist
│       ├── middleware/         # JWT verification, global error handler
│       └── services/           # alphaVantage, coinGecko, newsApi, sentiment
├── .env.example                # Required environment variables (documented below)
└── package.json                # Root scripts: dev, build, lint, test
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A free [Alpha Vantage](https://www.alphavantage.co/support/#api-key) API key
- A free [NewsAPI](https://newsapi.org/register) key

CoinGecko requires no API key for the free tier.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/marketpulse.git
cd marketpulse

# 2. Install all dependencies (root + client + server)
npm install
npm install --prefix client
npm install --prefix server

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)

# 4. Start the development servers (client + server concurrently)
npm run dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:5000`.

### Build for Production

```bash
npm run build
# Server output: server/dist/
# Client output: client/dist/
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. Never commit `.env`.

```bash
# ── Server ──────────────────────────────────────────────
PORT=5000

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/marketpulse

# JWT secrets — use long random strings (e.g. openssl rand -hex 64)
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh

# https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# https://newsapi.org/register
NEWS_API_KEY=your_newsapi_key

# Frontend origin for CORS (change in production)
CLIENT_ORIGIN=http://localhost:5173

# ── Client ──────────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Security note:** `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` should be cryptographically random strings of at least 64 characters. Generate them with `openssl rand -hex 64`.

---

## API Endpoints

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <accessToken>`.

### Auth

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | `{ email, password }` | Create a new account |
| `POST` | `/auth/login` | `{ email, password }` | Returns `{ accessToken }`; sets refresh token cookie |
| `POST` | `/auth/logout` | — | Invalidates refresh token server-side |
| `POST` | `/auth/refresh` | — (reads cookie) | Returns a new `{ accessToken }` |

### Prices

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| `GET` | `/prices/:symbol` | `?type=stock\|crypto` | Current quote: price, change, change %, high, low |
| `GET` | `/prices/history/:symbol` | `?type=stock\|crypto&range=1D\|1W\|1M\|3M` | OHLC history array |

### News

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| `GET` | `/news` | `?topics=Tesla,Bitcoin` | Headlines with VADER sentiment scores |

### Market Summary

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/market/summary` | Top 5 gainers and losers |

### Watchlist *(protected)*

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET` | `/watchlist` | — | Fetch saved assets and topics |
| `PUT` | `/watchlist/assets` | `{ symbol, type }` | Add an asset |
| `DELETE` | `/watchlist/assets/:symbol` | — | Remove an asset |
| `PUT` | `/watchlist/topics` | `{ topic }` | Add a news topic |
| `DELETE` | `/watchlist/topics/:name` | — | Remove a news topic |

---

## Analytics — How the Chart Overlays Work

All three overlays are computed client-side from the existing price history; no extra API calls are made.

**7-day SMA** — for each candle at index `i`, the average of `close` prices from `i−6` to `i`. Only drawn once 7 data points are available, so the line starts after the 7th candle.

**Linear regression trendline** — ordinary least-squares fit over all candle indices. For `n` points with closes `y₀…yₙ₋₁`:

```
slope     = (n·Σ(i·yᵢ) − Σi·Σyᵢ) / (n·Σi² − (Σi)²)
intercept = (Σyᵢ − slope·Σi) / n
```

**Tomorrow's prediction** — extends the regression line one step past the last candle: `slope × n + intercept`. Displayed as a badge above the chart.

---

## Running Tests

```bash
# All tests (server + client)
npm test

# Server only (Jest + Supertest)
npm test --prefix server

# Client only (Vitest + React Testing Library)
npm test --prefix client
```

Coverage targets: 80% line coverage on the server, 70% on the client.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes following the existing code style
4. Open a pull request against `main`

Pre-commit hooks (Husky) enforce ESLint and Prettier. Run `npm run lint` before pushing.

---

## License

[MIT](LICENSE) © 2024 MarketPulse Contributors
