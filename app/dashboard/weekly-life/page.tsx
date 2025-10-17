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
  formatUSD,
} from "@/app/lib/fetchers";

type Kind = "life" | "annuities";

export default function WeeklyLifePage() {
  const [data, setData] = useState<WeeklySeries | null>(null);
  const [advisorId, setAdvisorId] = useState<string>("");

  const kind: Kind = "life";

  // fetch once for life
  useEffect(() => {
    const ctrl = new AbortController();
    let disposed = false;

    (async () => {
      try {
        const d = await fetchWeeklySeries(kind, ctrl.signal);
        if (!disposed) setData(d);
      } catch (e: any) {
        const aborted =
          e?.name === "AbortError" || e === "route-change" || ctrl.signal.aborted;
        if (!aborted) {
          console.error(e);
          if (!disposed) setData({ advisors: [] });
        }
      }
    })();

    return () => {
      disposed = true;
      if (!ctrl.signal.aborted) ctrl.abort("route-change");
    };
  }, [kind]);

  // initialize selection when data appears
  useEffect(() => {
    if (!data) return;
    setAdvisorId((prev) => prev || data.advisors?.[0]?.id || "");
  }, [data]);

  const advisor: WeeklyAdvisor | undefined = useMemo(
    () => data?.advisors.find((a) => a.id === advisorId),
    [data, advisorId]
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-[1600px] px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Weekly Life</h1>
          {data && (
            <AdvisorPicker
              advisors={data.advisors}
              value={advisorId}
              onChange={setAdvisorId}
            />
          )}
        </div>

        {/* KPI */}
        {advisor && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5">
              <div className="text-xs text-slate-600 mb-1">Advisor</div>
              <div className="text-2xl font-semibold text-slate-900">{advisor.name}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5">
              <div className="text-xs text-slate-600 mb-1">YTD Total</div>
              <div className="text-2xl font-semibold text-slate-900">
                {formatUSD(sumAdvisorYTD(advisor))}
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <WeeklyTrendChart
          title={`Weekly Life Production – ${advisor?.name ?? "…"}`}
          data={advisor ? advisor.weekly : []}
          color="#f59e0b" // orange
        />
      </div>
    </main>
  );
}
