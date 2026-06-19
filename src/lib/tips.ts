import { TIPS } from '../constants/emissions';
import type { Category, CategoryTotals } from '../types';

/**
 * Returns the category with the highest emissions, or null when there is no data.
 * Keys the tip engine off the user's ACTUAL biggest source — never a static message.
 */
export function deriveTopCategory(totals: CategoryTotals): Category | null {
  const pairs = Object.entries(totals) as Array<[Category, number]>;
  let top: Category | null = null;
  let max = 0;

  for (const [category, value] of pairs) {
    if (value > max) {
      max = value;
      top = category;
    }
  }

  return top;
}

/** The actionable reduction tip for a given category. */
export function getTip(category: Category): string {
  return TIPS[category];
}
