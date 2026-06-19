import { describe, expect, it } from 'vitest';
import type { ActivityEntry } from '../types';
import { STORAGE_KEY_FOR_TEST, loadEntries, saveEntries } from './storage';

const valid: ActivityEntry = {
  id: 'a',
  date: '2026-06-01',
  label: 'Commute',
  transportation: { carKm: 1, busKm: 2, flightKm: 3 },
  energy: { electricityKwh: 4 },
  food: { meatMeals: 1, dairyMeals: 1, plantMeals: 1 },
  waste: { kg: 2 },
};

describe('storage', () => {
  it('round-trips valid entries', () => {
    saveEntries([valid]);
    expect(loadEntries()).toEqual([valid]);
  });

  it('returns an empty array when nothing is stored', () => {
    expect(loadEntries()).toEqual([]);
  });

  it('returns an empty array for malformed JSON (try/catch fallback)', () => {
    localStorage.setItem(STORAGE_KEY_FOR_TEST, '{not valid json');
    expect(loadEntries()).toEqual([]);
  });

  it('returns an empty array when the stored value is not an array', () => {
    localStorage.setItem(STORAGE_KEY_FOR_TEST, JSON.stringify({ nope: true }));
    expect(loadEntries()).toEqual([]);
  });

  it('filters out records that fail the schema-shape guard', () => {
    const corrupt = { ...valid, transportation: { carKm: 'oops', busKm: 0, flightKm: 0 } };
    localStorage.setItem(STORAGE_KEY_FOR_TEST, JSON.stringify([valid, { id: 'bad' }, corrupt]));
    expect(loadEntries()).toEqual([valid]);
  });
});
