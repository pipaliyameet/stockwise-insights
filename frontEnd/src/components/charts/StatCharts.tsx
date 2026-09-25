import type { BoxStats } from "@/data/mockData";

const BOX_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

/**
 * Lightweight SVG box plot (Recharts has no native box plot).
 * Mirrors the matplotlib box plot from the Python EDA stage.
 */
export function BoxPlot({ data, height = 300 }: { data: BoxStats[]; height?: number }) {
  if (!data.length) return null;
  const all = data.flatMap((d) => [d.min, d.max, ...d.outliers]);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const pad = (max - min) * 0.08 || 1;
  const lo = min - pad;
  const hi = max + pad;

  const chartHeight = height;
  const top = 16;
  const bottom = chartHeight - 34;
  const y = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top);
  const colWidth = 100 / data.length;
  const boxWidth = Math.min(52, (colWidth / 100) * 420 * 0.45);

  const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 560 ${chartHeight}`}
        className="h-auto w-full min-w-[320px]"
        role="img"
        aria-label="Box plot of price columns"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={54}
              x2={556}
              y1={y(t)}
              y2={y(t)}
              stroke="rgba(156, 163, 175, 0.2)"
              strokeDasharray="3 3"
            />
            <text x={48} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              ₹{Math.round(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = 54 + ((i + 0.5) / data.length) * (556 - 54);
          const color = BOX_COLORS[i % BOX_COLORS.length];
          return (
            <g key={d.label}>
              <line x1={cx} x2={cx} y1={y(d.max)} y2={y(d.q3)} stroke={color} strokeWidth={1.5} />
              <line x1={cx} x2={cx} y1={y(d.q1)} y2={y(d.min)} stroke={color} strokeWidth={1.5} />
              <line
                x1={cx - boxWidth / 3}
                x2={cx + boxWidth / 3}
                y1={y(d.max)}
                y2={y(d.max)}
                stroke={color}
                strokeWidth={1.5}
              />
              <line
                x1={cx - boxWidth / 3}
                x2={cx + boxWidth / 3}
                y1={y(d.min)}
                y2={y(d.min)}
                stroke={color}
                strokeWidth={1.5}
              />
              <rect
                x={cx - boxWidth / 2}
                y={y(d.q3)}
                width={boxWidth}
                height={Math.max(2, y(d.q1) - y(d.q3))}
                fill={color}
                fillOpacity={0.25}
                stroke={color}
                strokeWidth={1.5}
                rx={3}
              >
                <title>{`${d.label}: min ${d.min}, Q1 ${d.q1}, median ${d.median}, Q3 ${d.q3}, max ${d.max}`}</title>
              </rect>
              <line
                x1={cx - boxWidth / 2}
                x2={cx + boxWidth / 2}
                y1={y(d.median)}
                y2={y(d.median)}
                stroke={color}
                strokeWidth={2.5}
              />
              {d.outliers.map((o, oi) => (
                <circle
                  key={`${o}-${oi}`}
                  cx={cx}
                  cy={y(o)}
                  r={2.5}
                  fill={color}
                  fillOpacity={0.6}
                />
              ))}
              <text x={cx} y={chartHeight - 10} textAnchor="middle" fontSize="11" fill="#94a3b8">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function CorrelationHeatmap({
  data,
}: {
  data: { row: string; values: { col: string; value: number }[] }[];
}) {
  const cols = data[0]?.values.map((v) => v.col) ?? [];
  const color = (v: number) => {
    const intensity = Math.min(1, Math.abs(v));
    return v >= 0
      ? `rgba(59, 130, 246, ${Math.max(0.15, intensity * 0.85)})`
      : `rgba(239, 68, 68, ${Math.max(0.15, intensity * 0.85)})`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[320px] border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="w-16" />
            {cols.map((c) => (
              <th key={c} className="pb-1 font-medium text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.row}>
              <th className="pr-2 text-right font-medium text-muted-foreground">{row.row}</th>
              {row.values.map((cell) => (
                <td
                  key={cell.col}
                  className="rounded-md px-2 py-2.5 text-center num font-semibold"
                  style={{
                    background: color(cell.value),
                    color: Math.abs(cell.value) > 0.5 ? "#ffffff" : "var(--color-foreground)",
                  }}
                  title={`${row.row} vs ${cell.col}: ${cell.value}`}
                >
                  {cell.value.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ConfusionMatrix({
  matrix,
}: {
  matrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
}) {
  const cells = [
    {
      label: "True UP",
      value: matrix.truePositive,
      tone: "success" as const,
      hint: "Predicted UP · Actual UP",
    },
    {
      label: "False UP",
      value: matrix.falsePositive,
      tone: "danger" as const,
      hint: "Predicted UP · Actual DOWN",
    },
    {
      label: "False DOWN",
      value: matrix.falseNegative,
      tone: "danger" as const,
      hint: "Predicted DOWN · Actual UP",
    },
    {
      label: "True DOWN",
      value: matrix.trueNegative,
      tone: "success" as const,
      hint: "Predicted DOWN · Actual DOWN",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {cells.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-border p-4"
          style={{
            background:
              c.tone === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
          }}
        >
          <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold num">{c.value}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{c.hint}</p>
        </div>
      ))}
    </div>
  );
}
