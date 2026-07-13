// Shared domain types for Risk It.

export const CATEGORIES = [
  "Truth",
  "Dare",
  "Challenge",
  "Mini Game",
  "Ongoing",
  "Group Round",
] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * Categories that award points and count as a scoring turn. Group Rounds are
 * non-scoring interludes — everyone joins in, nobody scores.
 *
 * Ongoing cards score too, but their points are deferred: the player starts
 * the task now and the group checks whether they kept it up at the player's
 * next turn.
 */
export const SCORING_CATEGORIES = [
  "Truth",
  "Dare",
  "Challenge",
  "Mini Game",
  "Ongoing",
] as const;
export type ScoringCategory = (typeof SCORING_CATEGORIES)[number];

/** Non-scoring interlude categories, shown between scoring turns. */
export const INTERLUDE_CATEGORIES = ["Group Round"] as const;

export function isScoringCategory(category: Category): boolean {
  return (SCORING_CATEGORIES as readonly string[]).includes(category);
}

/** Ongoing tasks are accepted now and scored at the player's next turn. */
export function isOngoingCategory(category: Category): boolean {
  return category === "Ongoing";
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

/** An accepted Ongoing task awaiting its check-in at the player's next turn. */
export interface PendingMission {
  title: string;
  points: number;
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
  /** An Ongoing task to be checked at this player's next turn, if any. */
  pendingMission: PendingMission | null;
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
