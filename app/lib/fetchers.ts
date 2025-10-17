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


// ---------------- Weekly Biz: types ----------------
export type MonthlyPoint = { m: string; area: number; line: number } // area=2024, line=2025 (raw integers)
export type TableRow = { month: string; y2024: number; y2025: number }
export type PendingRow = { carrier: string; value: number }

// export type BizPack = {
//   monthly: MonthlyPoint[]      // normalized dollars from JSON
//   table: TableRow[]            // normalized dollars from JSON
//   pending: PendingRow[]        // normalized dollars from JSON
// }

// export type WeeklyBizData = {
//   annuities: BizPack
//   life: BizPack
// }

// --- Weekly Biz Report Types ---
export type BizPack = {
  monthly: { m: string; area: number; line: number }[];
  table: { month: string; y2024: number; y2025: number }[];
  pending: { carrier: string; value: number }[];
};

export type WeeklyBizData = {
  annuities: BizPack;
  life: BizPack;
};

// ---------------- Weekly Biz: fetcher ----------------
// Client-safe: relative fetch (same as other pages). No caching for “latest weekly”.
export async function fetchWeeklyBiz(signal?: AbortSignal): Promise<WeeklyBizData> {
  const res = await fetch("/data/weekly-biz.json", { cache: "no-store", signal })
  if (!res.ok) throw new Error(`Failed to load /data/weekly-biz.json (${res.status})`)
  const json = (await res.json()) as WeeklyBizData
  return json
}

// ---------------- Chart helpers ----------------

/**
 * For Recharts Stacked Area chart using 2024 vs 2025 on the same month axis.
 * Returns rows like: { m: 'Jan', y2024: number, y2025: number }
 * Prefers the `table` (ground truth). Falls back to `monthly` if needed.
 */
export function toStackedAreaRows(pack: BizPack): Array<{ m: string; y2024: number; y2025: number }> {
  if (pack.table?.length) {
    return pack.table.map(r => ({
      m: r.month?.slice(0,3) || "",
      y2024: Number(r.y2024 || 0),
      y2025: Number(r.y2025 || 0),
    }))
  }
  // fallback from `monthly` if table missing
  return (pack.monthly || []).map(p => ({
    m: p.m,
    y2024: Number(p.area || 0),
    y2025: Number(p.line || 0),
  }))
}

/**
 * Pending → line-series points. We’ll sort by value desc and add an index-based x,
 * so you can feed a simple <LineChart dataKey="value" /> or switch to bars easily.
 * Rows: { x: number, label: string, value: number }
 */
export function toPendingLineSeries(pending: PendingRow[]): Array<{ x: number; label: string; value: number }> {
  const sorted = [...(pending || [])].sort((a,b) => (b?.value || 0) - (a?.value || 0))
  return sorted.map((row, idx) => ({
    x: idx + 1,
    label: row.carrier,
    value: Number(row.value || 0),
  }))
}

/**
 * Convenience: totals for KPI tiles.
 */
export function sumPending(pending: PendingRow[]): number {
  return (pending || []).reduce((acc, r) => acc + Number(r.value || 0), 0)
}
export function sumMonthlyArea(pack: BizPack): number {
  return (pack.monthly || []).reduce((acc, r) => acc + Math.max(0, Number(r.area || 0)), 0)
}

export function isAbortError(err: unknown): boolean {
  return !!(
    err &&
    typeof err === "object" &&
    // @ts-ignore
    (err.name === "AbortError" || (err as any).code === "ERR_CANCELED")
  );
}

export function toPendingBars(pending: PendingRow[]): Array<{ carrier: string; value: number }> {
  return [...(pending || [])]
    .map(p => ({ carrier: p.carrier, value: Number(p.value || 0) }))
    .sort((a, b) => b.value - a.value);
}



export type MonthlyRecord = {
  m: string;       // Month abbreviation
  y2024: number;   // 2024 value
  y2025: number;   // 2025 value
};

export async function fetchWeeklyBizData(): Promise<{
  annuities: MonthlyRecord[];
  life: MonthlyRecord[];
}> {
  try {
    const res = await fetch("/data/weekly-biz.json");
    if (!res.ok) throw new Error("Failed to fetch Weekly Biz data");
    return res.json();
  } catch (err) {
    console.error("Error loading Weekly Biz JSON:", err);
    return { annuities: [], life: [] };
  }
}



// --- Weekly advisor drilldown data types ---
type WeeklyPoint =
  | number
  | { w?: number; week?: number; v?: number; value?: number };
export type WeeklyAdvisor = {
  id: string;
  name: string;
  weekly: { w: number; v: number }[];
};

// Coerce any weekly point to a number
const pointToNumber = (p: WeeklyPoint): number => {
  if (typeof p === "number") return p;
  const n = Number(p?.value ?? p?.v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export type WeeklySeries = { advisors: WeeklyAdvisor[] };

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, { signal, next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json() as Promise<T>;
}

export async function fetchWeeklySeries(
  kind: "life" | "annuities",
  signal?: AbortSignal
): Promise<WeeklySeries> {
  return fetchJson<WeeklySeries>(`/data/weekly-${kind}.json`, signal);
}

// helpers
export const sumAdvisorYTD = (a?: WeeklyAdvisor) =>
  (a?.weekly ?? []).reduce((sum, p) => sum + pointToNumber(p), 0);

// export const formatUSD = (n: number) =>
//   n >= 1_000_000
//     ? `$${(n / 1_000_000).toFixed(1)}M`
//     : n >= 1_000
//     ? `$${(n / 1_000).toFixed(1)}K`
//     : `$${n.toLocaleString()}`;

export const formatUSD = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : `$${Math.round(n).toLocaleString("en-US")}`;