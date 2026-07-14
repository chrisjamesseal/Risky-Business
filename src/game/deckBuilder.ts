import {
  behaviorByCategory,
  DIFFICULTIES,
  isScoringBehavior,
  type BehaviorByCategory,
  type Card,
  type CardLocation,
  type CategoryDef,
  type Difficulty,
  type GameLocation,
} from "../types";
import { createRng, shuffle, type Rng } from "./random";

/** A card scores if its category exists and isn't a non-scoring "group" one. */
function cardScores(card: Card, behavior: BehaviorByCategory): boolean {
  const b = behavior[card.category];
  return b !== undefined && isScoringBehavior(b);
}

export interface Deck {
  /** Scoring cards in play order (difficulty fully randomised, not ramped). */
  scoring: Card[];
  /** Shuffled non-scoring interludes (Group cards). */
  interludes: Card[];
}

/** A card is usable in a location if it targets that location or "All". */
export function isUsableInLocation(
  cardLocation: CardLocation,
  location: GameLocation,
): boolean {
  return cardLocation === "All" || cardLocation === location;
}

export function cardsForLocation(
  cards: readonly Card[],
  location: GameLocation,
): Card[] {
  return cards.filter((card) => isUsableInLocation(card.location, location));
}

/** Scoring cards available for a location and the chosen difficulty set. */
export function scoringCardsFor(
  cards: readonly Card[],
  location: GameLocation,
  difficulties: readonly Difficulty[],
  categories: readonly CategoryDef[],
): Card[] {
  const behavior = behaviorByCategory(categories);
  return cardsForLocation(cards, location).filter(
    (c) => cardScores(c, behavior) && difficulties.includes(c.difficulty),
  );
}

/**
 * Build a deck for a game.
 *
 * - Only scoring cards of the chosen `difficulties` are used, drawn in a fully
 *   random order (not ramped harder over the game - a rising curve lets
 *   players save lifelines for a predictable late-game spike, so difficulty
 *   is shuffled instead).
 * - Repeats are avoided until the pool is exhausted, at which point it's
 *   reshuffled so play can continue.
 * - A `buffer` of extra scoring cards is appended so Swap lifelines have
 *   material to draw from without ending the game early.
 * - Non-scoring "group" interludes are always available regardless of difficulty.
 */
export function buildDeck(
  cards: readonly Card[],
  categories: readonly CategoryDef[],
  location: GameLocation,
  scoringCount: number,
  buffer = 0,
  seed?: number,
  difficulties: readonly Difficulty[] = DIFFICULTIES,
): Deck {
  const rng = createRng(seed);
  const behavior = behaviorByCategory(categories);
  const usable = cardsForLocation(cards, location);

  const scoringPool = usable.filter(
    (c) => cardScores(c, behavior) && difficulties.includes(c.difficulty),
  );
  // Interludes = cards of a known non-scoring (group) category.
  const interludePool = usable.filter((c) => behavior[c.category] === "group");

  const total = scoringCount + buffer;
  const scoring = pickRandom(scoringPool, total, rng);
  const interludes = shuffle(interludePool, rng);

  return { scoring, interludes };
}

/**
 * Draw `count` cards from `pool` in fully shuffled order. Cards are not
 * repeated until the pool has been exhausted, at which point it's reshuffled
 * so play can continue past the size of the library.
 */
function pickRandom(pool: readonly Card[], count: number, rng: Rng): Card[] {
  if (count <= 0 || pool.length === 0) return [];

  let shuffled = shuffle(pool, rng);
  let cursor = 0;
  const result: Card[] = [];
  for (let i = 0; i < count; i++) {
    if (cursor >= shuffled.length) {
      shuffled = shuffle(pool, rng);
      cursor = 0;
    }
    result.push(shuffled[cursor]);
    cursor += 1;
  }
  return result;
}
