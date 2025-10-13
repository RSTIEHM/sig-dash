"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Layout3Col from "@/app/components/Layout3Col";
import KpiRow from "./KpiRow";
import ChartTop25Advisors from "./ChartTop25Advisors";
import CenterPanel, { CenterPanelTop, CenterPanelDonut } from "./CenterPanel";
import AdvisorList from "./AdvisorList";
import { fetchTop25Advisors, type Advisor } from "@/app/lib/fetchers";

export default function Top25AdvisorsPage() {
  const [advisors, setAdvisors] = useState<Advisor[] | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchTop25Advisors()
      .then((rows) => {
        if (!mounted) return;
        setAdvisors(rows);
        setSelectedRank(rows[0]?.rank ?? 1);
      })
      .catch((e) => {
        console.error(e);
        setAdvisors([]); // show empty state instead of crashing
      });
    return () => { mounted = false; };
  }, []);

  const chartData = useMemo(() => {
    if (!advisors) return [];
    return advisors
      .map((d, i) => ({
        display: `${String(d.rank ?? i + 1).padStart(2, "0")} ${d.name}`,
        value: Number(d.aumYTD ?? 0),
        fill: "#698D6B",
      }))
      .sort((a, b) => b.value - a.value);
  }, [advisors]);

  if (!advisors) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Header />
        <div className="mx-auto max-w-[1600px] px-8 py-8 text-slate-600">
          Loading Top 25 Advisors…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-[1600px] px-8 py-4 space-y-5">
        <KpiRow advisors={advisors} />
        {/* ≤1023px */}
        <div className="lg:hidden grid gap-6">
          <div className="col-span-2">
            <CenterPanelTop advisors={advisors} selectedRank={selectedRank ?? undefined} />
          </div>
          <div className="grid grid-cols-2 gap-4 items-start max-[640px]:grid-cols-1">
            <CenterPanelDonut advisors={advisors} selectedRank={selectedRank ?? undefined} />
            <AdvisorList
              advisors={advisors}
              selectedRank={selectedRank ?? undefined}
              onSelect={(r) => setSelectedRank(r)}
            />
          </div>
          {/* hide chart under 1024px; show only on desktop path below */}
          {/* <div className="hidden md:block"><ChartTop25Advisors data={chartData} /></div> */}
        </div>
        {/* ≥1024px */}
        <div className="hidden lg:block">
          <Layout3Col
            left={<ChartTop25Advisors data={chartData} />}
            center={<CenterPanel advisors={advisors} selectedRank={selectedRank ?? undefined} />}
            right={
              <AdvisorList
                advisors={advisors}
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
