import { getStockQuote } from '../services/alphaVantage';
import { getCryptoQuote } from '../services/coinGecko';
import fetch from 'node-fetch';

jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('alphaVantage', () => {
  it('normalizes stock quote', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        'Global Quote': {
          '01. symbol': 'AAPL',
          '05. price': '185.50',
          '09. change': '2.30',
          '10. change percent': '1.26%',
          '03. high': '187.00',
          '04. low': '183.00',
        },
      }),
    } as unknown as ReturnType<typeof fetch>);

    const quote = await getStockQuote('AAPL');
    expect(quote.symbol).toBe('AAPL');
    expect(quote.type).toBe('stock');
    expect(quote.price).toBe(185.5);
    expect(quote.changePct).toBeCloseTo(1.26);
  });

  it('throws when no data returned', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({}) } as unknown as ReturnType<typeof fetch>);
    await expect(getStockQuote('BAD')).rejects.toThrow();
  });
});

describe('coinGecko', () => {
  it('normalizes crypto quote', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        market_data: {
          current_price: { usd: 45000 },
          price_change_24h: { usd: -500 },
          price_change_percentage_24h: -1.1,
          high_24h: { usd: 46000 },
          low_24h: { usd: 44000 },
        },
      }),
    } as unknown as ReturnType<typeof fetch>);

    const quote = await getCryptoQuote('bitcoin');
    expect(quote.symbol).toBe('bitcoin');
    expect(quote.type).toBe('crypto');
    expect(quote.price).toBe(45000);
  });
});
