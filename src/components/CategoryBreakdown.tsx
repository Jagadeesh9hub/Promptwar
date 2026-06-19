import { CATEGORIES } from '../constants/emissions';
import { DISPLAY_DECIMALS, PERCENT_MULTIPLIER } from '../constants/ui';
import type { CategoryTotals } from '../types';

interface CategoryBreakdownProps {
  totals: CategoryTotals;
  total: number;
}

/** Per-category CO2e and percentage share, as an accessible table. */
export function CategoryBreakdown({ totals, total }: CategoryBreakdownProps): JSX.Element {
  return (
    <table className="breakdown">
      <caption>Emissions by category</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col">kg CO₂e</th>
          <th scope="col">Share</th>
        </tr>
      </thead>
      <tbody>
        {CATEGORIES.map((category) => {
          const value = totals[category.id];
          const share = total > 0 ? (value / total) * PERCENT_MULTIPLIER : 0;
          return (
            <tr key={category.id}>
              <th scope="row">
                <span className="swatch" style={{ backgroundColor: category.color }} aria-hidden="true" />
                {category.label}
              </th>
              <td>{value.toFixed(DISPLAY_DECIMALS)}</td>
              <td>{share.toFixed(DISPLAY_DECIMALS)}%</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Total</th>
          <td>{total.toFixed(DISPLAY_DECIMALS)}</td>
          <td>{PERCENT_MULTIPLIER}%</td>
        </tr>
      </tfoot>
    </table>
  );
}
