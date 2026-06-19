import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TIPS } from '../constants/emissions';
import { TipPanel } from './TipPanel';

describe('TipPanel', () => {
  it('renders the actionable tip for the highest-emission category', () => {
    render(<TipPanel topCategory="food" />);
    expect(screen.getByText(TIPS.food)).toBeInTheDocument();
    expect(screen.getByText(/highest-emission category/i)).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('prompts the user to log an activity when there is no data', () => {
    render(<TipPanel topCategory={null} />);
    expect(screen.getByText(/log an activity/i)).toBeInTheDocument();
  });
});
