import vader from 'vader-sentiment';

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface SentimentResult {
  label: SentimentLabel;
  score: number;
}

export function score(text: string): SentimentResult {
  const { compound } = vader.SentimentIntensityAnalyzer.polarity_scores(text) as { compound: number };
  const label: SentimentLabel =
    compound >= 0.05 ? 'positive' : compound <= -0.05 ? 'negative' : 'neutral';
  return { label, score: compound };
}
