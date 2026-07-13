import { Button } from "../components/ui";
import { drinksByPlayer } from "../game/drinks";
import { finishingPositions, rankedPlayers } from "../game/scoring";
import type { Player } from "../types";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function ResultsScreen({
  players,
  drinkMode,
  onPlayAgain,
  onHome,
}: {
  players: Player[];
  drinkMode: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
}) {
  const ranked = rankedPlayers(players);
  const positions = finishingPositions(players);
  const drinks = drinksByPlayer(players);

  // Everyone sharing top spot (handles ties for the win).
  const topScore = ranked[0].score;
  const winners = ranked.filter((p) => p.score === topScore);
  const headline =
    winners.length > 1
      ? `🤝 It's a tie at ${topScore}!`
      : `👑 ${winners[0].name} wins with ${topScore}!`;

  return (
    <div className="screen">
      <h1 className="logo" style={{ fontSize: 30 }}>
        Results
      </h1>
      <p className="tagline">{headline}</p>

      <div className="podium">
        {ranked.map((player) => {
          const pos = positions.get(player.id) ?? 0;
          return (
            <div key={player.id} className={`result-row result-row--${pos}`}>
              <span className="result-row__medal">{MEDALS[pos] ?? pos}</span>
              <div className="list-item__body">
                <div className="result-row__name">{player.name}</div>
                {drinkMode && (
                  <div className="result-row__drinks">
                    {"🍺".repeat(drinks.get(player.id) ?? 0) || "No drinks"}
                    {drinks.get(player.id) ? ` ${drinks.get(player.id)}` : ""}
                  </div>
                )}
              </div>
              <span className="result-row__score">{player.score}</span>
            </div>
          );
        })}
      </div>

      <div className="spacer" />
      <Button variant="primary" large block onClick={onPlayAgain}>
        ↻ Play Again
      </Button>
      <Button variant="secondary" block onClick={onHome}>
        🏠 Home
      </Button>
    </div>
  );
}
