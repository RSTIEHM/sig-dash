"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import KpiRowAllAdvisors from "./KpiRowAllAdvisors";
import AdvisorListAllAdvisors from "./AdvisorListAllAdvisors";
import CenterPanelAllAdvisors from "./CenterPanelAllAdvisors";

export type AdvisorRow = {
  name: string;
  group?: string;
  status?: string;              // "Active", etc.
  aumPrev?: number;             // 2024 AUM (previous year)
  aumYTD?: number;              // current YTD
  gainDollar?: number;
  gainPct?: number;             // decimal (0.174)
  rank?: number;
};

export default function AllAdvisorsPage() {
  const [advisors, setAdvisors] = useState<AdvisorRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/all-advisors.json")
      .then((r) => r.json())
      .then((data: AdvisorRow[]) => {
        setAdvisors(data ?? []);
        setSelected(data?.[0]?.name ?? null);
      });
  }, []);

  if (!advisors.length) return null;

  return (
    <main className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-[1600px] px-8 py-6 space-y-6">
        <KpiRowAllAdvisors advisors={advisors} />

        {/* same two-column layout as All Groups */}
        <div className="grid grid-cols-[2fr_1fr] gap-6 max-[1100px]:grid-cols-1">
          <AdvisorListAllAdvisors
            advisors={advisors}
            selected={selected}
            onSelect={setSelected}
          />
          <CenterPanelAllAdvisors
            advisors={advisors}
            selected={selected}
          />
        </div>
      </div>
    </main>
  );
}
