import type { Body } from "../types";

/**
 * Serialize the working set of bodies and trigger a download of planets.json.
 * The admin commits this file over src/data/planets.json to publish changes —
 * there is no live database write.
 */
export function exportBodies(bodies: Body[], filename = "planets.json"): void {
  const json = JSON.stringify(bodies, null, 2) + "\n";
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
