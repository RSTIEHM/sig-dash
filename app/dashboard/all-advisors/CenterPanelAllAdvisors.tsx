"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export type AdvisorRow = {
  name: string;
  group?: string;
  status?: string;
  aumPrev?: number;
  aumYTD?: number;
  gainDollar?: number;
  gainPct?: number;
  rank?: number;
};

const KPI_GREEN = "#698D6B";
const KPI_RED   = "#E06666";

const n = (v: unknown) =>
  typeof v === "number" ? (Number.isFinite(v) ? v : 0)
  : Number(String(v ?? 0).replace(/[^0-9.-]/g, "")) || 0;

const moneyFull0 = (v: number) =>
  `$${Math.round(v || 0).toLocaleString("en-US")}`;

const moneyShort0 = (v: number) =>
  Math.abs(v || 0) >= 1_000_000
    ? `$${((v || 0) / 1_000_000).toFixed(0)}M`
    : `$${Math.round(v || 0).toLocaleString("en-US")}`;

const pctFmt = (p: number) => `${((p || 0) * 100).toFixed(1)}%`;

export default function CenterPanelAllAdvisors({
  advisors,
  selected,
}: {
  advisors: AdvisorRow[];
  selected: string | null;
}) {
  if (!advisors?.length) return null;

  const idx = Math.max(0, advisors.findIndex(a => a.name === selected));
  const row = advisors[idx] ?? advisors[0];

  const base = n(row.aumPrev);
  const ytd  = n(row.aumYTD);
  const diff = ytd - base;
  const pct  = base ? diff / base : 0;
  const isUp = diff >= 0;

  // ✅ EXACTLY like AllGroups
  const start = 90;                        // always start at the top
  const end   = isUp ? -270 : 450;         // CW for gains, CCW for losses
  const seg   = Math.min(Math.abs(pct), 0.999);

  // colored arc first, transparent remainder second
  const arcData = [{ value: seg }, { value: 1 - seg }];

  // force re-animation when direction or person changes
  const animKey = `${isUp ? "up" : "down"}-${row.rank ?? idx + 1}`;

  return (
    <section className="space-y-4">
      {/* Name bar */}
      <div className="rounded-2xl bg-[var(--color-sig-green,#698D6B)] text-white text-center font-bold py-3 shadow-sm text-2xl tracking-wide">
        {String(row.rank ?? idx + 1).padStart(2, "0")} {row.name}
      </div>

      {/* Status */}
      <div className="text-center text-sm text-slate-600 -mt-2 mb-2">
        <span className="font-semibold">Status:</span> {row.status ?? "—"}
      </div>

      {/* Donut */}
      <div className="relative flex h-[300px] w-full items-center justify-center">
        <div className="relative h-full w-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* base ring: full circle */}
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

              {/* colored arc + transparent remainder */}
              <Pie
                key={`arc-${animKey}`}
                data={arcData}
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
                <Cell fill={isUp ? KPI_GREEN : KPI_RED} />
                <Cell fill="transparent" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-slate-600 font-semibold text-sm">Gain or Loss %</div>
            <div className={`font-extrabold text-[28px] sm:text-[32px] ${isUp ? "text-[var(--color-sig-green,#698D6B)]" : "text-rose-700"}`}>
              {pctFmt(pct)}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">2024 AUM</div>
          <div className="font-extrabold text-2xl" style={{ color: KPI_GREEN }}>
            {moneyFull0(base)}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">2025 YTD</div>
          <div className="font-extrabold text-2xl" style={{ color: KPI_GREEN }}>
            {moneyFull0(ytd)}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Gain or Loss $</div>
          <div className={`font-extrabold text-2xl ${isUp ? "text-[var(--color-sig-green,#698D6B)]" : "text-rose-700"}`}>
            {moneyFull0(diff)}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Total AUM</div>
          <div className="font-extrabold text-2xl" style={{ color: KPI_GREEN }}>
            {moneyShort0(ytd)}
          </div>
        </div>
      </div>
    </section>
  );
}
