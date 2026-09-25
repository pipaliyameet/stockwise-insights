import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
} from "recharts";
import { AXIS, ChartFrame, GRID_STROKE, SERIES_COLORS, TOOLTIP_STYLE } from "./chartTheme";
import { formatCompact, formatShortDate } from "@/utils/format";

export function NormalizedComparisonChart({
  data,
  symbols,
  height = 320,
}: {
  data: Record<string, number | string>[];
  symbols: string[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          {...AXIS}
          tickFormatter={(v) => formatShortDate(String(v))}
          minTickGap={28}
        />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${v}%`} width={50} />
        <Tooltip
          {...TOOLTIP_STYLE}
          labelFormatter={(l) => formatShortDate(String(l))}
          formatter={(v: number, n) => [`${Number(v).toFixed(2)}%`, String(n)]}
        />
        <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
        {symbols.map((s, i) => (
          <Line
            key={s}
            type="monotone"
            dataKey={s}
            stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ChartFrame>
  );
}

export function ComparisonBarChart({
  data,
  dataKey,
  label,
  formatter,
  height = 280,
}: {
  data: { symbol: string; [k: string]: number | string }[];
  dataKey: string;
  label: string;
  formatter?: ((v: number) => string) | undefined;
  height?: number;
}) {
  const fmt = formatter ?? ((v: number) => formatCompact(v));
  return (
    <ChartFrame height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="symbol" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v: number) => fmt(v)} width={55} />
        <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [fmt(Number(v)), label]} />
        <Bar dataKey={dataKey} name={label} radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={String(d.symbol)} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}
