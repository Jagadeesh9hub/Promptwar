import type { Category } from '../types';

/**
 * ============================================================================
 *  SINGLE SOURCE OF TRUTH for every domain number in the app.
 *  ESLint's `no-magic-numbers` rule is enabled everywhere EXCEPT src/constants/**,
 *  so emission factors and bounds cannot leak into the rest of the codebase.
 * ============================================================================
 *
 *  Emission factors are kg CO2e per activity unit. Provenance (see SOURCES):
 *   - Transport & energy : UK Government GHG Conversion Factors 2023 (DEFRA/DESNZ).
 *   - Food (per meal)    : Poore & Nemecek (2018, Science), via Our World in Data —
 *                          representative per-meal estimates by meal type.
 *   - Waste (per kg)     : US EPA WARM / DEFRA waste-disposal factors (mixed
 *                          household waste to landfill).
 */
export const EMISSION_FACTORS = {
  /** Average car, unknown fuel — DEFRA 2023, kg CO2e/km. */
  carKm: 0.17,
  /** Average local bus — DEFRA 2023, kg CO2e/km. */
  busKm: 0.103,
  /** Domestic flight incl. radiative forcing — DEFRA 2023, kg CO2e/passenger-km. */
  flightKm: 0.246,
  /** UK grid electricity — DEFRA 2023, kg CO2e/kWh. */
  electricityKwh: 0.207,
  /** Meat-based meal — Poore & Nemecek 2018 / OWID, kg CO2e/meal. */
  meatMeals: 3.3,
  /** Dairy or vegetarian meal — Poore & Nemecek 2018 / OWID, kg CO2e/meal. */
  dairyMeals: 1.9,
  /** Plant-based meal — Poore & Nemecek 2018 / OWID, kg CO2e/meal. */
  plantMeals: 0.9,
  /** Mixed household waste to landfill — EPA WARM / DEFRA, kg CO2e/kg. */
  wasteKg: 0.45,
} as const;

/**
 * Per-field upper bounds. They reject physically absurd single-day inputs while
 * staying generous enough never to block a real user.
 *   - 20000 km/day  : beyond the longest non-stop commercial flight (~15000 km).
 *   - 1000 kWh/day  : ~20x a high-consumption household's daily electricity use.
 *   - 50 meals/day  : far beyond any realistic count of meals in one day.
 *   - 1000 kg/day   : ~3 years of an average household's waste, in a single day.
 */
export const MAX_KM_PER_DAY = 20000;
export const MAX_KWH_PER_DAY = 1000;
export const MAX_MEALS_PER_DAY = 50;
export const MAX_WASTE_KG_PER_DAY = 1000;

export interface FieldMeta {
  /** Key within the matching ActivityEntry sub-object. */
  key: string;
  /** Accessible label — used by <label> and as the input's accessible name. */
  label: string;
  unit: string;
  /** kg CO2e per unit (from EMISSION_FACTORS). */
  factor: number;
  /** Absurd-value upper bound for validation. */
  max: number;
}

export interface CategoryMeta {
  id: Category;
  label: string;
  /** Chart / legend / swatch color. Contrast ratios are documented in the README. */
  color: string;
  fields: FieldMeta[];
}

/**
 * Drives the form, the calculation breakdown, the chart series and the
 * methodology table — one declarative list, no duplicated structure.
 */
export const CATEGORIES: readonly CategoryMeta[] = [
  {
    id: 'transportation',
    label: 'Transportation',
    color: '#1a5a96',
    fields: [
      { key: 'carKm', label: 'Car (km)', unit: 'km', factor: EMISSION_FACTORS.carKm, max: MAX_KM_PER_DAY },
      { key: 'busKm', label: 'Bus (km)', unit: 'km', factor: EMISSION_FACTORS.busKm, max: MAX_KM_PER_DAY },
      { key: 'flightKm', label: 'Flight (km)', unit: 'km', factor: EMISSION_FACTORS.flightKm, max: MAX_KM_PER_DAY },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    color: '#9a4c00',
    fields: [
      {
        key: 'electricityKwh',
        label: 'Electricity (kWh)',
        unit: 'kWh',
        factor: EMISSION_FACTORS.electricityKwh,
        max: MAX_KWH_PER_DAY,
      },
    ],
  },
  {
    id: 'food',
    label: 'Food',
    color: '#1b6e3b',
    fields: [
      { key: 'meatMeals', label: 'Meat-based meals', unit: 'meals', factor: EMISSION_FACTORS.meatMeals, max: MAX_MEALS_PER_DAY },
      { key: 'dairyMeals', label: 'Dairy or vegetarian meals', unit: 'meals', factor: EMISSION_FACTORS.dairyMeals, max: MAX_MEALS_PER_DAY },
      { key: 'plantMeals', label: 'Plant-based meals', unit: 'meals', factor: EMISSION_FACTORS.plantMeals, max: MAX_MEALS_PER_DAY },
    ],
  },
  {
    id: 'waste',
    label: 'Waste',
    color: '#6a3d9a',
    fields: [
      { key: 'kg', label: 'Waste (kg)', unit: 'kg', factor: EMISSION_FACTORS.wasteKg, max: MAX_WASTE_KG_PER_DAY },
    ],
  },
];

/** Actionable reduction tip per category, keyed off the user's highest-emission category. */
export const TIPS: Record<Category, string> = {
  transportation:
    'Transportation is your largest source. Combine errands into one trip, switch short car journeys to walking, cycling or the bus, and choose rail over short-haul flights where you can.',
  energy:
    'Energy is your largest source. Switch to LED lighting, turn heating down by 1°C, unplug idle devices, and move to a renewable electricity tariff if one is available.',
  food:
    'Food is your largest source. Swapping a few red-meat and dairy meals each week for plant-based options is one of the highest-impact changes you can make.',
  waste:
    'Waste is your largest source. Cut single-use items, compost food scraps, and recycle thoroughly to keep waste out of landfill.',
};

export interface EmissionSource {
  scope: string;
  citation: string;
  url: string;
}

/** Citations rendered in the in-app "How we calculate this" panel. */
export const SOURCES: readonly EmissionSource[] = [
  {
    scope: 'Transport & energy',
    citation: 'UK Government GHG Conversion Factors for Company Reporting 2023 (DEFRA/DESNZ)',
    url: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
  },
  {
    scope: 'Food (per meal)',
    citation: 'Poore, J. & Nemecek, T. (2018), Science 360(6392) — via Our World in Data',
    url: 'https://ourworldindata.org/environmental-impacts-of-food',
  },
  {
    scope: 'Waste (landfill, per kg)',
    citation: 'US EPA Waste Reduction Model (WARM) / DEFRA waste-disposal factors',
    url: 'https://www.epa.gov/warm',
  },
];
