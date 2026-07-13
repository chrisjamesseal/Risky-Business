import { Button } from "../components/ui";

export function HomeScreen({
  onNewGame,
  onSettings,
  onHelp,
}: {
  onNewGame: () => void;
  onSettings: () => void;
  onHelp: () => void;
}) {
  return (
    <div className="screen screen--center">
      <div className="stack" style={{ width: "100%" }}>
        <h1 className="logo">
          <span className="risk">RISK</span> IT
        </h1>
        <p className="tagline">One phone · Many dares · No mercy</p>

        <div style={{ height: 12 }} />

        <Button variant="primary" large block onClick={onNewGame}>
          ▶ New Game
        </Button>
        <Button variant="secondary" block onClick={onSettings}>
          ⚙ Settings
        </Button>
        <Button variant="ghost" block onClick={onHelp}>
          ? How to Play
        </Button>

        <p className="tagline" style={{ marginTop: 18 }}>
          Offline party game
        </p>
      </div>
    </div>
  );
}
