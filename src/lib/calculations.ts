import { EMISSION_FACTORS } from '../constants/emissions';
import type {
  ActivityEntry,
  CategoryTotals,
  EnergyInput,
  FoodInput,
  TransportationInput,
  WasteInput,
} from '../types';

/**
 * Coerce an incoming numeric value into a safe, non-negative, finite number.
 *
 * This single guard handles every calculation edge case the challenge calls for:
 *   - missing / undefined fields  -> 0
 *   - NaN or non-numeric          -> 0
 *   - Infinity / -Infinity        -> 0
 *   - negative amounts (rejected) -> 0  (a negative activity amount is meaningless)
 * A "very large" but finite value passes through unchanged and multiplies normally.
 */
function safe(value: number | undefined | null): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

export function calcTransportation(input: TransportationInput): number {
  return (
    safe(input?.carKm) * EMISSION_FACTORS.carKm +
    safe(input?.busKm) * EMISSION_FACTORS.busKm +
    safe(input?.flightKm) * EMISSION_FACTORS.flightKm
  );
}

export function calcEnergy(input: EnergyInput): number {
  return safe(input?.electricityKwh) * EMISSION_FACTORS.electricityKwh;
}

export function calcFood(input: FoodInput): number {
  return (
    safe(input?.meatMeals) * EMISSION_FACTORS.meatMeals +
    safe(input?.dairyMeals) * EMISSION_FACTORS.dairyMeals +
    safe(input?.plantMeals) * EMISSION_FACTORS.plantMeals
  );
}

export function calcWaste(input: WasteInput): number {
  return safe(input?.kg) * EMISSION_FACTORS.wasteKg;
}

/** Per-category CO2e for a single entry. */
export function calcEntryTotals(entry: ActivityEntry): CategoryTotals {
  return {
    transportation: calcTransportation(entry.transportation),
    energy: calcEnergy(entry.energy),
    food: calcFood(entry.food),
    waste: calcWaste(entry.waste),
  };
}

export function addTotals(a: CategoryTotals, b: CategoryTotals): CategoryTotals {
  return {
    transportation: a.transportation + b.transportation,
    energy: a.energy + b.energy,
    food: a.food + b.food,
    waste: a.waste + b.waste,
  };
}

const EMPTY_TOTALS: CategoryTotals = { transportation: 0, energy: 0, food: 0, waste: 0 };

/**
 * Sum every entry into per-category totals in a single O(n) pass.
 * `reduce` visits each entry exactly once; there are no nested loops.
 */
export function computeCategoryTotals(entries: ActivityEntry[]): CategoryTotals {
  return entries.reduce<CategoryTotals>(
    (acc, entry) => addTotals(acc, calcEntryTotals(entry)),
    { ...EMPTY_TOTALS },
  );
}

/** Grand total across all categories. */
export function grandTotal(totals: CategoryTotals): number {
  return totals.transportation + totals.energy + totals.food + totals.waste;
}
