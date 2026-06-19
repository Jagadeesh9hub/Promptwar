import { calcEntryTotals, grandTotal } from '../lib/calculations';
import { DISPLAY_DECIMALS } from '../constants/ui';
import type { ActivityEntry, Category, CategoryTotals } from '../types';
import { CategoryBreakdown } from './CategoryBreakdown';
import { TipPanel } from './TipPanel';
import { TrendSection } from './TrendSection';

interface DashboardProps {
  entries: ActivityEntry[];
  totals: CategoryTotals;
  total: number;
  topCategory: Category | null;
  onRemove: (id: string) => void;
}

export function Dashboard({ entries, totals, total, topCategory, onRemove }: DashboardProps): JSX.Element {
  return (
    <section className="dashboard" aria-labelledby="dashboard-heading">
      <h2 id="dashboard-heading">Your footprint</h2>

      <p className="grand-total">
        <span className="grand-total__value">{total.toFixed(DISPLAY_DECIMALS)}</span>
        <span className="grand-total__unit"> kg CO₂e total</span>
      </p>

      <TipPanel topCategory={topCategory} />
      <CategoryBreakdown totals={totals} total={total} />
      <TrendSection entries={entries} />

      <section className="history" aria-labelledby="history-heading">
        <h3 id="history-heading">Recent entries</h3>
        {entries.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          <ul className="entry-list">
            {[...entries].reverse().map((entry) => (
              <li key={entry.id} className="entry">
                <span className="entry__date">{entry.date}</span>
                {entry.label ? <span className="entry__note">{entry.label}</span> : null}
                <span className="entry__total">
                  {grandTotal(calcEntryTotals(entry)).toFixed(DISPLAY_DECIMALS)} kg
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove entry from ${entry.date}`}
                  onClick={() => onRemove(entry.id)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
