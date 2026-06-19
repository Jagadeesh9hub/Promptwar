/** The four tracked emission categories. */
export type Category = 'transportation' | 'energy' | 'food' | 'waste';

export interface TransportationInput {
  carKm: number;
  busKm: number;
  flightKm: number;
}

export interface EnergyInput {
  electricityKwh: number;
}

export interface FoodInput {
  meatMeals: number;
  dairyMeals: number;
  plantMeals: number;
}

export interface WasteInput {
  kg: number;
}

/** A single logged day of activity. */
export interface ActivityEntry {
  id: string;
  /** ISO calendar date, YYYY-MM-DD. */
  date: string;
  /** Optional free-text note. ALWAYS rendered as text by React, never as HTML. */
  label?: string;
  transportation: TransportationInput;
  energy: EnergyInput;
  food: FoodInput;
  waste: WasteInput;
}

/** A new entry before an id is assigned. */
export interface ActivityDraft {
  date: string;
  label?: string;
  transportation: TransportationInput;
  energy: EnergyInput;
  food: FoodInput;
  waste: WasteInput;
}

/** kg CO2e totalled per category. */
export type CategoryTotals = Record<Category, number>;

export type Granularity = 'daily' | 'weekly' | 'monthly';

/** One bucket in the trend chart / data table. */
export interface TrendPoint {
  /** Sortable bucket key (date / week-start date / YYYY-MM). */
  period: string;
  /** Human-readable bucket label. */
  label: string;
  total: number;
  transportation: number;
  energy: number;
  food: number;
  waste: number;
}
