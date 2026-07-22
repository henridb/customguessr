import { useState } from "react";
import { Link } from "react-router-dom";
import type { Body, Point } from "../types";
import { bodies as seedBodies } from "../data/bodies";
import { MapView, type MapMarker } from "../components/MapView";
import { BodyModal } from "../admin/BodyModal";
import { checkPassword } from "../admin/auth";
import { exportBodies } from "../admin/exportJson";

interface EditorState {
  mode: "create" | "edit";
  body: Body;
}

export function AdminPage() {
  const [authed, setAuthed] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {authed ? <Editor /> : <PasswordGate onSuccess={() => setAuthed(true)} />}
    </main>
  );
}

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (await checkPassword(value)) {
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Admin</h1>
      <form onSubmit={submit} className="flex flex-col items-center gap-3">
        <input
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          autoFocus
          className="rounded border border-white/10 bg-slate-800 px-3 py-2 outline-none focus:border-indigo-400"
        />
        {error && <p className="text-sm text-rose-400">Incorrect password.</p>}
        <button
          type="submit"
          className="rounded-lg bg-indigo-500 px-6 py-2 font-semibold text-white transition hover:bg-indigo-400"
        >
          Enter
        </button>
      </form>
      <Link to="/" className="text-sm text-slate-500 underline hover:text-slate-300">
        Back to game
      </Link>
    </div>
  );
}

function Editor() {
  const [bodies, setBodies] = useState<Body[]>(() => [...seedBodies]);
  const [editor, setEditor] = useState<EditorState | null>(null);

  function openCreate(point: Point) {
    setEditor({
      mode: "create",
      body: { id: crypto.randomUUID(), name: "", type: "planet", x: point.x, y: point.y },
    });
  }

  function openEdit(body: Body) {
    setEditor({ mode: "edit", body });
  }

  function handleSave(body: Body) {
    setBodies((prev) => {
      const exists = prev.some((b) => b.id === body.id);
      return exists ? prev.map((b) => (b.id === body.id ? body : b)) : [...prev, body];
    });
    setEditor(null);
  }

  function handleDelete() {
    if (!editor) return;
    const id = editor.body.id;
    setBodies((prev) => prev.filter((b) => b.id !== id));
    setEditor(null);
  }

  const markers: MapMarker[] = bodies.map((b) => ({
    id: b.id,
    point: { x: b.x, y: b.y },
    variant: b.type,
    label: b.name,
    onClick: () => openEdit(b),
  }));

  return (
    <div className="mx-auto flex h-screen w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin editor</h1>
          <p className="text-sm text-slate-400">
            {bodies.length} bodies · click empty space to add, a marker to edit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportBodies(bodies)}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            Export planets.json
          </button>
          <Link to="/" className="text-sm text-slate-500 underline hover:text-slate-300">
            Back to game
          </Link>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <MapView markers={markers} onBackgroundClick={openCreate} />
      </div>

      <p className="shrink-0 text-xs text-slate-500">
        Changes live only in this browser session. Use “Export planets.json”, then commit the file over
        <code className="mx-1 rounded bg-white/10 px-1">src/data/planets.json</code> to publish.
      </p>

      {editor && (
        <BodyModal
          mode={editor.mode}
          initial={editor.body}
          onSave={handleSave}
          onDelete={editor.mode === "edit" ? handleDelete : undefined}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  );
}
