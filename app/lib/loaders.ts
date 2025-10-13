// app/lib/loaders.ts
import data from "@/public/data/top25-advisors.json";

export type Advisor = {
  rank: number | null;
  name: string | null;
  group: string | null;
  aum?: number | null; // using 12/31/24 for now
  gainLoss$?: number | null;
  gainLossPct?: number | null; // decimal (e.g., 0.174) or percent (0.174 == 17.4%)
};


export function getTop25Advisors() {
  return data;
}