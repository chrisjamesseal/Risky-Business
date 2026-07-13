import {
  SCORING_TURNS_PER_PLAYER,
  type Card,
  type GameLocation,
  type Player,
} from "../types";
import { buildDeck } from "./deckBuilder";
import { cardPoints } from "./scoring";

export type TurnPhase = "ready" | "interlude" | "card" | "result";

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  location: GameLocation;
  drinkMode: boolean;
  scoringQueue: Card[];
  interludeQueue: Card[];
  phase: TurnPhase;
  currentCard: Card | null;
  /** A non-scoring Group Round or Chaos Event to show before the scoring card. */
  pendingInterlude: Card | null;
  /** True when a "Double Trouble" interlude has doubled this turn's card. */
  chaosDoubled: boolean;
  /** Points awarded on the most recent resolution (for the result screen). */
  lastAward: number | null;
  lastDoubled: boolean;
  finished: boolean;
}

export interface NewGameConfig {
  names: string[];
  location: GameLocation;
  drinkMode: boolean;
  cards: Card[];
  seed?: number;
}

// Chance a non-scoring interlude (Group Round or Chaos Event) shows before a
// scoring card, when any interludes remain.
const INTERLUDE_CHANCE = 0.28;

export function createGame(config: NewGameConfig): GameState {
  const players: Player[] = config.names.map((name, index) => ({
    id: `player-${index}`,
    name: name.trim() || `Player ${index + 1}`,
    score: 0,
    scoringTurnsCompleted: 0,
    swapUsed: false,
    doublePointsUsed: false,
    doublePointsArmed: false,
  }));

  const scoringNeeded = players.length * SCORING_TURNS_PER_PLAYER;
  // Buffer covers up to one Swap per player without exhausting the deck.
  const deck = buildDeck(
    config.cards,
    config.location,
    scoringNeeded,
    players.length,
    config.seed,
  );

  return {
    players,
    currentPlayerIndex: 0,
    location: config.location,
    drinkMode: config.drinkMode,
    scoringQueue: deck.scoring,
    interludeQueue: deck.interludes,
    phase: "ready",
    currentCard: null,
    pendingInterlude: null,
    chaosDoubled: false,
    lastAward: null,
    lastDoubled: false,
    finished: false,
  };
}

export type GameAction =
  | { type: "ARM_DOUBLE" }
  | { type: "REVEAL"; roll: number }
  | { type: "CONTINUE_INTERLUDE" }
  | { type: "SWAP" }
  | { type: "COMPLETE" }
  | { type: "FAIL" }
  | { type: "NEXT" };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ARM_DOUBLE":
      return armDouble(state);
    case "REVEAL":
      return reveal(state, action.roll);
    case "CONTINUE_INTERLUDE":
      return state.phase === "interlude"
        ? { ...state, phase: "card", pendingInterlude: null }
        : state;
    case "SWAP":
      return swap(state);
    case "COMPLETE":
      return resolve(state, true);
    case "FAIL":
      return resolve(state, false);
    case "NEXT":
      return next(state);
    default:
      return state;
  }
}

function updateCurrentPlayer(
  state: GameState,
  update: (player: Player) => Player,
): Player[] {
  return state.players.map((player, index) =>
    index === state.currentPlayerIndex ? update(player) : player,
  );
}

function armDouble(state: GameState): GameState {
  if (state.phase !== "ready") return state;
  const player = state.players[state.currentPlayerIndex];
  if (player.doublePointsUsed || player.doublePointsArmed) return state;
  return {
    ...state,
    players: updateCurrentPlayer(state, (p) => ({
      ...p,
      doublePointsArmed: true,
    })),
  };
}

function reveal(state: GameState, roll: number): GameState {
  if (state.phase !== "ready") return state;
  const [card, ...restScoring] = state.scoringQueue;
  if (!card) return state; // safety: nothing left to draw

  const injectInterlude =
    roll < INTERLUDE_CHANCE && state.interludeQueue.length > 0;
  if (injectInterlude) {
    const [interlude, ...restInterludes] = state.interludeQueue;
    return {
      ...state,
      scoringQueue: restScoring,
      interludeQueue: restInterludes,
      currentCard: card,
      pendingInterlude: interlude,
      chaosDoubled: interlude.doublesNext === true,
      phase: "interlude",
    };
  }
  return {
    ...state,
    scoringQueue: restScoring,
    currentCard: card,
    chaosDoubled: false,
    phase: "card",
  };
}

function swap(state: GameState): GameState {
  if (state.phase !== "card" || !state.currentCard) return state;
  const player = state.players[state.currentPlayerIndex];
  if (player.swapUsed) return state;
  const [replacement, ...rest] = state.scoringQueue;
  if (!replacement) return state; // nothing to swap to
  return {
    ...state,
    // retired card returns to the back of the queue
    scoringQueue: [...rest, state.currentCard],
    currentCard: replacement,
    players: updateCurrentPlayer(state, (p) => ({ ...p, swapUsed: true })),
  };
}

function resolve(state: GameState, completed: boolean): GameState {
  if (state.phase !== "card" || !state.currentCard) return state;
  const player = state.players[state.currentPlayerIndex];
  // Doubled by the player's lifeline OR a Double Trouble chaos card this turn.
  const doubled = player.doublePointsArmed || state.chaosDoubled;
  const award = completed ? cardPoints(state.currentCard, doubled) : 0;

  return {
    ...state,
    players: updateCurrentPlayer(state, (p) => ({
      ...p,
      score: p.score + award,
      scoringTurnsCompleted: p.scoringTurnsCompleted + 1,
      doublePointsArmed: false,
      // Only the lifeline is consumed; the chaos effect is free.
      doublePointsUsed: p.doublePointsUsed || player.doublePointsArmed,
    })),
    lastAward: award,
    lastDoubled: doubled,
    phase: "result",
  };
}

function next(state: GameState): GameState {
  if (state.phase !== "result") return state;

  const everyoneDone = state.players.every(
    (p) => p.scoringTurnsCompleted >= SCORING_TURNS_PER_PLAYER,
  );
  if (everyoneDone) {
    return { ...state, finished: true, currentCard: null, phase: "ready" };
  }

  // Advance to the next player who still has scoring turns remaining.
  let idx = state.currentPlayerIndex;
  for (let i = 0; i < state.players.length; i++) {
    idx = (idx + 1) % state.players.length;
    if (state.players[idx].scoringTurnsCompleted < SCORING_TURNS_PER_PLAYER) {
      break;
    }
  }

  return {
    ...state,
    currentPlayerIndex: idx,
    currentCard: null,
    pendingInterlude: null,
    chaosDoubled: false,
    lastAward: null,
    lastDoubled: false,
    phase: "ready",
  };
}
