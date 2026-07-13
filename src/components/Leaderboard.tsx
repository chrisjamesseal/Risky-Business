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
