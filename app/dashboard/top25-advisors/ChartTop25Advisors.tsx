// ChartTop25Advisors.tsx
"use client";
import React, { memo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList, Cell
} from "recharts";

type Row = { display: string; value: number; fill?: string };

export default memo(function ChartTop25Advisors({
  data,
  variant = "advisors",              // "advisors" | "groups"
  yAxisWidth,                         // optional overrides
  labelFontSize,
  barSize,
  containerHeight,
}: {
  data: Row[];
  variant?: "advisors" | "groups";
  yAxisWidth?: number;
  labelFontSize?: number;
  barSize?: number;
  containerHeight?: number;
}) {
  // sensible defaults per variant
  const cfg = {
    advisors: {
      yWidth: 150,
      labelFS: 12,
      bSize: 18,
      h: 640,
    },
    groups: {
      yWidth: 210,   // wider for long group names
      labelFS: 11,   // slightly smaller
      bSize: 20,     // a touch thicker
      h: 715,        // more vertical room for 25 rows
    },
  }[variant];

  const final = {
    yWidth: yAxisWidth ?? cfg.yWidth,
    labelFS: labelFontSize ?? cfg.labelFS,
    bSize: barSize ?? cfg.bSize,
    h: containerHeight ?? cfg.h,
  };

  function fmtLabelM(v: number) {
    if (!v || isNaN(v)) return "";
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(0)}B`;
    if (v >= 1_000_000)     return `$${(v / 1_000_000).toFixed(0)}M`;
    if (v >= 1_000)         return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  }

  // optional: label wrapping for very long group names (keeps one or two lines)
  const Tick = ({ x, y, payload }: any) => {
    const text = String(payload.value ?? "");
    // Break after ~24 chars on a space to two lines
    const max = 24;
    const cut = text.length > max ? text.lastIndexOf(" ", max) : -1;
    const line1 = cut > 0 ? text.slice(0, cut) : text;
    const line2 = cut > 0 ? text.slice(cut + 1) : "";

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={line2 ? -2 : 3}
          textAnchor="end"
          fill="#374151"
          fontSize={final.labelFS}
          fontWeight={600}
        >
          {line1}
          {line2 && (
            <tspan x={0} dy={final.labelFS + 2}>
              {line2}
            </tspan>
          )}
        </text>
      </g>
    );
  };

  return (
    <div className="relative w-full" style={{ height: final.h }}>
      <div className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 z-10 text-emerald-800 text-[14px] font-semibold">
        Top 25 {variant === "groups" ? "Groups" : "Advisors"} — AUM (YTD)
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ left: 12, right: 90, top: 28, bottom: 10 }}
          barCategoryGap={4}
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
          <XAxis
            type="number"
            tickFormatter={(v) => fmtLabelM(Number(v))}
            domain={[0, "dataMax"]}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickMargin={6}
          />
          <YAxis
            type="category"
            dataKey="display"
            width={final.yWidth}
            tick={<Tick />}                      // custom tick with two-line wrap
            axisLine={false}
            tickLine={false}
            interval={0}
            tickMargin={6}
          />
          <Tooltip
            isAnimationActive={false}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #CBD5E1",
              borderRadius: 6,
              color: "#111827",
              fontSize: 13,
            }}
            formatter={(v: any) => [`$${Number(v).toLocaleString("en-US")}`, "AUM (YTD)"]}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 4, 4]}
            barSize={final.bSize}
            isAnimationActive={false}
            fill="url(#aumGreenGradient)"
          >
            {/* fallback cell fill if gradient is not defined globally */}
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.fill || "#698D6B"} />
            ))}
            <LabelList
              dataKey="value"
              content={({ x, y, width, height, value }: any) => (
                <text
                  x={x + width + 6}
                  y={y + height / 2}
                  alignmentBaseline="middle"
                  textAnchor="start"
                  fontSize="12"
                  fontWeight="700"
                  fill="#1E293B"
                >
                  {fmtLabelM(Number(value))}
                </text>
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
