import { MAX_GAME_SCORE, MAX_ROUND_SCORE } from "../game/scoring";
import type { GameSession } from "../game/session";

interface ResultsViewProps {
  session: GameSession;
  onPlayAgain: () => void;
  onChangeSettings: () => void;
}

/** Final scoreboard shown once all rounds are done. */
export function ResultsView({
  session,
  onPlayAgain,
  onChangeSettings,
}: ResultsViewProps) {
  const max = session.rounds.length * MAX_ROUND_SCORE;
  return (
    <div className="flex flex-col items-center gap-6 mx-auto px-4 py-10 w-full max-w-2xl h-full overflow-y-auto">
      <div className="text-center">
        <p className="text-slate-400 text-sm uppercase tracking-widest">
          Final score
        </p>
        <p className="font-bold text-white text-5xl">
          {session.totalScore.toLocaleString()}
          <span className="text-slate-500 text-2xl">
            {" "}
            / {max.toLocaleString()}
          </span>
        </p>
        {max === MAX_GAME_SCORE ? null : (
          <p className="mt-1 text-slate-500 text-xs">
            ({session.rounds.length} rounds this game)
          </p>
        )}
      </div>

      <ul className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/5 w-full">
        {session.rounds.map((r, i) => (
          <li
            key={r.body.id}
            className="flex justify-between items-center px-4 py-3"
          >
            <span className="text-slate-300">
              <span className="mr-2 text-slate-500">{i + 1}.</span>
              {r.body.name}
              <span className="ml-2 text-slate-500 text-xs uppercase">
                {r.body.type}
              </span>
            </span>
            <span className="font-semibold text-emerald-400">
              {(r.score ?? 0).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onPlayAgain}
          className="bg-indigo-500 hover:bg-indigo-400 px-6 py-3 rounded-lg font-semibold text-white transition cursor-pointer"
        >
          Play again
        </button>
        <button
          type="button"
          onClick={onChangeSettings}
          className="text-slate-500 hover:text-slate-300 text-sm underline cursor-pointer"
        >
          Change timer
        </button>
      </div>
    </div>
  );
}
