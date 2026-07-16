import { DIFFICULTY_POINTS, isScoringBehavior, type Card } from "../types";
import { useCategory } from "../state/CategoriesContext";
import { DifficultyBadge } from "./ui";

export function GameCard({
  card,
  playerName,
  doubled = false,
  preview = false,
}: {
  card: Card;
  /** Shown in place of a card title - every card reads as if speaking to them. */
  playerName?: string;
  doubled?: boolean;
  /** Editor-only: surfaces extra card settings (like location) that don't show in live play. */
  preview?: boolean;
}) {
  const category = useCategory(card.category);
  const scoring = isScoringBehavior(category.behavior);
  const isRound = category.behavior === "group";
  const isOngoing = category.behavior === "ongoing";
  const points = DIFFICULTY_POINTS[card.difficulty] * (doubled ? 2 : 1);

  const badge = scoring ? `${points} PTS${doubled ? " x2" : ""}` : "NO POINTS";

  const className =
    "game-card" +
    (isRound ? " game-card--round" : "") +
    (isOngoing ? " game-card--ongoing" : "");

  return (
    <div className={className}>
      <div className="game-card__top">
        <span className="game-card__category" style={{ color: category.color }}>
          {category.icon} {card.category}
        </span>
        <span className="game-card__points">{badge}</span>
      </div>

      {playerName && <div className="game-card__title">{playerName}</div>}
      <div className="game-card__desc">{card.description}</div>

      {(scoring || isOngoing || preview) && (
        <div className="game-card__badges">
          {scoring && <DifficultyBadge difficulty={card.difficulty} />}
          {isOngoing && (
            <span className="duration-badge">⏱️ {card.duration ?? "Next round"}</span>
          )}
          {preview && <span className="location-badge">📍 {card.location}</span>}
        </div>
      )}
    </div>
  );
}
