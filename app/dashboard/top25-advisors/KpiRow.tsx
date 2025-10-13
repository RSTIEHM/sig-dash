"use client";
import KpiCard from "@/app/components/KpiCard";

type Advisor = {
  rank?: number | null;
  name?: string | null;
  group?: string | null;
  aumPrev?: number | null;      // ← 2024 total
  aumYTD?: number | null;       // ← YTD total
  gainDollar?: number | null;   // optional in JSON
  gainPct?: number | null;      // optional in JSON (0.139 = 13.9%)
};

// compact money (1 decimal for M/B like your earlier top cards)
const fmtMoney = (n: number) =>
  Math.abs(n) >= 1_000_000_000 ? `$${(n / 1_000_000_000).toFixed(1)}B` :
  Math.abs(n) >= 1_000_000     ? `$${(n / 1_000_000).toFixed(1)}M` :
  `$${Math.round(n).toLocaleString("en-US")}`;

const fmtPct = (p: number) => `${(p * 100).toFixed(1)}%`;
const sum = (arr: number[]) => arr.reduce((a, v) => a + (Number(v) || 0), 0);

export default function KpiRow({ advisors }: { advisors: Advisor[] }) {
  // Totals across the provided (Top-25) advisors
  const totalPrev = sum(advisors.map(a => Number(a.aumPrev ?? 0)));
  const totalYTD  = sum(advisors.map(a => Number(a.aumYTD  ?? 0)));

  // Use file-provided gains if every row has them; otherwise compute
  const haveAllGain$ = advisors.every(a => a.gainDollar != null);
  const totalGain$ = haveAllGain$
    ? sum(advisors.map(a => Number(a.gainDollar ?? 0)))
    : (totalYTD - totalPrev);

  const totalGainPct = totalPrev ? (totalGain$ / totalPrev) : 0;

  const gainAccent: "up" | "down" | undefined =
    totalGain$ > 0 ? "up" : totalGain$ < 0 ? "down" : undefined;

  return (
    <section
      className="
        mx-auto
        grid grid-cols-4 gap-4
        max-w-[1300px]

        max-[1100px]:max-w-[85%]
        max-[1100px]:grid-cols-2
        max-[1100px]:gap-x-6 max-[1100px]:gap-y-4

        max-[590px]:max-w-[94%]
        max-[590px]:grid-cols-1
        max-[590px]:gap-y-3

        max-[1023px]:hidden   /* hide entire KPI row under 1024px per latest ask */
      "
    >
      <KpiCard label="Top 25 Advisors AUM 2024" value={fmtMoney(totalPrev)} compact />
      <KpiCard label="Top 25 Advisor AUM YTD"    value={fmtMoney(totalYTD)} compact />
      <KpiCard label="Top 25 Advisor Gain or Loss %" value={fmtPct(totalGainPct)} accent={gainAccent} compact />
      <KpiCard label="Top 25 Advisor Gain or Loss $"  value={fmtMoney(totalGain$)}  accent={gainAccent} compact />
    </section>
  );
}
