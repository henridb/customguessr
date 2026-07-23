import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { MAP_IMAGE_URL } from "../data/mapConfig";
import type { Point } from "../types";

export type MarkerVariant =
  | "guess"
  | "target"
  | "planet"
  | "star"
  | "system"
  | "satellite";

export interface MapMarker {
  id: string;
  point: Point;
  variant: MarkerVariant;
  label?: string;
  onClick?: () => void;
}

interface MapViewProps {
  markers?: MapMarker[];
  /** Fired with normalized [0,1] coords for a genuine click (not a drag/pan). */
  onBackgroundClick?: (point: Point) => void;
  /** Straight lines drawn between point pairs (e.g. guess -> target on reveal). */
  connections?: Array<[Point, Point]>;
  className?: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 10;
const DRAG_THRESHOLD_PX = 5;

const VARIANT_STYLE: Record<MarkerVariant, string> = {
  guess: "bg-amber-400 ring-amber-200",
  target: "bg-emerald-400 ring-emerald-200",
  planet: "bg-sky-400 ring-sky-200",
  star: "bg-yellow-300 ring-yellow-100",
  system: "bg-cyan-500 ring-cyan-200",
  satellite: "bg-gray-700 ring-gray-200",
};

interface View {
  scale: number;
  x: number;
  y: number;
}

/** Size of the image when fit ("contained") inside the viewport. */
function computeFit(vw: number, vh: number, aspect: number) {
  if (vw <= 0 || vh <= 0) return { fw: 0, fh: 0 };
  return vw / vh > aspect
    ? { fw: vh * aspect, fh: vh }
    : { fw: vw, fh: vw / aspect };
}

/** Keep the (possibly zoomed) image from being dragged out of view. */
function clampTranslate(
  t: number,
  viewportLen: number,
  scaledLen: number,
): number {
  if (scaledLen <= viewportLen) return (viewportLen - scaledLen) / 2;
  return Math.min(0, Math.max(viewportLen - scaledLen, t));
}

/**
 * The galaxy map, fit to its container's height with zoom (wheel / buttons) and
 * click-drag panning. Clicks are reported as normalized [0,1] coordinates via
 * the rendered image's bounding box, so they stay correct at any zoom/pan.
 * A press that moves less than a few pixels counts as a click (guess / create);
 * anything more is a pan. Marker sizes and line widths are counter-scaled so
 * they stay visually constant as you zoom. Reused by the game and admin editor.
 */
export function MapView({
  markers = [],
  onBackgroundClick,
  connections = [],
  className,
}: MapViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [size, setSize] = useState({ vw: 0, vh: 0 });
  const [aspect, setAspect] = useState(1);
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });

  const { fw, fh } = computeFit(size.vw, size.vh, aspect);

  // Latest geometry for the non-passive wheel handler (which can't close over state).
  const geom = useRef({ vw: 0, vh: 0, fw: 0, fh: 0 });
  geom.current = { vw: size.vw, vh: size.vh, fw, fh };

  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  // Track the viewport size.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ vw: entry.contentRect.width, vh: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-fit (reset zoom, recenter) whenever the viewport size or image aspect changes.
  useEffect(() => {
    const f = computeFit(size.vw, size.vh, aspect);
    setView({ scale: 1, x: (size.vw - f.fw) / 2, y: (size.vh - f.fh) / 2 });
  }, [size.vw, size.vh, aspect]);

  // Zoom toward a viewport point, keeping that point fixed under the cursor.
  function zoomAt(cx: number, cy: number, factor: number) {
    const { vw, vh, fw: gw, fh: gh } = geom.current;
    if (gw <= 0) return;
    setView((v) => {
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
      const localX = (cx - v.x) / v.scale;
      const localY = (cy - v.y) / v.scale;
      const x = clampTranslate(cx - localX * scale, vw, gw * scale);
      const y = clampTranslate(cy - localY * scale, vh, gh * scale);
      return { scale, x, y };
    });
  }

  // Wheel zoom must call preventDefault, which requires a non-passive listener.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(
        e.clientX - rect.left,
        e.clientY - rect.top,
        e.deltaY < 0 ? 1.15 : 1 / 1.15,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    viewportRef.current?.setPointerCapture(e.pointerId);
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origX: view.x,
      origY: view.y,
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) d.moved = true;
    const { vw, vh, fw: gw, fh: gh } = geom.current;
    setView((v) => ({
      scale: v.scale,
      x: clampTranslate(d.origX + dx, vw, gw * v.scale),
      y: clampTranslate(d.origY + dy, vh, gh * v.scale),
    }));
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (d.moved || !onBackgroundClick) return;
    const img = imgRef.current;
    if (!img) return;
    const r = img.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) onBackgroundClick({ x, y });
  }

  function zoomButton(factor: number) {
    const { vw, vh } = geom.current;
    zoomAt(vw / 2, vh / 2, factor);
  }

  function resetView() {
    setView({ scale: 1, x: (size.vw - fw) / 2, y: (size.vh - fh) / 2 });
  }

  return (
    <div
      ref={viewportRef}
      className={`relative h-full w-full touch-none overflow-hidden rounded-xl border border-white/10 bg-slate-900 ${
        onBackgroundClick ? "cursor-crosshair" : "cursor-grab"
      } ${className ?? ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {fw > 0 && (
        <div
          className="top-0 left-0 absolute"
          style={{
            width: fw,
            height: fh,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <img
            ref={imgRef}
            src={MAP_IMAGE_URL}
            alt="Galaxy map"
            draggable={false}
            onLoad={(e) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth > 0 && naturalHeight > 0)
                setAspect(naturalWidth / naturalHeight);
            }}
            className="block w-full h-full object-cover"
          />

          {connections.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {connections.map(([a, b], i) => (
                <line
                  key={i}
                  x1={a.x * 100}
                  y1={a.y * 100}
                  x2={b.x * 100}
                  y2={b.y * 100}
                  stroke="white"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  vectorEffect="non-scaling-stroke"
                  opacity={0.7}
                />
              ))}
            </svg>
          )}

          {markers.map((m) => (
            <div
              key={m.id}
              className="absolute"
              style={{
                left: `${m.point.x * 100}%`,
                top: `${m.point.y * 100}%`,
              }}
            >
              <div
                className="absolute flex flex-col items-center"
                style={{
                  transform: `translate(-50%, -50%) scale(${1 / view.scale})`,
                  transformOrigin: "center",
                }}
              >
                <button
                  type="button"
                  aria-label={m.label ?? m.variant}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    m.onClick?.();
                  }}
                  className={`block h-3.5 w-3.5 rounded-full ring-2 shadow transition ${VARIANT_STYLE[m.variant]} ${
                    m.onClick
                      ? "cursor-pointer hover:scale-125"
                      : "cursor-default"
                  }`}
                />
                {m.label && (
                  <span className="bg-black/70 mt-1 px-1.5 py-0.5 rounded text-white text-xs whitespace-nowrap">
                    {m.label}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zoom controls. stopPropagation on pointer-down so the viewport doesn't
          capture the pointer (which would swallow the button click). */}
      <div
        className="right-2 bottom-2 absolute flex flex-col bg-slate-900/80 backdrop-blur border border-white/10 rounded-lg overflow-hidden text-slate-100"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => zoomButton(1.3)}
          className="hover:bg-white/10 px-3 py-1.5 text-lg leading-none"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomButton(1 / 1.3)}
          className="hover:bg-white/10 px-3 py-1.5 border-white/10 border-t text-lg leading-none"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetView}
          className="hover:bg-white/10 px-3 py-1.5 border-white/10 border-t text-base leading-none pbe-2.5"
          aria-label="Reset view"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
