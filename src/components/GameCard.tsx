import { DIFFICULTY_POINTS, type Card } from "../types";
import { CATEGORY_COLOR, CATEGORY_ICON, DifficultyBadge } from "./ui";

export function GameCard({
  card,
  doubled = false,
}: {
  card: Card;
  doubled?: boolean;
}) {
  const isChaos = card.category === "Chaos Event";
  const points = DIFFICULTY_POINTS[card.difficulty] * (doubled ? 2 : 1);

  return (
    <div className={"game-card" + (isChaos ? " game-card--chaos" : "")}>
      <div className="game-card__top">
        <span
          className="game-card__category"
          style={{ color: CATEGORY_COLOR[card.category] }}
        >
          {CATEGORY_ICON[card.category]} {card.category}
        </span>
        {isChaos ? (
          <span className="game-card__points">CHAOS</span>
        ) : (
          <span className="game-card__points">
            {points} PTS{doubled ? " x2" : ""}
          </span>
        )}
      </div>

      <div className="game-card__title">{card.title}</div>
      <div className="game-card__desc">{card.description}</div>

      {!isChaos && (
        <div>
          <DifficultyBadge difficulty={card.difficulty} />
        </div>
      )}
    </div>
  );
}
