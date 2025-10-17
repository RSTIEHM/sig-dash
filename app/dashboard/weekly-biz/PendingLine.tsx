"use client";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip
} from "recharts";

const fmtMoney = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n/1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n/1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
};

export default function PendingLine({
  title,
  data,
}: {
  title: string;
  data: Array<{ x: number; label: string; value: number }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm text-slate-700">{title}</div>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              interval={0}
              tick={{ fontSize: 11 }}
              height={50}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <RTooltip formatter={(v: any) => fmtMoney(Number(v))} />
            <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
