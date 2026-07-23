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
export function BodyModal({
  mode,
  initial,
  onSave,
  onDelete,
  onClose,
}: BodyModalProps) {
  const [name, setName] = useState(initial.name);
  const [type, setType] = useState<BodyType>(initial.type);
  const [description, setDescription] = useState(initial.description ?? "");
  const [x, setX] = useState(initial.x);
  const [y, setY] = useState(initial.y);
  const [likelihood, setLikelihood] = useState(initial.likelihood ?? 1);
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
      likelihood: likelihood,
    });
  }

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 shadow-xl p-6 border border-white/10 rounded-xl w-full max-w-md text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 font-semibold text-lg">
          {mode === "create" ? "New body" : `Edit ${initial.name}`}
        </h2>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="bg-slate-800 px-3 py-2 border border-white/10 focus:border-indigo-400 rounded outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as BodyType)}
              className="bg-slate-800 px-3 py-2 border border-white/10 focus:border-indigo-400 rounded outline-none cursor-pointer"
            >
              <option value="planet">Planète</option>
              <option value="star">Étoile</option>
              <option value="system">Système stellaire</option>
              <option value="satellite">Satellite</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-slate-800 px-3 py-2 border border-white/10 focus:border-indigo-400 rounded outline-none resize-none"
            />
          </label>

          <div className="gap-3 grid grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-400">X (0–1)</span>
              <input
                type="number"
                step="0.001"
                min={0}
                max={1}
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                className="bg-slate-800 px-3 py-2 border border-white/10 focus:border-indigo-400 rounded outline-none"
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
                className="bg-slate-800 px-3 py-2 border border-white/10 focus:border-indigo-400 rounded outline-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-400">Likelihood</span>
            <input
              type="number"
              step="1"
              min={0}
              value={likelihood}
              onChange={(e) => setLikelihood(Number(e.target.value))}
              className="bg-slate-800 px-3 py-2 border border-white/10 focus:border-indigo-400 rounded outline-none resize-none"
            />
          </label>

          {error && <p className="text-rose-400 text-sm">{error}</p>}
        </div>

        <div className="flex justify-between items-center mt-6">
          {mode === "edit" && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="hover:bg-rose-500/10 px-4 py-2 rounded-lg font-semibold text-rose-400 text-sm transition cursor-pointer"
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
              className="hover:bg-white/5 px-4 py-2 rounded-lg font-semibold text-slate-300 text-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-lg font-semibold text-white text-sm transition cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
