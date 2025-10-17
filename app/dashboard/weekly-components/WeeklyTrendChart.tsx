"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  LabelList,
} from "recharts";
import {
  axisLabelStyle,
  formatShortNumber,
  formatCurrencyFull,
} from "@/app/lib/chart-helpers";

/* ----------------------------- Types ----------------------------- */

type Num = number | string;
type Maybe<T> = T | null | undefined;

type ObjPoint = { w?: Maybe<Num>; week?: Maybe<Num>; value?: Maybe<Num> };
type DataInput = Array<Maybe<Num | ObjPoint>>;

type Props = {
  title: string;
  data: DataInput;
  color?: string;
};

/* ------------------------- helpers ------------------------- */

function toNumberLoose(v: Maybe<Num>): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (v == null) return 0;
  const cleaned = String(v).replace(/[^0-9.\-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Normalize ANY input shape to { w, value } with null safety */
function normalizeRows(input: Maybe<DataInput>) {
  return (input ?? []).map((pt, i) => {
    if (pt == null) return { w: i + 1, value: 0 };

    if (typeof pt === "number" || typeof pt === "string") {
      return { w: i + 1, value: toNumberLoose(pt) };
    }

    const w = toNumberLoose(pt.week ?? pt.w ?? i + 1);
    const value = toNumberLoose(pt.value ?? 0);
    return { w, value };
  });
}

function hexToRgb(hex: string) {
  const s = hex.replace("#", "");
  const b = s.length === 3 ? s.split("").map((c) => c + c).join("") : s.padEnd(6, "0").slice(0, 6);
  const n = parseInt(b, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbaFromHex(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/* ---------------------- component ------------------------ */

export default function WeeklyTrendChart({
  title,
  data,
  color = "#2563eb",
}: Props) {
  const rows = useMemo(() => normalizeRows(data), [data]);

  /* Smart label strategy:
     - if <= 15 points: label everything (except 0s)
     - otherwise: label every 5th point + top 4 peaks
  */
  const SHOW_ALL_THRESHOLD = 15;
  const STEP_LABEL_EVERY = 5;
  const TOP_N = 4;

  const topIndexSet = useMemo(() => {
    if (!rows?.length) return new Set<number>();
    const sorted = rows
      .map((r, i) => ({ i, v: r.value }))
      .filter((x) => x.v > 0)
      .sort((a, b) => b.v - a.v)
      .slice(0, TOP_N);
    return new Set(sorted.map((x) => x.i));
  }, [rows]);

  const gradientId = `grad-${color.replace("#", "")}`;

  // Label renderer with subtle color-matched pill background
  const labelRender = (props: any) => {
    const { x, y, value, index } = props;
    const num = Number(value);
    if (!num || num <= 0) return null;

    const showAll = rows.length <= SHOW_ALL_THRESHOLD;
    const showSparse = index % STEP_LABEL_EVERY === 0 || topIndexSet.has(index);
    if (!showAll && !showSparse) return null;

    const label = formatShortNumber(num);
    const fontSize = 11;
    const padX = 6;
    const padY = 3;
    const textW = label.length * 6.2;
    const boxW = textW + padX * 3;
    const boxH = fontSize + padY * 3;

    // Sit above the dot/line slightly
    const boxX = Number(x) - boxW / 2;
    const boxY = Number(y) - boxH - 8;

    return (
      <g style={{ pointerEvents: "none" }}>
        <rect
          x={boxX}
          y={boxY}
          width={boxW}
          height={boxH}
          rx={7}
          ry={7}
          fill={rgbaFromHex(color, 0.85)}
        />
        <text
          x={Number(x)}
          y={boxY + boxH / 2 + 4}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight={700}
          fill="#fff"
        >
          {label}
        </text>
      </g>
    );
  };

  // Headroom so big spikes don't clip
  const yDomain: [number, any] = [0, (dataMax: number) => Math.ceil(dataMax * 1.08)];

  // --- Custom tooltip (one clean row, no decimals) -----------------
  function WeeklyTooltip({
    active,
    label,
    payload,
  }: {
    active?: boolean;
    label?: any;
    payload?: Array<any>;
  }) {
    if (!active || !payload || payload.length === 0) return null;

    const row = payload.find((p) => p?.dataKey === "value") ?? payload[0];

    const n = Number.isFinite(row?.value)
      ? Math.round(Number(row.value))
      : Math.round(toNumberLoose(row?.value));

    const dollars = `$${n.toLocaleString("en-US")}`;

    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          padding: "10px 12px",
        }}
      >
        <div style={{ color: "#111827", fontWeight: 800, marginBottom: 4 }}>
          {`Week ${label}`}
        </div>
        <div style={{ color: "#111827", fontWeight: 700 }}>{dollars}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex justify-center mb-2">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="h-[420px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={rows}
            margin={{ top: 16, right: 28, left: 8, bottom: 28 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.28} />
                <stop offset="95%" stopColor={color} stopOpacity={0.06} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="w"
              allowDecimals={false}
              tick={{ ...axisLabelStyle, fontWeight: "bold" }}
              interval={0}
            />
            <YAxis
              tickFormatter={formatShortNumber}
              tick={{ ...axisLabelStyle, fontWeight: "bold" }}
              domain={yDomain}
            />

            <RTooltip content={<WeeklyTooltip />} />

            {/* visible stroke + area */}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-in-out"
            />

            {/* transparent pass that draws the labels on top */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="transparent"
              fill="transparent"
              isAnimationActive={false}
              connectNulls
            >
              <LabelList dataKey="value" content={labelRender} />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-center text-xs text-slate-500">Weeks</div>
    </div>
  );
}
