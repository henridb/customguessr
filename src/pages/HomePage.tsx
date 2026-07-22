import { useState } from "react";
import { Link } from "react-router-dom";
import { GameView } from "../components/GameView";
import { ResultsView } from "../components/ResultsView";
import { DEFAULT_SECONDS_PER_ROUND, useGame } from "../game/useGame";

// The single player page. It has three views driven by game state — the landing
// screen, an active game, and the results — so the app stays at "two pages"
// (this one and /admin) as intended. The page is locked to the viewport height
// so the map area can size itself to what's left over.
export function HomePage() {
  const game = useGame();

  let content;
  if (!game.session) {
    content = <Landing onNewGame={(seconds) => game.start(seconds)} />;
  } else if (game.session.finished) {
    content = <ResultsView session={game.session} onPlayAgain={() => game.start()} onChangeSettings={game.reset} />;
  } else {
    content = <GameView game={game} />;
  }

  return <main className="h-screen overflow-hidden bg-slate-950 text-slate-100">{content}</main>;
}

const TIMER_PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
];

function Landing({ onNewGame }: { onNewGame: (secondsPerRound: number) => void }) {
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS_PER_ROUND);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-4xl font-bold tracking-tight">GalaxyGuessr</h1>
      <p className="text-slate-400">Guess where each celestial body sits in the galaxy.</p>

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-slate-400">Time per round</span>
        <div className="flex items-center gap-2">
          {TIMER_PRESETS.map((p) => (
            <button
              key={p.seconds}
              type="button"
              onClick={() => setSeconds(p.seconds)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                seconds === p.seconds ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {p.label}
            </button>
          ))}
          <label className="flex items-center gap-1 text-sm text-slate-400">
            <input
              type="number"
              min={5}
              max={600}
              value={seconds}
              onChange={(e) => setSeconds(Math.min(600, Math.max(5, Number(e.target.value) || 0)))}
              className="w-20 rounded border border-white/10 bg-slate-800 px-2 py-1.5 text-slate-100 outline-none focus:border-indigo-400"
            />
            <span>sec</span>
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onNewGame(seconds)}
        className="rounded-lg bg-indigo-500 px-8 py-3 text-lg font-semibold text-white transition hover:bg-indigo-400"
      >
        New Game
      </button>
      <Link to="/admin" className="text-sm text-slate-500 underline hover:text-slate-300">
        Admin
      </Link>
    </div>
  );
}
