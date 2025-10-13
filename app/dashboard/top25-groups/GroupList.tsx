"use client";

import type { GroupRow } from "@/app/lib/fetchers-groups";

export default function GroupList({
  items,
  selectedRank,
  onSelect,
}: {
  items: GroupRow[];                 // <-- accept full normalized rows
  selectedRank?: number;
  onSelect: (rank: number) => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm max-h-[640px] overflow-auto">
      <div className="text-center text-emerald-800 text-[14px] font-semibold mb-2">
        TOP 25 GROUPS
      </div>
      <ul className="space-y-1">
        {items.map((it, idx) => {
          const r = it.rank ?? (idx + 1);
          const active = r === selectedRank;
          return (
            <li key={r}>
              <button
                aria-pressed={active}
                onClick={() => onSelect?.(r)}
                className={`w-full rounded-[6px] border px-2 py-1 text-left leading-5 transition
                  ${
                    active
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                  }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] text-slate-500 w-6 tabular-nums">
                    {String(r).padStart(2, "0")}
                  </span>
                  <span className="truncate text-[12px] font-semibold">{it.group}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
