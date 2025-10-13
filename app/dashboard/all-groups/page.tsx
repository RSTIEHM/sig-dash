// app/dashboard/all-groups/page.tsx
"use client";
import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import KpiRowAllGroups from "./KpiRowAllGroups";
import CenterPanelAllGroups from "./CenterPanelAllGroups";
import GroupListAllGroups from "./GroupListAllGroups";
import { fetchAllGroups } from "@/app/lib/fetchers-groups";

export default function AllGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetchAllGroups().then((data) => {
      setGroups(data);
      setSelected(data[0]?.group || null);
    });
  }, []);

  if (!groups.length) return null;

  return (
    <main className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-[1600px] px-8 py-6 space-y-6">
        <KpiRowAllGroups groups={groups} />
        <div className="grid grid-cols-[2fr_1fr] gap-6 max-[1100px]:grid-cols-1">
          <GroupListAllGroups groups={groups} selected={selected} onSelect={setSelected} />
          <CenterPanelAllGroups groups={groups} selected={selected} />
        </div>
      </div>
    </main>
  );
}
