import { Button } from "../components/ui";
import { APP_VERSION } from "../data/changelog";
import type { Settings } from "../types";

export function SettingsScreen({
  settings,
  cardCount,
  onChange,
  onOpenEditor,
  onResetCards,
  onShowChangelog,
  onBack,
}: {
  settings: Settings;
  cardCount: number;
  onChange: (settings: Settings) => void;
  onOpenEditor: () => void;
  onResetCards: () => void;
  onShowChangelog: () => void;
  onBack: () => void;
}) {
  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h2>Settings</h2>
      </div>

      <div className="section-title">General</div>
      <button
        className="toggle"
        onClick={() =>
          onChange({ ...settings, drinkModeDefault: !settings.drinkModeDefault })
        }
        aria-pressed={settings.drinkModeDefault}
      >
        <span>🍺 Drink Mode default</span>
        <span
          className={`toggle__state toggle__state--${
            settings.drinkModeDefault ? "on" : "off"
          }`}
        >
          {settings.drinkModeDefault ? "ON" : "OFF"}
        </span>
      </button>

      <div className="section-title">Cards</div>
      <Button variant="secondary" block onClick={onOpenEditor}>
        ✎ Card Editor ({cardCount})
      </Button>
      <Button variant="danger" block onClick={onResetCards}>
        ↺ Reset Cards to Default
      </Button>

      <div className="spacer" />
      <div className="panel">
        <div className="section-title" style={{ marginBottom: 8 }}>
          About
        </div>
        <p className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
          Risk It — an offline-first pixel arcade party game. Everything is
          stored on this device. No accounts, no internet, no limits. Export
          your cards from the editor to back them up.
        </p>
        <button className="version-btn" onClick={onShowChangelog}>
          Version {APP_VERSION} — what's new?
        </button>
      </div>
    </div>
  );
}
