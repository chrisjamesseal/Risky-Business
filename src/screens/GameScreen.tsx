import { useEffect, useReducer } from "react";
import { Button } from "../components/ui";
import { GameCard } from "../components/GameCard";
import { Leaderboard } from "../components/Leaderboard";
import {
  createGame,
  gameReducer,
  type NewGameConfig,
} from "../game/gameReducer";
import { cardPoints } from "../game/scoring";
import { SCORING_TURNS_PER_PLAYER, type Player } from "../types";

export function GameScreen({
  config,
  onFinish,
  onQuit,
}: {
  config: NewGameConfig;
  onFinish: (players: Player[], drinkMode: boolean) => void;
  onQuit: () => void;
}) {
  const [state, dispatch] = useReducer(gameReducer, config, createGame);

  useEffect(() => {
    if (state.finished) onFinish(state.players, state.drinkMode);
  }, [state.finished, state.players, state.drinkMode, onFinish]);

  const player = state.players[state.currentPlayerIndex];
  const everyoneDoneAfterThis = state.players.every(
    (p) => p.scoringTurnsCompleted >= SCORING_TURNS_PER_PLAYER,
  );
  const doubled = player.doublePointsArmed;
  const stake = state.currentCard ? cardPoints(state.currentCard, doubled) : 0;
  const currentBehavior = state.currentCard
    ? state.behavior[state.currentCard.category]
    : undefined;
  const isOngoing = currentBehavior === "ongoing";
  const isMini = currentBehavior === "mini";

  const quit = () => {
    if (window.confirm("Quit the game? All scores will be lost.")) onQuit();
  };

  return (
    <div className="screen" style={{ paddingBottom: 0 }}>
      <div className="topbar">
        <button className="icon-btn" onClick={quit} aria-label="Quit game">
          ←
        </button>
        <div className="spacer" />
        <span className="muted" style={{ fontSize: 11 }}>
          {config.location}
          {config.drinkMode ? " · 🍺" : ""}
        </span>
      </div>

      <div className="game-top">
        <div className="turn-banner">
          <span className="turn-banner__name">{player.name}</span>
          <span className="turn-banner__score">{player.score}</span>
        </div>
      </div>

      <div className="game-body">
        {state.phase === "ready" && (
          <div className="stack handoff">
            <div className="handoff__icon">📲</div>
            <p className="handoff__label">Pass the phone to</p>
            <p className="handoff__name">{player.name}</p>
            {!player.doublePointsUsed && (
              <Button
                variant={player.doublePointsArmed ? "warn" : "outline"}
                large
                block
                disabled={player.doublePointsArmed}
                onClick={() => dispatch({ type: "ARM_DOUBLE" })}
              >
                {player.doublePointsArmed
                  ? "⚡ ×2 ARMED - next card doubles!"
                  : "⚡ ×2 Double Points"}
              </Button>
            )}
            <p className="handoff__hint muted">
              {player.doublePointsArmed
                ? "Locked in - reveal your card."
                : player.doublePointsUsed
                  ? " "
                  : "Gamble your ×2 before revealing - it locks once the card is out."}
            </p>
            <Button
              variant="primary"
              large
              block
              onClick={() => dispatch({ type: "REVEAL", roll: Math.random() })}
            >
              Reveal Card
            </Button>
          </div>
        )}

        {state.phase === "interlude" && state.pendingInterlude && (
          <div className="stack">
            <GameCard card={state.pendingInterlude} />
            <p className="muted" style={{ textAlign: "center", fontSize: 12 }}>
              Everyone joins in - no points. Then {player.name}'s card.
            </p>
            <Button
              variant="secondary"
              block
              onClick={() => dispatch({ type: "CONTINUE_INTERLUDE" })}
            >
              Continue →
            </Button>
          </div>
        )}

        {state.phase === "card" && state.currentCard && isOngoing && (
          <div className="stack">
            <GameCard card={state.currentCard} playerName={player.name} doubled={doubled} />
            <p className="muted" style={{ textAlign: "center", fontSize: 12 }}>
              Keep it up until your next turn - the group checks then for +{stake}.
            </p>
            <div className="btn-row">
              <Button
                variant="warn"
                onClick={() => dispatch({ type: "START_MISSION" })}
              >
                ▶ Start Task
              </Button>
              <Button
                variant="danger"
                onClick={() => dispatch({ type: "FAIL" })}
              >
                ✗ Skip · 0
              </Button>
            </div>
          </div>
        )}

        {state.phase === "card" && state.currentCard && isMini && (
          <div className="stack">
            <GameCard card={state.currentCard} playerName={player.name} doubled={doubled} />
            <p className="muted" style={{ textAlign: "center", fontSize: 12 }}>
              Everyone plays - then tap who won for +{stake}.
            </p>
            <div className="winner-grid">
              {state.players.map((p) => (
                <button
                  key={p.id}
                  className="chip chip--active"
                  onClick={() =>
                    dispatch({ type: "AWARD_MINI", winnerId: p.id })
                  }
                >
                  🏆 {p.name}
                </button>
              ))}
            </div>
            <Button
              variant="danger"
              block
              onClick={() => dispatch({ type: "AWARD_MINI", winnerId: null })}
            >
              ✗ No winner · 0
            </Button>
          </div>
        )}

        {state.phase === "card" && state.currentCard && !isOngoing && !isMini && (
          <div className="stack">
            <GameCard card={state.currentCard} playerName={player.name} doubled={doubled} />
            <div className="btn-row">
              <Button
                variant="success"
                onClick={() => dispatch({ type: "COMPLETE" })}
              >
                ✓ Done +{stake}
              </Button>
              <Button
                variant="danger"
                onClick={() => dispatch({ type: "FAIL" })}
              >
                ✗ Fail · 0
              </Button>
            </div>
          </div>
        )}

        {state.phase === "card" && state.currentCard && !player.swapUsed && (
          <Button
            variant={player.doublePointsArmed ? "danger" : "default"}
            block
            className={player.doublePointsArmed ? undefined : "btn--muted"}
            onClick={() => dispatch({ type: "SWAP" })}
          >
            {player.doublePointsArmed
              ? "🔄 Swap - loses your ⚡×2! · -50"
              : "🔄 Swap this card · -50"}
          </Button>
        )}

        {state.phase === "checkin" && player.pendingMission && (
          <div className="stack" style={{ textAlign: "center" }}>
            <div className="handoff__icon">⏳</div>
            <p className="handoff__label">Task check for</p>
            <p className="handoff__name">{player.name}</p>
            <p style={{ fontSize: 17, lineHeight: 1.4 }}>
              Did {player.name} keep up:{" "}
              <span style={{ color: "var(--orange)" }}>
                "{player.pendingMission.description}"
              </span>
            </p>
            <div className="btn-row">
              <Button
                variant="success"
                onClick={() =>
                  dispatch({ type: "RESOLVE_MISSION", success: true })
                }
              >
                ✓ Yes +{player.pendingMission.points}
              </Button>
              <Button
                variant="danger"
                onClick={() =>
                  dispatch({ type: "RESOLVE_MISSION", success: false })
                }
              >
                ✗ No · 0
              </Button>
            </div>
          </div>
        )}

        {state.phase === "result" && (
          <div className="stack">
            {state.lastMissionStarted ? (
              <div className="award">
                <div className="award__value" style={{ color: "var(--orange)" }}>
                  ⏳
                </div>
                <div className="award__label">
                  Task started - checked at your next turn
                </div>
              </div>
            ) : (
              <div className="award">
                <div
                  className={
                    "award__value" +
                    (state.lastAward === 0 ? " award__value--zero" : "")
                  }
                >
                  {state.lastAward === 0 ? "0" : `+${state.lastAward}`}
                </div>
                <div className="award__label">
                  {state.lastWinnerName
                    ? `🏆 ${state.lastWinnerName} won!`
                    : state.lastAward === 0
                      ? "No points"
                      : state.lastDoubled
                        ? "Double points!"
                        : "Points awarded"}
                </div>
              </div>
            )}
            <Button
              variant="primary"
              large
              block
              onClick={() => dispatch({ type: "NEXT" })}
            >
              {everyoneDoneAfterThis ? "🏆 See Results" : "Next Player →"}
            </Button>
          </div>
        )}
      </div>

      <Leaderboard players={state.players} currentPlayerId={player.id} />
    </div>
  );
}
