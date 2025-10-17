"use client";

import React, { useId, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  LabelList,
} from "recharts";
import {
  axisLabelStyle,
  formatShortNumber,
  formatCurrencyFull,
} from "@/app/lib/chart-helpers";

type Row = { m: string; y2024: number; y2025: number };

type Colors = {
  y2024: string;
  y2025: string;
};

type TooltipEntry = { name?: string; value?: number | string; color?: string };
type TooltipPayload = TooltipEntry[];
type CustomTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayload;
  seriesColors: Record<string, string>;
};

// ---- Tooltip (kept from your version) --------------------------------
const CustomTooltip = ({
  active,
  payload,
  label,
  seriesColors,
}: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-300 shadow-sm rounded-md px-3 py-2 text-sm">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((entry, idx) => {
        const n = String(entry.name ?? "");
        const color = seriesColors[n] ?? "#334155";
        return (
          <p key={idx} className="font-medium" style={{ color }}>
            {n}: {formatCurrencyFull(Number(entry.value ?? 0))}
          </p>
        );
      })}
    </div>
  );
};

// ---- helpers to find min/max per series ------------------------------
function minIdx(rows: Row[], key: keyof Row) {
  let idx = -1,
    best = Infinity;
  rows.forEach((r, i) => {
    const v = Number(r[key] ?? 0);
    if (v > 0 && v < best) {
      best = v;
      idx = i;
    }
  });
  return idx;
}
function maxIdx(rows: Row[], key: keyof Row) {
  let idx = -1,
    best = -Infinity;
  rows.forEach((r, i) => {
    const v = Number(r[key] ?? 0);
    if (v > best) {
      best = v;
      idx = i;
    }
  });
  return idx;
}

export default function StackedMonthly({
  title,
  data,
  colors = {
    y2024: "#2563eb",
    y2025: "#f59e0b",
  },
}: {
  title: string;
  data: Row[];
  colors?: Colors;
}) {
  const gid24 = useId();
  const gid25 = useId();

  const seriesColors: Record<string, string> = {
    "2024": colors.y2024,
    "2025": colors.y2025,
  };

  const idxs24 = useMemo(
    () => new Set([minIdx(data, "y2024"), maxIdx(data, "y2024")]),
    [data]
  );
  const idxs25 = useMemo(
    () => new Set([minIdx(data, "y2025"), maxIdx(data, "y2025")]),
    [data]
  );

  // Build labeled data with gentle separation if both series are near each other
  const labeledData = useMemo(() => {
    return data.map((d, i) => {
      const hot24 = idxs24.has(i);
      const hot25 = idxs25.has(i);
      const near =
        hot24 &&
        hot25 &&
        Math.abs(d.y2024 - d.y2025) /
          Math.max(Math.max(d.y2024, d.y2025, 1), 1) <
          0.08;

      return {
        ...d,
        y2024Label:
          hot24 && d.y2024 > 0 ? formatShortNumber(d.y2024) : undefined,
        y2025Label:
          hot25 && d.y2025 > 0 ? formatShortNumber(d.y2025) : undefined,
        y2024Offset: near ? -14 : 0,
        y2025Offset: near ? +18 : 0,
      };
    });
  }, [data, idxs24, idxs25]);

  // Pill renderer (same look you liked)
  const labelRenderer =
    (color: string) =>
    (props: any) => {
      const { x, y, value } = props;
      if (!value) return null;

      const label = String(value);
      const fontSize = 14;
      const padX = 8;
      const padY = 4;
      const textW = label.length * (fontSize * 0.58);
      const w = textW + padX * 2;
      const h = fontSize + padY * 2;

      const tx = Number(x) - w / 2;
      const ty = Number(y) - h - 6;

      return (
        <g transform={`translate(${tx}, ${ty})`} style={{ pointerEvents: "none" }}>
          <rect
            width={w}
            height={h}
            rx={7}
            ry={7}
            fill={color}
            opacity={0.95}
            filter="url(#pillShadow)"
          />
          <text
            x={w / 2}
            y={h / 2 + 4}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight={800}
            fill="#fff"
          >
            {label}
          </text>
        </g>
      );
    };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex justify-center mb-3">
        <h2 className="text-base font-semibold text-slate-800 text-center">
          {title.includes("Stacked") ? title.replace("Stacked", "Comparison") : title}
        </h2>
      </div>

      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={labeledData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id={gid24} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.y2024} stopOpacity={0.28} />
                <stop offset="100%" stopColor={colors.y2024} stopOpacity={0.06} />
              </linearGradient>
              <linearGradient id={gid25} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.y2025} stopOpacity={0.28} />
                <stop offset="100%" stopColor={colors.y2025} stopOpacity={0.06} />
              </linearGradient>
              <filter id="pillShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.25" />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="m" tick={{ ...axisLabelStyle, fontWeight: "bold" }} />
            <YAxis
              tick={{ ...axisLabelStyle, fontWeight: "bold" }}
              tickFormatter={formatShortNumber}
            />
            <RTooltip content={<CustomTooltip seriesColors={seriesColors} />} />
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="left"
              wrapperStyle={{
                position: "absolute",
                top: -35, // raises it up closer to the title
                right: -20, // nudges toward the right edge of the chart card
                fontWeight: 900,
                fontSize: 13,
              }}
            />
            {/* --- 2024: base fill + stroke --- */}
            <Area
              dataKey="y2024"
              name="2024"
              type="monotone"
              fill={`url(#${gid24})`}
              stroke={colors.y2024}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* 2024 overlay (labels on top of the line) */}
            <Area
              dataKey="y2024"
              type="monotone"
              fill="transparent"
              stroke="transparent"
              isAnimationActive={false}
              pointerEvents="none"
            >
              <LabelList
                dataKey="y2024Label"
                content={(p: any) =>
                  labelRenderer(colors.y2024)({
                    ...p,
                    y: Number(p.y) + (p.payload?.y2024Offset ?? 0),
                  })
                }
              />
            </Area>

            {/* --- 2025: base fill + stroke --- */}
            <Area
              dataKey="y2025"
              name="2025"
              type="monotone"
              fill={`url(#${gid25})`}
              stroke={colors.y2025}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* 2025 overlay (labels on top of the line) */}
            <Area
              dataKey="y2025"
              type="monotone"
              fill="transparent"
              stroke="transparent"
              isAnimationActive={false}
              pointerEvents="none"
            >
              <LabelList
                dataKey="y2025Label"
                content={(p: any) =>
                  labelRenderer(colors.y2025)({
                    ...p,
                    y: Number(p.y) + (p.payload?.y2025Offset ?? 0),
                  })
                }
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
