// Shared domain types for Risk It.

/**
 * How a category plays out:
 * - standard: the current player does it now and completes/fails for points.
 * - duel:     the current player faces off against another player. Only the
 *             current player can score - if they lose, nobody does.
 * - mini:     the whole group plays, then you pick a winner who takes the points.
 * - ongoing:  the player starts a task now; it's checked at their next turn.
 * - group:    a non-scoring interlude - everyone joins in, nobody scores.
 */
export const CATEGORY_BEHAVIORS = [
  "standard",
  "duel",
  "mini",
  "ongoing",
  "group",
] as const;
export type CategoryBehavior = (typeof CATEGORY_BEHAVIORS)[number];

export const BEHAVIOR_LABEL: Record<CategoryBehavior, string> = {
  standard: "Do it now - score or miss",
  duel: "1v1 - only you can win the points",
  mini: "Group game - pick the winner",
  ongoing: "Ongoing task - checked next turn",
  group: "Just for fun - no points",
};

/** Categories are user-editable data, so a category name is just a string. */
export type Category = string;

/** A user-editable card category and how it behaves in a game. */
export interface CategoryDef {
  name: string;
  behavior: CategoryBehavior;
  icon: string;
  color: string;
  description: string;
}

/** Behaviours that award points (everything except a "group" round). */
export function isScoringBehavior(behavior: CategoryBehavior): boolean {
  return behavior !== "group";
}

/** Palette custom categories cycle through for their accent colour. */
export const CATEGORY_COLORS = [
  "var(--cyan)",
  "var(--pink)",
  "var(--yellow)",
  "var(--green)",
  "var(--orange)",
  "var(--purple)",
  "var(--red)",
];

export type BehaviorByCategory = Record<string, CategoryBehavior>;

export function behaviorByCategory(
  categories: readonly CategoryDef[],
): BehaviorByCategory {
  const map: BehaviorByCategory = {};
  for (const c of categories) map[c.name] = c.behavior;
  return map;
}

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const LOCATIONS = ["Home", "Pub", "Club/Festival"] as const;
export type GameLocation = (typeof LOCATIONS)[number];

/** A card's location field also allows "All" (usable everywhere). */
export const CARD_LOCATIONS = ["Home", "Pub", "Club/Festival", "All"] as const;
export type CardLocation = (typeof CARD_LOCATIONS)[number];

/**
 * Token in a card description that gets replaced with a random other
 * player's name when the card is revealed, e.g. "Arm wrestle {opponent}."
 */
export const OPPONENT_TOKEN = "{opponent}";

export interface Card {
  id: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  location: CardLocation;
}

/** An accepted Ongoing task awaiting its check-in at the player's next turn. */
export interface PendingMission {
  description: string;
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

/** Points awarded per difficulty. */
export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  Easy: 100,
  Medium: 200,
  Hard: 300,
};

/** Number of scoring turns each player must complete. */
export const SCORING_TURNS_PER_PLAYER = 5;
