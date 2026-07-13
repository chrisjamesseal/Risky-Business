import { describe, expect, it } from "vitest";
import { DEFAULT_CARDS } from "../data/defaultCards";
import {
  buildDeck,
  cardsForLocation,
  isUsableInLocation,
  scoringCardsFor,
} from "./deckBuilder";
import { cardPoints, finishingPositions, rankedPlayers } from "./scoring";
import { drinksForPosition } from "./drinks";
import {
  createGame,
  gameReducer,
  type GameState,
  type NewGameConfig,
} from "./gameReducer";
import {
  CATEGORIES,
  DIFFICULTIES,
  isScoringCategory,
  LOCATIONS,
  SCORING_CATEGORIES,
  SCORING_TURNS_PER_PLAYER,
  type Card,
  type Player,
} from "../types";

/** Base game config for tests; every difficulty included by default. */
function gameConfig(overrides: Partial<NewGameConfig>): NewGameConfig {
  return {
    names: ["A", "B"],
    location: "Home",
    drinkMode: false,
    difficulties: [...DIFFICULTIES],
    cards: DEFAULT_CARDS,
    ...overrides,
  };
}

function player(overrides: Partial<Player> = {}): Player {
  return {
    id: "p",
    name: "P",
    score: 0,
    scoringTurnsCompleted: 0,
    swapUsed: false,
    doublePointsUsed: false,
    doublePointsArmed: false,
    pendingMission: null,
    ...overrides,
  };
}

describe("location filtering", () => {
  it("matches exact location or All", () => {
    expect(isUsableInLocation("All", "Pub")).toBe(true);
    expect(isUsableInLocation("Pub", "Pub")).toBe(true);
    expect(isUsableInLocation("Home", "Pub")).toBe(false);
  });

  it("only includes cards for the location (or All)", () => {
    const cards: Card[] = [
      { ...DEFAULT_CARDS[0], location: "Home" },
      { ...DEFAULT_CARDS[1], location: "Pub" },
    ];
    const usable = cardsForLocation(cards, "Home");
    expect(usable.length).toBe(1);
    expect(usable[0].location).toBe("Home");
  });

  it("filters scoring cards by the chosen difficulties", () => {
    const easyOnly = scoringCardsFor(DEFAULT_CARDS, "Home", ["Easy"]);
    expect(easyOnly.length).toBeGreaterThan(0);
    expect(easyOnly.every((c) => c.difficulty === "Easy")).toBe(true);
    const hardOnly = scoringCardsFor(DEFAULT_CARDS, "Home", ["Hard"]);
    expect(hardOnly.every((c) => c.difficulty === "Hard")).toBe(true);
  });
});

describe("default library balance", () => {
  it("has Group Round cards, and they are non-scoring", () => {
    const rounds = DEFAULT_CARDS.filter((c) => c.category === "Group Round");
    expect(rounds.length).toBeGreaterThan(0);
    expect(rounds.every((c) => !isScoringCategory(c.category))).toBe(true);
    // Group-only games must not linger as scoring Mini Games.
    const titles = DEFAULT_CARDS.filter(
      (c) => c.category === "Mini Game",
    ).map((c) => c.title);
    expect(titles).not.toContain("Never Have I Ever");
    expect(titles).not.toContain("Would You Rather");
  });

  it("keeps truths at Easy or Medium so big points require action cards", () => {
    const truths = DEFAULT_CARDS.filter((c) => c.category === "Truth");
    expect(truths.length).toBeGreaterThan(0);
    for (const t of truths) {
      expect(["Easy", "Medium"]).toContain(t.difficulty);
    }
  });

  it("every location offers an Extreme action card for late-game turns", () => {
    for (const location of LOCATIONS) {
      const usable = cardsForLocation(DEFAULT_CARDS, location);
      const extreme = usable.filter(
        (c) => c.difficulty === "Extreme" && c.category !== "Truth",
      );
      expect(extreme.length).toBeGreaterThan(0);
    }
  });

  it("every location has enough scoring cards for an 8-player game", () => {
    const needed = 8 * SCORING_TURNS_PER_PLAYER; // 40
    for (const location of LOCATIONS) {
      const scoring = cardsForLocation(DEFAULT_CARDS, location).filter((c) =>
        (SCORING_CATEGORIES as readonly string[]).includes(c.category),
      );
      expect(scoring.length).toBeGreaterThanOrEqual(needed);
    }
  });
});

describe("deck builds for every player count and location", () => {
  it("returns the right deck for 2 through 8 players everywhere", () => {
    for (let players = 2; players <= 8; players++) {
      const scoringNeeded = players * SCORING_TURNS_PER_PLAYER;
      for (const location of LOCATIONS) {
        const deck = buildDeck(
          DEFAULT_CARDS,
          location,
          scoringNeeded,
          players,
          players, // deterministic seed
        );
        expect(deck.scoring.length).toBe(scoringNeeded + players);
        expect(deck.scoring.every((c) => isScoringCategory(c.category))).toBe(
          true,
        );
        expect(
          deck.interludes.every((c) => !isScoringCategory(c.category)),
        ).toBe(true);
      }
    }
  });
});

describe("buildDeck", () => {
  it("returns exactly the requested number of scoring cards plus buffer", () => {
    const deck = buildDeck(DEFAULT_CARDS, "Home", 40, 8, 123);
    expect(deck.scoring.length).toBe(48);
    expect(deck.scoring.every((c) => isScoringCategory(c.category))).toBe(true);
  });

  it("puts Group Rounds in the interlude pool, not the scoring deck", () => {
    const deck = buildDeck(DEFAULT_CARDS, "Home", 20, 0, 3);
    expect(deck.interludes.every((c) => c.category === "Group Round")).toBe(
      true,
    );
    expect(deck.interludes.length).toBeGreaterThan(0);
    expect(deck.scoring.some((c) => c.category === "Group Round")).toBe(false);
    // Ongoing cards are scoring, so they belong in the scoring deck.
    expect(deck.scoring.some((c) => c.category === "Ongoing")).toBe(true);
  });

  it("only includes location-appropriate cards", () => {
    const deck = buildDeck(DEFAULT_CARDS, "Pub", 20, 0, 7);
    for (const card of [...deck.scoring, ...deck.interludes]) {
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
  const config = gameConfig({ names: ["Ann", "Ben"], seed: 5 });

  it("creates two players with zeroed state", () => {
    const state = createGame(config);
    expect(state.players).toHaveLength(2);
    expect(state.players.every((p) => p.score === 0)).toBe(true);
    expect(state.phase).toBe("ready");
  });

  it("reveals a scoring card without an interlude when roll is high", () => {
    const state = gameReducer(createGame(config), { type: "REVEAL", roll: 0.9 });
    expect(state.phase).toBe("card");
    expect(state.currentCard).not.toBeNull();
    expect(isScoringCategory(state.currentCard!.category)).toBe(true);
  });

  it("shows a non-scoring interlude first when roll is low", () => {
    const state = gameReducer(createGame(config), { type: "REVEAL", roll: 0 });
    expect(state.phase).toBe("interlude");
    expect(state.pendingInterlude).not.toBeNull();
    expect(isScoringCategory(state.pendingInterlude!.category)).toBe(false);
    // The scoring card is queued behind it and never awards points itself.
    expect(isScoringCategory(state.currentCard!.category)).toBe(true);
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
        // roll 0 forces interludes so this path is exercised too
        state = gameReducer(state, { type: "REVEAL", roll: 0 });
      } else if (state.phase === "interlude") {
        state = gameReducer(state, { type: "CONTINUE_INTERLUDE" });
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

describe("chaos removed", () => {
  it("has no Chaos Event cards or category", () => {
    expect(CATEGORIES as readonly string[]).not.toContain("Chaos Event");
    expect(
      DEFAULT_CARDS.some((c) => (c.category as string) === "Chaos Event"),
    ).toBe(false);
  });
});

describe("Mini Games (winner picks up the points)", () => {
  const mini: Card = {
    id: "mg",
    title: "Categories",
    description: "play",
    category: "Mini Game",
    difficulty: "Medium",
    location: "All",
  };

  it("has default Mini Games, and they are scoring", () => {
    const games = DEFAULT_CARDS.filter((c) => c.category === "Mini Game");
    expect(games.length).toBeGreaterThan(0);
    expect(games.every((c) => isScoringCategory(c.category))).toBe(true);
    // The old solo mini-games moved out.
    expect(games.map((c) => c.title)).not.toContain("Coaster Toss");
  });

  it("awards the card's points to the chosen winner", () => {
    let state = createGame(gameConfig({ cards: [mini], seed: 4 }));
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    expect(state.currentCard?.category).toBe("Mini Game");
    const winner = state.players[1];
    state = gameReducer(state, { type: "AWARD_MINI", winnerId: winner.id });
    expect(state.phase).toBe("result");
    expect(state.players[1].score).toBe(200); // Medium
    expect(state.players[0].score).toBe(0);
    // The current player spent their turn regardless of who won.
    expect(state.players[0].scoringTurnsCompleted).toBe(1);
    expect(state.lastWinnerName).toBe(winner.name);
  });

  it("awards nothing when there's no winner", () => {
    let state = createGame(gameConfig({ cards: [mini], seed: 4 }));
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    state = gameReducer(state, { type: "AWARD_MINI", winnerId: null });
    expect(state.players.every((p) => p.score === 0)).toBe(true);
    expect(state.players[0].scoringTurnsCompleted).toBe(1);
    expect(state.lastWinnerName).toBeNull();
  });
});

describe("Ongoing tasks", () => {
  const card = (id: string, category: Card["category"]): Card => ({
    id,
    title: id === "on" ? "Accent" : id,
    description: "do a thing",
    category,
    difficulty: "Easy",
    location: "All",
  });

  it("has Ongoing cards, and they are scoring", () => {
    const ongoing = DEFAULT_CARDS.filter((c) => c.category === "Ongoing");
    expect(ongoing.length).toBeGreaterThan(0);
    expect(ongoing.every((c) => isScoringCategory(c.category))).toBe(true);
  });

  // A deck where every scoring card is an Ongoing "Accent" task.
  const cfg = gameConfig({ cards: [card("on", "Ongoing")], seed: 2 });

  it("defers points: start now, check and score at the next turn", () => {
    let state = createGame(cfg);
    // Reveal Player A's ongoing card (roll high = no interlude available anyway)
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    expect(state.currentCard?.category).toBe("Ongoing");

    state = gameReducer(state, { type: "START_MISSION" });
    expect(state.phase).toBe("result");
    expect(state.lastMissionStarted).toBe(true);
    expect(state.players[0].pendingMission?.points).toBe(100);
    expect(state.players[0].score).toBe(0); // not yet awarded
    expect(state.players[0].scoringTurnsCompleted).toBe(1); // but the turn counted

    // Player B's turn — no pending mission for them
    state = gameReducer(state, { type: "NEXT" });
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.phase).toBe("ready");
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    state = gameReducer(state, { type: "START_MISSION" });
    state = gameReducer(state, { type: "NEXT" });

    // Back to Player A: their task is checked before they play again
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.phase).toBe("checkin");
    state = gameReducer(state, { type: "RESOLVE_MISSION", success: true });
    expect(state.players[0].score).toBe(100); // awarded now
    expect(state.players[0].pendingMission).toBeNull();
    expect(state.phase).toBe("ready"); // their turn continues
  });

  it("finishes the game by settling any tasks left pending at the end", () => {
    let state = createGame(cfg);
    let guard = 0;
    while (!state.finished && guard++ < 2000) {
      switch (state.phase) {
        case "ready":
          state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
          break;
        case "card":
          state = gameReducer(state, { type: "START_MISSION" });
          break;
        case "checkin":
          state = gameReducer(state, { type: "RESOLVE_MISSION", success: true });
          break;
        case "result":
          state = gameReducer(state, { type: "NEXT" });
          break;
        default:
          state = gameReducer(state, { type: "NEXT" });
      }
    }
    expect(state.finished).toBe(true);
    // No missions left hanging, and every task was scored.
    expect(state.players.every((p) => p.pendingMission === null)).toBe(true);
    for (const p of state.players) {
      expect(p.scoringTurnsCompleted).toBe(SCORING_TURNS_PER_PLAYER);
      expect(p.score).toBe(SCORING_TURNS_PER_PLAYER * 100);
    }
  });
});
