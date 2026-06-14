# MarketPulse — Product Specification

## 1. Objective

A real-time market data dashboard for individual traders and investors. Users can track live asset prices, read sentiment-tagged news headlines, and save favorite topics/assets to a personal watchlist. The first version ships as a web application.

**Target users:** Individual retail traders and investors who want a single place to monitor market sentiment and price movement without navigating multiple sites.

---

## 2. Core Features

### 2.1 Authentication
- Register and log in with email + password.
- JWTs issued on login: short-lived access token (15 min) + long-lived refresh token (7 days) stored in an HTTP-only cookie.
- Protected routes on both client and server require a valid access token.
- Logout invalidates the refresh token server-side.

### 2.2 Live Price Feed
- Poll prices every 30 seconds for assets on the user's watchlist.
- Support stocks (via Alpha Vantage free tier) and crypto (via CoinGecko free API — no key required).
- Display: asset symbol, current price, change %, and 24h high/low.
- Global market summary panel (top gainers/losers — top 5 each, refreshed every 60 s).

### 2.3 News Headlines with Sentiment Analysis
- Fetch latest headlines from NewsAPI filtered by the user's saved topics.
- Run each headline through VADER sentiment scoring server-side (`vader-sentiment` npm package — no external API key needed).
- Display sentiment badge: Positive (green), Neutral (grey), Negative (red).
- Headlines are refreshed every 5 minutes.

### 2.4 Charts & Analytics
- Candlestick or line chart for individual assets using `Recharts`.
- Time range selector: 1D / 1W / 1M / 3M.
- Price data fetched on demand when a user views an asset detail page.

### 2.5 Saved Favorites (Watchlist)
- Users can add/remove assets (stocks or crypto) and news topics (e.g. "Tesla", "Bitcoin", "Fed rates").
- Watchlist and topics persisted in MongoDB per user.
- Watchlist is the default landing page after login.

---

## 3. Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | React 18 + TypeScript | Vite for bundling |
| Styling | Tailwind CSS | Utility-first, dark mode via `class` strategy |
| Charts | Recharts | Composable, works well with React |
| State | React Context + `useReducer` | No Redux — scope doesn't warrant it |
| Backend | Node.js 20 + Express | TypeScript, compiled with `tsc` |
| Database | MongoDB + Mongoose | Hosted on MongoDB Atlas free tier |
| Auth | JWT (jsonwebtoken) | Refresh token stored in HTTP-only cookie |
| Sentiment | vader-sentiment (npm) | VADER is tuned for short financial/social text |
| Price data | Alpha Vantage (stocks) + CoinGecko (crypto) | Both have free tiers; no paid plan needed for v1 |
| News | NewsAPI | Free tier: 100 req/day, sufficient for development |
| Dev tooling | ESLint + Prettier + Husky | Pre-commit lint enforcement |

---

## 4. Project Structure

```
marketpulse/
├── client/                       # React frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── AssetCard.tsx
│   │   │   ├── SentimentBadge.tsx
│   │   │   ├── PriceChart.tsx
│   │   │   └── Navbar.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx     # Watchlist + market summary
│   │   │   ├── AssetDetail.tsx   # Chart + news for a single asset
│   │   │   └── Settings.tsx      # Manage watchlist / topics
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── usePriceFeed.ts
│   │   │   └── useHeadlines.ts
│   │   ├── services/
│   │   │   └── api.ts            # Axios instance + typed API calls
│   │   └── types/
│   │       └── index.ts
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                       # Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts           # POST /auth/register, /auth/login, /auth/logout, /auth/refresh
│   │   │   ├── prices.ts         # GET /prices/:symbol
│   │   │   ├── news.ts           # GET /news?topics=...
│   │   │   └── watchlist.ts      # GET/POST/DELETE /watchlist
│   │   ├── controllers/          # Route handlers (thin, delegate to services)
│   │   ├── models/
│   │   │   ├── User.ts           # email, passwordHash, refreshTokens[]
│   │   │   └── Watchlist.ts      # userId, assets[], topics[]
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT verification middleware
│   │   │   └── errorHandler.ts
│   │   ├── services/
│   │   │   ├── alphaVantage.ts   # Stock price fetching
│   │   │   ├── coinGecko.ts      # Crypto price fetching
│   │   │   ├── newsApi.ts        # Headline fetching
│   │   │   └── sentiment.ts      # VADER scoring wrapper
│   │   └── index.ts              # Express app entry point
│   ├── tsconfig.json
│   └── package.json
├── .env.example                  # Document required env vars
├── .gitignore
└── package.json                  # Root scripts: dev, build, lint, test
```

---

## 5. API Endpoints

```
POST   /api/auth/register          Body: { email, password }
POST   /api/auth/login             Body: { email, password } → { accessToken }
POST   /api/auth/logout            Clears refresh token cookie
POST   /api/auth/refresh           Reads cookie → { accessToken }

GET    /api/prices/:symbol         ?type=stock|crypto → { price, change, ... }
GET    /api/prices/history/:symbol ?range=1D|1W|1M|3M → [{ time, open, high, low, close }]
GET    /api/news                   ?topics=Tesla,Bitcoin → [{ title, url, sentiment, score }]
GET    /api/market/summary         → { gainers[], losers[] }

GET    /api/watchlist              → { assets[], topics[] }
PUT    /api/watchlist/assets       Body: { symbol, type } → updated watchlist
DELETE /api/watchlist/assets/:sym  → updated watchlist
PUT    /api/watchlist/topics       Body: { topic } → updated watchlist
DELETE /api/watchlist/topics/:name → updated watchlist
```

All protected routes require `Authorization: Bearer <accessToken>`.

---

## 6. Data Models

### User
```typescript
{
  _id: ObjectId,
  email: string,           // unique, lowercase, trimmed
  passwordHash: string,    // bcrypt, cost factor 12
  refreshTokens: string[], // store hashed refresh tokens
  createdAt: Date
}
```

### Watchlist
```typescript
{
  _id: ObjectId,
  userId: ObjectId,        // ref: User
  assets: Array<{
    symbol: string,        // e.g. "AAPL", "bitcoin"
    type: "stock" | "crypto"
  }>,
  topics: string[]         // e.g. ["Tesla", "Fed rates"]
}
```

---

## 7. Code Style

- **TypeScript strict mode** on both client and server (`"strict": true` in tsconfig).
- **No `any`** — use `unknown` with type guards at system boundaries.
- **Functional React components only**; no class components.
- **Custom hooks** for all data-fetching logic; components own only rendering.
- **Error handling**: Express global error handler catches all thrown errors; client displays toast notifications for API errors.
- **Environment variables**: all secrets via `.env` (never committed); documented in `.env.example`.
- **No comments** explaining what the code does — only add a comment when a non-obvious constraint or workaround is present.
- ESLint (`eslint-config-airbnb-typescript`) + Prettier enforced via Husky pre-commit hook.

---

## 8. Testing Strategy

### Backend
- **Jest + Supertest** for integration tests on API routes.
- Auth flows (register, login, token refresh, logout) — full happy path + failure cases.
- Sentiment scoring unit tests: confirm positive/neutral/negative classification for known inputs.
- External API calls mocked with `jest.mock` to avoid rate limits in CI.

### Frontend
- **Vitest + React Testing Library** for component and hook tests.
- `AuthContext` tested: login sets token, logout clears it, protected routes redirect.
- `usePriceFeed` and `useHeadlines` hooks tested with mocked API responses.
- Snapshot tests are prohibited (too brittle) — test behavior, not markup.

### Coverage target
- 80% line coverage on the server (enforced in CI).
- 70% on the client.

---

## 9. Environment Variables

```bash
# server/.env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ALPHA_VANTAGE_API_KEY=...
NEWS_API_KEY=...
CLIENT_ORIGIN=http://localhost:5173

# client/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 10. Boundaries

### Always do
- Hash passwords with bcrypt (cost 12) before storing.
- Validate and sanitize all incoming request bodies (use `zod` for schema validation on the server).
- Rate-limit the auth endpoints (100 req / 15 min per IP via `express-rate-limit`).
- Refresh tokens: store only the hash in the DB; rotate on every use.

### Ask first about
- Adding a paid API tier (Alpha Vantage premium, NewsAPI paid plan).
- Adding WebSocket-based real-time updates instead of polling.
- Deploying to a cloud provider (Vercel, Railway, Render, etc.).
- Adding a second authentication method (OAuth / social login).

### Never do
- Store plaintext passwords or access tokens in the database.
- Expose API keys to the client bundle.
- Commit `.env` files.
- Use `eval`, `innerHTML`, or unescaped user input in the DOM.
- Skip CORS configuration — restrict `Access-Control-Allow-Origin` to `CLIENT_ORIGIN`.
