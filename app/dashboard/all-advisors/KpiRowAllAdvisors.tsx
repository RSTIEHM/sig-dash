"use client";
import KpiCard from "@/app/components/KpiCard";
import type { AdvisorRow } from "./page";

function n(v: unknown): number {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  return Number(String(v).replace(/[,$]/g, "")) || 0;
}
const fmtMoney = (v: number) =>
  Math.abs(v) >= 1_000_000_000 ? `$${(v/1_000_000_000).toFixed(1)}B`
: Math.abs(v) >= 1_000_000     ? `$${(v/1_000_000).toFixed(1)}M`
: Math.abs(v) >= 1_000         ? `$${(v/1_000).toFixed(0)}K`
: `$${v.toLocaleString("en-US")}`;

const fmtPct = (p: number) => `${(p * 100).toFixed(1)}%`;

export default function KpiRowAllAdvisors({ advisors }: { advisors: AdvisorRow[] }) {
  const totalPrev = advisors.reduce((a, r) => a + n(r.aumPrev), 0);
  const totalYTD  = advisors.reduce((a, r) => a + n(r.aumYTD), 0);
  const diff      = totalYTD - totalPrev;
  const pct       = totalPrev ? diff / totalPrev : 0;

  return (
    <section className="mx-auto grid grid-cols-4 gap-4 max-w-[1300px]
                        max-[1100px]:grid-cols-2 max-[590px]:grid-cols-1">
      <KpiCard label="All Advisors AUM 2024" value={fmtMoney(totalPrev)} compact />
      <KpiCard label="All Advisors AUM YTD"  value={fmtMoney(totalYTD)}  compact />
      <KpiCard
        label="All Advisors Gain or Loss %"
        value={fmtPct(pct)}
        accent={pct >= 0 ? "up" : "down"}
        compact
      />
      <KpiCard
        label="All Advisors Gain or Loss $"
        value={fmtMoney(diff)}
        accent={diff >= 0 ? "up" : "down"}
        compact
      />
    </section>
  );
}
