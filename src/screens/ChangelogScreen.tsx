import { Button } from "../components/ui";
import { CHANGELOG } from "../data/changelog";

export function ChangelogScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn icon-btn--plain" onClick={onBack} aria-label="Back">
          ⬅️
        </button>
        <h2>What's New</h2>
      </div>

      <div className="stack">
        {CHANGELOG.map((entry) => (
          <div key={entry.version} className="panel">
            <div className="changelog__head">
              <span className="changelog__version">v{entry.version}</span>
              <span className="changelog__title">{entry.title}</span>
            </div>
            <ul className="changelog__list">
              {entry.changes.map((change, i) => (
                <li key={i}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="spacer" />
      <Button variant="primary" block onClick={onBack}>
        Back
      </Button>
    </div>
  );
}
