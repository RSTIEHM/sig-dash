"use client";

import clsx from "clsx";

type Props = {
  label: string;
  value: string | number;
  accent?: "up" | "down";
  compact?: boolean;
  className?: string;
};

export default function KpiCard({
  label, value, accent, compact = true, className,
}: Props) {
  const accentCls =
    accent === "up" ? "text-emerald-700"
    : accent === "down" ? "text-rose-700"
    : "text-slate-800";

  return (
    <div
  className={clsx(
    "w-full min-w-0",   // ⬅️ important: fill the grid cell
    "flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm text-center",
    compact ? "px-4 py-3" : "px-5 py-4"
  )}
    >
      <div className="text-[12px] sm:text-[13px] font-semibold tracking-tight text-slate-700 mb-1">
        {label}
      </div>
      <div className={`font-extrabold tracking-tightest ${accentCls} text-[22px] sm:text-[26px] leading-none`}>
        {value}
      </div>
    </div>
  );
}
