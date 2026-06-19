import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TrendPoint } from '../types';
import TrendChart from './TrendChart';

const data: TrendPoint[] = [
  { period: '2026-06-01', label: '2026-06-01', total: 1.7, transportation: 1.7, energy: 0, food: 0, waste: 0 },
];

describe('TrendChart', () => {
  it('exposes itself to screen readers as a single labelled image', () => {
    render(<TrendChart data={data} ariaLabel="Daily CO2e emissions, currently steady." />);
    expect(screen.getByRole('img', { name: /co2e emissions/i })).toBeInTheDocument();
  });
});
