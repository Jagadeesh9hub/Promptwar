import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ActivityDraft } from '../types';
import { useActivityLog } from './useActivityLog';

const draft: ActivityDraft = {
  date: '2026-06-01',
  transportation: { carKm: 10, busKm: 0, flightKm: 0 },
  energy: { electricityKwh: 0 },
  food: { meatMeals: 0, dairyMeals: 0, plantMeals: 0 },
  waste: { kg: 0 },
};

describe('useActivityLog', () => {
  it('adds entries, derives totals and the top category, then removes them', () => {
    const { result } = renderHook(() => useActivityLog());
    expect(result.current.total).toBe(0);
    expect(result.current.topCategory).toBeNull();

    act(() => result.current.addEntry(draft));

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.total).toBeGreaterThan(0);
    expect(result.current.topCategory).toBe('transportation');

    const { id } = result.current.entries[0];
    act(() => result.current.removeEntry(id));

    expect(result.current.entries).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('persists entries to localStorage so a fresh hook re-hydrates them', () => {
    const first = renderHook(() => useActivityLog());
    act(() => first.result.current.addEntry(draft));

    // A second independent mount should load the persisted entry.
    const second = renderHook(() => useActivityLog());
    expect(second.result.current.entries).toHaveLength(1);
  });
});
