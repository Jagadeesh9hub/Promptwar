import { describe, expect, it } from 'vitest';
import { EMISSION_FACTORS } from '../constants/emissions';
import type { ActivityEntry } from '../types';
import { aggregateTrend } from './aggregation';

function entry(date: string, carKm: number): ActivityEntry {
  return {
    id: `${date}-${carKm}`,
    date,
    transportation: { carKm, busKm: 0, flightKm: 0 },
    energy: { electricityKwh: 0 },
    food: { meatMeals: 0, dairyMeals: 0, plantMeals: 0 },
    waste: { kg: 0 },
  };
}

describe('aggregateTrend', () => {
  it('returns an empty array for no entries', () => {
    expect(aggregateTrend([], 'daily')).toEqual([]);
  });

  it('merges same-day entries into one daily bucket', () => {
    const result = aggregateTrend([entry('2026-06-01', 10), entry('2026-06-01', 5)], 'daily');
    expect(result).toHaveLength(1);
    expect(result[0].transportation).toBeCloseTo(15 * EMISSION_FACTORS.carKm);
  });

  it('keeps separate days apart and sorts them', () => {
    const result = aggregateTrend([entry('2026-06-02', 1), entry('2026-06-01', 1)], 'daily');
    expect(result.map((point) => point.period)).toEqual(['2026-06-01', '2026-06-02']);
  });

  it('groups dates in the same month when monthly', () => {
    const result = aggregateTrend([entry('2026-06-01', 1), entry('2026-06-20', 1)], 'monthly');
    expect(result).toHaveLength(1);
    expect(result[0].period).toBe('2026-06');
  });

  it('groups dates in the same ISO week when weekly', () => {
    // 2026-06-01 is a Monday; 2026-06-07 is the Sunday of the same week; 2026-06-08 is the next Monday.
    const result = aggregateTrend(
      [entry('2026-06-01', 1), entry('2026-06-07', 1), entry('2026-06-08', 1)],
      'weekly',
    );
    expect(result).toHaveLength(2);
    expect(result[0].period).toBe('2026-06-01');
  });
});
