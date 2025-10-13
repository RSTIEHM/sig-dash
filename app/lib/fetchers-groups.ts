// app/lib/fetchers-groups.ts
export type GroupRow = {
  rank: number | null;             // <-- not optional anymore
  group: string;
  leadAdvisor?: string | null;
  aum2024: number;
  aumYTD: number;
  gainDollar: number;
  gainPct: number;                 // decimal (0.157 = 15.7%)
};

const n = (v: any): number => {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v).replace(/[^0-9.-]/g, "");
  const num = Number(s);
  return Number.isFinite(num) ? num : 0;
};

function normalize(g: any, i: number): GroupRow {
  const aum2024 = n(g.aum2024 ?? g.aumPrev);
  const aumYTD  = n(g.aumYTD);
  const gainDollar = n(g.gainDollar ?? (aumYTD - aum2024));
  const gainPct    = aum2024 ? gainDollar / aum2024 : 0;

  return {
    rank: g.rank ?? i + 1,                 // <-- always provide a number
    group: String(g.group ?? ""),
    leadAdvisor: g.leadAdvisor ?? null,
    aum2024,
    aumYTD,
    gainDollar,
    gainPct,
  };
}

export async function fetchTop25Groups(): Promise<GroupRow[]> {
  const res = await fetch("/data/top25-groups.json", { cache: "no-store" });
  const data = (await res.json()) ?? [];
  const rows = data.map((g: any, i: number) => normalize(g, i));
  rows.sort((a, b) => a.rank! - b.rank!);
  return rows;
}

export async function fetchAllGroups(): Promise<GroupRow[]> {
  const res = await fetch("/data/all-groups.json", { cache: "no-store" });
  const data = (await res.json()) ?? [];
  const rows = data.map((g: any, i: number) => normalize(g, i));
  rows.sort((a, b) => a.rank! - b.rank!);
  return rows;
}
