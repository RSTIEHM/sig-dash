"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import AdvisorPicker from "../weekly-components/AdvisorPicker";
import WeeklyTrendChart from "../weekly-components/WeeklyTrendChart";
import {
  fetchWeeklySeries,
  type WeeklySeries,
  type WeeklyAdvisor,
  sumAdvisorYTD,
} from "@/app/lib/fetchers";

/* --------------------------- Types & Meta --------------------------- */

type Kind = "annuities" | "life";

const KIND_META: Record<Kind, { title: string; color: string }> = {
  annuities: { title: "Weekly Annuity Production", color: "#2563eb" },
  life: { title: "Weekly Life Production", color: "#f59e0b" },
};

/* ------------------------------ Utils ------------------------------ */

function toFirstLast(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/[,\s]+/);
  if (parts.length === 1) return parts[0];
  return name.includes(",") ? `${parts[1]} ${parts[0]}` : `${parts[0]} ${parts.slice(1).join(" ")}`;
}

function formatUSD0(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function isAbort(e: unknown) {
  if (!e) return false;
  if (typeof e === "string") return e === "route-change";
  const anyErr = e as any;
  return anyErr?.name === "AbortError" || /aborted|AbortError/i.test(anyErr?.message ?? "");
}

/* ----------------------------- Page ------------------------------- */

export default function WeeklyUnifiedPage() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialKind = (search.get("kind") as Kind) === "life" ? "life" : "annuities";
  const [kind, setKind] = useState<Kind>(initialKind);

  const [data, setData] = useState<WeeklySeries | null>(null);
  const [advisorId, setAdvisorId] = useState<string>("");

  // Keep URL in sync with selected kind (quietly)
  useEffect(() => {
    const params = new URLSearchParams(search.toString());
    params.set("kind", kind);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  // Fetch when `kind` changes
useEffect(() => {
  const ctrl = new AbortController();
  let disposed = false;

  (async () => {
    try {
      const d = await fetchWeeklySeries(kind, ctrl.signal);
      if (disposed) return;

      setData(d);

      // keep current selection if it exists in the new dataset; otherwise pick first
      setAdvisorId((prev) => {
        const exists = prev && d.advisors?.some((a) => a.id === prev);
        return exists ? (prev as string) : (d.advisors?.[0]?.id ?? "");
      });
    } catch (e) {
      if (isAbort(e)) return;
      console.error("[weekly] load failed:", e);
      if (!disposed) setData({ advisors: [] });
    }
  })();

  return () => {
    disposed = true;
    if (!ctrl.signal.aborted) ctrl.abort("route-change");
  };
}, [kind]);


  const advisor: WeeklyAdvisor | undefined = useMemo(
    () => data?.advisors.find((a) => a.id === advisorId),
    [data, advisorId]
  );

  const meta = KIND_META[kind];

  return (
    <main className="min-h-screen bg-slate-100">
      <Header />

      {/* Slightly tighter spacing to bring content up */}
      <div className="mx-auto max-w-[1600px] px-8 pt-6 pb-8 space-y-6">
        {/* Row 1: Centered title & toggle (kept as-is) */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl md:text-2xl font-semibold text-slate-900 text-center">
            Weekly Sales{" "}
            <span className="text-slate-500 font-normal">
              – {kind === "life" ? "Life" : "Annuities"}
            </span>
          </h1>
          <KindToggle kind={kind} onChange={setKind} />
        </div>

        {/* Row 2: KPI cards (left) + AdvisorPicker (right) on lg; stacked on small */}
        {advisor && data && (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 flex-1">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5">
                <div className="text-xs text-slate-600 mb-1">Advisor</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {toFirstLast(advisor.name)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5">
                <div className="text-xs text-slate-600 mb-1">YTD Total</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {formatUSD0(sumAdvisorYTD(advisor))}
                </div>
              </div>
            </div>

            {/* Right column: search/picker */}
            <div className="w-full lg:w-[420px]">
              <AdvisorPicker
                advisors={data.advisors}
                value={advisorId}
                onChange={setAdvisorId}
              />
            </div>
          </div>
        )}

        {/* Row 3: Chart */}
        <WeeklyTrendChart
          title={`${meta.title} – ${advisor ? toFirstLast(advisor.name) : "…"}`}
          data={advisor?.weekly ?? []}
          color={meta.color}
        />
      </div>
    </main>
  );
}

/* --------------------------- Toggle UI ---------------------------- */

function KindToggle({
  kind,
  onChange,
}: {
  kind: Kind;
  onChange: (k: Kind) => void;
}) {
  const isLife = kind === "life";
  return (
    <div className="inline-flex overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onChange("annuities")}
        className={`px-5 py-2 text-sm font-semibold transition-colors ${
          !isLife ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        Annuities
      </button>
      <button
        type="button"
        onClick={() => onChange("life")}
        className={`px-5 py-2 text-sm font-semibold transition-colors ${
          isLife ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        Life
      </button>
    </div>
  );
}
