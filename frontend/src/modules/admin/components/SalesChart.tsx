import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SegmentedControl } from "@/modules/admin/components/SegmentedControl";
import type { MonthlySale } from "@/modules/admin/utils/metrics";
import {
  formatMoneyCompact,
  formatMoneyRounded,
  formatNumber,
} from "@/shared/utils/format";
import "./SalesChart.css";

type Metric = "revenue" | "orders";

const metricOptions: { value: Metric; label: string }[] = [
  { value: "revenue", label: "Ingresos" },
  { value: "orders", label: "Órdenes" },
];

const BAR_COLOR = "#2c4bdb";
const BAR_DIM_COLOR = "#b9c4f3";
const CURRENT_COLOR = "#e0702e";
const GRID_COLOR = "#e2e8f0";
const TICK_COLOR = "#64748b";

type ChartTooltipProps = {
  active?: boolean;
  payload?: { payload: MonthlySale }[];
};

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const month = payload[0].payload;

  return (
    <div className="sales-chart__tooltip">
      <p className="sales-chart__tooltip-title">{month.label}</p>
      <p>
        Ingresos: <strong>{formatMoneyRounded(month.revenue)}</strong>
      </p>
      <p>
        Órdenes: <strong>{formatNumber(month.orders)}</strong>
      </p>
    </div>
  );
}

type SalesChartProps = {
  data: MonthlySale[];
};

export function SalesChart({ data }: SalesChartProps) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const [hovered, setHovered] = useState<number | null>(null);

  const total = data.reduce((sum, month) => sum + month[metric], 0);
  const best = data.reduce(
    (top, month) => (month[metric] > top[metric] ? month : top),
    data[0],
  );
  const format = (value: number) =>
    metric === "revenue" ? formatMoneyRounded(value) : formatNumber(value);

  return (
    <section aria-labelledby="sales-heading" className="sales-chart">
      <div className="sales-chart__header">
        <div>
          <h2 id="sales-heading" className="sales-chart__title">
            Ventas mensuales
          </h2>
          <p className="sales-chart__subtitle">
            Últimos 12 meses · <strong>{format(total)}</strong>
            {best && ` · Mejor mes: ${best.label}`}
          </p>
        </div>
        <SegmentedControl
          name="sales-metric"
          label="Métrica del gráfico"
          value={metric}
          options={metricOptions}
          onChange={setMetric}
        />
      </div>

      <div
        className="sales-chart__plot"
        role="img"
        aria-label={`Gráfico de barras de ${metric === "revenue" ? "ingresos" : "órdenes"} por mes`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            onMouseMove={(state) =>
              // Recharts reports the index as a string
              setHovered(
                state.activeTooltipIndex == null
                  ? null
                  : Number(state.activeTooltipIndex),
              )
            }
            onMouseLeave={() => setHovered(null)}
          >
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={8}
              tick={{ fill: TICK_COLOR, fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={64}
              tick={{ fill: TICK_COLOR, fontSize: 12 }}
              tickFormatter={(value: number) =>
                metric === "revenue"
                  ? formatMoneyCompact(value)
                  : formatNumber(value)
              }
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#eff1fb" }} />
            <Bar
              dataKey={metric}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
              animationDuration={300}
            >
              {data.map((month, index) => {
                const isCurrent = index === data.length - 1;
                const isDimmed = hovered !== null && hovered !== index;
                return (
                  <Cell
                    key={month.key}
                    fill={
                      isCurrent
                        ? CURRENT_COLOR
                        : isDimmed
                          ? BAR_DIM_COLOR
                          : BAR_COLOR
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="sales-chart__legend">
        <span className="sales-chart__legend-swatch" aria-hidden="true" />
        Mes en curso
      </p>
    </section>
  );
}
