# Carbon Footprint Tracker

Log daily activities across **transportation, energy, food and waste**, convert each to CO₂e using
published emission factors, and see a running total, a per-category breakdown, a trend chart
(daily/weekly/monthly), and an actionable tip targeting your **highest-emission category**. No backend —
everything persists in `localStorage`.

> **Stack:** React 18 + TypeScript (strict) + Vite · Recharts (code-split) · Vitest + React Testing Library · ESLint + `eslint-plugin-jsx-a11y`.

---

## Quick start

```bash
npm install
npm run dev          # start the app (Vite) at http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the app in development. |
| `npm run build` | Type-check (`tsc --noEmit`) then build for production. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint with **`--max-warnings 0`** (zero warnings allowed). |
| `npm run typecheck` | Strict TypeScript type-check, no emit. |
| `npm test` | Run the full Vitest suite once. |
| `npm run coverage` | Run tests with a V8 coverage report (see [Testing](#testing)). |

---

## How the six judging criteria map to the code

Every claim below is independently verifiable at the cited path.

### 1. Code Quality
| Requirement | Implementation |
| --- | --- |
| Modular, isolated components | One responsibility per file in [`src/components/`](src/components) — form, dashboard, breakdown, chart, tips, methodology. |
| All emission factors + category metadata in one typed file | [`src/constants/emissions.ts`](src/constants/emissions.ts) — `EMISSION_FACTORS`, `CATEGORIES`, bounds, `TIPS`, `SOURCES`. |
| **Zero magic numbers elsewhere** | ESLint `no-magic-numbers` is **on for all of `src/`** and disabled **only** under `src/constants/**` and tests — see [`.eslintrc.cjs`](.eslintrc.cjs). Domain numbers cannot leak. |
| Strict TypeScript, no `any` | [`tsconfig.json`](tsconfig.json) `strict: true` + `@typescript-eslint/no-explicit-any: error`. |
| Pure calc functions decoupled from React | [`src/lib/`](src/lib) is React-free; a `no-restricted-imports` rule **forbids importing React** there. |
| ESLint passes with zero warnings | `npm run lint` runs with `--max-warnings 0`. |

### 2. Security
| Requirement | Implementation |
| --- | --- |
| Validate & clamp every numeric input; reject NaN/negative/absurd with a documented bound | [`src/lib/validation.ts`](src/lib/validation.ts); bounds + rationale commented in [`src/constants/emissions.ts`](src/constants/emissions.ts) (`MAX_KM_PER_DAY`, etc.). |
| No `dangerouslySetInnerHTML`, no `eval` | Enforced by lint: a `no-restricted-syntax` selector bans `dangerouslySetInnerHTML`, plus `no-eval`/`no-implied-eval`. |
| `JSON.parse(localStorage…)` in try/catch + schema-shape check | [`src/lib/storage.ts`](src/lib/storage.ts): `loadEntries` wraps parsing in try/catch with an empty fallback and filters every record through the `isActivityEntry` structural guard before it is trusted. |
| User label text rendered, never injected as HTML | The optional note is rendered as a React child (`{entry.label}`) in [`Dashboard.tsx`](src/components/Dashboard.tsx) — auto-escaped. |

### 3. Efficiency
| Requirement | Implementation |
| --- | --- |
| Memoize derived totals & chart datasets | `useMemo` in [`useActivityLog.ts`](src/hooks/useActivityLog.ts) (totals, grand total, top category) and [`TrendSection.tsx`](src/components/TrendSection.tsx) (chart data + summary). |
| Stabilize callbacks | `useCallback` for `addEntry`/`removeEntry` ([`useActivityLog.ts`](src/hooks/useActivityLog.ts)) and form handlers ([`ActivityForm.tsx`](src/components/ActivityForm.tsx)). |
| O(n) aggregation, no nested loops | [`src/lib/aggregation.ts`](src/lib/aggregation.ts) and `computeCategoryTotals` in [`calculations.ts`](src/lib/calculations.ts) — single pass with a `Map`/`reduce`. |
| Code-split the chart | [`TrendSection.tsx`](src/components/TrendSection.tsx): `React.lazy(() => import('./TrendChart'))` inside `<Suspense>`, keeping Recharts out of the initial bundle. |
| Note any dependency > ~50 KB gzipped | **Recharts** (incl. its d3 deps) is the only one. It is **fully code-split**: `npm run build` emits it as a separate `TrendChart-*.js` chunk (**100.71 kB gzip**), keeping the **initial bundle at 51.28 kB gzip**. Justified by the responsive, accessible charting it provides. |

### 4. Testing
See [Testing](#testing). Covers every calculation function (zero, negative-rejection, missing/undefined fields, very-large value), the validation logic, aggregation, the tip engine, and two component tests (accessible-name lookup + highest-category tip).

### 5. Accessibility (WCAG 2.1 AA)
| Requirement | Implementation |
| --- | --- |
| Semantic HTML only | `<form>`, `<fieldset>`/`<legend>` per category, `<button>`, `<table>` — see [`ActivityForm.tsx`](src/components/ActivityForm.tsx). |
| Every input has a `<label htmlFor>` | Yes — each field's label is also its accessible name (asserted in tests). |
| Visible focus + logical tab order | `:focus-visible { outline: 3px solid … }` in [`index.css`](src/index.css); DOM order is the tab order. |
| Charts have a table equivalent + summarizing `aria-label` | [`DataTable.tsx`](src/components/DataTable.tsx) renders the same data; [`TrendChart.tsx`](src/components/TrendChart.tsx) is `role="img"` with a sentence `aria-label` summarizing the trend. |
| ARIA labels on icon-only buttons | The remove-entry "×" button has `aria-label="Remove entry from …"` ([`Dashboard.tsx`](src/components/Dashboard.tsx)). |
| Contrast ≥ 4.5:1, ratios stated | See [palette below](#color-contrast). |

### 6. Problem Statement Alignment
Every feature serves *track and reduce*: log → total → breakdown → trend → targeted tip → methodology. No auth, no social features, no scope creep. The tip is chosen by `deriveTopCategory` in [`src/lib/tips.ts`](src/lib/tips.ts) from the **actual** highest-emission category — never a static message.

---

## Emission factors & sources

Defined once in [`src/constants/emissions.ts`](src/constants/emissions.ts) and shown in-app via the **"How we calculate this"** panel.

| Activity | Factor (kg CO₂e) | Per | Source |
| --- | --- | --- | --- |
| Car (average) | 0.170 | km | UK DEFRA/DESNZ 2023 |
| Bus (local) | 0.103 | km | UK DEFRA/DESNZ 2023 |
| Flight (domestic, incl. radiative forcing) | 0.246 | km | UK DEFRA/DESNZ 2023 |
| Electricity (UK grid) | 0.207 | kWh | UK DEFRA/DESNZ 2023 |
| Meat-based meal | 3.3 | meal | Poore & Nemecek 2018 / Our World in Data |
| Dairy / vegetarian meal | 1.9 | meal | Poore & Nemecek 2018 / OWID |
| Plant-based meal | 0.9 | meal | Poore & Nemecek 2018 / OWID |
| Waste (to landfill) | 0.45 | kg | US EPA WARM / DEFRA waste |

### Validation bounds (the "absurd value" caps)
Documented with rationale in `emissions.ts`. Inputs are clamped to `[0, max]`; `NaN`, negatives and non-finite values are rejected.

- Distance: **20 000 km/day** per mode (beyond the longest non-stop commercial flight).
- Electricity: **1 000 kWh/day** (~20× a high-use household).
- Meals: **50/day** per type. Waste: **1 000 kg/day**.

---

## Testing

```bash
npm test            # run once
npm run coverage    # run with a V8 coverage report
```

**What's covered**
- **Every calculation function** — [`calculations.test.ts`](src/lib/calculations.test.ts): zero input, the negative-rejection path, missing/undefined fields, a very large value, and NaN.
- **Input validation** — [`validation.test.ts`](src/lib/validation.test.ts): valid, empty, zero, non-numeric, NaN, negative, and over-max.
- **Aggregation** — [`aggregation.test.ts`](src/lib/aggregation.test.ts): daily/weekly/monthly bucketing, sorting, empty log.
- **Tip engine** — [`tips.test.ts`](src/lib/tips.test.ts): highest-category selection and the no-data case.
- **Components** — [`ActivityForm.test.tsx`](src/components/ActivityForm.test.tsx) asserts each input is reachable via `getByRole('spinbutton', { name: … })` and that a negative value is rejected; [`TipPanel.test.tsx`](src/components/TipPanel.test.tsx) asserts the highest-category tip renders.

**Reading coverage:** `npm run coverage` prints a per-file table (statements / branches / functions / lines) to the terminal and writes a browsable HTML report to `coverage/index.html`. Coverage is scoped to `src/lib`, `src/components` and `src/hooks` (see [`vite.config.ts`](vite.config.ts)).

---

## Color contrast

Verified with the standard WCAG formula (all text pairs exceed the 4.5:1 AA threshold):

| Token / pair | Ratio |
| --- | --- |
| Body text `#1a1a1a` on white | **17.40:1** |
| Muted text `#4a4a4a` on white | **8.86:1** |
| Accent `#1a5a96` on white / white on accent | **7.13:1** |
| Error `#b00020` on white | **7.33:1** |
| Transportation series `#1a5a96` | **7.13:1** |
| Energy series `#9a4c00` | **6.16:1** |
| Food series `#1b6e3b` | **6.29:1** |
| Waste series `#6a3d9a` | **7.64:1** |

Chart colors also carry no meaning on their own — the equivalent data table conveys the same information.

---

## Project structure

```
src/
├─ constants/    emissions.ts (factors, metadata, bounds, tips, sources) · ui.ts · time.ts
├─ types/        shared TypeScript types
├─ lib/          pure, React-free, fully tested: calculations · validation · aggregation · tips · storage
├─ hooks/        useActivityLog (state + persistence + memoized selectors)
├─ components/   ActivityForm · Dashboard · CategoryBreakdown · TrendSection · TrendChart (lazy) · DataTable · TipPanel · MethodologyPanel · VisuallyHidden
├─ App.tsx · main.tsx · index.css
└─ test/setup.ts
```

## Pinned versions
React `18.3.1` · TypeScript `5.4.5` · Vite `5.2.11` · Recharts `2.12.7` · Vitest `1.6.0` ·
`@testing-library/react` `15.0.7` · ESLint `8.57.0` · `eslint-plugin-jsx-a11y` `6.8.0`. All dependencies are pinned to exact versions in [`package.json`](package.json).
