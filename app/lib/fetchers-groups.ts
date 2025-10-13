// app/lib/fetchers-groups.ts
type AnyNum = number | string | null | undefined;

const n = (v: AnyNum): number => {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v).replace(/[^0-9.-]/g, "");
  const num = Number(s);
  return Number.isFinite(num) ? num : 0;
};

/** Normalized shape the UI expects everywhere */
export type GroupRow = {
  rank?: number | null;
  group: string;
  leadAdvisor?: string | null;

  // normalized keys:
  aum2024: number;  // from aumPrev if present
  aumYTD: number;

  gainDollar?: number; // optional if you want to use precomputed
  gainPct?: number;    // decimal (0.15 = 15%)
};

/** map raw to normalized */
function normalize(raw: any): GroupRow {
  // accept either aumPrev or aum2024 (future-proof)
  const aum2024 = n(raw.aumPrev ?? raw.aum2024);
  const aumYTD  = n(raw.aumYTD);

  // keep provided gainDollar/gainPct if present; otherwise derive
  const diff    = aumYTD - aum2024;
  const pct     = aum2024 ? diff / aum2024 : 0;

  return {
    rank: raw.rank ?? null,
    group: String(raw.group ?? ""),
    leadAdvisor: raw.leadAdvisor ?? null,
    aum2024,
    aumYTD,
    gainDollar: raw.gainDollar != null ? n(raw.gainDollar) : diff,
    gainPct: raw.gainPct != null ? Number(raw.gainPct) : pct,
  };
}

export async function fetchAllGroups(): Promise<GroupRow[]> {
  const res = await fetch("/data/all-groups.json", { cache: "no-store" });
  const json = await res.json();
  const rows: GroupRow[] = Array.isArray(json) ? json.map(normalize) : [];

  // sort by rank if provided, else by YTD desc
  rows.sort((a, b) => {
    if (a.rank != null && b.rank != null) return a.rank - b.rank;
    return b.aumYTD - a.aumYTD;
  });

  return rows;
}

export async function fetchTop25Groups(): Promise<any[]> {
  const res = await fetch("/data/top25-groups.json", { cache: "no-store" });
  const data = await res.json();

  return data.map((g: any) => ({
    rank: g.rank ?? null,
    group: g.group ?? "",
    leadAdvisor: g.leadAdvisor ?? "",
    // Normalize to consistent keys
    aum2024: g.aum2024 ?? g.aumPrev ?? 0,
    aumYTD: g.aumYTD ?? g["aumYTD"] ?? 0,
    gainDollar: g.gainDollar ?? g.gainLoss$ ?? (g.aumYTD ?? 0) - (g.aumPrev ?? 0),
    gainPct:
      g.gainPct ??
      (g.aumPrev ? ((g.aumYTD ?? 0) - (g.aumPrev ?? 0)) / g.aumPrev : 0),
  }));
}

