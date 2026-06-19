import { Suspense, lazy, useMemo, useState } from 'react';
import { aggregateTrend } from '../lib/aggregation';
import type { ActivityEntry, Granularity, TrendPoint } from '../types';
import { DataTable } from './DataTable';
import { VisuallyHidden } from './VisuallyHidden';

// Code-split: Recharts is only fetched when this chunk first renders.
const TrendChart = lazy(() => import('./TrendChart'));

const GRANULARITIES: ReadonlyArray<{ id: Granularity; label: string }> = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Builds the plain-language trend summary used as the chart's accessible name. */
function buildSummary(data: TrendPoint[], granularity: Granularity): string {
  if (data.length === 0) return 'No emissions data yet.';
  const first = data[0];
  const last = data[data.length - 1];
  let direction = 'steady';
  if (last.total > first.total) direction = 'rising';
  else if (last.total < first.total) direction = 'falling';
  return `${capitalize(granularity)} CO2e emissions from ${first.label} to ${last.label}, currently ${direction}.`;
}

interface TrendSectionProps {
  entries: ActivityEntry[];
}

export function TrendSection({ entries }: TrendSectionProps): JSX.Element {
  const [granularity, setGranularity] = useState<Granularity>('daily');
  const data = useMemo(() => aggregateTrend(entries, granularity), [entries, granularity]);
  const summary = useMemo(() => buildSummary(data, granularity), [data, granularity]);

  return (
    <section className="trend" aria-labelledby="trend-heading">
      <h3 id="trend-heading">Emissions trend</h3>

      <div className="toggle" role="group" aria-label="Trend granularity">
        {GRANULARITIES.map((option) => (
          <button
            key={option.id}
            type="button"
            className="toggle__btn"
            aria-pressed={granularity === option.id}
            onClick={() => setGranularity(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <p>No data yet — log an activity to see your trend.</p>
      ) : (
        <>
          <Suspense fallback={<p className="chart-loading">Loading chart…</p>}>
            <TrendChart data={data} ariaLabel={summary} />
          </Suspense>
          <VisuallyHidden>The chart above is also available as the data table below.</VisuallyHidden>
          <DataTable data={data} caption={`${summary} (data table)`} />
        </>
      )}
    </section>
  );
}
