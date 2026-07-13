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
  const stake = state.currentCard
    ? cardPoints(state.currentCard, player.doublePointsArmed)
    : 0;

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
        <div className="lifelines">
          <Button
            variant={player.doublePointsArmed ? "warn" : "default"}
            disabled={
              state.phase !== "ready" ||
              player.doublePointsUsed ||
              player.doublePointsArmed
            }
            onClick={() => dispatch({ type: "ARM_DOUBLE" })}
          >
            {player.doublePointsArmed
              ? "×2 ARMED"
              : player.doublePointsUsed
                ? "×2 USED"
                : "×2 Double"}
          </Button>
          <Button
            variant="default"
            disabled={state.phase !== "card" || player.swapUsed}
            onClick={() => dispatch({ type: "SWAP" })}
          >
            {player.swapUsed ? "🔄 USED" : "🔄 Swap"}
          </Button>
        </div>
      </div>

      <div className="game-body">
        {state.phase === "ready" && (
          <div className="stack handoff">
            <div className="handoff__icon">📲</div>
            <p className="handoff__label">Pass the phone to</p>
            <p className="handoff__name">{player.name}</p>
            {player.doublePointsArmed ? (
              <p className="handoff__hint" style={{ color: "var(--yellow)" }}>
                ×2 armed — this card scores double!
              </p>
            ) : (
              <p className="handoff__hint muted">
                {player.doublePointsUsed
                  ? " "
                  : "Tip: tap ×2 first to double this card"}
              </p>
            )}
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

        {state.phase === "chaos" && state.pendingChaos && (
          <div className="stack">
            <GameCard card={state.pendingChaos} />
            <Button
              variant="secondary"
              block
              onClick={() => dispatch({ type: "CONTINUE_CHAOS" })}
            >
              Continue →
            </Button>
          </div>
        )}

        {state.phase === "card" && state.currentCard && (
          <div className="stack">
            <GameCard
              card={state.currentCard}
              doubled={player.doublePointsArmed}
            />
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

        {state.phase === "result" && (
          <div className="stack">
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
                {state.lastAward === 0
                  ? "No points"
                  : state.lastDoubled
                    ? "Double points!"
                    : "Points awarded"}
              </div>
            </div>
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
