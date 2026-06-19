export interface ValidationResult {
  /** Clamped, safe value to store. */
  value: number;
  /** User-facing message when the raw input was rejected, otherwise null. */
  error: string | null;
}

/**
 * Validate and clamp a single numeric activity input.
 *
 *   - empty string            -> 0, no error (nothing logged for this field)
 *   - NaN / non-numeric       -> rejected (value 0)
 *   - negative                -> rejected (clamped to 0)
 *   - greater than `max`      -> rejected (clamped to `max`)
 *   - otherwise               -> accepted as-is
 *
 * `max` is the per-field absurd-value bound defined in constants/emissions.ts.
 */
export function validateNumericInput(raw: string | number, max: number): ValidationResult {
  if (typeof raw === 'string' && raw.trim() === '') {
    return { value: 0, error: null };
  }

  const parsed = typeof raw === 'number' ? raw : Number(raw.trim());

  if (!Number.isFinite(parsed)) {
    return { value: 0, error: 'Enter a valid number.' };
  }
  if (parsed < 0) {
    return { value: 0, error: 'Value cannot be negative.' };
  }
  if (parsed > max) {
    return { value: max, error: `Value is too large (maximum ${max}).` };
  }
  return { value: parsed, error: null };
}
