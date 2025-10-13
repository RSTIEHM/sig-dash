"use client";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type GroupRow = {
  group: string;
  leadAdvisor?: string | null;
  aumPrev?: number | null;   // prior / 2024 total
  aum2024?: number | null;   // some JSONs use this
  aumYTD?: number | null;    // current YTD total
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

const moneyFull0 = (v: number) =>
  `$${Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const moneyShort0 = (v: number) => {
  const x = Math.abs(v || 0);
  if (x >= 1_000_000_000) return `$${Math.round(v / 1_000_000_000)}B`;
  if (x >= 1_000_000)     return `$${Math.round(v / 1_000_000)}M`;
  return `$${Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

const pctFmt = (p: number) => `${((p || 0) * 100).toFixed(1)}%`;

export default function CenterPanelAllGroups({
  groups,
  selected, // string: group name
}: {
  groups: GroupRow[];
  selected: string | null;
}) {
  // Resolve the current group row from the selected group name
  const idx  = Math.max(0, groups.findIndex((g) => g.group === selected));
  const data = groups[idx] ?? groups[0];

  // Metrics
  const base = n(data?.aumPrev ?? data?.aum2024);
  const ytd  = n(data?.aumYTD);
  const diff = ytd - base;
  const pct  = base ? diff / base : 0;
  const isUp = diff >= 0;

  // Donut animation
  const start   = isUp ? 90 : 270;
  const end     = isUp ? -270 : 450;             // clockwise if positive, ccw if negative
  const seg     = Math.min(Math.abs(pct), 0.999);
  const animKey = `${isUp ? "up" : "down"}-${data?.rank ?? idx + 1}`; // ✅ use row, not selected string

  return (
    <div className="space-y-5">
      {/* Title with rank */}
      <div className="rounded-2xl bg-[var(--color-sig-green,#698D6B)] text-white text-center font-bold py-3 text-2xl shadow-sm">
        {String(data?.rank ?? idx + 1).padStart(2, "0")} {data?.group}
      </div>

      {/* Lead advisor line */}
      {data?.leadAdvisor ? (
        <div className="text-center text-slate-700 text-sm -mt-1 mb-1">
          <span className="font-semibold">Lead Advisor:</span> {data.leadAdvisor}
        </div>
      ) : null}

      {/* Donut with directional animation */}
      <div className="relative flex h-[300px] w-full items-center justify-center">
        <div className="relative h-full w-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* base ring */}
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
              {/* directional arc */}
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

          {/* Center labels */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-slate-600 font-semibold text-sm">Gain or Loss %</div>
            <div className={`font-extrabold text-[28px] sm:text-[32px] ${isUp ? "text-[var(--color-sig-green,#698D6B)]" : "text-rose-700"}`}>
              {pctFmt(pct)}
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards — full value everywhere except Total AUM (short) */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">2024 AUM</div>
          <div className="font-extrabold text-2xl" style={{ color: KPI_GREEN }}>
            {moneyFull0(base)}
          </div>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">2025 YTD</div>
          <div className="font-extrabold text-2xl" style={{ color: KPI_GREEN }}>
            {moneyFull0(ytd)}
          </div>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Gain or Loss $</div>
          <div className={`font-extrabold text-2xl ${isUp ? "text-[var(--color-sig-green,#698D6B)]" : "text-rose-700"}`}>
            {moneyFull0(diff)}
          </div>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-600">Total AUM</div>
          <div className="font-extrabold text-2xl" style={{ color: KPI_GREEN }}>
            {moneyShort0(ytd)}
          </div>
        </div>
      </div>
    </div>
  );
}
