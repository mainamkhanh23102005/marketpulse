import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HistoryPoint } from '../types';

interface Props { data: HistoryPoint[] }

function linearRegression(closes: number[]) {
  const n = closes.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i; sumY += closes[i];
    sumXY += i * closes[i]; sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function PriceChart({ data }: Props) {
  const { chartData, predictedPrice } = useMemo(() => {
    if (data.length === 0) return { chartData: [], predictedPrice: null };

    const closes = data.map(d => d.close);
    const { slope, intercept } = linearRegression(closes);
    const n = closes.length;

    const chartData = data.map((d, i) => {
      const smaSlice = closes.slice(Math.max(0, i - 6), i + 1);
      const sma = smaSlice.length === 7 ? parseFloat((smaSlice.reduce((a, b) => a + b, 0) / 7).toFixed(2)) : undefined;
      const trend = parseFloat((slope * i + intercept).toFixed(2));
      return { ...d, sma, trend };
    });

    const predictedPrice = parseFloat((slope * n + intercept).toFixed(2));
    return { chartData, predictedPrice };
  }, [data]);

  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-500">No data</div>;

  return (
    <div>
      <div className="flex justify-end mb-2 pr-2">
        <span className="text-xs bg-indigo-950/60 text-indigo-300 border border-indigo-700/60 rounded-full px-3 py-1 font-medium">
          Predicted tomorrow: ${predictedPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
          <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} />
          <YAxis domain={['auto', 'auto']} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false}
            tickFormatter={(v: number) => `$${v.toLocaleString()}`} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3e', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(v: number, name: string) => {
              const labels: Record<string, string> = { close: 'Close', sma: '7-day SMA', trend: 'Trend' };
              return [`$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, labels[name] ?? name];
            }}
          />
          <Line type="monotone" dataKey="close" stroke="#4ade80" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="sma" stroke="#f97316" dot={false} strokeWidth={1.5} connectNulls={false} />
          <Line type="monotone" dataKey="trend" stroke="#818cf8" dot={false} strokeWidth={1.5} strokeDasharray="6 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
