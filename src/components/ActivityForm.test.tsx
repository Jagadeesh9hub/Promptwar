import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActivityForm } from './ActivityForm';

describe('ActivityForm', () => {
  it('exposes each numeric input by its accessible name', () => {
    render(<ActivityForm onAdd={vi.fn()} />);
    // role="spinbutton" is the accessible role of <input type="number">.
    expect(screen.getByRole('spinbutton', { name: /car \(km\)/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /electricity \(kwh\)/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /waste \(kg\)/i })).toBeInTheDocument();
  });

  it('validates and submits values through onAdd', () => {
    const onAdd = vi.fn();
    render(<ActivityForm onAdd={onAdd} />);

    fireEvent.change(screen.getByRole('spinbutton', { name: /car \(km\)/i }), {
      target: { value: '10' },
    });
    fireEvent.submit(screen.getByRole('form', { name: /log today/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ transportation: expect.objectContaining({ carKm: 10 }) }),
    );
  });

  it('rejects a negative value and blocks submission', () => {
    const onAdd = vi.fn();
    render(<ActivityForm onAdd={onAdd} />);

    fireEvent.change(screen.getByRole('spinbutton', { name: /car \(km\)/i }), {
      target: { value: '-5' },
    });
    fireEvent.submit(screen.getByRole('form', { name: /log today/i }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/negative/i);
  });
});
