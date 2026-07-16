import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Card,
  CategoryDef,
  Difficulty,
  GameLocation,
  Player,
} from "./types";
import type { NewGameConfig } from "./game/gameReducer";
import {
  loadLibrary,
  markCustomized,
  resetLibrary,
  saveCards,
  saveCategories,
} from "./storage/localStorage";
import { Toast } from "./components/ui";
import { CategoriesProvider } from "./state/CategoriesContext";
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
  const [library] = useState(loadLibrary);
  const [categories, setCategories] = useState<CategoryDef[]>(library.categories);
  const [cards, setCards] = useState<Card[]>(library.cards);
  const [gameConfig, setGameConfig] = useState<NewGameConfig | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const screenRef = useRef<Screen>(screen);

  useEffect(() => saveCards(cards), [cards]);
  useEffect(() => saveCategories(categories), [categories]);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  // Browser back/forward support: every navigation pushes a history entry,
  // so the hardware/gesture back button steps back one screen instead of
  // leaving the app. Quitting mid-game via back is confirmed just like the
  // in-game quit button.
  useEffect(() => {
    history.replaceState({ screen: "home" }, "");
    const onPopState = (e: PopStateEvent) => {
      const target = ((e.state as { screen?: Screen } | null)?.screen ?? "home");
      if (screenRef.current === "game" && target !== "game") {
        if (!window.confirm("Quit the game? All scores will be lost.")) {
          history.pushState({ screen: "game" }, "");
          return;
        }
      }
      setScreen(target);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((next: Screen) => {
    setScreen(next);
    history.pushState({ screen: next }, "");
  }, []);

  // Editing cards or categories marks the library customised so app updates
  // won't overwrite the player's set.
  const updateCards = (next: Card[]) => {
    markCustomized();
    setCards(next);
  };
  const updateCategories = (next: CategoryDef[]) => {
    markCustomized();
    setCategories(next);
  };

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
    roundsPerPlayer: number;
  }) => {
    // Snapshot the library so edits mid-game don't affect the deck.
    setGameConfig({
      ...config,
      cards: cards.map((c) => ({ ...c })),
      categories: categories.map((c) => ({ ...c })),
    });
    navigate("game");
  };

  const finishGame = useCallback(
    (players: Player[], drinkMode: boolean) => {
      setResults({ players, drinkMode });
      navigate("results");
    },
    [navigate],
  );

  const handleReset = () => {
    if (window.confirm("Reset all cards and categories to the default set?")) {
      const lib = resetLibrary();
      setCategories(lib.categories);
      setCards(lib.cards);
      showToast("Reset to default");
    }
  };

  return (
    <CategoriesProvider categories={categories}>
      <div className="app">
        {screen === "home" && (
          <HomeScreen
            onNewGame={() => navigate("setup")}
            onOpenEditor={() => navigate("editor")}
            onHelp={() => navigate("help")}
            onShowChangelog={() => navigate("changelog")}
          />
        )}

        {screen === "help" && <HelpScreen onBack={() => navigate("home")} />}

        {screen === "changelog" && (
          <ChangelogScreen onBack={() => navigate("home")} />
        )}

        {screen === "setup" && (
          <SetupScreen
            cards={cards}
            categories={categories}
            onStart={startGame}
            onBack={() => navigate("home")}
          />
        )}

        {screen === "game" && gameConfig && (
          <GameScreen
            config={gameConfig}
            onFinish={finishGame}
            onQuit={() => navigate("home")}
          />
        )}

        {screen === "results" && results && (
          <ResultsScreen
            players={results.players}
            drinkMode={results.drinkMode}
            onPlayAgain={() => navigate("setup")}
            onHome={() => navigate("home")}
          />
        )}

        {screen === "editor" && (
          <CardEditorScreen
            cards={cards}
            categories={categories}
            onChange={updateCards}
            onChangeCategories={updateCategories}
            onReset={handleReset}
            onBack={() => navigate("home")}
            onToast={showToast}
          />
        )}

        {toast && (
          <Toast key={toast.id} message={toast.message} error={toast.error} />
        )}
      </div>
    </CategoriesProvider>
  );
}
