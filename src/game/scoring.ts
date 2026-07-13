import { DIFFICULTY_POINTS, type Card, type Player } from "../types";

/** Points a card is worth, doubled when Double Points is armed. */
export function cardPoints(card: Card, doubled: boolean): number {
  const base = DIFFICULTY_POINTS[card.difficulty];
  return doubled ? base * 2 : base;
}

/** Players sorted by score (highest first), stable for equal scores. */
export function rankedPlayers(players: readonly Player[]): Player[] {
  return players
    .map((player, index) => ({ player, index }))
    .sort((a, b) => b.player.score - a.player.score || a.index - b.index)
    .map(({ player }) => player);
}

/**
 * Finishing positions (1-based). Players with equal scores share a position
 * (standard competition ranking: 1, 2, 2, 4 ...).
 */
export function finishingPositions(
  players: readonly Player[],
): Map<string, number> {
  const ranked = rankedPlayers(players);
  const positions = new Map<string, number>();
  let lastScore: number | null = null;
  let lastPosition = 0;
  ranked.forEach((player, index) => {
    if (lastScore === null || player.score !== lastScore) {
      lastPosition = index + 1;
      lastScore = player.score;
    }
    positions.set(player.id, lastPosition);
  });
  return positions;
}
