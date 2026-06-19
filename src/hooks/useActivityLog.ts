import { useCallback, useEffect, useMemo, useState } from 'react';
import { computeCategoryTotals, grandTotal } from '../lib/calculations';
import { loadEntries, saveEntries } from '../lib/storage';
import { deriveTopCategory } from '../lib/tips';
import type { ActivityDraft, ActivityEntry, Category, CategoryTotals } from '../types';

let fallbackCounter = 0;

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  fallbackCounter += 1;
  return `id-${Date.now()}-${fallbackCounter}`;
}

export interface UseActivityLog {
  entries: ActivityEntry[];
  totals: CategoryTotals;
  total: number;
  topCategory: Category | null;
  addEntry: (draft: ActivityDraft) => void;
  removeEntry: (id: string) => void;
}

/**
 * Owns the activity log: hydrates from localStorage, persists on change, and
 * exposes memoized derived values so totals/breakdown/tip recompute only when
 * the entries actually change.
 */
export function useActivityLog(): UseActivityLog {
  const [entries, setEntries] = useState<ActivityEntry[]>(() => loadEntries());

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const addEntry = useCallback((draft: ActivityDraft) => {
    setEntries((prev) => [...prev, { id: createId(), ...draft }]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const totals = useMemo(() => computeCategoryTotals(entries), [entries]);
  const total = useMemo(() => grandTotal(totals), [totals]);
  const topCategory = useMemo(() => deriveTopCategory(totals), [totals]);

  return { entries, totals, total, topCategory, addEntry, removeEntry };
}
