import { score } from '../services/sentiment';

describe('sentiment', () => {
  it('labels positive text', () => {
    const result = score('Excellent gains! Stock rockets upward with fantastic earnings beat');
    expect(result.label).toBe('positive');
    expect(result.score).toBeGreaterThan(0.05);
  });

  it('labels negative text', () => {
    const result = score('Terrible crash! Stock plummets on horrible losses and bad outlook');
    expect(result.label).toBe('negative');
    expect(result.score).toBeLessThan(-0.05);
  });

  it('labels neutral text', () => {
    const result = score('The company filed its 10-K annual report with the SEC');
    expect(result.label).toBe('neutral');
    expect(result.score).toBeGreaterThanOrEqual(-0.05);
    expect(result.score).toBeLessThanOrEqual(0.05);
  });
});
