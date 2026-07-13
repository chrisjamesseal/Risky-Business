import { describe, expect, it } from "vitest";
import { DEFAULT_CARDS } from "../data/defaultCards";
import {
  buildDeck,
  enabledCardsForLocation,
  isUsableInLocation,
} from "./deckBuilder";
import { cardPoints, finishingPositions, rankedPlayers } from "./scoring";
import { drinksForPosition } from "./drinks";
import { createGame, gameReducer, type GameState } from "./gameReducer";
import { SCORING_TURNS_PER_PLAYER, type Card, type Player } from "../types";

function player(overrides: Partial<Player> = {}): Player {
  return {
    id: "p",
    name: "P",
    score: 0,
    scoringTurnsCompleted: 0,
    swapUsed: false,
    doublePointsUsed: false,
    doublePointsArmed: false,
    ...overrides,
  };
}

describe("location filtering", () => {
  it("matches exact location or All", () => {
    expect(isUsableInLocation("All", "Pub")).toBe(true);
    expect(isUsableInLocation("Pub", "Pub")).toBe(true);
    expect(isUsableInLocation("Home", "Pub")).toBe(false);
  });

  it("excludes disabled cards", () => {
    const cards: Card[] = [
      { ...DEFAULT_CARDS[0], enabled: false },
      { ...DEFAULT_CARDS[1], enabled: true },
    ];
    const usable = enabledCardsForLocation(cards, "Home");
    expect(usable.every((c) => c.enabled)).toBe(true);
    expect(usable.length).toBe(1);
  });
});

describe("buildDeck", () => {
  it("returns exactly the requested number of scoring cards plus buffer", () => {
    const deck = buildDeck(DEFAULT_CARDS, "Home", 40, 8, 123);
    expect(deck.scoring.length).toBe(48);
    expect(deck.scoring.every((c) => c.category !== "Chaos Event")).toBe(true);
  });

  it("only includes location-appropriate cards", () => {
    const deck = buildDeck(DEFAULT_CARDS, "Pub", 20, 0, 7);
    for (const card of [...deck.scoring, ...deck.chaos]) {
      expect(["Pub", "All"]).toContain(card.location);
    }
  });

  it("trends from easier to harder over the game", () => {
    const points = { Easy: 1, Medium: 2, Hard: 3, Extreme: 4 } as const;
    const deck = buildDeck(DEFAULT_CARDS, "Home", 40, 0, 99);
    const firstHalf = deck.scoring.slice(0, 20);
    const secondHalf = deck.scoring.slice(20);
    const avg = (cards: Card[]) =>
      cards.reduce((s, c) => s + points[c.difficulty], 0) / cards.length;
    expect(avg(secondHalf)).toBeGreaterThan(avg(firstHalf));
  });

  it("is deterministic for a given seed", () => {
    const a = buildDeck(DEFAULT_CARDS, "Home", 20, 4, 42);
    const b = buildDeck(DEFAULT_CARDS, "Home", 20, 4, 42);
    expect(a.scoring.map((c) => c.id)).toEqual(b.scoring.map((c) => c.id));
  });
});

describe("scoring", () => {
  it("awards difficulty points, doubled when armed", () => {
    const easy = DEFAULT_CARDS.find((c) => c.difficulty === "Easy")!;
    const extreme = DEFAULT_CARDS.find((c) => c.difficulty === "Extreme")!;
    expect(cardPoints(easy, false)).toBe(100);
    expect(cardPoints(easy, true)).toBe(200);
    expect(cardPoints(extreme, false)).toBe(500);
    expect(cardPoints(extreme, true)).toBe(1000);
  });

  it("ranks players by score, stable on ties", () => {
    const players = [
      player({ id: "a", score: 100 }),
      player({ id: "b", score: 300 }),
      player({ id: "c", score: 300 }),
    ];
    expect(rankedPlayers(players).map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("assigns shared positions for ties", () => {
    const players = [
      player({ id: "a", score: 300 }),
      player({ id: "b", score: 300 }),
      player({ id: "c", score: 100 }),
    ];
    const pos = finishingPositions(players);
    expect(pos.get("a")).toBe(1);
    expect(pos.get("b")).toBe(1);
    expect(pos.get("c")).toBe(3);
  });
});

describe("drinks", () => {
  it("follows the ladder 0/2/4/6", () => {
    expect(drinksForPosition(1)).toBe(0);
    expect(drinksForPosition(2)).toBe(2);
    expect(drinksForPosition(3)).toBe(4);
    expect(drinksForPosition(4)).toBe(6);
    expect(drinksForPosition(7)).toBe(6);
  });
});

describe("game reducer", () => {
  const config = {
    names: ["Ann", "Ben"],
    location: "Home" as const,
    drinkMode: false,
    cards: DEFAULT_CARDS,
    seed: 5,
  };

  it("creates two players with zeroed state", () => {
    const state = createGame(config);
    expect(state.players).toHaveLength(2);
    expect(state.players.every((p) => p.score === 0)).toBe(true);
    expect(state.phase).toBe("ready");
  });

  it("reveals a scoring card without chaos when roll is high", () => {
    const state = gameReducer(createGame(config), { type: "REVEAL", roll: 0.9 });
    expect(state.phase).toBe("card");
    expect(state.currentCard).not.toBeNull();
  });

  it("shows a chaos event first when roll is low", () => {
    const state = gameReducer(createGame(config), { type: "REVEAL", roll: 0 });
    expect(state.phase).toBe("chaos");
    expect(state.pendingChaos?.category).toBe("Chaos Event");
  });

  it("awards points on complete and advances the player", () => {
    let state = createGame(config);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    const expected = cardPoints(state.currentCard!, false);
    state = gameReducer(state, { type: "COMPLETE" });
    expect(state.phase).toBe("result");
    expect(state.players[0].score).toBe(expected);
    expect(state.players[0].scoringTurnsCompleted).toBe(1);

    state = gameReducer(state, { type: "NEXT" });
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.phase).toBe("ready");
  });

  it("awards zero on fail but still counts the turn", () => {
    let state = createGame(config);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    state = gameReducer(state, { type: "FAIL" });
    expect(state.players[0].score).toBe(0);
    expect(state.players[0].scoringTurnsCompleted).toBe(1);
  });

  it("doubles points when armed and consumes the lifeline", () => {
    let state = createGame(config);
    state = gameReducer(state, { type: "ARM_DOUBLE" });
    expect(state.players[0].doublePointsArmed).toBe(true);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    const expected = cardPoints(state.currentCard!, true);
    state = gameReducer(state, { type: "COMPLETE" });
    expect(state.players[0].score).toBe(expected);
    expect(state.players[0].doublePointsUsed).toBe(true);
    expect(state.players[0].doublePointsArmed).toBe(false);
  });

  it("swap replaces the current card and is single use", () => {
    let state = createGame(config);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    const first = state.currentCard;
    state = gameReducer(state, { type: "SWAP" });
    expect(state.players[0].swapUsed).toBe(true);
    expect(state.currentCard).not.toBe(first);
    // second swap is a no-op
    const before = state.currentCard;
    state = gameReducer(state, { type: "SWAP" });
    expect(state.currentCard).toBe(before);
  });

  it("finishes after every player completes their scoring turns", () => {
    let state: GameState = createGame(config);
    let guard = 0;
    while (!state.finished && guard++ < 1000) {
      if (state.phase === "ready") {
        state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
      } else if (state.phase === "chaos") {
        state = gameReducer(state, { type: "CONTINUE_CHAOS" });
      } else if (state.phase === "card") {
        state = gameReducer(state, { type: "COMPLETE" });
      } else if (state.phase === "result") {
        state = gameReducer(state, { type: "NEXT" });
      }
    }
    expect(state.finished).toBe(true);
    for (const p of state.players) {
      expect(p.scoringTurnsCompleted).toBe(SCORING_TURNS_PER_PLAYER);
    }
  });
});
