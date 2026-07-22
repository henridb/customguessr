import { Link } from "react-router-dom";

// Player home page. The New Game flow is wired up in Phase 3; for now this is
// a placeholder that confirms the scaffold, routing, and Tailwind all work.
export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-slate-100">
      <h1 className="text-4xl font-bold tracking-tight">CustomGuessr</h1>
      <p className="text-slate-400">Guess where each planet or star sits in the galaxy.</p>
      <button
        type="button"
        className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
        disabled
      >
        New Game (coming soon)
      </button>
      <Link to="/admin" className="text-sm text-slate-500 underline hover:text-slate-300">
        Admin
      </Link>
    </main>
  );
}
