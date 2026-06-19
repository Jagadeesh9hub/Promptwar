import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CATEGORIES } from '../constants/emissions';
import { CHART_HEIGHT } from '../constants/ui';
import type { TrendPoint } from '../types';

interface TrendChartProps {
  data: TrendPoint[];
  /** Sentence summarizing the trend, announced to screen readers via role="img". */
  ariaLabel: string;
}

/**
 * Recharts stacked bar chart. Default-exported so it can be `React.lazy`-loaded,
 * keeping Recharts (~100KB gzipped) out of the initial bundle. The chart is
 * exposed to assistive tech as a single labelled image; the real data lives in
 * the always-present DataTable.
 */
function TrendChart({ data, ariaLabel }: TrendChartProps): JSX.Element {
  return (
    <div className="chart" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          {CATEGORIES.map((category) => (
            <Bar
              key={category.id}
              dataKey={category.id}
              name={category.label}
              stackId="emissions"
              fill={category.color}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
