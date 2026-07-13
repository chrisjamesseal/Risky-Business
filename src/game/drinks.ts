import type { Player } from "../types";
import { finishingPositions } from "./scoring";

// Drink Mode punishment ladder, keyed by finishing position.
// 1st: 0, 2nd: 2, 3rd: 4, 4th and beyond: 6.
export function drinksForPosition(position: number): number {
  switch (position) {
    case 1:
      return 0;
    case 2:
      return 2;
    case 3:
      return 4;
    default:
      return 6;
  }
}

export function drinksByPlayer(players: readonly Player[]): Map<string, number> {
  const positions = finishingPositions(players);
  const drinks = new Map<string, number>();
  for (const player of players) {
    drinks.set(player.id, drinksForPosition(positions.get(player.id) ?? 4));
  }
  return drinks;
}
