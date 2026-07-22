import type { CSSProperties, ReactNode } from "react";
import type { Point } from "../types";
import { MAP_ASPECT_RATIO, MAP_IMAGE_URL } from "../data/mapConfig";

export type MarkerVariant = "guess" | "target" | "planet" | "star";

export interface MapMarker {
  id: string;
  point: Point;
  variant: MarkerVariant;
  label?: string;
  onClick?: () => void;
}

interface MapViewProps {
  markers?: MapMarker[];
  /** Fired with normalized [0,1] coords when the map background is clicked. */
  onBackgroundClick?: (point: Point) => void;
  /** Straight lines drawn between point pairs (e.g. guess -> target on reveal). */
  connections?: Array<[Point, Point]>;
  className?: string;
}

const VARIANT_STYLE: Record<MarkerVariant, string> = {
  guess: "bg-amber-400 ring-amber-200",
  target: "bg-emerald-400 ring-emerald-200",
  planet: "bg-sky-400 ring-sky-200",
  star: "bg-yellow-300 ring-yellow-100",
};

function pct(p: Point): CSSProperties {
  return { left: `${p.x * 100}%`, top: `${p.y * 100}%` };
}

/**
 * Renders the galaxy map at its true aspect ratio and reports clicks as
 * normalized [0,1] coordinates. Markers and connection lines are positioned by
 * the same normalized coords, so everything stays aligned at any screen size.
 * Reused by both the game (guess/target markers) and the admin editor (all bodies).
 */
export function MapView({ markers = [], onBackgroundClick, connections = [], className }: MapViewProps) {
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onBackgroundClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onBackgroundClick({ x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) });
  }

  return (
    <div
      className={`relative w-full select-none overflow-hidden rounded-xl border border-white/10 ${
        onBackgroundClick ? "cursor-crosshair" : ""
      } ${className ?? ""}`}
      style={{ aspectRatio: String(MAP_ASPECT_RATIO) }}
      onClick={handleClick}
    >
      <img src={MAP_IMAGE_URL} alt="Galaxy map" className="absolute inset-0 h-full w-full object-cover" draggable={false} />

      {connections.length > 0 && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {connections.map(([a, b], i) => (
            <line
              key={i}
              x1={a.x * 100}
              y1={a.y * 100}
              x2={b.x * 100}
              y2={b.y * 100}
              stroke="white"
              strokeWidth={0.4}
              strokeDasharray="1.5 1.5"
              opacity={0.7}
            />
          ))}
        </svg>
      )}

      {markers.map((m) => (
        <div key={m.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(m.point)}>
          <button
            type="button"
            aria-label={m.label ?? m.variant}
            onClick={(e) => {
              e.stopPropagation();
              m.onClick?.();
            }}
            className={`block h-3.5 w-3.5 rounded-full ring-2 ${VARIANT_STYLE[m.variant]} ${
              m.onClick ? "cursor-pointer hover:scale-125" : "cursor-default"
            } shadow transition`}
          />
          {m.label && (
            <span className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
              {m.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Convenience wrapper so callers can pass children overlays if needed later. */
export function MapFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl">{children}</div>;
}
