"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type Advisor = {
  rank?: number | null;
  name?: string | null;          // already "First Last" from our transformer
  group?: string | null;
  aumPrev?: number | null;       // ← was aum2024
  aumYTD?: number | null;
  gainDollar?: number | null;    // optional in JSON; we can compute if missing
  gainPct?: number | null;       // optional in JSON; we can compute if missing
};

function fmtMoneyFull(n?: number | null) {
  const v = Number(n || 0);
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function fmtMoneyShort(n?: number | null) {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1_000_000_000) return `$${Math.round(v / 1_000_000_000)}B`;
  if (Math.abs(v) >= 1_000_000)     return `$${Math.round(v / 1_000_000)}M`;
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
function fmtPct(p?: number | null) {
  return `${((p ?? 0) * 100).toFixed(1)}%`;
}

// (names already come “First Last”; keeping this no-op just in case data ever comes "Last, First")
function fmtName(name?: string | null) {
  if (!name) return "";
  const s = String(name);
  if (s.includes(",")) {
    const parts = s.split(",").map((p) => p.trim());
    return parts.length >= 2 ? `${parts.slice(1).join(" ")} ${parts[0]}` : s;
  }
  return s;
}

// ---- shared math for top & donut
function useSelected(advisors: Advisor[], selectedRank?: number) {
  const selected =
    (selectedRank != null
      ? advisors.find((a) => a.rank === selectedRank)
      : undefined) ?? advisors[0];

  const base = Number(selected?.aumPrev ?? 0);       // ← previous (2024) total
  const ytd  = Number(selected?.aumYTD  ?? 0);
  const gain$ = selected?.gainDollar != null ? Number(selected.gainDollar) : ytd - base;
  const gainPct =
    selected?.gainPct != null
      ? Number(selected.gainPct)
      : base
      ? gain$ / base
      : 0;

  const isUp = gain$ >= 0;
  return { selected, base, ytd, gain$, gainPct, isUp };
}

type Props = { advisors: Advisor[]; selectedRank?: number };

// ---------- TOP: name bar + KPI cards
export function CenterPanelTop({ advisors, selectedRank }: Props) {
  const { selected, base, ytd, gain$ } = useSelected(advisors, selectedRank);

  const valueCls =
    "mt-1 font-extrabold leading-tight tracking-tight " +
    "text-[clamp(18px,2.1vw,28px)] " +        // 1024–1160
    "max-[1023px]:text-[clamp(20px,4vw,32px)] " + // under 1024
    "xl:text-3xl";

  return (
    <section className="space-y-4">
      {/* Advisor heading */}
      <div className="rounded-2xl bg-[#698D6B] text-white text-center font-bold py-3 shadow-sm text-2xl tracking-wide">
        {String(selected?.rank ?? "").padStart(2, "0")} {fmtName(selected?.name)}
      </div>

      {/* KPI cards */}
      <div
        className="
          grid grid-cols-1 gap-4
          sm:grid-cols-2
          max-[640px]:grid-cols-2
          max-[640px]:gap-3
        "
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 max-[1160px]:p-4 shadow-sm text-center">
          <div className="text-slate-700 text-sm font-semibold">2024 AUM</div>
          <div className={`${valueCls} text-[#698D6B]`}>{fmtMoneyFull(base)}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 max-[1160px]:p-4 shadow-sm text-center">
          <div className="text-slate-700 text-sm font-semibold">2025 YTD</div>
          <div className={`${valueCls} text-[#698D6B]`}>{fmtMoneyFull(ytd)}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 max-[1160px]:p-4 shadow-sm text-center">
          <div className="text-slate-700 text-sm font-semibold">Gain or Loss $</div>
          <div
            className={`${valueCls} ${gain$ >= 0 ? "text-[#698D6B]" : "text-[#E06666]"}`}
          >
            {fmtMoneyFull(gain$)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 max-[1160px]:p-4 shadow-sm text-center">
          <div className="text-slate-700 text-sm font-semibold">Total AUM</div>
          <div className={`${valueCls} text-[#698D6B]`}>{fmtMoneyShort(ytd)}</div>
        </div>
      </div>
    </section>
  );
}

// ---------- Donut: Gain/Loss %
export function CenterPanelDonut({ advisors, selectedRank }: Props) {
  const { gainPct, isUp } = useSelected(advisors, selectedRank);
  const start = 90;                          // top
  const end   = isUp ? -270 : 450;           // up=clockwise, down=counter-clockwise
  const seg   = Math.min(Math.abs(gainPct), 0.999);

// Use key to retrigger animation when sign or selection changes
const animKey = `${isUp ? "up" : "down"}-${selectedRank ?? ""}`;

  return (
    <div
      className="
        relative flex h-[320px] w-full items-center justify-center
        max-[1023px]:justify-start
        max-[640px]:justify-center
      "
    >
      <div
        className="
          relative h-full w-[85%]
          max-[1023px]:w-[280px]
          max-[640px]:w-[260px]
          max-[640px]:mx-auto
        "
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* base thin ring */}
            <Pie
          key={`base-${animKey}`}
          data={[{ name: "rest", value: 1 }]}
          innerRadius={78}
          outerRadius={112}
          startAngle={start}
          endAngle={end}
          dataKey="value"
          stroke="none"
          isAnimationActive={false}

              cornerRadius={6}
            >
              <Cell fill="#E5E7EB" />
            </Pie>

            {/* colored arc */}
            <Pie
          key={`arc-${animKey}`}               // remount on sign/rank change
          data={[
            { name: "gain", value: seg },
            { name: "rest", value: 1 - seg },
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
            >
              <Cell fill={isUp ? '#698D6B' : '#E06666'} />
              <Cell fill="transparent" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* center labels */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-sm sm:text-base font-semibold text-slate-600">
            Gain or Loss %
          </div>
          <div
            className={`font-extrabold ${
              isUp ? "text-emerald-700" : "text-rose-700"
            } text-3xl sm:text-3xl`}
          >
            {fmtPct(gainPct)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Desktop wrapper (we still render both parts stacked)
export default function CenterPanel({ advisors, selectedRank }: Props) {
  return (
    <>
      <CenterPanelTop advisors={advisors} selectedRank={selectedRank} />
      <CenterPanelDonut advisors={advisors} selectedRank={selectedRank} />
    </>
  );
}
