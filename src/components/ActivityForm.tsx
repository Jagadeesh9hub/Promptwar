import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { CATEGORIES } from '../constants/emissions';
import { DATE_KEY_LENGTH } from '../constants/time';
import { NOTE_MAX_LENGTH, NUMBER_INPUT_STEP } from '../constants/ui';
import { validateNumericInput } from '../lib/validation';
import type { ActivityDraft } from '../types';

function todayIso(): string {
  return new Date().toISOString().slice(0, DATE_KEY_LENGTH);
}

function buildInitialValues(): Record<string, string> {
  const initial: Record<string, string> = {};
  for (const category of CATEGORIES) {
    for (const field of category.fields) {
      initial[field.key] = '';
    }
  }
  return initial;
}

interface ActivityFormProps {
  onAdd: (draft: ActivityDraft) => void;
}

/** Accessible form to log a day's activity. Every numeric input is validated and clamped on submit. */
export function ActivityForm({ onAdd }: ActivityFormProps): JSX.Element {
  const [values, setValues] = useState<Record<string, string>>(buildInitialValues);
  const [date, setDate] = useState<string>(todayIso);
  const [note, setNote] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (prev[key] === undefined) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors: Record<string, string> = {};
      const clamped: Record<string, number> = {};

      for (const category of CATEGORIES) {
        for (const field of category.fields) {
          const result = validateNumericInput(values[field.key] ?? '', field.max);
          clamped[field.key] = result.value;
          if (result.error !== null) {
            nextErrors[field.key] = result.error;
          }
        }
      }

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      const trimmedNote = note.trim();
      onAdd({
        date,
        label: trimmedNote === '' ? undefined : trimmedNote,
        transportation: { carKm: clamped.carKm, busKm: clamped.busKm, flightKm: clamped.flightKm },
        energy: { electricityKwh: clamped.electricityKwh },
        food: { meatMeals: clamped.meatMeals, dairyMeals: clamped.dairyMeals, plantMeals: clamped.plantMeals },
        waste: { kg: clamped.kg },
      });

      setValues(buildInitialValues());
      setNote('');
      setErrors({});
    },
    [values, date, note, onAdd],
  );

  return (
    <form className="activity-form" onSubmit={handleSubmit} noValidate aria-labelledby="form-heading">
      <h2 id="form-heading">Log today&apos;s activity</h2>

      <div className="field">
        <label htmlFor="entry-date">Date</label>
        <input
          id="entry-date"
          type="date"
          value={date}
          max={todayIso()}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      {CATEGORIES.map((category) => (
        <fieldset key={category.id} className="category-fieldset">
          <legend>{category.label}</legend>
          {category.fields.map((field) => {
            const inputId = `field-${field.key}`;
            const errorId = `${inputId}-error`;
            const fieldError = errors[field.key];
            return (
              <div className="field" key={field.key}>
                <label htmlFor={inputId}>{field.label}</label>
                <input
                  id={inputId}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={NUMBER_INPUT_STEP}
                  value={values[field.key]}
                  aria-invalid={fieldError ? true : undefined}
                  aria-describedby={fieldError ? errorId : undefined}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                />
                {fieldError ? (
                  <p className="field-error" id={errorId} role="alert">
                    {fieldError}
                  </p>
                ) : null}
              </div>
            );
          })}
        </fieldset>
      ))}

      <div className="field">
        <label htmlFor="entry-note">Note (optional)</label>
        <input
          id="entry-note"
          type="text"
          maxLength={NOTE_MAX_LENGTH}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <button type="submit" className="primary-btn">
        Add entry
      </button>
    </form>
  );
}
