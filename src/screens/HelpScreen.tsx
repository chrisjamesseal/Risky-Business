import { Button } from "../components/ui";
import { useCategories } from "../state/CategoriesContext";

export function HelpScreen({ onBack }: { onBack: () => void }) {
  const { categories } = useCategories();
  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ⬅️
        </button>
        <h2>How to Play</h2>
      </div>

      <div className="stack">
        <div className="help-block">
          <div className="help-block__title">🎯 Goal</div>
          <p>
            Pass one phone around. Pick 1, 3 or 5 scoring cards per player at
            setup. Highest score wins.
          </p>
        </div>

        <div className="help-block">
          <div className="help-block__title">🃏 Each turn</div>
          <p>
            Hand the phone to the named player, reveal their card, then tap
            <b> Complete</b> to bank the points or <b>Failed</b> for zero.
          </p>
        </div>

        <div className="help-block">
          <div className="help-block__title">⭐ Points</div>
          <p>Easy 100 · Medium 200 · Hard 300. Difficulty is fully random each game.</p>
        </div>

        <div className="help-block">
          <div className="help-block__title">🃏 Card types</div>
          <p>
            {categories.map((c) => (
              <span key={c.name}>
                <b>
                  {c.icon} {c.name}
                </b>{" "}
                : {c.description}
                <br />
              </span>
            ))}
          </p>
        </div>

        <div className="help-block">
          <div className="help-block__title">🎁 Lifelines (once each)</div>
          <p>
            <b>2️⃣ Double</b> : arm it before revealing to double the next card.
            <br />
            <b>🔁 Swap</b> : ditch a card you don't fancy and draw another, for -50.
          </p>
        </div>

        <div className="help-block">
          <div className="help-block__title">🍺 Drink Mode</div>
          <p>
            Optional. No drinking during play; drinks are handed out at the end
            by finishing place.
          </p>
        </div>
      </div>

      <div className="spacer" />
      <Button variant="primary" block onClick={onBack}>
        Got it
      </Button>
    </div>
  );
}
