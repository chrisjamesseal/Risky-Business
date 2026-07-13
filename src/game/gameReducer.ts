import {
  SCORING_TURNS_PER_PLAYER,
  type Card,
  type GameLocation,
  type Player,
} from "../types";
import { buildDeck } from "./deckBuilder";
import { cardPoints } from "./scoring";

export type TurnPhase = "ready" | "interlude" | "card" | "result" | "checkin";

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  location: GameLocation;
  drinkMode: boolean;
  scoringQueue: Card[];
  interludeQueue: Card[];
  phase: TurnPhase;
  currentCard: Card | null;
  /** A non-scoring Group Round to show before the scoring card. */
  pendingInterlude: Card | null;
  /** Points awarded on the most recent resolution (for the result screen). */
  lastAward: number | null;
  lastDoubled: boolean;
  /** True when the last resolution started an Ongoing task (deferred points). */
  lastMissionStarted: boolean;
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
    pendingMission: null,
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
    lastAward: null,
    lastDoubled: false,
    lastMissionStarted: false,
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
  | { type: "START_MISSION" }
  | { type: "RESOLVE_MISSION"; success: boolean }
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
    case "START_MISSION":
      return startMission(state);
    case "RESOLVE_MISSION":
      return resolveMission(state, action.success);
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
      phase: "interlude",
    };
  }
  return {
    ...state,
    scoringQueue: restScoring,
    currentCard: card,
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
  const doubled = player.doublePointsArmed;
  const award = completed ? cardPoints(state.currentCard, doubled) : 0;

  return {
    ...state,
    players: updateCurrentPlayer(state, (p) => ({
      ...p,
      score: p.score + award,
      scoringTurnsCompleted: p.scoringTurnsCompleted + 1,
      doublePointsArmed: false,
      // Arming is consumed whether the card is completed or failed.
      doublePointsUsed: p.doublePointsUsed || doubled,
    })),
    lastAward: award,
    lastDoubled: doubled,
    lastMissionStarted: false,
    phase: "result",
  };
}

/**
 * Accept an Ongoing task. It counts as this scoring turn now; the points are
 * held and awarded (or not) at the player's next turn check-in.
 */
function startMission(state: GameState): GameState {
  if (state.phase !== "card" || !state.currentCard) return state;
  if (state.currentCard.category !== "Ongoing") return state;
  const player = state.players[state.currentPlayerIndex];
  const doubled = player.doublePointsArmed;
  const points = cardPoints(state.currentCard, doubled);
  const title = state.currentCard.title;

  return {
    ...state,
    players: updateCurrentPlayer(state, (p) => ({
      ...p,
      scoringTurnsCompleted: p.scoringTurnsCompleted + 1,
      pendingMission: { title, points },
      doublePointsArmed: false,
      doublePointsUsed: p.doublePointsUsed || doubled,
    })),
    lastAward: null,
    lastDoubled: doubled,
    lastMissionStarted: true,
    phase: "result",
  };
}

/** Check-in on a pending Ongoing task, then continue play. */
function resolveMission(state: GameState, success: boolean): GameState {
  if (state.phase !== "checkin") return state;
  const player = state.players[state.currentPlayerIndex];
  const mission = player.pendingMission;
  if (!mission) return state;
  const award = success ? mission.points : 0;

  const players = state.players.map((p, i) =>
    i === state.currentPlayerIndex
      ? { ...p, score: p.score + award, pendingMission: null }
      : p,
  );
  const resolved: GameState = { ...state, players };

  // Mid-game check-in: the player still has a turn to play, so hand it to them.
  const stillHasTurns =
    players[state.currentPlayerIndex].scoringTurnsCompleted <
    SCORING_TURNS_PER_PLAYER;
  if (stillHasTurns) {
    return {
      ...resolved,
      currentCard: null,
      pendingInterlude: null,
      lastAward: null,
      lastDoubled: false,
      lastMissionStarted: false,
      phase: "ready",
    };
  }
  // End-of-game check-in: settle the next pending mission or finish.
  return settleOrFinish(resolved);
}

function next(state: GameState): GameState {
  if (state.phase !== "result") return state;
  return advance(state);
}

/** Move play to the next player, routing through a check-in if one is due. */
function advance(state: GameState): GameState {
  const everyoneDone = state.players.every(
    (p) => p.scoringTurnsCompleted >= SCORING_TURNS_PER_PLAYER,
  );
  if (everyoneDone) return settleOrFinish(state);

  let idx = state.currentPlayerIndex;
  for (let i = 0; i < state.players.length; i++) {
    idx = (idx + 1) % state.players.length;
    if (state.players[idx].scoringTurnsCompleted < SCORING_TURNS_PER_PLAYER) {
      break;
    }
  }

  const cleared: GameState = {
    ...state,
    currentPlayerIndex: idx,
    currentCard: null,
    pendingInterlude: null,
    lastAward: null,
    lastDoubled: false,
    lastMissionStarted: false,
  };
  // A pending Ongoing task from this player's last turn is checked first.
  return {
    ...cleared,
    phase: state.players[idx].pendingMission ? "checkin" : "ready",
  };
}

/**
 * When everyone has taken their turns, resolve any still-pending Ongoing tasks
 * one at a time before ending the game.
 */
function settleOrFinish(state: GameState): GameState {
  const pendingIdx = state.players.findIndex((p) => p.pendingMission);
  if (pendingIdx >= 0) {
    return {
      ...state,
      currentPlayerIndex: pendingIdx,
      currentCard: null,
      pendingInterlude: null,
      lastAward: null,
      lastMissionStarted: false,
      phase: "checkin",
    };
  }
  return { ...state, finished: true, currentCard: null, phase: "ready" };
}
