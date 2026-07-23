import { useEffect, useRef, useState } from "react";
import { MAX_ROUND_SCORE } from "../game/scoring";
import type { GameController } from "../game/useGame";
import { MapView, type MapMarker } from "./MapView";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Per-round countdown. Kept as its own component and mounted with key={round} so
 * each round gets a fresh timer — this avoids a stale `remaining` from the
 * previous round leaking into the next one (which made a timed-out round start
 * the next round at 0).
 */
function RoundTimer({
  seconds,
  onExpire,
}: {
  seconds: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  // Keep the latest callback without making it a timer dependency.
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (remaining <= 0) {
      expireRef.current();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const low = remaining <= 10;
  return (
    <span
      className={`font-mono text-lg font-semibold ${low ? "animate-pulse text-rose-400" : "text-slate-100"}`}
    >
      {formatTime(remaining)}
    </span>
  );
}

/** One round of play: timer, prompt, clickable map, and the reveal after submit. */
export function GameView({ game }: { game: GameController }) {
  const {
    round,
    roundNumber,
    totalRounds,
    phase,
    pendingGuess,
    isLast,
    session,
    secondsPerRound,
  } = game;
  if (!round || !session) return null;

  const target = { x: round.body.x, y: round.body.y };
  const revealed = phase === "revealed";
  const missed = revealed && !round.guess;

  const markers: MapMarker[] = [];
  if (pendingGuess)
    markers.push({
      id: "guess",
      point: pendingGuess,
      variant: "guess",
      label: revealed ? "Your guess" : undefined,
    });
  if (revealed)
    markers.push({
      id: "target",
      point: target,
      variant: "target",
      label: round.body.name,
    });

  const connections =
    revealed && pendingGuess
      ? [[pendingGuess, target] as [typeof target, typeof target]]
      : [];

  return (
    <div className="flex flex-col gap-3 mx-auto px-4 py-4 w-full max-w-5xl h-full">
      <header className="flex justify-between items-center text-slate-200 shrink-0">
        <span className="text-slate-400 text-sm uppercase tracking-widest">
          Round {roundNumber} / {totalRounds}
        </span>
        {!revealed && (
          <RoundTimer
            key={roundNumber}
            seconds={secondsPerRound}
            onExpire={game.timeUp}
          />
        )}
        <span className="text-slate-400 text-sm">
          Score:{" "}
          <span className="font-semibold text-slate-100">
            {session.totalScore.toLocaleString()}
          </span>
        </span>
      </header>

      <div className="text-center shrink-0">
        <p className="text-slate-400 text-sm">
          Où se situe-t-elle ?
        </p>
        <h2 className="font-bold text-white text-2xl">{round.body.name}</h2>
        {revealed && round.body.description && <p>{round.body.description}</p>}
      </div>

      <div className="flex-1 min-h-0">
        <MapView
          markers={markers}
          connections={connections}
          onBackgroundClick={revealed ? undefined : game.placeGuess}
        />
      </div>

      {revealed ? (
        <div className="flex flex-col items-center gap-2 shrink-0">
          <p className="text-slate-200 text-lg">
            {missed && (
              <span className="mr-2 text-rose-400">Le temps est écoulé !</span>
            )}
            <span className="font-bold text-emerald-400">
              {(round.score ?? 0).toLocaleString()}
            </span>
            <span className="text-slate-400">
              {" "}
              / {MAX_ROUND_SCORE.toLocaleString()} points
            </span>
          </p>
          <button
            type="button"
            onClick={game.nextRound}
            className="bg-indigo-500 hover:bg-indigo-400 px-6 py-2.5 rounded-lg font-semibold text-white transition cursor-pointer"
          >
            {isLast ? "See results" : "Next round"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={game.submitGuess}
            disabled={!pendingGuess}
            className="bg-indigo-500 enabled:hover:bg-indigo-400 disabled:opacity-40 px-6 py-2.5 rounded-lg font-semibold text-white transition cursor-pointer disabled:cursor-not-allowed"
          >
            Submit guess
          </button>
          <p className="text-slate-500 text-xs">
            {pendingGuess
              ? "Click again to move your marker, then submit."
              : "Click the map to guess · drag to pan · scroll to zoom."}
          </p>
        </div>
      )}
    </div>
  );
}
