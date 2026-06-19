import { describe, expect, it } from 'vitest';
import { validateNumericInput } from './validation';

const MAX = 1000;

describe('validateNumericInput', () => {
  it('accepts a valid decimal number', () => {
    expect(validateNumericInput('12.5', MAX)).toEqual({ value: 12.5, error: null });
  });

  it('accepts zero', () => {
    expect(validateNumericInput('0', MAX)).toEqual({ value: 0, error: null });
  });

  it('treats an empty string as zero with no error', () => {
    expect(validateNumericInput('', MAX)).toEqual({ value: 0, error: null });
  });

  it('rejects non-numeric text', () => {
    const result = validateNumericInput('abc', MAX);
    expect(result.value).toBe(0);
    expect(result.error).not.toBeNull();
  });

  it('rejects a NaN numeric argument', () => {
    expect(validateNumericInput(Number.NaN, MAX).error).not.toBeNull();
  });

  it('rejects and clamps negatives to 0', () => {
    expect(validateNumericInput('-5', MAX)).toEqual({ value: 0, error: expect.any(String) });
  });

  it('rejects and clamps absurd values down to max', () => {
    const result = validateNumericInput(MAX + 1, MAX);
    expect(result.value).toBe(MAX);
    expect(result.error).not.toBeNull();
  });
});
