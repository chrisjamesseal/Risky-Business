import { Button } from "../components/ui";

export function HelpScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h2>How to Play</h2>
      </div>

      <div className="stack">
        <div className="help-block">
          <div className="help-block__title">🎯 Goal</div>
          <p>
            Pass one phone around. Everyone gets five scoring cards. Highest
            score wins.
          </p>
        </div>

        <div className="help-block">
          <div className="help-block__title">🃏 Each turn</div>
          <p>
            Hand the phone to the named player, reveal their card, then tap
            <b> Done</b> to bank the points or <b>Fail</b> for zero.
          </p>
        </div>

        <div className="help-block">
          <div className="help-block__title">⭐ Points</div>
          <p>Easy 100 · Medium 200 · Hard 300 · Extreme 500.</p>
        </div>

        <div className="help-block">
          <div className="help-block__title">🃏 Card types</div>
          <p>
            <b>💬 Truth</b> · <b>🔥 Dare</b> · <b>🎯 Challenge</b> — do it now,
            score or miss.
            <br />
            <b>🕹️ Mini Game</b> — the whole group plays, then you pick who won
            and they take the points.
            <br />
            <b>⏳ Ongoing</b> — keep a task up until your next turn, then the
            group checks and you score.
            <br />
            <b>🎉 Group Round</b> — a game or question with no winner, just for
            fun (no points).
          </p>
        </div>

        <div className="help-block">
          <div className="help-block__title">🎁 Lifelines (once each)</div>
          <p>
            <b>×2 Double</b> — arm it before revealing to double the next card.
            <br />
            <b>🔄 Swap</b> — ditch a card you don't fancy and draw another.
          </p>
        </div>

        <div className="help-block">
          <div className="help-block__title">🍺 Drink Mode</div>
          <p>
            Optional. No drinking during play — drinks are handed out at the end
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
