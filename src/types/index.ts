// Shared domain types for Risk It.

export const CATEGORIES = [
  "Truth",
  "Dare",
  "Challenge",
  "Mini Game",
  "Group Round",
  "Chaos Event",
] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * Categories that award points and count as a scoring turn. Group Rounds and
 * Chaos Events are non-scoring interludes — everyone joins in, nobody scores.
 */
export const SCORING_CATEGORIES = [
  "Truth",
  "Dare",
  "Challenge",
  "Mini Game",
] as const;
export type ScoringCategory = (typeof SCORING_CATEGORIES)[number];

/** Non-scoring interlude categories, shown between scoring turns. */
export const INTERLUDE_CATEGORIES = ["Group Round", "Chaos Event"] as const;

export function isScoringCategory(category: Category): boolean {
  return (SCORING_CATEGORIES as readonly string[]).includes(category);
}

export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Extreme"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const LOCATIONS = ["Home", "Pub", "Club/Festival"] as const;
export type GameLocation = (typeof LOCATIONS)[number];

/** A card's location field also allows "All" (usable everywhere). */
export const CARD_LOCATIONS = ["Home", "Pub", "Club/Festival", "All"] as const;
export type CardLocation = (typeof CARD_LOCATIONS)[number];

export interface Card {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  location: CardLocation;
  enabled: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  /** Number of scoring cards this player has resolved (target is 5). */
  scoringTurnsCompleted: number;
  swapUsed: boolean;
  doublePointsUsed: boolean;
  /** True once Double Points is armed for the upcoming scoring card. */
  doublePointsArmed: boolean;
}

export interface Settings {
  drinkModeDefault: boolean;
}

/** Points awarded per difficulty. */
export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  Easy: 100,
  Medium: 200,
  Hard: 300,
  Extreme: 500,
};

/** Number of scoring turns each player must complete. */
export const SCORING_TURNS_PER_PLAYER = 5;
