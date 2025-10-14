"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { GroupRow } from "@/app/lib/fetchers-groups";

function n(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (v == null) return 0;
  const s = String(v).replace(/[^0-9.-]/g, "");
  const num = Number(s);
  return Number.isFinite(num) ? num : 0;
}

const fmtMoneyShort = (v: number) =>
  Math.abs(v) >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(0)}M`
    : `$${v.toLocaleString("en-US")}`;

const fmtPct = (p: number) => `${(p * 100).toFixed(1)}%`;

export default function CenterPanelAllGroups({
  groups,
  selected,
}: {
  groups: GroupRow[];
  selected: string | null;
}) {
  if (!groups?.length) return null;

  const idx = Math.max(0, groups.findIndex((g) => g.group === selected));
  const row = groups[idx] ?? groups[0];

  const base = n(row.aum2024 ?? (row as any).aumPrev);
  const ytd = n(row.aumYTD);
  const diff = ytd - base;
  const pct = base ? diff / base : 0;
  const isUp = diff >= 0;

  

  const shownRank = row.rank ?? idx + 1;
  const title = `${String(shownRank).padStart(2, "0")} ${row.group}`;
  const start = 90;                           // start at top
  const end   = isUp ? -270 : 450;            // clockwise if positive, ccw if negative
  const seg   = Math.min(Math.abs(pct), 0.999);
// ✅ use the actual row’s rank or fallback to index+1
  const animKey = `${isUp ? "up" : "down"}-${row.rank ?? idx + 1}`;


  return (
    <div className="space-y-5">
      {/* Group title card */}
      <div className="rounded-xl bg-[#698D6B] text-white text-center font-bold py-3 text-2xl shadow-sm">
        {title}
      </div>

      {/* Lead Advisor line */}
      <div className="text-center text-slate-600 font-semibold text-sm -mt-3 mb-2">
        Lead Advisor: <span className="text-slate-800 font-bold">{row.leadAdvisor}</span>
      </div>

      {/* Donut */}
      <div className="relative flex h-[300px] w-full items-center justify-center">
        <div className="relative h-full w-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                key={`base-${animKey}`}
                data={[{ value: 1 }]}
                innerRadius={78}
                outerRadius={112}
                startAngle={start}
                endAngle={end}
                dataKey="value"
                stroke="none"
                isAnimationActive={false}
              >
                <Cell fill="#E5E7EB" />
              </Pie>
              <Pie
                key={`arc-${animKey}`}
                  data={[
                    { value: seg },
                    { value: 1 - seg },
                  ]}
                  innerRadius={72}
                  outerRadius={120}
                  startAngle={start}
                  endAngle={end}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                  paddingAngle={0.5}
                  isAnimationActive
                  animationBegin={0}
                  animationDuration={900}
                  animationEasing="ease-out"
              >
                <Cell fill={isUp ? "#698D6B" : "#E06666"} />
                <Cell fill="transparent" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-slate-600 font-semibold">Gain or Loss %</div>
            <div
              className={`text-3xl font-extrabold ${
                isUp ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {fmtPct(pct)}
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">2024 AUM</div>
          <div className="text-emerald-800 font-extrabold text-2xl">
            ${Math.round(base).toLocaleString("en-US")}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">2025 YTD</div>
          <div className="text-emerald-800 font-extrabold text-2xl">
            ${Math.round(ytd).toLocaleString("en-US")}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Gain or Loss $</div>
          <div
            className={`font-extrabold text-2xl ${
              isUp ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            ${Math.round(diff).toLocaleString("en-US")}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Total AUM</div>
          <div className="text-emerald-800 font-extrabold text-2xl">
            {fmtMoneyShort(ytd)}
          </div>
        </div>
      </div>
    </div>
  );
}
