import type { GameController } from "../game/useGame";
import { MAX_ROUND_SCORE } from "../game/scoring";
import { MapView, type MapMarker } from "./MapView";

/** One round of play: prompt, clickable map, and the reveal after submitting. */
export function GameView({ game }: { game: GameController }) {
  const { round, roundNumber, totalRounds, phase, pendingGuess, isLast, session } = game;
  if (!round || !session) return null;

  const target = { x: round.body.x, y: round.body.y };
  const revealed = phase === "revealed";

  const markers: MapMarker[] = [];
  if (pendingGuess) markers.push({ id: "guess", point: pendingGuess, variant: "guess", label: revealed ? "Your guess" : undefined });
  if (revealed) markers.push({ id: "target", point: target, variant: "target", label: round.body.name });

  const connections = revealed && pendingGuess ? [[pendingGuess, target] as [typeof target, typeof target]] : [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between text-slate-200">
        <span className="text-sm uppercase tracking-widest text-slate-400">
          Round {roundNumber} / {totalRounds}
        </span>
        <span className="text-sm text-slate-400">
          Score: <span className="font-semibold text-slate-100">{session.totalScore.toLocaleString()}</span>
        </span>
      </header>

      <div className="text-center">
        <p className="text-sm text-slate-400">Where is this {round.body.type}?</p>
        <h2 className="text-3xl font-bold text-white">{round.body.name}</h2>
      </div>

      <MapView
        markers={markers}
        connections={connections}
        onBackgroundClick={revealed ? undefined : game.placeGuess}
      />

      {revealed ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg text-slate-200">
            <span className="font-bold text-emerald-400">{(round.score ?? 0).toLocaleString()}</span>
            <span className="text-slate-400"> / {MAX_ROUND_SCORE.toLocaleString()} points</span>
          </p>
          {round.body.description && <p className="text-center text-sm text-slate-400">{round.body.description}</p>}
          <button
            type="button"
            onClick={game.nextRound}
            className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
          >
            {isLast ? "See results" : "Next round"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={game.submitGuess}
            disabled={!pendingGuess}
            className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition enabled:hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit guess
          </button>
          <p className="text-xs text-slate-500">
            {pendingGuess ? "Click again to move your marker, then submit." : "Click on the map to place your guess."}
          </p>
        </div>
      )}
    </div>
  );
}
