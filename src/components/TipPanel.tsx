import { CATEGORIES } from '../constants/emissions';
import { getTip } from '../lib/tips';
import type { Category } from '../types';

interface TipPanelProps {
  topCategory: Category | null;
}

/** Surfaces the actionable tip for the user's highest-emission category. */
export function TipPanel({ topCategory }: TipPanelProps): JSX.Element {
  if (topCategory === null) {
    return (
      <section className="tip-panel" aria-labelledby="tip-heading">
        <h3 id="tip-heading">Your top tip</h3>
        <p>Log an activity to get a personalised reduction tip for your biggest source of emissions.</p>
      </section>
    );
  }

  const meta = CATEGORIES.find((category) => category.id === topCategory);

  return (
    <section className="tip-panel" aria-labelledby="tip-heading">
      <h3 id="tip-heading">Your top tip</h3>
      <p className="tip-panel__category">
        Highest-emission category: <strong>{meta ? meta.label : topCategory}</strong>
      </p>
      <p className="tip-panel__body">{getTip(topCategory)}</p>
    </section>
  );
}
