declare module 'vader-sentiment' {
  const vader: {
    SentimentIntensityAnalyzer: {
      polarity_scores(text: string): { pos: number; neg: number; neu: number; compound: number };
    };
  };
  export default vader;
}
