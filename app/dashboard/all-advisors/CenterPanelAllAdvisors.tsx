"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export type AdvisorRow = {
  name: string;
  group?: string;
  status?: string;
  aumPrev?: number | null;   // prior/2024 AUM
  aumYTD?: number | null;    // current YTD AUM
  gainDollar?: number | null;
  gainPct?: number | null;   // decimal (e.g., 0.157)
  rank?: number | null;
};

const KPI_GREEN = "#698D6B";
const KPI_RED   = "#E06666";

function n(v: unknown): number {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  return Number(String(v).replace(/[,$]/g, "")) || 0;
}

// Full dollar, no decimals (e.g., $321,229,609)
const fmtMoneyFull0 = (v: number) =>
  `$${Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

// Short form with no decimals (e.g., $321M / $3B)
const fmtMoneyShort = (v: number) => {
  const x = Math.abs(v || 0);
  if (x >= 1_000_000_000) return `$${Math.round(v / 1_000_000_000)}B`;
  if (x >= 1_000_000)     return `$${Math.round(v / 1_000_000)}M`;
  return `$${Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

const fmtPct = (p: number) => `${((p || 0) * 100).toFixed(1)}%`;

export default function CenterPanelAllAdvisors({
  advisors,
  selected,
}: {
  advisors: AdvisorRow[];
  selected: string | null;   // advisor name
}) {
  // Resolve the selected advisor row from the string `selected`
  const idx = Math.max(0, advisors.findIndex((r) => r.name === selected));
  const row = advisors[idx] ?? advisors[0];

  // Metrics
  const base = n(row?.aumPrev);
  const ytd  = n(row?.aumYTD);
  const diff = ytd - base;
  const pct  = base ? diff / base : 0;

  const isUp  = diff >= 0;
  const start = isUp ? 90 : 270;   // start at top for up, left for down
  const end   = isUp ? -270 : 450; // clockwise if positive, ccw if negative
  const seg   = Math.min(Math.abs(pct), 0.999);

  // ✅ Use resolved row (or idx) for a stable animation key
  const animKey = `${isUp ? "up" : "down"}-${row?.rank ?? idx + 1}`;

  return (
    <section className="space-y-4">
      {/* Name bar */}
      <div className="rounded-2xl bg-[#698D6B] text-white text-center font-bold py-3 shadow-sm text-2xl tracking-wide">
        {String(row?.rank ?? idx + 1).padStart(2, "0")} {row?.name}
      </div>

      {/* Status line */}
      <div className="text-center text-sm text-slate-600 -mt-2 mb-2">
        <span className="font-semibold">Status:</span> {row?.status ?? "—"}
      </div>

      {/* Donut */}
      <div className="relative flex h-[300px] w-full items-center justify-center">
        <div className="relative h-full w-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Base ring */}
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

              {/* Directional overlay arc */}
              <Pie
                key={`arc-${animKey}`}
                data={[{ value: seg }, { value: 1 - seg }]}
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

          {/* Donut center labels */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-slate-600 font-semibold">Gain or Loss %</div>
            <div className={`text-[28px] sm:text-[32px] font-extrabold ${isUp ? "text-emerald-700" : "text-rose-700"}`}>
              {fmtPct(pct)}
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards — full value (no decimals) except Total AUM (short) */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">2024 AUM</div>
          <div className="font-extrabold text-2xl" style={{ color: KPI_GREEN }}>
            {fmtMoneyFull0(base)}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">2025 YTD</div>
          <div className="font-extrabold text-2xl" style={{ color: KPI_GREEN }}>
            {fmtMoneyFull0(ytd)}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Gain or Loss $</div>
          <div className={`font-extrabold text-2xl ${isUp ? "text-emerald-700" : "text-rose-700"}`}>
            {fmtMoneyFull0(diff)}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Total AUM</div>
          <div className="font-extrabold text-2xl" style={{ color: KPI_GREEN }}>
            {fmtMoneyShort(ytd)}
          </div>
        </div>
      </div>
    </section>
  );
}
