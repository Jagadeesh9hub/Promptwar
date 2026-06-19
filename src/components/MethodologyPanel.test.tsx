import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SOURCES } from '../constants/emissions';
import { MethodologyPanel } from './MethodologyPanel';

describe('MethodologyPanel', () => {
  it('explains the calculation and cites every source', () => {
    render(<MethodologyPanel />);
    expect(screen.getByText(/how we calculate this/i)).toBeInTheDocument();
    expect(screen.getByText(/emission factors used/i)).toBeInTheDocument();
    // One reference link per documented source.
    expect(screen.getAllByRole('link')).toHaveLength(SOURCES.length);
  });
});
