import { Link } from "react-router-dom";
import { GameView } from "../components/GameView";
import { ResultsView } from "../components/ResultsView";
import { useGame } from "../game/useGame";

// The single player page. It has three views driven by game state — the landing
// screen, an active game, and the results — so the app stays at "two pages"
// (this one and /admin) as intended.
export function HomePage() {
  const game = useGame();

  let content;
  if (!game.session) {
    content = <Landing onNewGame={game.start} />;
  } else if (game.session.finished) {
    content = <ResultsView session={game.session} onPlayAgain={game.start} />;
  } else {
    content = <GameView game={game} />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">{content}</main>
  );
}

function Landing({ onNewGame }: { onNewGame: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold tracking-tight">GalaxyGuessr</h1>
      <p className="text-slate-400">
        Guess where each celestial body sits in the galaxy.
      </p>
      <button
        type="button"
        onClick={onNewGame}
        className="rounded-lg bg-indigo-500 px-8 py-3 text-lg font-semibold text-white transition hover:bg-indigo-400"
      >
        New Game
      </button>
      <Link
        to="/admin"
        className="text-sm text-slate-500 underline hover:text-slate-300"
      >
        Admin
      </Link>
    </div>
  );
}
