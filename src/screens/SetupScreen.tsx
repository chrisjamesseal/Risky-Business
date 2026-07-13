import { useMemo, useState } from "react";
import {
  LOCATIONS,
  type Card,
  type GameLocation,
} from "../types";
import { Button } from "../components/ui";
import { enabledCardsForLocation } from "../game/deckBuilder";
import { SCORING_CATEGORIES } from "../types";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

const LOCATION_ICON: Record<GameLocation, string> = {
  Home: "🏠",
  Pub: "🍺",
  "Club/Festival": "🎵",
};

export function SetupScreen({
  cards,
  drinkModeDefault,
  onStart,
  onBack,
}: {
  cards: Card[];
  drinkModeDefault: boolean;
  onStart: (config: {
    names: string[];
    location: GameLocation;
    drinkMode: boolean;
  }) => void;
  onBack: () => void;
}) {
  const [names, setNames] = useState<string[]>(["", ""]);
  const [location, setLocation] = useState<GameLocation>("Home");
  const [drinkMode, setDrinkMode] = useState(drinkModeDefault);
  const [error, setError] = useState<string | null>(null);

  const setName = (index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };
  const addPlayer = () => {
    if (names.length < MAX_PLAYERS) setNames((prev) => [...prev, ""]);
  };
  const removePlayer = (index: number) => {
    if (names.length > MIN_PLAYERS) {
      setNames((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // How many scoring cards this location can offer, so we can warn on a thin deck.
  const scoringCount = useMemo(() => {
    return enabledCardsForLocation(cards, location).filter((c) =>
      (SCORING_CATEGORIES as readonly string[]).includes(c.category),
    ).length;
  }, [cards, location]);

  const start = () => {
    const trimmed = names.map((n) => n.trim());
    const filled = trimmed.filter((n) => n.length > 0);
    if (filled.length < MIN_PLAYERS) {
      setError(`Enter at least ${MIN_PLAYERS} player names.`);
      return;
    }
    if (scoringCount === 0) {
      setError("No enabled cards for this location. Add some in Settings.");
      return;
    }
    // Fill any blank names with a default so play order stays intact.
    const finalNames = trimmed.map((n, i) => n || `Player ${i + 1}`);
    onStart({ names: finalNames, location, drinkMode });
  };

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h2>New Game</h2>
      </div>

      <div className="stack">
        <div className="section-title">Players</div>
        {names.map((name, index) => (
          <div className="player-input-row" key={index}>
            <input
              type="text"
              value={name}
              maxLength={16}
              autoFocus={index === 0}
              placeholder={`Player ${index + 1}`}
              onChange={(e) => setName(index, e.target.value)}
            />
            <button
              className="icon-btn"
              onClick={() => removePlayer(index)}
              disabled={names.length <= MIN_PLAYERS}
              aria-label="Remove player"
            >
              ✕
            </button>
          </div>
        ))}
        <Button
          variant="ghost"
          onClick={addPlayer}
          disabled={names.length >= MAX_PLAYERS}
        >
          + Add player ({names.length}/{MAX_PLAYERS})
        </Button>
      </div>

      <div className="stack--sm">
        <div className="section-title">Location</div>
        <div className="loc-list">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              className={"loc-option" + (location === loc ? " loc-option--active" : "")}
              onClick={() => setLocation(loc)}
              aria-pressed={location === loc}
            >
              <span className="loc-option__icon">{LOCATION_ICON[loc]}</span>
              <span className="loc-option__name">{loc}</span>
            </button>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 11 }}>
          {scoringCount} card{scoringCount === 1 ? "" : "s"} available here
        </p>
      </div>

      <div className="stack--sm">
        <div className="section-title">Drink Mode</div>
        <button
          className="toggle"
          onClick={() => setDrinkMode((v) => !v)}
          aria-pressed={drinkMode}
        >
          <span>🍺&nbsp; Drinks at the end</span>
          <span
            className={`toggle__state toggle__state--${drinkMode ? "on" : "off"}`}
          >
            {drinkMode ? "ON" : "OFF"}
          </span>
        </button>
      </div>

      {error && (
        <p className="muted" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}

      <div className="spacer" />
      <Button variant="primary" large block onClick={start}>
        ▶ Start Game
      </Button>
    </div>
  );
}
