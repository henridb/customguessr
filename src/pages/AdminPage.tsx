import { Link } from "react-router-dom";

// Admin editor. The password gate, map editor, and JSON export land in Phase 4;
// this is a placeholder so the /admin route resolves during Phase 1.
export function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-slate-100">
      <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      <p className="text-slate-400">Planet &amp; star editor (coming soon).</p>
      <Link to="/" className="text-sm text-slate-500 underline hover:text-slate-300">
        Back to game
      </Link>
    </main>
  );
}
