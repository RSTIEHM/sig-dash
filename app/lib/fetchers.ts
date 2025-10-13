// app/lib/fetchers.ts
export type Advisor = {
  rank: number | null;
  name: string;
  group: string;
  aumPrev: number;
  aumYTD: number;
  gainDollar: number;
  gainPct: number;
};

export async function fetchTop25Advisors(): Promise<Advisor[]> {
  const res = await fetch("/data/top25-advisors.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load /data/top25-advisors.json");
  return res.json();
}

export async function fetchKpis(): Promise<any> {
  const res = await fetch("/data/kpis.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load /data/kpis.json");
  return res.json();
}
