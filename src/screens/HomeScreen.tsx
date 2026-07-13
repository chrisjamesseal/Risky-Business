import { Button } from "../components/ui";
import { APP_VERSION } from "../data/changelog";

export function HomeScreen({
  onNewGame,
  onOpenEditor,
  onHelp,
  onShowChangelog,
}: {
  onNewGame: () => void;
  onOpenEditor: () => void;
  onHelp: () => void;
  onShowChangelog: () => void;
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
        <Button variant="secondary" block onClick={onHelp}>
          ? How to Play
        </Button>
        <Button variant="default" block onClick={onOpenEditor}>
          ✎ Card Editor
        </Button>

        <button
          className="version-btn"
          style={{ alignSelf: "center", marginTop: 14 }}
          onClick={onShowChangelog}
        >
          Offline party game · v{APP_VERSION}
        </button>
      </div>
    </div>
  );
}
