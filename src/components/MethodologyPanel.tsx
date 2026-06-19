import { CATEGORIES, SOURCES } from '../constants/emissions';

/** In-app "How we calculate this" panel, citing every emission-factor source. */
export function MethodologyPanel(): JSX.Element {
  return (
    <section className="methodology" aria-labelledby="method-heading">
      <details>
        <summary id="method-heading">How we calculate this</summary>
        <p>
          Each activity amount you log is multiplied by a published emission factor (kg CO₂e per unit)
          and summed across categories to give your total.
        </p>
        <table className="factor-table">
          <caption>Emission factors used</caption>
          <thead>
            <tr>
              <th scope="col">Activity</th>
              <th scope="col">Factor (kg CO₂e)</th>
              <th scope="col">Per</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.flatMap((category) =>
              category.fields.map((field) => (
                <tr key={field.key}>
                  <th scope="row">{field.label}</th>
                  <td>{field.factor}</td>
                  <td>{field.unit}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
        <h3>Sources</h3>
        <ul>
          {SOURCES.map((source) => (
            <li key={source.scope}>
              <strong>{source.scope}:</strong> {source.citation} —{' '}
              <a href={source.url} target="_blank" rel="noreferrer noopener">
                reference
              </a>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
