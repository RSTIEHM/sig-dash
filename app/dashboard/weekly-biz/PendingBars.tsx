"use client";

import React, { useId, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  LabelList,
} from "recharts";
import { axisLabelStyle, formatShortNumber } from "@/app/lib/chart-helpers";

type Row = { carrier: string; value: number };

type Props = {
  title: string;
  data: Row[];
  /** kept for API compatibility, but the bar color is now unified (emerald gradient) */
  color?: string;
  /** Add a $ before labels (defaults true for “pending” money) */
  currency?: boolean;
};

/** Nice upper bound (1/2/5 * 10^k) a bit above the real max */
function niceMax(n: number) {
  if (!Number.isFinite(n) || n <= 0) return 1;
  const exp = Math.floor(Math.log10(n));
  const base = Math.pow(10, exp);
  const scaled = n / base;
  let niceScaled: number;
  if (scaled <= 1) niceScaled = 1;
  else if (scaled <= 2) niceScaled = 2;
  else if (scaled <= 5) niceScaled = 5;
  else niceScaled = 10;
  return niceScaled * base;
}

// right-end label (truncated) placed just outside bar end
const rightLabel =
  (opts: { currency: boolean }) =>
  (props: any) => {
    const { x, y, width, height, value } = props;
    if (value == null) return null;

    const txt = `${opts.currency ? "$" : ""}${formatShortNumber(Number(value))}`;
    const tx = (x ?? 0) + (width ?? 0) + 12; // a touch more room
    const ty = (y ?? 0) + (height ?? 0) / 2 + 4;

    return (
      <text
        x={tx}
        y={ty}
        textAnchor="start"
        fontSize={12}
        fontWeight={700}
        fill="#1f2937" // slate-800 / dark gray
      >
        {txt}
      </text>
    );
  };

export default function PendingBars({
  title,
  data,
  // color is ignored for fill (we unify to emerald); kept so page code doesn’t need edits
  color = "#10b981",
  currency = true,
}: Props) {
  const gid = useId();

  // sort once (desc), compute a nice X max
  const sorted = useMemo(
    () => [...data].sort((a, b) => Number(b.value) - Number(a.value)),
    [data]
  );
  const rawMax = useMemo(
    () => Math.max(...sorted.map((d) => Number(d.value) || 0), 0),
    [sorted]
  );
  const xMax = useMemo(() => niceMax(rawMax * 1.02), [rawMax]); // small headroom

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex justify-center mb-3">
        <h2 className="text-base font-semibold text-slate-800 text-center">
          {title}
        </h2>
      </div>

      {/* Keep visual height consistent with area chart */}
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ left: 8, right: 32, top: 8, bottom: 8 }}
          >
            <defs>
              {/* Unified emerald gradient (light → slightly darker) */}
              <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#A7F3D0" stopOpacity={0.95} />  {/* emerald-200 */}
                <stop offset="100%" stopColor="#34D399" stopOpacity={0.95} /> {/* emerald-400 */}
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            {/* Y = categories */}
            <YAxis
              type="category"
              dataKey="carrier"
              width={180}
              interval={0}
              tickLine={false}
              tick={{ ...axisLabelStyle, fontWeight: "bold" }}
            />

            {/* X = numeric axis */}
            <XAxis
              type="number"
              domain={[0, xMax]}
              padding={{ right: 110 }}  // more space for largest label
              tickFormatter={formatShortNumber}
              allowDecimals={false}
              tickCount={5}
              tick={{ ...axisLabelStyle, fontWeight: "bold" }}
            />

<RTooltip
  contentStyle={{
    backgroundColor: "rgba(255,255,255,0.95)",
    border: "1px solid #cbd5e1", // slate-300
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    color: "#1e293b", // slate-800 (dark readable text)
    fontWeight: 600,
  }}
  labelStyle={{
    color: "#334155", // slate-700 for label
    fontWeight: 700,
  }}
  formatter={(v: any) => [
    `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    "Pending",
  ]}
  labelFormatter={(n: any) => String(n)}
/>


            <Bar
              dataKey="value"
              barSize={18}
              radius={[8, 8, 8, 8]}
              fill={`url(#${gid})`}
            >
              <LabelList dataKey="value" content={rightLabel({ currency })} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
