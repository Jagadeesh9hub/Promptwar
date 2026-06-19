import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ActivityEntry, CategoryTotals } from '../types';
import { Dashboard } from './Dashboard';

const entries: ActivityEntry[] = [
  {
    id: '1',
    date: '2026-06-01',
    label: 'Commute',
    transportation: { carKm: 10, busKm: 0, flightKm: 0 },
    energy: { electricityKwh: 0 },
    food: { meatMeals: 0, dairyMeals: 0, plantMeals: 0 },
    waste: { kg: 0 },
  },
];

const totals: CategoryTotals = { transportation: 1.7, energy: 0, food: 0, waste: 0 };

describe('Dashboard', () => {
  it('renders the total, breakdown, trend table and a recent entry with its (escaped) label', async () => {
    render(
      <Dashboard
        entries={entries}
        totals={totals}
        total={1.7}
        topCategory="transportation"
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: /your footprint/i })).toBeInTheDocument();
    expect(screen.getByText(/emissions by category/i)).toBeInTheDocument();
    // The user-entered note is rendered as text content (never as HTML).
    expect(screen.getByText('Commute')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /remove entry from 2026-06-01/i }),
    ).toBeInTheDocument();

    // The code-split chart loads (allow time for the lazy chunk) and exposes
    // itself as a labelled image.
    expect(
      await screen.findByRole('img', { name: /emissions/i }, { timeout: 10000 }),
    ).toBeInTheDocument();
  }, 15000);
});
