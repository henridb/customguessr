import { useEffect, useState } from "react";
import type { GameController } from "../game/useGame";
import { MAX_ROUND_SCORE } from "../game/scoring";
import { MapView, type MapMarker } from "./MapView";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** One round of play: timer, prompt, clickable map, and the reveal after submit. */
export function GameView({ game }: { game: GameController }) {
  const { round, roundNumber, totalRounds, phase, pendingGuess, isLast, session, secondsPerRound } = game;
  const [remaining, setRemaining] = useState(secondsPerRound);

  // Reset the countdown at the start of each round's guessing phase.
  useEffect(() => {
    if (phase === "guessing") setRemaining(secondsPerRound);
  }, [phase, roundNumber, secondsPerRound]);

  // Tick down once per second while guessing; fire timeUp() at zero.
  useEffect(() => {
    if (phase !== "guessing") return;
    if (remaining <= 0) {
      game.timeUp();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, remaining, roundNumber, game]);

  if (!round || !session) return null;

  const target = { x: round.body.x, y: round.body.y };
  const revealed = phase === "revealed";
  const missed = revealed && !round.guess;

  const markers: MapMarker[] = [];
  if (pendingGuess) markers.push({ id: "guess", point: pendingGuess, variant: "guess", label: revealed ? "Your guess" : undefined });
  if (revealed) markers.push({ id: "target", point: target, variant: "target", label: round.body.name });

  const connections = revealed && pendingGuess ? [[pendingGuess, target] as [typeof target, typeof target]] : [];
  const lowTime = !revealed && remaining <= 10;

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-3 px-4 py-4">
      <header className="flex shrink-0 items-center justify-between text-slate-200">
        <span className="text-sm uppercase tracking-widest text-slate-400">
          Round {roundNumber} / {totalRounds}
        </span>
        {!revealed && (
          <span className={`font-mono text-lg font-semibold ${lowTime ? "animate-pulse text-rose-400" : "text-slate-100"}`}>
            {formatTime(remaining)}
          </span>
        )}
        <span className="text-sm text-slate-400">
          Score: <span className="font-semibold text-slate-100">{session.totalScore.toLocaleString()}</span>
        </span>
      </header>

      <div className="shrink-0 text-center">
        <p className="text-sm text-slate-400">Where is this {round.body.type}?</p>
        <h2 className="text-2xl font-bold text-white">{round.body.name}</h2>
      </div>

      <div className="min-h-0 flex-1">
        <MapView markers={markers} connections={connections} onBackgroundClick={revealed ? undefined : game.placeGuess} />
      </div>

      {revealed ? (
        <div className="flex shrink-0 flex-col items-center gap-2">
          <p className="text-lg text-slate-200">
            {missed && <span className="mr-2 text-rose-400">Time's up — no guess.</span>}
            <span className="font-bold text-emerald-400">{(round.score ?? 0).toLocaleString()}</span>
            <span className="text-slate-400"> / {MAX_ROUND_SCORE.toLocaleString()} points</span>
          </p>
          <button
            type="button"
            onClick={game.nextRound}
            className="rounded-lg bg-indigo-500 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-400"
          >
            {isLast ? "See results" : "Next round"}
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 flex-col items-center gap-1">
          <button
            type="button"
            onClick={game.submitGuess}
            disabled={!pendingGuess}
            className="rounded-lg bg-indigo-500 px-6 py-2.5 font-semibold text-white transition enabled:hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit guess
          </button>
          <p className="text-xs text-slate-500">
            {pendingGuess ? "Click again to move your marker, then submit." : "Click the map to guess · drag to pan · scroll to zoom."}
          </p>
        </div>
      )}
    </div>
  );
}
