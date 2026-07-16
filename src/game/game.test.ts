import { describe, expect, it } from "vitest";
import { DEFAULT_CARDS } from "../data/defaultCards";
import { DEFAULT_CATEGORIES } from "../data/categories";
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
  behaviorByCategory,
  DIFFICULTIES,
  isScoringBehavior,
  LOCATIONS,
  ROUND_OPTIONS,
  SCORING_TURNS_PER_PLAYER,
  type Card,
  type CategoryDef,
  type Player,
} from "../types";
import { sanitizeCards } from "../storage/localStorage";

const BEHAVIOR = behaviorByCategory(DEFAULT_CATEGORIES);
const scores = (category: string) =>
  BEHAVIOR[category] !== undefined && isScoringBehavior(BEHAVIOR[category]);

/** Base game config for tests; every difficulty and default categories. */
function gameConfig(overrides: Partial<NewGameConfig>): NewGameConfig {
  return {
    names: ["A", "B"],
    location: "At Home",
    drinkMode: false,
    difficulties: [...DIFFICULTIES],
    cards: DEFAULT_CARDS,
    categories: DEFAULT_CATEGORIES,
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
    expect(isUsableInLocation("All", "Pub Trip")).toBe(true);
    expect(isUsableInLocation("Pub Trip", "Pub Trip")).toBe(true);
    expect(isUsableInLocation("At Home", "Pub Trip")).toBe(false);
  });

  it("only includes cards for the location (or All)", () => {
    const cards: Card[] = [
      { ...DEFAULT_CARDS[0], location: "At Home" },
      { ...DEFAULT_CARDS[1], location: "Pub Trip" },
    ];
    const usable = cardsForLocation(cards, "At Home");
    expect(usable.length).toBe(1);
    expect(usable[0].location).toBe("At Home");
  });

  it("filters scoring cards by the chosen difficulties", () => {
    const easyOnly = scoringCardsFor(DEFAULT_CARDS, "At Home", ["Easy"], DEFAULT_CATEGORIES);
    expect(easyOnly.length).toBeGreaterThan(0);
    expect(easyOnly.every((c) => c.difficulty === "Easy")).toBe(true);
    const hardOnly = scoringCardsFor(DEFAULT_CARDS, "At Home", ["Hard"], DEFAULT_CATEGORIES);
    expect(hardOnly.every((c) => c.difficulty === "Hard")).toBe(true);
  });
});

describe("locations", () => {
  it("uses the renamed location set", () => {
    expect(LOCATIONS).toEqual(["At Home", "Pub Trip", "Night Out"]);
  });

  it("migrates legacy location names when sanitising stored cards", () => {
    const legacy = [
      { id: "a", description: "d1", category: "Truth", difficulty: "Easy", location: "Home" },
      { id: "b", description: "d2", category: "Truth", difficulty: "Easy", location: "Pub" },
      { id: "c", description: "d3", category: "Truth", difficulty: "Easy", location: "Club/Festival" },
    ];
    const sanitized = sanitizeCards(legacy, new Set(["Truth"]));
    expect(sanitized?.map((c) => c.location)).toEqual([
      "At Home",
      "Pub Trip",
      "Night Out",
    ]);
  });

  it("migrates legacy minute-based durations to round-based ones", () => {
    const legacy = [
      { id: "a", description: "d1", category: "Task", difficulty: "Easy", location: "All", duration: "1 min" },
      { id: "b", description: "d2", category: "Task", difficulty: "Easy", location: "All", duration: "2 min" },
      { id: "c", description: "d3", category: "Task", difficulty: "Easy", location: "All", duration: "5 min" },
      { id: "d", description: "d4", category: "Task", difficulty: "Easy", location: "All", duration: "Until next turn" },
    ];
    const sanitized = sanitizeCards(legacy, new Set(["Task"]));
    expect(sanitized?.map((c) => c.duration)).toEqual([
      "1 round",
      "2 rounds",
      "3 rounds",
      "Next round",
    ]);
  });
});

describe("difficulty tiers", () => {
  it("no longer includes Extreme", () => {
    expect(DIFFICULTIES as readonly string[]).not.toContain("Extreme");
    expect(DIFFICULTIES).toEqual(["Easy", "Medium", "Hard"]);
    expect(DEFAULT_CARDS.some((c) => (c.difficulty as string) === "Extreme")).toBe(
      false,
    );
  });
});

describe("default library", () => {
  it("has Group cards, and they are non-scoring", () => {
    const rounds = DEFAULT_CARDS.filter((c) => c.category === "Group");
    expect(rounds.length).toBeGreaterThan(0);
    expect(rounds.every((c) => !scores(c.category))).toBe(true);
  });

  it("Mini Game is defined as a non-scoring category (may have zero cards)", () => {
    const minis = DEFAULT_CARDS.filter((c) => c.category === "Mini Game");
    expect(minis.every((c) => !scores(c.category))).toBe(true);
    expect(scores("Mini Game")).toBe(false);
  });

  it("has Task cards (deferred, checked at the next turn), and they score", () => {
    const tasks = DEFAULT_CARDS.filter((c) => c.category === "Task");
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((c) => scores(c.category))).toBe(true);
  });

  it("has no card left over without a matching category", () => {
    const names = new Set(DEFAULT_CATEGORIES.map((c) => c.name));
    expect(DEFAULT_CARDS.every((c) => names.has(c.category))).toBe(true);
  });

  it("has an {opponent}-token card for random-opponent challenges", () => {
    expect(DEFAULT_CARDS.some((c) => c.description.includes("{opponent}"))).toBe(
      true,
    );
  });
});

describe("deck builds for every player count and location", () => {
  it("returns the right deck for 2 through 8 players everywhere", () => {
    for (let players = 2; players <= 8; players++) {
      const scoringNeeded = players * SCORING_TURNS_PER_PLAYER;
      for (const location of LOCATIONS) {
        const deck = buildDeck(
          DEFAULT_CARDS,
          DEFAULT_CATEGORIES,
          location,
          scoringNeeded,
          players,
          players, // deterministic seed
        );
        expect(deck.scoring.length).toBe(scoringNeeded + players);
        expect(deck.scoring.every((c) => scores(c.category))).toBe(true);
        expect(deck.interludes.every((c) => !scores(c.category))).toBe(true);
      }
    }
  });
});

describe("buildDeck", () => {
  it("returns exactly the requested number of scoring cards plus buffer", () => {
    const deck = buildDeck(DEFAULT_CARDS, DEFAULT_CATEGORIES, "At Home", 40, 8, 123);
    expect(deck.scoring.length).toBe(48);
    expect(deck.scoring.every((c) => scores(c.category))).toBe(true);
  });

  it("puts Group and Mini Game cards in the interlude pool, not the scoring deck", () => {
    const deck = buildDeck(DEFAULT_CARDS, DEFAULT_CATEGORIES, "At Home", 20, 0, 3);
    expect(
      deck.interludes.every((c) => c.category === "Group" || c.category === "Mini Game"),
    ).toBe(true);
    expect(deck.interludes.length).toBeGreaterThan(0);
    expect(deck.scoring.some((c) => c.category === "Group")).toBe(false);
    // Task cards are scoring, so they belong in the scoring deck.
    expect(deck.scoring.some((c) => c.category === "Task")).toBe(true);
  });

  it("only includes location-appropriate cards", () => {
    const deck = buildDeck(DEFAULT_CARDS, DEFAULT_CATEGORIES, "Pub Trip", 20, 0, 7);
    for (const card of [...deck.scoring, ...deck.interludes]) {
      expect(["Pub Trip", "All"]).toContain(card.location);
    }
  });

  it("does not force an easy-to-hard ramp - difficulty is shuffled", () => {
    // A pool where difficulty is fully distinguishable by id.
    const pool: Card[] = [
      { id: "e1", description: "e1", category: "Truth", difficulty: "Easy", location: "All" },
      { id: "e2", description: "e2", category: "Truth", difficulty: "Easy", location: "All" },
      { id: "h1", description: "h1", category: "Truth", difficulty: "Hard", location: "All" },
      { id: "h2", description: "h2", category: "Truth", difficulty: "Hard", location: "All" },
    ];
    const cats: CategoryDef[] = [
      { name: "Truth", behavior: "standard", icon: "", color: "", description: "" },
    ];
    // Across several seeds, a Hard card should turn up first at least once -
    // a rising-difficulty curve would never allow that.
    const firstIsHard = Array.from({ length: 20 }, (_, seed) =>
      buildDeck(pool, cats, "At Home", 4, 0, seed).scoring[0].difficulty,
    ).some((d) => d === "Hard");
    expect(firstIsHard).toBe(true);
  });

  it("is deterministic for a given seed", () => {
    const a = buildDeck(DEFAULT_CARDS, DEFAULT_CATEGORIES, "At Home", 20, 4, 42);
    const b = buildDeck(DEFAULT_CARDS, DEFAULT_CATEGORIES, "At Home", 20, 4, 42);
    expect(a.scoring.map((c) => c.id)).toEqual(b.scoring.map((c) => c.id));
  });

  it("routes custom categories by their behaviour", () => {
    const cats: CategoryDef[] = [
      { name: "Q", behavior: "standard", icon: "?", color: "", description: "" },
      { name: "Fun", behavior: "group", icon: "!", color: "", description: "" },
    ];
    const cards: Card[] = [
      { id: "q1", description: "d", category: "Q", difficulty: "Easy", location: "All" },
      { id: "f1", description: "d", category: "Fun", difficulty: "Easy", location: "All" },
    ];
    const deck = buildDeck(cards, cats, "At Home", 4, 0, 1);
    expect(deck.scoring.every((c) => c.category === "Q")).toBe(true);
    expect(deck.interludes.every((c) => c.category === "Fun")).toBe(true);
    expect(deck.interludes.length).toBe(1);
  });
});

describe("scoring", () => {
  it("awards difficulty points, doubled when armed", () => {
    const easy = DEFAULT_CARDS.find((c) => c.difficulty === "Easy")!;
    const hard = DEFAULT_CARDS.find((c) => c.difficulty === "Hard")!;
    expect(cardPoints(easy, false)).toBe(100);
    expect(cardPoints(easy, true)).toBe(200);
    expect(cardPoints(hard, false)).toBe(300);
    expect(cardPoints(hard, true)).toBe(600);
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
    expect(scores(state.currentCard!.category)).toBe(true);
  });

  it("shows a non-scoring interlude first when roll is low", () => {
    const state = gameReducer(createGame(config), { type: "REVEAL", roll: 0 });
    expect(state.phase).toBe("interlude");
    expect(state.pendingInterlude).not.toBeNull();
    expect(scores(state.pendingInterlude!.category)).toBe(false);
    // The scoring card is queued behind it and never awards points itself.
    expect(scores(state.currentCard!.category)).toBe(true);
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

  it("swap replaces the current card, costs 50 points, and is single use", () => {
    let state = createGame(config);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    const first = state.currentCard;
    const before = state.players[0].score;
    state = gameReducer(state, { type: "SWAP" });
    expect(state.players[0].swapUsed).toBe(true);
    expect(state.players[0].score).toBe(before - 50); // swap penalty
    expect(state.currentCard).not.toBe(first);
    // second swap is a no-op (no further penalty)
    const card = state.currentCard;
    const score = state.players[0].score;
    state = gameReducer(state, { type: "SWAP" });
    expect(state.currentCard).toBe(card);
    expect(state.players[0].score).toBe(score);
  });

  it("swapping while ×2 is armed cancels the bonus but doesn't burn the lifeline", () => {
    let state = createGame(config);
    state = gameReducer(state, { type: "ARM_DOUBLE" });
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    expect(state.players[0].doublePointsArmed).toBe(true);
    state = gameReducer(state, { type: "SWAP" });
    expect(state.players[0].doublePointsArmed).toBe(false);
    expect(state.players[0].doublePointsUsed).toBe(false); // not burned
    // Completing the swapped-in card is not doubled.
    const expected = cardPoints(state.currentCard!, false);
    const before = state.players[0].score;
    state = gameReducer(state, { type: "COMPLETE" });
    expect(state.players[0].score).toBe(before + expected);
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

  it("defaults to 5 rounds per player, and honours a chosen option", () => {
    const defaultState = createGame(config);
    expect(defaultState.roundsPerPlayer).toBe(5);
    expect(ROUND_OPTIONS).toEqual([3, 5, 10]);

    const short = createGame(gameConfig({ seed: 5, roundsPerPlayer: 1 }));
    expect(short.roundsPerPlayer).toBe(1);
    let state: GameState = short;
    let guard = 0;
    while (!state.finished && guard++ < 200) {
      if (state.phase === "ready") {
        state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
      } else if (state.phase === "card") {
        state = gameReducer(state, { type: "COMPLETE" });
      } else if (state.phase === "result") {
        state = gameReducer(state, { type: "NEXT" });
      }
    }
    expect(state.finished).toBe(true);
    for (const p of state.players) {
      expect(p.scoringTurnsCompleted).toBe(1);
    }
  });

  it("changing location mid-game rebuilds the queues without touching scores", () => {
    let state = createGame(config);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    state = gameReducer(state, { type: "COMPLETE" });
    const scoreBefore = state.players[0].score;
    state = gameReducer(state, { type: "NEXT" }); // back to phase "ready" for player B

    state = gameReducer(state, { type: "CHANGE_LOCATION", location: "Night Out" });
    expect(state.location).toBe("Night Out");
    expect(state.players[0].score).toBe(scoreBefore); // untouched

    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    expect(["Night Out", "All"]).toContain(state.currentCard!.location);
  });

  it("ignores CHANGE_LOCATION mid-card (only allowed between turns)", () => {
    let state = createGame(config);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    expect(state.phase).toBe("card");
    const next = gameReducer(state, { type: "CHANGE_LOCATION", location: "Night Out" });
    expect(next.location).toBe(state.location); // unchanged
  });
});

describe("opponent name token", () => {
  const tokenCard: Card = {
    id: "opp",
    description: "Arm wrestle {opponent}.",
    category: "Truth",
    difficulty: "Easy",
    location: "All",
  };
  const cfg = gameConfig({
    names: ["Ann", "Ben", "Cid"],
    cards: [tokenCard],
    seed: 7,
  });

  it("replaces {opponent} with a different player's name on reveal", () => {
    const state = gameReducer(createGame(cfg), { type: "REVEAL", roll: 0.9 });
    const desc = state.currentCard!.description;
    expect(desc).not.toContain("{opponent}");
    expect(desc).toContain("Arm wrestle");
    // The named opponent must not be the current player (Ann).
    expect(desc).not.toContain("Arm wrestle Ann.");
    expect(desc === "Arm wrestle Ben." || desc === "Arm wrestle Cid.").toBe(true);
  });

  it("leaves cards without the token untouched", () => {
    const plain: Card = { ...tokenCard, id: "plain", description: "Do a dance." };
    const state = gameReducer(
      createGame(gameConfig({ cards: [plain], seed: 1 })),
      { type: "REVEAL", roll: 0.9 },
    );
    expect(state.currentCard!.description).toBe("Do a dance.");
  });

  it("resolves the token regardless of case or stray whitespace", () => {
    const messyCard: Card = {
      ...tokenCard,
      id: "messy",
      description: "Arm wrestle {Opponent} and { opponent }.",
    };
    const state = gameReducer(
      createGame(gameConfig({ cards: [messyCard], seed: 9 })),
      { type: "REVEAL", roll: 0.9 },
    );
    const desc = state.currentCard!.description;
    expect(desc).not.toMatch(/\{\s*opponent\s*\}/i);
    expect(desc).not.toContain("Ann");
  });
});


describe("the 'mini' winner behaviour (available for custom categories)", () => {
  const winnerCat: CategoryDef = {
    name: "Winner Game",
    behavior: "mini",
    icon: "🏆",
    color: "",
    description: "",
  };
  const card: Card = {
    id: "wg",
    description: "play",
    category: "Winner Game",
    difficulty: "Medium",
    location: "All",
  };
  const cfg = gameConfig({ cards: [card], categories: [winnerCat], seed: 4 });

  it("awards the card's points to the chosen winner", () => {
    let state = createGame(cfg);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    expect(state.currentCard?.category).toBe("Winner Game");
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
    let state = createGame(cfg);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    state = gameReducer(state, { type: "AWARD_MINI", winnerId: null });
    expect(state.players.every((p) => p.score === 0)).toBe(true);
    expect(state.players[0].scoringTurnsCompleted).toBe(1);
    expect(state.lastWinnerName).toBeNull();
  });
});

describe("Task cards (Ongoing behaviour, deferred to next turn)", () => {
  const card = (id: string): Card => ({
    id,
    description: "do a thing",
    category: "Task",
    difficulty: "Easy",
    location: "All",
  });

  it("has Task cards, and they are scoring", () => {
    const tasks = DEFAULT_CARDS.filter((c) => c.category === "Task");
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((c) => scores(c.category))).toBe(true);
  });

  const cfg = gameConfig({ cards: [card("on")], seed: 2 });

  it("defers points: start now, check and score at the next turn", () => {
    let state = createGame(cfg);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    expect(state.currentCard?.category).toBe("Task");

    state = gameReducer(state, { type: "START_MISSION" });
    expect(state.phase).toBe("result");
    expect(state.lastMissionStarted).toBe(true);
    expect(state.players[0].pendingMission?.points).toBe(100);
    expect(state.players[0].score).toBe(0); // not yet awarded
    expect(state.players[0].scoringTurnsCompleted).toBe(1); // but the turn counted

    // Player B's turn - no pending mission for them
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

describe("1v1 cards (duel behaviour - only the reader can score)", () => {
  const duelCard: Card = {
    id: "d1",
    description: "Arm wrestle {opponent}.",
    category: "1v1",
    difficulty: "Medium",
    location: "All",
  };

  it("has default 1v1 cards, and they are scoring", () => {
    const duels = DEFAULT_CARDS.filter((c) => c.category === "1v1");
    expect(duels.length).toBeGreaterThan(0);
    expect(duels.every((c) => scores(c.category))).toBe(true);
  });

  it("no longer has a Challenge category - 1v1 replaced it", () => {
    expect(DEFAULT_CATEGORIES.some((c) => c.name === "Challenge")).toBe(false);
    expect(DEFAULT_CARDS.some((c) => c.category === "Challenge")).toBe(false);
  });

  it("awards the reader points on COMPLETE; nobody scores on FAIL", () => {
    const cfg = gameConfig({ cards: [duelCard], seed: 3 });
    let state = createGame(cfg);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    expect(state.currentCard?.category).toBe("1v1");
    const expected = cardPoints(state.currentCard!, false);
    state = gameReducer(state, { type: "COMPLETE" });
    expect(state.players[0].score).toBe(expected);
    expect(state.players[1].score).toBe(0); // the opponent never scores
  });

  it("awards nobody on FAIL - losing doesn't hand points to the opponent", () => {
    const cfg = gameConfig({ cards: [duelCard], seed: 3 });
    let state = createGame(cfg);
    state = gameReducer(state, { type: "REVEAL", roll: 0.9 });
    state = gameReducer(state, { type: "FAIL" });
    expect(state.players.every((p) => p.score === 0)).toBe(true);
    expect(state.players[0].scoringTurnsCompleted).toBe(1);
  });
});
