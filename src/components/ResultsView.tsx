import type { GameSession } from "../game/session";
import { MAX_GAME_SCORE, MAX_ROUND_SCORE } from "../game/scoring";

interface ResultsViewProps {
  session: GameSession;
  onPlayAgain: () => void;
  onChangeSettings: () => void;
}

/** Final scoreboard shown once all rounds are done. */
export function ResultsView({ session, onPlayAgain, onChangeSettings }: ResultsViewProps) {
  const max = session.rounds.length * MAX_ROUND_SCORE;
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center gap-6 overflow-y-auto px-4 py-10">
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-slate-400">Final score</p>
        <p className="text-5xl font-bold text-white">
          {session.totalScore.toLocaleString()}
          <span className="text-2xl text-slate-500"> / {max.toLocaleString()}</span>
        </p>
        {max === MAX_GAME_SCORE ? null : (
          <p className="mt-1 text-xs text-slate-500">
            ({session.rounds.length} rounds this game)
          </p>
        )}
      </div>

      <ul className="w-full divide-y divide-white/5 rounded-xl border border-white/10 bg-white/5">
        {session.rounds.map((r, i) => (
          <li key={r.body.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-slate-300">
              <span className="mr-2 text-slate-500">{i + 1}.</span>
              {r.body.name}
              <span className="ml-2 text-xs uppercase text-slate-500">{r.body.type}</span>
            </span>
            <span className="font-semibold text-emerald-400">{(r.score ?? 0).toLocaleString()}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
        >
          Play again
        </button>
        <button
          type="button"
          onClick={onChangeSettings}
          className="text-sm text-slate-500 underline hover:text-slate-300"
        >
          Change timer
        </button>
      </div>
    </div>
  );
}
