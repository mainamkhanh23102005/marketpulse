import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AssetCard } from '../components/AssetCard';
import { PriceQuote, WatchlistAsset } from '../types';

const asset: WatchlistAsset = { symbol: 'AAPL', type: 'stock' };

const quote: PriceQuote = {
  symbol: 'AAPL', type: 'stock',
  price: 185.5, change: 2.3, changePct: 1.26,
  high: 187, low: 183,
};

function renderCard(q?: PriceQuote) {
  return render(<MemoryRouter><AssetCard asset={asset} quote={q} /></MemoryRouter>);
}

describe('AssetCard', () => {
  it('renders the symbol', () => {
    renderCard(quote);
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });

  it('shows green text for positive change', () => {
    renderCard(quote);
    const change = screen.getByText('+1.26%');
    expect(change.className).toMatch(/green/);
  });

  it('shows red text for negative change', () => {
    renderCard({ ...quote, changePct: -2.5 });
    const change = screen.getByText('-2.50%');
    expect(change.className).toMatch(/red/);
  });

  it('shows loading state when no quote', () => {
    renderCard(undefined);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});
