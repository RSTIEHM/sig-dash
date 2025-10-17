"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import AdvisorPicker from "../weekly-components/AdvisorPicker";
import WeeklyTrendChart from "../weekly-components/WeeklyTrendChart";
import {
  fetchWeeklySeries,
  type WeeklySeries,
  type WeeklyAdvisor,
  sumAdvisorYTD,
} from "@/app/lib/fetchers";
import { formatCurrencyFull } from "@/app/lib/chart-helpers";

// "Last, First" -> "First Last"
const toFirstLast = (full?: string) => {
  if (!full) return "";
  const [last, first = ""] = full.split(",").map((s) => s.trim());
  return first ? `${first} ${last}` : full;
};

export function formatUSD(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function WeeklyAnnuitiesPage() {
  const [data, setData] = useState<WeeklySeries | null>(null);
  const [advisorId, setAdvisorId] = useState<string>("");

  useEffect(() => {
    const ctrl = new AbortController();
    let mounted = true;

    (async () => {
      try {
        const d = await fetchWeeklySeries("annuities", ctrl.signal);
        if (!mounted) return;
        setData(d);

        // default selection on first load
        if (!advisorId && d.advisors.length) {
          setAdvisorId(d.advisors[0].id);
        }
      } catch (e: any) {
        // Swallow route-change and normal aborts
        if (e?.name === "AbortError" || e === "route-change") return;

        console.error(e);
        if (mounted) setData({ advisors: [] });
      }
    })();

    return () => {
      mounted = false;
      if (!ctrl.signal.aborted) ctrl.abort("route-change");
    };
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advisor: WeeklyAdvisor | undefined = useMemo(
    () => data?.advisors.find((a) => a.id === advisorId),
    [data, advisorId]
  );

  const ytd = useMemo(() => (advisor ? sumAdvisorYTD(advisor) : 0), [advisor]);

  return (
    <main className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-[1600px] px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Weekly Annuities</h1>

          {data && (
            <AdvisorPicker
              advisors={data.advisors}
              value={advisorId}
              onChange={setAdvisorId}
              placeholder="Search advisor…"
            />
          )}
        </div>

        {/* KPI cards */}
        {advisor && (
          <div className="flex flex-wrap justify-center gap-4">
            <div className="min-w-[280px] rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm">
              <div className="text-xs text-slate-600 mb-1">Advisor</div>
              <div className="text-2xl font-semibold text-slate-900">
                {toFirstLast(advisor.name)}
              </div>
            </div>

            <div className="min-w-[280px] rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm">
              <div className="text-xs text-slate-600 mb-1">YTD Total</div>
              <div className="text-2xl font-semibold text-slate-900">
                {/* {formatCurrencyFull(ytd)} */}
                {formatUSD(sumAdvisorYTD(advisor))}
              </div>
            </div>
          </div>
        )}

        <WeeklyTrendChart
          title={`Weekly Annuity Production – ${toFirstLast(advisor?.name) || "…"}`}
          data={advisor?.weekly ?? []}
          color="#2563eb"
        />
      </div>
    </main>
  );
}
