"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  date: string;
  value: string;
}

interface Props {
  title: string;
  data: DataPoint[];
  unit?: string;
  color?: string;
  secondaryData?: DataPoint[];
  secondaryLabel?: string;
  secondaryColor?: string;
  primaryLabel?: string;
}

function fmt(date: string) {
  return date.slice(0, 7);
}

export default function MacroChart({
  title,
  data,
  unit = "",
  color = "#6366f1",
  secondaryData,
  secondaryLabel,
  secondaryColor = "#f59e0b",
  primaryLabel,
}: Props) {
  const merged = data.map((d) => {
    const match = secondaryData?.find((s) => s.date.slice(0, 7) === d.date.slice(0, 7));
    return {
      date: fmt(d.date),
      primary: parseFloat(d.value),
      ...(match ? { secondary: parseFloat(match.value) } : {}),
    };
  });

  return (
    <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={merged} margin={{ top: 2, right: 8, bottom: 2, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}${unit}`}
            width={40}
          />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            labelStyle={{ color: "#a1a1aa" }}
            itemStyle={{ color: "#e4e4e7" }}
            formatter={(v) => [`${v}${unit}`, ""]}
          />
          {(primaryLabel || secondaryData) && <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />}
          <Line
            type="monotone"
            dataKey="primary"
            stroke={color}
            dot={false}
            strokeWidth={2}
            name={primaryLabel ?? title}
          />
          {secondaryData && (
            <Line
              type="monotone"
              dataKey="secondary"
              stroke={secondaryColor}
              dot={false}
              strokeWidth={2}
              strokeDasharray="4 2"
              name={secondaryLabel}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
