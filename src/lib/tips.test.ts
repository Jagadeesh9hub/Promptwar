import { describe, expect, it } from 'vitest';
import { TIPS } from '../constants/emissions';
import type { CategoryTotals } from '../types';
import { deriveTopCategory, getTip } from './tips';

const ZERO: CategoryTotals = { transportation: 0, energy: 0, food: 0, waste: 0 };

describe('deriveTopCategory', () => {
  it('returns the category with the highest emissions', () => {
    expect(deriveTopCategory({ ...ZERO, transportation: 5, food: 2 })).toBe('transportation');
    expect(deriveTopCategory({ ...ZERO, food: 9, waste: 8 })).toBe('food');
  });

  it('returns null when there is no data', () => {
    expect(deriveTopCategory(ZERO)).toBeNull();
  });
});

describe('getTip', () => {
  it('returns the actionable tip text for a category', () => {
    expect(getTip('food')).toBe(TIPS.food);
    expect(getTip('transportation')).toBe(TIPS.transportation);
  });
});
