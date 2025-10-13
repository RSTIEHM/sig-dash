"use client";
import KpiCard from "@/app/components/KpiCard";
import type { GroupRow } from "@/app/lib/fetchers-groups";

const fmtMoney = (n: number) =>
  Math.abs(n) >= 1e9 ? `$${(n/1e9).toFixed(1)}B` :
  Math.abs(n) >= 1e6 ? `$${(n/1e6).toFixed(1)}M` :
  `$${Math.round(n).toLocaleString("en-US")}`;
const fmtPct = (p: number) => `${(p * 100).toFixed(1)}%`;

export default function KpiRowGroups({ groups }: { groups: any[] }) {
  const total2024 = groups.reduce((a, g) => a + (Number(g.aum2024) || 0), 0);
  const totalYTD  = groups.reduce((a, g) => a + (Number(g.aumYTD)  || 0), 0);
  const diff = totalYTD - total2024;
  const pct  = total2024 ? diff / total2024 : 0;

  return (
    <section className="mx-auto grid grid-cols-4 gap-4 max-w-[1300px]
                        max-[1100px]:grid-cols-2 max-[590px]:grid-cols-1">
      <KpiCard label="Top 25 Groups AUM 2024" value={fmtMoney(total2024)} compact />
      <KpiCard label="Top 25 Groups AUM YTD" value={fmtMoney(totalYTD)} compact />
      <KpiCard
        label="Top 25 Groups Gain or Loss %"
        value={fmtPct(pct)}
        accent={pct >= 0 ? "up" : "down"}
        compact
      />
      <KpiCard
        label="Top 25 Groups Gain or Loss $"
        value={fmtMoney(diff)}
        accent={diff >= 0 ? "up" : "down"}
        compact
      />
    </section>
  );
}

