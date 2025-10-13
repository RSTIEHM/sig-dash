"use client";

import KpiCard from "@/app/components/KpiCard";

type GroupRow = {
  aum2024?: number | string | null;
  aumYTD?: number | string | null;
};

// strip $ , spaces etc → number
const n = (v: unknown): number => {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v).replace(/[^0-9.-]/g, "");
  const num = Number(s);
  return Number.isFinite(num) ? num : 0;
};

const fmtMoney = (v: number) => {
  const a = Math.abs(v);
  if (a >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (a >= 1_000_000)     return `$${(v / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000)         return `$${(v / 1_000).toFixed(0)}K`;
  return `$${Math.round(v).toLocaleString("en-US")}`;
};

const fmtPct = (p: number) => `${(p * 100).toFixed(2)}%`;

export default function KpiRowAllGroups({ groups }: { groups: GroupRow[] }) {
  const total2024 = groups.reduce((a, g) => a + n(g.aum2024), 0);
  const totalYTD  = groups.reduce((a, g) => a + n(g.aumYTD), 0);
  const diff      = totalYTD - total2024;
  const pct       = total2024 ? diff / total2024 : 0;

  return (
    <section
      className="
        mx-auto grid max-w-[1300px] grid-cols-4 gap-4
        max-[1100px]:grid-cols-2
        max-[590px]:grid-cols-1
      "
    >
      <KpiCard label="All Groups AUM 2024" value={fmtMoney(total2024)} compact />
      <KpiCard label="All Groups AUM YTD"  value={fmtMoney(totalYTD)}  compact />
      <KpiCard
        label="All Groups Gain or Loss %"
        value={fmtPct(pct)}
        accent={pct >= 0 ? "up" : "down"}
        compact
      />
      <KpiCard
        label="All Groups Gain or Loss $"
        value={fmtMoney(diff)}
        accent={diff >= 0 ? "up" : "down"}
        compact
      />
    </section>
  );
}
