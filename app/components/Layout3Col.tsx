"use client";
import { ReactNode } from "react";

export default function Layout3Col({
  left,   // chart
  center, // KPIs + donut
  right,  // advisor list
}: { left: ReactNode; center: ReactNode; right: ReactNode }) {
  return (
    <>
      {/* Mobile / Tablet (≤1023px): Center + Right side-by-side; Chart below */}
        <div className="lg:hidden grid gap-6 pt-4">
          {/* Row: Donut + AdvisorList */}
          <div className="grid grid-cols-2 gap-4 items-start max-[640px]:grid-cols-1">
            <div className="min-w-0">{center}</div>  {/* donut + KPIs */}
            <div className="min-w-0">{right}</div>   {/* advisor list */}
          </div>
          <div className="min-w-0">{left}</div>       {/* chart full width below */}
        </div>

      {/* Desktop (≥1024px): 3 columns like before */}
      <div
        className="
          hidden lg:grid gap-6 items-start pt-4 min-w-0
          lg:grid-cols-[clamp(360px,35vw,520px)_1fr_clamp(220px,22vw,280px)]
          xl:grid-cols-[clamp(360px,28vw,440px)_1fr_clamp(200px,16vw,240px)]
        "
      >
        <div className="min-w-0">{left}</div>
        <div className="min-w-0">{center}</div>
        <div className="min-w-0">{right}</div>
      </div>
    </>
  );
}
