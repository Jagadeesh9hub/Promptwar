import {
  DATE_KEY_LENGTH,
  MONDAY_INDEX,
  MONDAY_OFFSET_FROM_SUNDAY,
  MONTH_KEY_LENGTH,
  SUNDAY_INDEX,
} from '../constants/time';
import { calcEntryTotals } from './calculations';
import type { ActivityEntry, Granularity, TrendPoint } from '../types';

function dayKey(date: string): string {
  return date.slice(0, DATE_KEY_LENGTH);
}

function monthKey(date: string): string {
  return date.slice(0, MONTH_KEY_LENGTH);
}

/** Returns the ISO date of the Monday that starts the week containing `date`. */
function weekKey(date: string): string {
  const d = new Date(`${date.slice(0, DATE_KEY_LENGTH)}T00:00:00Z`);
  const day = d.getUTCDay();
  const offset = day === SUNDAY_INDEX ? MONDAY_OFFSET_FROM_SUNDAY : MONDAY_INDEX - day;
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, DATE_KEY_LENGTH);
}

function keyFor(date: string, granularity: Granularity): string {
  if (granularity === 'daily') return dayKey(date);
  if (granularity === 'weekly') return weekKey(date);
  return monthKey(date);
}

function labelFor(period: string, granularity: Granularity): string {
  return granularity === 'weekly' ? `Week of ${period}` : period;
}

/**
 * Aggregate entries into trend buckets in a single O(n) pass.
 *
 * A Map provides O(1) bucket lookup, so the loop touches each entry exactly once
 * with no nested iteration. The final sort runs only over the (typically small)
 * set of distinct periods, keeping aggregation linear in the number of entries.
 */
export function aggregateTrend(entries: ActivityEntry[], granularity: Granularity): TrendPoint[] {
  const buckets = new Map<string, TrendPoint>();

  for (const entry of entries) {
    const period = keyFor(entry.date, granularity);
    const totals = calcEntryTotals(entry);
    const entryTotal = totals.transportation + totals.energy + totals.food + totals.waste;
    const existing = buckets.get(period);

    if (existing) {
      existing.transportation += totals.transportation;
      existing.energy += totals.energy;
      existing.food += totals.food;
      existing.waste += totals.waste;
      existing.total += entryTotal;
    } else {
      buckets.set(period, {
        period,
        label: labelFor(period, granularity),
        transportation: totals.transportation,
        energy: totals.energy,
        food: totals.food,
        waste: totals.waste,
        total: entryTotal,
      });
    }
  }

  return Array.from(buckets.values()).sort((a, b) => (a.period < b.period ? -1 : 1));
}
