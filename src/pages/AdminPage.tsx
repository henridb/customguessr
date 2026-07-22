import { useState } from "react";
import { Link } from "react-router-dom";
import { BodyModal } from "../admin/BodyModal";
import { checkPassword } from "../admin/auth";
import { exportBodies } from "../admin/exportJson";
import { MapView, type MapMarker } from "../components/MapView";
import { bodies as seedBodies } from "../data/bodies";
import type { Body, Point } from "../types";

interface EditorState {
  mode: "create" | "edit";
  body: Body;
}

export function AdminPage() {
  const [authed, setAuthed] = useState(false);

  return (
    <main className="bg-slate-950 min-h-screen text-slate-100">
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
    <div className="flex flex-col justify-center items-center gap-4 min-h-screen">
      <h1 className="font-bold text-2xl">Admin</h1>
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
          className="bg-slate-800 px-3 py-2 border border-white/10 focus:border-indigo-400 rounded outline-none"
        />
        {error && <p className="text-rose-400 text-sm">Incorrect password.</p>}
        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-400 px-6 py-2 rounded-lg font-semibold text-white transition cursor-pointer"
        >
          Enter
        </button>
      </form>
      <Link
        to="/"
        className="text-slate-500 hover:text-slate-300 text-sm underline"
      >
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
      body: {
        id: crypto.randomUUID(),
        name: "",
        type: "planet",
        x: point.x,
        y: point.y,
      },
    });
  }

  function openEdit(body: Body) {
    setEditor({ mode: "edit", body });
  }

  function handleSave(body: Body) {
    setBodies((prev) => {
      const exists = prev.some((b) => b.id === body.id);
      return exists
        ? prev.map((b) => (b.id === body.id ? body : b))
        : [...prev, body];
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
    <div className="flex flex-col gap-4 mx-auto px-4 py-6 w-full max-w-5xl h-screen">
      <header className="flex flex-wrap justify-between items-center gap-3 shrink-0">
        <div>
          <h1 className="font-bold text-2xl">Admin editor</h1>
          <p className="text-slate-400 text-sm">
            {bodies.length} bodies · click empty space to add, a marker to edit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportBodies(bodies)}
            className="bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-lg font-semibold text-white text-sm transition cursor-pointer"
          >
            Export planets.json
          </button>
          <Link
            to="/"
            className="text-slate-500 hover:text-slate-300 text-sm underline"
          >
            Back to game
          </Link>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <MapView markers={markers} onBackgroundClick={openCreate} />
      </div>

      <p className="text-slate-500 text-xs shrink-0">
        Changes live only in this browser session. Use “Export planets.json”,
        then commit the file over
        <code className="bg-white/10 mx-1 px-1 rounded">
          src/data/planets.json
        </code>{" "}
        to publish.
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
