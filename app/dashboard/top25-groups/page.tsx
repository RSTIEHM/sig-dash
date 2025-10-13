"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Layout3Col from "@/app/components/Layout3Col";

import KpiRowGroups from "./KpiRowGroups";

import CenterPanelGroups from "./CenterPanelGroups";

import GroupList from "./GroupList";

// reuse the same horizontal bar chart component from advisors
import ChartTop25 from "../top25-advisors/ChartTop25Advisors";

import { fetchTop25Groups, type GroupRow } from "@/app/lib/fetchers-groups";

export default function Top25GroupsPage() {
  const [groups, setGroups] = useState<GroupRow[] | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchTop25Groups()
      .then((rows) => {
        if (!mounted) return;
        setGroups(rows);
        setSelectedRank(rows[0]?.rank ?? 1);
      })
      .catch((err) => {
        console.error(err);
        setGroups([]);
      });
    return () => { mounted = false; };
  }, []);

  const chartData = useMemo(() => {
    if (!groups) return [];
    return groups
      .map((d, i) => ({
        display: `${String(d.rank ?? i + 1).padStart(2, "0")} ${d.group}`,
        value: Number(d.aumYTD ?? 0),
        fill: "#698D6B",
      }))
      .sort((a, b) => b.value - a.value);
  }, [groups]);

  if (!groups) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Header />
        <div className="mx-auto max-w-[1600px] px-8 py-8 text-slate-600">
          Loading Top 25 Groups…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-[1600px] px-8 py-4 space-y-5">
        <KpiRowGroups groups={groups} />

        {/* ≤1023px: name+KPIs full width; donut + list side-by-side */}
        <div className="lg:hidden grid gap-6">
          <div className="col-span-2">
            <CenterPanelGroups  groups={groups} selectedRank={selectedRank ?? undefined} />
          </div>
          <div className="grid grid-cols-2 gap-4 items-start max-[640px]:grid-cols-1">
            <CenterPanelGroups  groups={groups} selectedRank={selectedRank ?? undefined} />
            <GroupList
              items={groups}
              selectedRank={selectedRank ?? undefined}
              onSelect={(r) => setSelectedRank(r)}
            />
          </div>
        </div>

        {/* ≥1024px: 3-column layout */}
        <div className="hidden lg:block">
          <Layout3Col
            left={<ChartTop25 data={chartData} variant="groups"  />}
            center={<CenterPanelGroups groups={groups} selectedRank={selectedRank ?? undefined} />}
            right={
              <GroupList
                items={groups}
                selectedRank={selectedRank ?? undefined}
                onSelect={(r) => setSelectedRank(r)}
              />
            }
          />
        </div>
      </div>
    </main>
  );
}
