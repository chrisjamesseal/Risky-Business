import { DIFFICULTY_POINTS, isScoringCategory, type Card } from "../types";
import { CATEGORY_COLOR, CATEGORY_ICON, DifficultyBadge } from "./ui";

export function GameCard({
  card,
  doubled = false,
}: {
  card: Card;
  doubled?: boolean;
}) {
  const scoring = isScoringCategory(card.category);
  const isChaos = card.category === "Chaos Event";
  const isRound = card.category === "Group Round";
  const points = DIFFICULTY_POINTS[card.difficulty] * (doubled ? 2 : 1);

  const badge = scoring
    ? `${points} PTS${doubled ? " x2" : ""}`
    : isChaos
      ? "CHAOS"
      : "NO POINTS";

  const className =
    "game-card" +
    (isChaos ? " game-card--chaos" : "") +
    (isRound ? " game-card--round" : "");

  return (
    <div className={className}>
      <div className="game-card__top">
        <span
          className="game-card__category"
          style={{ color: CATEGORY_COLOR[card.category] }}
        >
          {CATEGORY_ICON[card.category]} {card.category}
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
