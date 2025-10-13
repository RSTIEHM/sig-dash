"use client";

import type { AdvisorRow } from "./page";

export default function AdvisorListAllAdvisors({
  advisors,
  selected,
  onSelect,
}: {
  advisors: AdvisorRow[];
  selected: string | null;
  onSelect: (name: string) => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-center text-emerald-800 text-[14px] font-semibold mb-2">
        ALL ADVISORS
      </div>
      <div className="max-h-[640px] overflow-auto pr-0.5">
        {/* 🔥 changed from grid-cols-2 → grid-cols-4 for larger layouts */}
        <ul
          className="
            grid grid-cols-4 gap-2
            max-[1100px]:grid-cols-3
            max-[900px]:grid-cols-2
            max-[640px]:grid-cols-1
          "
        >
          {advisors.map((a) => {
            const active = a.name === selected;
            return (
              <li key={a.name}>
                <button
                  aria-pressed={active}
                  onClick={() => onSelect(a.name)}
                  className={`w-full rounded-[8px] border px-3 py-2 text-left leading-5 transition
                    ${
                      active
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] text-slate-500 w-6 tabular-nums">
                      {String(a.rank ?? "").padStart(2, "0")}
                    </span>
                    <span className="truncate text-[13px] font-semibold">
                      {a.name}
                    </span>
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
