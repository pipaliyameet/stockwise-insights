export function formatINR(value: number | null | undefined, decimals = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatNumber(value: number | null | undefined, decimals = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCompact(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1e7) return `${(value / 1e7).toFixed(2)} Cr`;
  if (Math.abs(value) >= 1e5) return `${(value / 1e5).toFixed(2)} L`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString("en-IN");
}

export function formatPercent(value: number | null | undefined, decimals = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatSigned(value: number | null | undefined, decimals = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}₹${Math.abs(value).toFixed(decimals)}`;
}

export function formatDate(
  date: string | Date,
  opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" },
) {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00Z`) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { ...opts, timeZone: "UTC" }).format(d);
}

export function formatShortDate(date: string) {
  return formatDate(date, { day: "2-digit", month: "short" });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function toCsv(rows: Record<string, unknown>[], columns?: string[]) {
  if (!rows.length) return "";
  const cols = columns ?? Object.keys(rows[0]!);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => escape(r[c])).join(","))].join("\n");
}

export function downloadFile(content: string, filename: string, mime = "text/csv;charset=utf-8;") {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as Error).message === "string"
  ) {
    const msg = (err as Error).message;
    // Never surface raw JS runtime errors to end users.
    if (/undefined|null|NaN|TypeError|ReferenceError|Cannot read/i.test(msg)) return fallback;
    return msg;
  }
  return fallback;
}
