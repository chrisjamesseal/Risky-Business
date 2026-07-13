import { SCORING_TURNS_PER_PLAYER, type Player } from "../types";
import { finishingPositions, rankedPlayers } from "../game/scoring";

export function Leaderboard({
  players,
  currentPlayerId,
}: {
  players: Player[];
  currentPlayerId?: string;
}) {
  const ranked = rankedPlayers(players);
  const positions = finishingPositions(players);

  return (
    <div className="leaderboard">
      <div className="leaderboard__title">Leaderboard</div>
      <div className="leaderboard__list">
        {ranked.map((player) => (
          <div
            key={player.id}
            className={
              "lb-row" +
              (player.id === currentPlayerId ? " lb-row--current" : "")
            }
          >
            <span className="lb-row__pos">{positions.get(player.id)}</span>
            <span className="lb-row__name">{player.name}</span>
            <span className="lb-row__lifelines">
              <span
                className={
                  "lb-life" +
                  (player.doublePointsArmed
                    ? " lb-life--armed"
                    : player.doublePointsUsed
                      ? " lb-life--used"
                      : "")
                }
                title={
                  player.doublePointsUsed
                    ? "Double Points used"
                    : player.doublePointsArmed
                      ? "Double Points armed"
                      : "Double Points available"
                }
              >
                ×2
              </span>
              <span
                className={"lb-life" + (player.swapUsed ? " lb-life--used" : "")}
                title={player.swapUsed ? "Swap used" : "Swap available"}
              >
                🔄
              </span>
            </span>
            <span className="lb-row__done">
              {player.scoringTurnsCompleted}/{SCORING_TURNS_PER_PLAYER}
            </span>
            <span className="lb-row__score">{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
