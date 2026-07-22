import { useState } from "react";
import type { Body, BodyType } from "../types";

interface BodyModalProps {
  mode: "create" | "edit";
  initial: Body;
  onSave: (body: Body) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Create/edit dialog for a single planet or star. */
export function BodyModal({ mode, initial, onSave, onDelete, onClose }: BodyModalProps) {
  const [name, setName] = useState(initial.name);
  const [type, setType] = useState<BodyType>(initial.type);
  const [description, setDescription] = useState(initial.description ?? "");
  const [x, setX] = useState(initial.x);
  const [y, setY] = useState(initial.y);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    onSave({
      ...initial,
      name: trimmed,
      type,
      x: clamp01(x),
      y: clamp01(y),
      description: description.trim() || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {mode === "create" ? "New body" : `Edit ${initial.name}`}
        </h2>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="rounded border border-white/10 bg-slate-800 px-3 py-2 outline-none focus:border-indigo-400"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as BodyType)}
              className="rounded border border-white/10 bg-slate-800 px-3 py-2 outline-none focus:border-indigo-400"
            >
              <option value="planet">Planet</option>
              <option value="star">Star</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none rounded border border-white/10 bg-slate-800 px-3 py-2 outline-none focus:border-indigo-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-400">X (0–1)</span>
              <input
                type="number"
                step="0.001"
                min={0}
                max={1}
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                className="rounded border border-white/10 bg-slate-800 px-3 py-2 outline-none focus:border-indigo-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-400">Y (0–1)</span>
              <input
                type="number"
                step="0.001"
                min={0}
                max={1}
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
                className="rounded border border-white/10 bg-slate-800 px-3 py-2 outline-none focus:border-indigo-400"
              />
            </label>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {mode === "edit" && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
