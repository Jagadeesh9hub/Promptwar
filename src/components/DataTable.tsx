import { CATEGORIES } from '../constants/emissions';
import { DISPLAY_DECIMALS } from '../constants/ui';
import type { TrendPoint } from '../types';

interface DataTableProps {
  data: TrendPoint[];
  caption: string;
}

/**
 * The screen-reader-equivalent of the trend chart: the exact same data as an
 * accessible table. Always rendered (never code-split) so assistive tech has
 * the data even before the chart chunk loads.
 */
export function DataTable({ data, caption }: DataTableProps): JSX.Element {
  return (
    <table className="data-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          {CATEGORIES.map((category) => (
            <th scope="col" key={category.id}>
              {category.label} (kg)
            </th>
          ))}
          <th scope="col">Total (kg)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((point) => (
          <tr key={point.period}>
            <th scope="row">{point.label}</th>
            <td>{point.transportation.toFixed(DISPLAY_DECIMALS)}</td>
            <td>{point.energy.toFixed(DISPLAY_DECIMALS)}</td>
            <td>{point.food.toFixed(DISPLAY_DECIMALS)}</td>
            <td>{point.waste.toFixed(DISPLAY_DECIMALS)}</td>
            <td>{point.total.toFixed(DISPLAY_DECIMALS)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
