// Bold axis labels + number shortening used across charts

// Reuse this on both XAxis and YAxis
export const axisLabelStyle = { fontSize: 12, fontWeight: "bold" } as const;

// 60_000 -> "60K", 52_800_000 -> "52.8M", 60_000_000_000 -> "60B"
export function formatShortNumber(value: number, digits = 1): string {
  if (value === null || value === undefined || isNaN(value)) return "";
  const sign = value < 0 ? "-" : "";
  const n = Math.abs(value);

  const withTrim = (num: number) =>
    num.toFixed(digits).replace(/\.0+$|(?<=\.\d*[1-9])0+$/g, ""); // trims trailing zeros

  if (n >= 1_000_000_000) return `${sign}${withTrim(n / 1_000_000_000)}B`;
  if (n >= 1_000_000)     return `${sign}${withTrim(n / 1_000_000)}M`;
  if (n >= 1_000)         return `${sign}${withTrim(n / 1_000)}K`;
  return `${sign}${withTrim(n)}`;
}

// Currency versions (useful for labels you might add later)
export const formatCurrencyShort = (n: number, digits = 1) =>
  `$${formatShortNumber(n, digits)}`;

export function formatCurrencyFull(n: number): string {
  const sign = n < 0 ? "-" : "";
  const num = Math.abs(n);
  return `${sign}$${num.toLocaleString()}`;
}
