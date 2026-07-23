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
    content = (
      <ResultsView
        session={game.session}
        onPlayAgain={() => game.start()}
        onChangeSettings={game.reset}
      />
    );
  } else {
    content = <GameView game={game} />;
  }

  return (
    <main className="bg-slate-950 h-screen overflow-hidden text-slate-100">
      {content}
    </main>
  );
}

const TIMER_PRESETS = [
  { label: "5s", seconds: 5 },
  { label: "10s", seconds: 10 },
  { label: "15s", seconds: 15 },
  { label: "20s", seconds: 20 },
  { label: "30s", seconds: 30 },
];

function Landing({
  onNewGame,
}: {
  onNewGame: (secondsPerRound: number) => void;
}) {
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS_PER_ROUND);

  return (
    <div className="flex flex-col justify-center items-center gap-6 px-4 h-full">
      <h1 className="font-bold text-4xl tracking-tight">SCO ELDER - Planètes de l'Univers</h1>
      <p className="text-slate-400">
        Placez chaque planète de l'Univers au bon endroit !
      </p>

      <div className="flex flex-col items-center gap-2">
        <span className="text-slate-400 text-sm">Temps par tour</span>
        <div className="flex items-center gap-2">
          {TIMER_PRESETS.map((p) => (
            <button
              key={p.seconds}
              type="button"
              onClick={() => setSeconds(p.seconds)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition cursor-pointer ${
                seconds === p.seconds
                  ? "bg-indigo-500 text-white"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {p.label}
            </button>
          ))}
          <label className="flex items-center gap-1 text-slate-400 text-sm">
            <input
              type="number"
              min={1}
              max={60}
              value={seconds}
              onChange={(e) =>
                setSeconds(
                  Math.min(600, Math.max(5, Number(e.target.value) || 0)),
                )
              }
              className="bg-slate-800 px-2 py-1.5 border border-white/10 focus:border-indigo-400 rounded outline-none w-20 text-slate-100"
            />
            <span>sec</span>
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onNewGame(seconds)}
        className="bg-indigo-500 hover:bg-indigo-400 px-8 py-3 rounded-lg font-semibold text-white text-lg transition cursor-pointer"
      >
        Commencer
      </button>
      <Link
        to="/admin"
        className="text-slate-500 hover:text-slate-300 text-sm underline"
      >
        Admin
      </Link>
    </div>
  );
}
