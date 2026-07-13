import {
  DIFFICULTIES,
  isScoringCategory,
  type Card,
  type CardLocation,
  type Difficulty,
  type GameLocation,
} from "../types";
import { createRng, shuffle, type Rng } from "./random";

export interface Deck {
  /** Scoring cards in play order (difficulty rises across the game). */
  scoring: Card[];
  /** Shuffled non-scoring interludes (Group Rounds). */
  interludes: Card[];
}

const DIFFICULTY_INDEX: Record<Difficulty, number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
  Extreme: 3,
};

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
): Card[] {
  return cardsForLocation(cards, location).filter(
    (c) => isScoringCategory(c.category) && difficulties.includes(c.difficulty),
  );
}

/**
 * Build a balanced deck for a game.
 *
 * - Only scoring cards of the chosen `difficulties` are used, with difficulty
 *   rising over the course of the game.
 * - Repeats are avoided until the available pool for a tier is exhausted, at
 *   which point that tier's pool is reshuffled so play can continue.
 * - A `buffer` of extra scoring cards is appended so Swap lifelines have
 *   material to draw from without ending the game early.
 * - Group Round interludes are always available regardless of difficulty.
 */
export function buildDeck(
  cards: readonly Card[],
  location: GameLocation,
  scoringCount: number,
  buffer = 0,
  seed?: number,
  difficulties: readonly Difficulty[] = DIFFICULTIES,
): Deck {
  const rng = createRng(seed);
  const usable = cardsForLocation(cards, location);

  const scoringPool = usable.filter(
    (c) => isScoringCategory(c.category) && difficulties.includes(c.difficulty),
  );
  const interludePool = usable.filter((c) => !isScoringCategory(c.category));

  const total = scoringCount + buffer;
  const scoring = pickWithRisingDifficulty(scoringPool, total, rng);
  const interludes = shuffle(interludePool, rng);

  return { scoring, interludes };
}

/** Group cards by difficulty and shuffle each bucket. */
function bucketByDifficulty(
  cards: readonly Card[],
  rng: Rng,
): Record<Difficulty, Card[]> {
  const buckets = {
    Easy: [] as Card[],
    Medium: [] as Card[],
    Hard: [] as Card[],
    Extreme: [] as Card[],
  } satisfies Record<Difficulty, Card[]>;
  for (const card of cards) buckets[card.difficulty].push(card);
  for (const diff of DIFFICULTIES) buckets[diff] = shuffle(buckets[diff], rng);
  return buckets;
}

function pickWithRisingDifficulty(
  pool: readonly Card[],
  count: number,
  rng: Rng,
): Card[] {
  if (count <= 0 || pool.length === 0) return [];

  const buckets = bucketByDifficulty(pool, rng);
  const cursors: Record<Difficulty, number> = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
    Extreme: 0,
  };
  const nonEmptyTiers = DIFFICULTIES.filter((d) => buckets[d].length > 0);

  const result: Card[] = [];
  for (let i = 0; i < count; i++) {
    const progress = count === 1 ? 0.5 : i / (count - 1);
    // Target tier 0..3 rising with progress, plus a little jitter so the
    // curve feels organic rather than strictly stepped.
    const jitter = (rng() - 0.5) * 1.2;
    const target = clamp(Math.round(progress * 3 + jitter), 0, 3);

    const chosenTier = nearestAvailableTier(target, nonEmptyTiers);
    const bucket = buckets[chosenTier];

    // Draw the next unused card; reshuffle the bucket if we've run through it.
    if (cursors[chosenTier] >= bucket.length) {
      buckets[chosenTier] = shuffle(bucket, rng);
      cursors[chosenTier] = 0;
    }
    result.push(buckets[chosenTier][cursors[chosenTier]]);
    cursors[chosenTier] += 1;
  }
  return result;
}

/** Find the non-empty tier closest to `target` (ties prefer the lower tier). */
function nearestAvailableTier(
  target: number,
  nonEmptyTiers: readonly Difficulty[],
): Difficulty {
  let best = nonEmptyTiers[0];
  let bestDist = Infinity;
  for (const tier of nonEmptyTiers) {
    const dist = Math.abs(DIFFICULTY_INDEX[tier] - target);
    if (dist < bestDist) {
      bestDist = dist;
      best = tier;
    }
  }
  return best;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
