import React from 'react';
import { render, screen } from '@testing-library/react';
import { SentimentBadge } from '../components/SentimentBadge';

describe('SentimentBadge', () => {
  it('renders positive badge with green class', () => {
    render(<SentimentBadge sentiment="positive" />);
    const badge = screen.getByText('positive');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/green/);
  });

  it('renders negative badge with red class', () => {
    render(<SentimentBadge sentiment="negative" />);
    const badge = screen.getByText('negative');
    expect(badge.className).toMatch(/red/);
  });

  it('renders neutral badge with gray class', () => {
    render(<SentimentBadge sentiment="neutral" />);
    const badge = screen.getByText('neutral');
    expect(badge.className).toMatch(/gray/);
  });
});
