"use client";
import { useEffect, useMemo, useState } from "react";

type AdvisorRow = { rank?: number | null; name?: string | null };
type Props = {
  advisors: AdvisorRow[];
  onSelect?: (rank: number) => void;
  selectedRank?: number;
};

function fmtName(name?: string | null) {
  if (!name) return "";
  const parts = String(name).split(",").map((p) => p.trim());
  return parts.length >= 2 ? `${parts.slice(1).join(" ")} ${parts[0]}` : String(name);
}

export default function AdvisorList({ advisors, onSelect, selectedRank }: Props) {
  const items = useMemo(
    () => advisors.map((a, i) => ({ rank: a.rank ?? i + 1, name: fmtName(a.name) })),
    [advisors]
  );

  const [open, setOpen] = useState(true);

  // Open by default on lg+ screens, closed on small
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const setFromMQ = () => setOpen(mq.matches);
    setFromMQ();
    mq.addEventListener?.("change", setFromMQ);
    return () => mq.removeEventListener?.("change", setFromMQ);
  }, []);

  return (
       <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="text-emerald-800 text-[14px] font-semibold text-center mb-2">
      TOP 25 ADVISORS
    </div>

    {/* Scroll area: shorter on tablet, matches chart height (≈640px) on large screens */}
    <div className="h-[400px] lg:h-[580px] overflow-auto pr-1">
      <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
        {items.map((it) => {
          const active = it.rank === selectedRank;
          return (
            <li key={it.rank}>
              <button
                aria-pressed={active}
                onClick={() => onSelect?.(it.rank)}
                className={`w-full rounded-xl border px-2.5 py-1.5 text-left transition
                  ${
                    active
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                  }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-6 tabular-nums text-[11px] text-slate-500">
                    {String(it.rank).padStart(2, "0")}
                  </span>
                  <span className="truncate text-[12px] font-semibold">{it.name}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  </aside>
  );
}
