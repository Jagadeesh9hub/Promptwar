import { ActivityForm } from './components/ActivityForm';
import { Dashboard } from './components/Dashboard';
import { MethodologyPanel } from './components/MethodologyPanel';
import { useActivityLog } from './hooks/useActivityLog';

function App(): JSX.Element {
  const { entries, totals, total, topCategory, addEntry, removeEntry } = useActivityLog();

  return (
    <div className="app">
      <header className="app__header">
        <h1>Carbon Footprint Tracker</h1>
        <p>Log daily activities to track and reduce your CO₂e emissions.</p>
      </header>

      <main className="app__main">
        <ActivityForm onAdd={addEntry} />
        <Dashboard
          entries={entries}
          totals={totals}
          total={total}
          topCategory={topCategory}
          onRemove={removeEntry}
        />
      </main>

      <footer className="app__footer">
        <MethodologyPanel />
      </footer>
    </div>
  );
}

export default App;
