import { useCallback, useEffect, useRef, useState } from "react";
import type { Card, Difficulty, GameLocation, Player } from "./types";
import type { NewGameConfig } from "./game/gameReducer";
import { loadCards, resetCards, saveCards } from "./storage/localStorage";
import { Toast } from "./components/ui";
import { HomeScreen } from "./screens/HomeScreen";
import { HelpScreen } from "./screens/HelpScreen";
import { ChangelogScreen } from "./screens/ChangelogScreen";
import { SetupScreen } from "./screens/SetupScreen";
import { GameScreen } from "./screens/GameScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { CardEditorScreen } from "./screens/CardEditorScreen";

type Screen =
  | "home"
  | "setup"
  | "game"
  | "results"
  | "editor"
  | "help"
  | "changelog";

interface Results {
  players: Player[];
  drinkMode: boolean;
}

interface ToastState {
  id: number;
  message: string;
  error: boolean;
}

export function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [cards, setCards] = useState<Card[]>(() => loadCards());
  const [gameConfig, setGameConfig] = useState<NewGameConfig | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // Persist the card library whenever it changes.
  useEffect(() => saveCards(cards), [cards]);

  const showToast = useCallback((message: string, error = false) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, error });
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const startGame = (config: {
    names: string[];
    location: GameLocation;
    drinkMode: boolean;
    difficulties: Difficulty[];
  }) => {
    // Snapshot the current library so edits mid-game don't affect the deck.
    setGameConfig({ ...config, cards: cards.map((c) => ({ ...c })) });
    setScreen("game");
  };

  const finishGame = useCallback((players: Player[], drinkMode: boolean) => {
    setResults({ players, drinkMode });
    setScreen("results");
  }, []);

  const handleResetCards = () => {
    if (window.confirm("Reset all cards to the default library?")) {
      setCards(resetCards());
      showToast("Cards reset to default");
    }
  };

  return (
    <div className="app">
      {screen === "home" && (
        <HomeScreen
          onNewGame={() => setScreen("setup")}
          onOpenEditor={() => setScreen("editor")}
          onHelp={() => setScreen("help")}
          onShowChangelog={() => setScreen("changelog")}
        />
      )}

      {screen === "help" && <HelpScreen onBack={() => setScreen("home")} />}

      {screen === "changelog" && (
        <ChangelogScreen onBack={() => setScreen("home")} />
      )}

      {screen === "setup" && (
        <SetupScreen
          cards={cards}
          onStart={startGame}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "game" && gameConfig && (
        <GameScreen
          config={gameConfig}
          onFinish={finishGame}
          onQuit={() => setScreen("home")}
        />
      )}

      {screen === "results" && results && (
        <ResultsScreen
          players={results.players}
          drinkMode={results.drinkMode}
          onPlayAgain={() => setScreen("setup")}
          onHome={() => setScreen("home")}
        />
      )}

      {screen === "editor" && (
        <CardEditorScreen
          cards={cards}
          onChange={setCards}
          onReset={handleResetCards}
          onBack={() => setScreen("home")}
          onToast={showToast}
        />
      )}

      {toast && (
        <Toast key={toast.id} message={toast.message} error={toast.error} />
      )}
    </div>
  );
}
