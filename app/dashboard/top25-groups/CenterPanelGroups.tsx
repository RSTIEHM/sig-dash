"use client";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const moneyFull = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
const moneyShort = (v: number) =>
  Math.abs(v) >= 1_000_000 ? `$${(v / 1_000_000).toFixed(0)}M` : `$${v.toLocaleString("en-US")}`;
const pctFmt = (p: number) => `${(p * 100).toFixed(1)}%`;

export default function CenterPanelGroups({
  groups,
  selectedRank,
}: {
  groups: any[];
  selectedRank?: number;
}) {
  const selected =
    groups.find((g) => g.rank === selectedRank) ?? groups[0];

  const base = Number(selected?.aum2024 ?? 0);
  const ytd  = Number(selected?.aumYTD  ?? 0);
  const diff = ytd - base;
  const pct  = base ? diff / base : 0;
  const isUp = diff >= 0;
  const start = 90;                           // start at top
  const end   = isUp ? -270 : 450;            // clockwise if positive, ccw if negative
  const seg   = Math.min(Math.abs(pct), 0.999);
  const animKey = `${isUp ? "up" : "down"}-${selected?.rank ?? ""}`;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-[#698D6B] text-white text-center font-bold py-3 shadow-sm text-2xl">
        {String(selected?.rank ?? 1).padStart(2, "0")} {selected?.group ?? ""}
      </div>

      {/* Optional lead advisor line */}
      {selected?.leadAdvisor ? (
        <div className="text-center text-slate-700 text-sm -mt-1 mb-2">
          <span className="font-semibold">Lead Advisor:</span>{" "}
          {selected.leadAdvisor}
        </div>
      ) : null}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-slate-700 text-sm font-semibold">2024 AUM</div>
          <div className="text-emerald-800 font-extrabold text-2xl">
            {moneyFull(base)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-slate-700 text-sm font-semibold">2025 YTD</div>
          <div className="text-emerald-800 font-extrabold text-2xl">
            {moneyFull(ytd)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-slate-700 text-sm font-semibold">Gain or Loss $</div>
          <div className={`${isUp ? "text-emerald-700" : "text-rose-700"} font-extrabold text-2xl`}>
            {moneyFull(diff)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-slate-700 text-sm font-semibold">Total AUM</div>
          <div className="text-emerald-800 font-extrabold text-2xl">
            {moneyShort(ytd)}
          </div>
        </div>
      </div>

      {/* Donut */}
      <div className="relative flex h-[320px] w-full items-center justify-center">
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
                paddingAngle={0.5}
                isAnimationActive
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
                cornerRadius={8}
              >
                <Cell fill={isUp ? "#698D6B" : "#E06666"} />
                <Cell fill="transparent" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-slate-600 font-semibold">Gain or Loss %</div>
            <div className={`text-3xl font-extrabold ${isUp ? "text-emerald-700" : "text-rose-700"}`}>
              {pctFmt(pct)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
