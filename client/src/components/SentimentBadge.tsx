const styles = {
  positive: 'bg-green-900 text-green-300',
  neutral: 'bg-gray-700 text-gray-300',
  negative: 'bg-red-900 text-red-300',
};

interface Props { sentiment: 'positive' | 'neutral' | 'negative' }

export function SentimentBadge({ sentiment }: Props) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[sentiment]}`}>
      {sentiment}
    </span>
  );
}
