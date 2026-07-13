import { DIFFICULTY_POINTS, isScoringBehavior, type Card } from "../types";
import { useCategory } from "../state/CategoriesContext";
import { DifficultyBadge } from "./ui";

export function GameCard({
  card,
  doubled = false,
}: {
  card: Card;
  doubled?: boolean;
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

      <div className="game-card__title">{card.title}</div>
      <div className="game-card__desc">{card.description}</div>

      {scoring && (
        <div>
          <DifficultyBadge difficulty={card.difficulty} />
        </div>
      )}
    </div>
  );
}
