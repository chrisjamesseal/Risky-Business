import { useMemo, useState } from "react";
import {
  DIFFICULTIES,
  DIFFICULTY_POINTS,
  LOCATIONS,
  type Card,
  type CategoryDef,
  type Difficulty,
  type GameLocation,
} from "../types";
import { Button } from "../components/ui";
import { scoringCardsFor } from "../game/deckBuilder";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

const LOCATION_ICON: Record<GameLocation, string> = {
  Home: "🏠",
  Pub: "🍺",
  "Club/Festival": "🎵",
};

const DRINK_LADDER: { place: string; drinks: number }[] = [
  { place: "🥇 1st", drinks: 0 },
  { place: "🥈 2nd", drinks: 2 },
  { place: "🥉 3rd", drinks: 4 },
  { place: "4th +", drinks: 6 },
];

export function SetupScreen({
  cards,
  categories,
  onStart,
  onBack,
}: {
  cards: Card[];
  categories: CategoryDef[];
  onStart: (config: {
    names: string[];
    location: GameLocation;
    drinkMode: boolean;
    difficulties: Difficulty[];
  }) => void;
  onBack: () => void;
}) {
  const [names, setNames] = useState<string[]>(["", ""]);
  const [location, setLocation] = useState<GameLocation>("Home");
  const [drinkMode, setDrinkMode] = useState(false);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([
    ...DIFFICULTIES,
  ]);
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
  const toggleDifficulty = (d: Difficulty) => {
    setDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  // Scoring cards available for the chosen location + difficulties.
  const scoringCount = useMemo(
    () => scoringCardsFor(cards, location, difficulties, categories).length,
    [cards, location, difficulties, categories],
  );

  const start = () => {
    const trimmed = names.map((n) => n.trim());
    const filled = trimmed.filter((n) => n.length > 0);
    if (filled.length < MIN_PLAYERS) {
      setError(`Enter at least ${MIN_PLAYERS} player names.`);
      return;
    }
    if (difficulties.length === 0) {
      setError("Pick at least one difficulty.");
      return;
    }
    if (scoringCount === 0) {
      setError("No cards match this location and difficulty. Try adding more.");
      return;
    }
    const finalNames = trimmed.map((n, i) => n || `Player ${i + 1}`);
    // Keep difficulties in their natural Easy→Extreme order for the deck.
    const ordered = DIFFICULTIES.filter((d) => difficulties.includes(d));
    onStart({ names: finalNames, location, drinkMode, difficulties: ordered });
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
              className={
                "loc-option" + (location === loc ? " loc-option--active" : "")
              }
              onClick={() => setLocation(loc)}
              aria-pressed={location === loc}
            >
              <span className="loc-option__icon">{LOCATION_ICON[loc]}</span>
              <span className="loc-option__name">{loc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stack--sm">
        <div className="section-title">Difficulty</div>
        <p className="muted" style={{ fontSize: 11 }}>
          Which cards to include (tap to toggle).
        </p>
        <div className="chip-row">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={
                "chip" + (difficulties.includes(d) ? " chip--active" : "")
              }
              onClick={() => toggleDifficulty(d)}
              aria-pressed={difficulties.includes(d)}
            >
              <span className={"diff-dot diff-" + d} /> {d} · {DIFFICULTY_POINTS[d]}
            </button>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 11 }}>
          {scoringCount} card{scoringCount === 1 ? "" : "s"} in this game
        </p>
      </div>

      <div className="stack--sm">
        <div className="section-title">Drink Mode</div>
        <button
          className="toggle"
          onClick={() => setDrinkMode((v) => !v)}
          aria-pressed={drinkMode}
        >
          <span>🍺&nbsp; Drink Mode</span>
          <span
            className={`toggle__state toggle__state--${drinkMode ? "on" : "off"}`}
          >
            {drinkMode ? "ON" : "OFF"}
          </span>
        </button>
        <div className="panel drink-info">
          <p>
            No drinking during the game - it only affects the end. When the final
            scores are in, players get drinks based on where they finished:
          </p>
          <div className="drink-ladder">
            {DRINK_LADDER.map((row) => (
              <div key={row.place} className="drink-ladder__row">
                <span>{row.place}</span>
                <span className="drink-ladder__drinks">
                  {row.drinks === 0 ? "no drinks" : `${"🍺".repeat(row.drinks)} ${row.drinks}`}
                </span>
              </div>
            ))}
          </div>
          <p className="muted">Off by default. Play responsibly.</p>
        </div>
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
