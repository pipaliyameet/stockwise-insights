import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { AXIS, ChartFrame, GRID_STROKE, SERIES_COLORS, TOOLTIP_STYLE } from "./chartTheme";
import type { Candle } from "@/data/mockData";
import { formatCompact, formatShortDate } from "@/utils/format";

const priceTick = (v: number) => `₹${Math.round(v)}`;

export type PriceSeriesKey = "close" | "open" | "high" | "low";

const SERIES_META: Record<PriceSeriesKey, { label: string; color: string }> = {
  close: { label: "Close", color: "#3b82f6" },
  open: { label: "Open", color: "#10b981" },
  high: { label: "High", color: "#f59e0b" },
  low: { label: "Low", color: "#ef4444" },
};

export function PriceLineChart({
  data,
  series,
  height = 320,
}: {
  data: Candle[];
  series: PriceSeriesKey[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" {...AXIS} tickFormatter={formatShortDate} minTickGap={28} />
        <YAxis {...AXIS} domain={["auto", "auto"]} tickFormatter={priceTick} width={55} />
        <Tooltip
          {...TOOLTIP_STYLE}
          labelFormatter={(l) => formatShortDate(String(l))}
          formatter={(v: number, n) => [`₹${Number(v).toFixed(2)}`, String(n)]}
        />
        <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
        {series.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={SERIES_META[key].label}
            stroke={SERIES_META[key].color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ChartFrame>
  );
}

export function OhlcChart({ data, height = 300 }: { data: Candle[]; height?: number }) {
  const trimmed = data.slice(-60);
  return (
    <ChartFrame height={height}>
      <ComposedChart data={trimmed} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" {...AXIS} tickFormatter={formatShortDate} minTickGap={28} />
        <YAxis {...AXIS} domain={["auto", "auto"]} tickFormatter={priceTick} width={55} />
        <Tooltip {...TOOLTIP_STYLE} labelFormatter={(l) => formatShortDate(String(l))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="high"
          name="High"
          stroke="#f59e0b"
          dot={false}
          strokeWidth={1.5}
        />
        <Line
          type="monotone"
          dataKey="low"
          name="Low"
          stroke="#ef4444"
          dot={false}
          strokeWidth={1.5}
        />
        <Line
          type="monotone"
          dataKey="open"
          name="Open"
          stroke="#10b981"
          dot={false}
          strokeWidth={1.5}
        />
        <Line
          type="monotone"
          dataKey="close"
          name="Close"
          stroke="#3b82f6"
          dot={false}
          strokeWidth={2.5}
        />
      </ComposedChart>
    </ChartFrame>
  );
}

export function VolumeChart({ data, height = 240 }: { data: Candle[]; height?: number }) {
  const trimmed = data.slice(-90);
  return (
    <ChartFrame height={height}>
      <BarChart data={trimmed} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" {...AXIS} tickFormatter={formatShortDate} minTickGap={28} />
        <YAxis {...AXIS} tickFormatter={(v: number) => formatCompact(v)} width={55} />
        <Tooltip
          {...TOOLTIP_STYLE}
          labelFormatter={(l) => formatShortDate(String(l))}
          formatter={(v: number) => [formatCompact(Number(v)), "Volume"]}
        />
        <Bar dataKey="volume" name="Volume" radius={[3, 3, 0, 0]}>
          {trimmed.map((c, i) => (
            <Cell
              key={c.date}
              fill={c.close >= (trimmed[i - 1]?.close ?? c.open) ? "#10b981" : "#ef4444"}
              fillOpacity={0.65}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}

export function MovingAverageChart({
  data,
  window,
  height = 300,
}: {
  data: { date: string; close: number; ma: number | null }[];
  window: number;
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="maFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" {...AXIS} tickFormatter={formatShortDate} minTickGap={28} />
        <YAxis {...AXIS} domain={["auto", "auto"]} tickFormatter={priceTick} width={55} />
        <Tooltip {...TOOLTIP_STYLE} labelFormatter={(l) => formatShortDate(String(l))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="close"
          name="Close"
          stroke="#3b82f6"
          fill="url(#maFill)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="ma"
          name={`${window}-Day MA`}
          stroke="#f59e0b"
          strokeWidth={2.5}
          dot={false}
          connectNulls
        />
      </AreaChart>
    </ChartFrame>
  );
}

export function CloseHistogram({
  data,
  height = 280,
}: {
  data: { bin: string; rangeLabel: string; count: number }[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="bin" {...AXIS} />
        <YAxis {...AXIS} width={40} />
        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={(v: number, _n, p) => [
            `${v} days`,
            (p?.payload as { rangeLabel?: string })?.rangeLabel ?? "Range",
          ]}
        />
        <Bar dataKey="count" name="Frequency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartFrame>
  );
}

export function OpenCloseScatter({
  data,
  height = 300,
}: {
  data: { open: number; close: number }[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="open"
          name="Open"
          {...AXIS}
          domain={["auto", "auto"]}
          tickFormatter={priceTick}
        />
        <YAxis
          type="number"
          dataKey="close"
          name="Close"
          {...AXIS}
          domain={["auto", "auto"]}
          tickFormatter={priceTick}
          width={55}
        />
        <ZAxis range={[28, 28]} />
        <Tooltip
          {...TOOLTIP_STYLE}
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(v: number, n) => [`₹${Number(v).toFixed(2)}`, String(n)]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Scatter name="Open vs Close" data={data} fill="#3b82f6" fillOpacity={0.65} />
      </ScatterChart>
    </ChartFrame>
  );
}

export function AveragesBarChart({
  data,
  height = 280,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" {...AXIS} />
        <YAxis {...AXIS} domain={["auto", "auto"]} tickFormatter={priceTick} width={55} />
        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={(v: number) => [`₹${Number(v).toFixed(2)}`, "Average"]}
        />
        <Bar dataKey="value" name="Average price" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={d.label} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}

export function PredictionVsActualChart({
  data,
  height = 300,
}: {
  data: { date: string; actual: number; predicted: number }[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" {...AXIS} tickFormatter={formatShortDate} minTickGap={28} />
        <YAxis {...AXIS} domain={["auto", "auto"]} tickFormatter={priceTick} width={55} />
        <Tooltip
          {...TOOLTIP_STYLE}
          labelFormatter={(l) => formatShortDate(String(l))}
          formatter={(v: number, n) => [`₹${Number(v).toFixed(2)}`, String(n)]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="predicted"
          name="Model estimate"
          stroke="#8b5cf6"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
        />
      </LineChart>
    </ChartFrame>
  );
}

export function ResidualPlot({
  data,
  height = 280,
}: {
  data: { index: number; residual: number }[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
        <XAxis type="number" dataKey="index" name="Sample" {...AXIS} />
        <YAxis type="number" dataKey="residual" name="Residual" {...AXIS} width={55} />
        <ReferenceLine y={0} stroke="rgba(156, 163, 175, 0.6)" strokeDasharray="4 4" />
        <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter name="Residual" data={data} fill="#ef4444" fillOpacity={0.7} />
      </ScatterChart>
    </ChartFrame>
  );
}

export function ActualVsPredictedScatter({
  data,
  height = 300,
}: {
  data: { actual: number; predicted: number }[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="actual"
          name="Actual"
          {...AXIS}
          domain={["auto", "auto"]}
          tickFormatter={priceTick}
        />
        <YAxis
          type="number"
          dataKey="predicted"
          name="Predicted"
          {...AXIS}
          domain={["auto", "auto"]}
          tickFormatter={priceTick}
          width={55}
        />
        <Tooltip
          {...TOOLTIP_STYLE}
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(v: number, n) => [`₹${Number(v).toFixed(2)}`, String(n)]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Scatter name="Test samples" data={data} fill="#10b981" fillOpacity={0.7} />
      </ScatterChart>
    </ChartFrame>
  );
}
