import type { ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

/** Shared chart theming so every chart looks crisp & identical across all devices and browsers. */
export const AXIS = {
  stroke: "rgba(156, 163, 175, 0.6)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

export const GRID_STROKE = "rgba(156, 163, 175, 0.15)";

export const TOOLTIP_STYLE = {
  contentStyle: {
    background: "var(--color-card, #1e293b)",
    border: "1px solid var(--color-border, rgba(255,255,255,0.1))",
    borderRadius: "10px",
    fontSize: "12px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
    color: "var(--color-card-foreground, #f8fafc)",
  },
  labelStyle: { color: "#94a3b8", marginBottom: 4, fontWeight: 600 },
  itemStyle: { color: "var(--color-card-foreground, #f8fafc)" },
} as const;

export const SERIES_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

/** Universal 100% fluid responsive chart frame wrapper */
export function ChartFrame({
  height = 300,
  minWidth,
  children,
}: {
  height?: number;
  minWidth?: number | undefined;
  children: ReactNode;
}) {
  return (
    <div className="w-full relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as never}
      </ResponsiveContainer>
    </div>
  );
}
