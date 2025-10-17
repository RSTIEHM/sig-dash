"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";

import {
  fetchWeeklyBiz,
  type WeeklyBizData,
  type BizPack,
  toStackedAreaRows,
  toPendingBars,
  isAbortError,
} from "@/app/lib/fetchers";

import StackedMonthly from "./StackedMonthly";
import PendingBars from "./PendingBars";

const palette = { y2024: "#2563eb", y2025: "#f59e0b" };

type Tab = "ann" | "life";

const seriesColors = {
  ann: { line24: "#2563eb", line25: "#f59e0b" },
  life: { line24: "#2563eb", line25: "#f59e0b" },
};

export default function WeeklyBizPage() {
  const [data, setData] = useState<WeeklyBizData | null>(null);
  const [tab, setTab] = useState<Tab>("ann");

  

  // ---- fetch JSON once ----
  useEffect(() => {
    const ctrl = new AbortController();
    fetchWeeklyBiz(ctrl.signal)
      .then(setData)
      .catch((e) => {
        if (isAbortError(e)) return;
        console.error(e);
        setData({
          annuities: { monthly: [], table: [], pending: [] },
          life: { monthly: [], table: [], pending: [] },
        });
      });
    return () => {
      if (!ctrl.signal.aborted) ctrl.abort();
    };
  }, []);

  // ---- select current pack (ann/life) ----
  const pack: BizPack | null = useMemo(() => {
    if (!data) return null;
    return tab === "ann" ? data.annuities : data.life;
  }, [data, tab]);

  // ---- chart data (shaped) ----
  const monthlyRows = useMemo(
    () => (pack ? toStackedAreaRows(pack) : []),
    [pack]
  );
  const pendingBars = useMemo(
    () => (pack ? toPendingBars(pack.pending) : []),
    [pack]
  );

  // ---- KPI totals (NO hooks; compute unconditionally to keep hook order stable) ----
  const total2024 = (pack?.table ?? [])
    .filter((r) => String(r.month).toLowerCase() !== "total")
    .reduce((sum, r) => sum + (r.y2024 || 0), 0);

  const total2025 = (pack?.table ?? [])
    .filter((r) => String(r.month).toLowerCase() !== "total")
    .reduce((sum, r) => sum + (r.y2025 || 0), 0);

  const totalCombined = total2024 + total2025;

  const totalPending = (pack?.pending ?? [])
    .filter((p) => !/total/i.test(p.carrier ?? ""))
    .reduce((sum, p) => sum + (p.value || 0), 0);

  // ---- loading state ----
  if (!pack) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Header />
        <div className="mx-auto max-w-[1600px] px-8 py-8 text-slate-600">
          Loading Weekly Biz…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-[1600px] px-8 py-4 space-y-5">

{/* Header + tab toggle */}
    <div className="flex flex-col items-center text-center gap-3 mt-2 mb-6">
      <h1 className="text-2xl font-semibold text-slate-800">
        Weekly Biz Report –{" "}
        <span className="text-slate-500 font-normal">
          {tab === "ann" ? "Annuities" : "Life Insurance"}
        </span>
      </h1>

      <div className="inline-flex overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <button
          onClick={() => setTab("ann")}
          className={`px-5 py-2 text-sm font-medium transition-colors ${
            tab === "ann"
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Annuities
        </button>
        <button
          onClick={() => setTab("life")}
          className={`px-5 py-2 text-sm font-medium transition-colors ${
            tab === "life"
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Life
        </button>
      </div>
    </div>


        {/* KPI CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-center">
          {/* 2024 Total */}
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5
                shadow-sm">
            <div className="text-xs text-slate-600 mb-1">
              Total {tab === "ann" ? "Annuity" : "Life"} Sales – 2024
            </div>
            <div className="text-2xl font-semibold text-slate-900">
              ${total2024.toLocaleString()}
            </div>
          </div>

          {/* 2025 Total */}
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
            <div className="text-xs text-slate-600 mb-1">
              Total {tab === "ann" ? "Annuity" : "Life"} Sales – 2025
            </div>
            <div className="text-2xl font-semibold text-slate-900">
              ${total2025.toLocaleString()}
            </div>
          </div>

          {/* Combined Total */}
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
            <div className="text-xs text-slate-600 mb-1">
              Total {tab === "ann" ? "Annuity" : "Life"} Sales – Combined
            </div>
            <div className="text-2xl font-semibold text-slate-900">
              ${totalCombined.toLocaleString()}
            </div>
          </div>

          {/* Pending Total */}
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
            <div className="text-xs text-slate-600 mb-1">
              Total {tab === "ann" ? "Annuity" : "Life"} Pending
            </div>
            <div className="text-2xl font-semibold text-slate-900">
              ${totalPending.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-5 lg:grid-cols-2">
          <StackedMonthly
            title={`Monthly ${tab === "ann" ? "Annuity" : "Life"} Sales (2024 vs 2025)`}
            data={monthlyRows}
              colors={palette}
          />
      <PendingBars
  title={`${tab === "ann" ? "Annuity" : "Life"} Pending by Carrier`}
  data={pendingBars}
  color={tab === "ann" ? seriesColors.ann.line24 : seriesColors.life.line25} // kept for API compat; now ignored for fill
  currency
/>

        </div>
      </div>
    </main>
  );
}
