"use client";

export default function GroupListAllGroups({
  groups,
  selected,
  onSelect,
}: {
  groups: { group: string; rank?: number | null }[];
  selected: string | null;
  onSelect: (name: string) => void;
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      {/* ✅ Title added */}
      <div className="text-center text-emerald-800 text-[14px] font-semibold mb-2">
        ALL GROUPS
      </div>

      <div className="max-h-[640px] overflow-auto pr-0.5">
        <ul
          className="
            grid grid-cols-4 gap-2
            max-[1100px]:grid-cols-3
            max-[900px]:grid-cols-2
            max-[640px]:grid-cols-1
          "
        >
          {groups.map((g, i) => {
            const active = g.group === selected;
            const rank = g.rank ?? i + 1;
            return (
              <li key={g.group}>
                <button
                  aria-pressed={active}
                  onClick={() => onSelect(g.group)}
                  className={`w-full rounded-[8px] border px-3 py-2 text-left transition
                    ${
                      active
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] text-slate-500 w-6 tabular-nums">
                      {String(rank).padStart(2, "0")}
                    </span>
                    {/* ✅ keep bold */}
                    <span className="truncate text-[13px] leading-tight font-semibold">
                      {g.group}
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
