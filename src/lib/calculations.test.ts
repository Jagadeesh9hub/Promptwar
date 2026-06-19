import { describe, expect, it } from 'vitest';
import { EMISSION_FACTORS } from '../constants/emissions';
import type { ActivityEntry, EnergyInput, FoodInput, TransportationInput, WasteInput } from '../types';
import {
  calcEnergy,
  calcEntryTotals,
  calcFood,
  calcTransportation,
  calcWaste,
  computeCategoryTotals,
  grandTotal,
} from './calculations';

const LARGE = 1000000;

function makeEntry(overrides: Partial<ActivityEntry> = {}): ActivityEntry {
  return {
    id: 'test',
    date: '2026-06-01',
    transportation: { carKm: 0, busKm: 0, flightKm: 0 },
    energy: { electricityKwh: 0 },
    food: { meatMeals: 0, dairyMeals: 0, plantMeals: 0 },
    waste: { kg: 0 },
    ...overrides,
  };
}

describe('calcTransportation', () => {
  it('returns 0 for all-zero input', () => {
    expect(calcTransportation({ carKm: 0, busKm: 0, flightKm: 0 })).toBe(0);
  });

  it('multiplies each mode by its emission factor', () => {
    expect(calcTransportation({ carKm: 10, busKm: 5, flightKm: 2 })).toBeCloseTo(
      10 * EMISSION_FACTORS.carKm + 5 * EMISSION_FACTORS.busKm + 2 * EMISSION_FACTORS.flightKm,
    );
  });

  it('rejects a negative value by treating it as 0', () => {
    expect(calcTransportation({ carKm: -5, busKm: 0, flightKm: 0 })).toBe(0);
  });

  it('treats missing/undefined fields as 0', () => {
    expect(calcTransportation({ carKm: 10 } as unknown as TransportationInput)).toBeCloseTo(
      10 * EMISSION_FACTORS.carKm,
    );
  });

  it('rejects NaN as 0', () => {
    expect(calcTransportation({ carKm: Number.NaN, busKm: 0, flightKm: 0 })).toBe(0);
  });

  it('handles a very large finite value without overflowing', () => {
    const result = calcTransportation({ carKm: LARGE, busKm: 0, flightKm: 0 });
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeCloseTo(LARGE * EMISSION_FACTORS.carKm);
  });
});

describe('calcEnergy', () => {
  it('returns 0 for zero input', () => {
    expect(calcEnergy({ electricityKwh: 0 })).toBe(0);
  });
  it('multiplies kWh by the grid factor', () => {
    expect(calcEnergy({ electricityKwh: 100 })).toBeCloseTo(100 * EMISSION_FACTORS.electricityKwh);
  });
  it('rejects negatives and missing fields', () => {
    expect(calcEnergy({ electricityKwh: -10 })).toBe(0);
    expect(calcEnergy({} as unknown as EnergyInput)).toBe(0);
  });
});

describe('calcFood', () => {
  it('sums each meal type by its factor', () => {
    expect(calcFood({ meatMeals: 1, dairyMeals: 1, plantMeals: 1 })).toBeCloseTo(
      EMISSION_FACTORS.meatMeals + EMISSION_FACTORS.dairyMeals + EMISSION_FACTORS.plantMeals,
    );
  });
  it('treats missing fields and negatives as 0', () => {
    expect(calcFood({ meatMeals: -3 } as unknown as FoodInput)).toBe(0);
  });
});

describe('calcWaste', () => {
  it('multiplies kg by the landfill factor', () => {
    expect(calcWaste({ kg: 4 })).toBeCloseTo(4 * EMISSION_FACTORS.wasteKg);
  });
  it('rejects negatives and missing fields', () => {
    expect(calcWaste({ kg: -1 })).toBe(0);
    expect(calcWaste({} as unknown as WasteInput)).toBe(0);
  });
});

describe('aggregate helpers', () => {
  it('computeCategoryTotals sums entries in one pass', () => {
    const entries = [
      makeEntry({ transportation: { carKm: 10, busKm: 0, flightKm: 0 } }),
      makeEntry({ energy: { electricityKwh: 100 } }),
    ];
    const totals = computeCategoryTotals(entries);
    expect(totals.transportation).toBeCloseTo(10 * EMISSION_FACTORS.carKm);
    expect(totals.energy).toBeCloseTo(100 * EMISSION_FACTORS.electricityKwh);
    expect(grandTotal(totals)).toBeCloseTo(
      10 * EMISSION_FACTORS.carKm + 100 * EMISSION_FACTORS.electricityKwh,
    );
  });

  it('returns all-zero totals for an empty log', () => {
    const totals = computeCategoryTotals([]);
    expect(grandTotal(totals)).toBe(0);
  });

  it('calcEntryTotals returns per-category values', () => {
    const totals = calcEntryTotals(makeEntry({ waste: { kg: 2 } }));
    expect(totals.waste).toBeCloseTo(2 * EMISSION_FACTORS.wasteKg);
    expect(totals.transportation).toBe(0);
  });
});
