import type { ActivityEntry } from '../types';

const STORAGE_KEY = 'carbon-footprint-tracker:v1';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasNumericFields(obj: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((key) => isFiniteNumber(obj[key]));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/**
 * Structural (schema-shape) guard. Every record parsed from localStorage is run
 * through this before the app trusts it, so corrupt or hand-edited data can never
 * flow into the calculations.
 */
function isActivityEntry(value: unknown): value is ActivityEntry {
  const v = asRecord(value);
  if (v === null) return false;
  if (typeof v.id !== 'string' || typeof v.date !== 'string') return false;
  if (v.label !== undefined && typeof v.label !== 'string') return false;

  const transportation = asRecord(v.transportation);
  const energy = asRecord(v.energy);
  const food = asRecord(v.food);
  const waste = asRecord(v.waste);
  if (!transportation || !energy || !food || !waste) return false;

  return (
    hasNumericFields(transportation, ['carKm', 'busKm', 'flightKm']) &&
    hasNumericFields(energy, ['electricityKwh']) &&
    hasNumericFields(food, ['meatMeals', 'dairyMeals', 'plantMeals']) &&
    hasNumericFields(waste, ['kg'])
  );
}

/**
 * Load the saved activity log. Wrapped in try/catch with a safe empty fallback,
 * and every parsed record is validated by `isActivityEntry` before being trusted.
 */
export function loadEntries(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isActivityEntry);
  } catch {
    // Corrupt JSON or unavailable storage -> start from a safe, empty log.
    return [];
  }
}

/** Persist the activity log. Failures (quota, private mode) are swallowed safely. */
export function saveEntries(entries: ActivityEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or disabled — keep running with in-memory state only.
  }
}

/** Exposed for tests. */
export const STORAGE_KEY_FOR_TEST = STORAGE_KEY;
