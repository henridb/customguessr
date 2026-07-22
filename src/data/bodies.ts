import type { Body, BodyType } from "../types";
import rawBodies from "./planets.json";

// Central access point for the planet/star dataset.
//
// The data lives in planets.json, which is bundled at build time. The admin page
// edits an in-memory copy and exports a replacement planets.json that gets
// committed to the repo, so this file is the single source of truth the player
// app reads from. `parseBodies` is shared: it validates both the bundled seed
// and any JSON the admin re-imports into the editor.

const BODY_TYPES: readonly BodyType[] = ["planet", "star"];

function isBody(value: unknown): value is Body {
  if (typeof value !== "object" || value === null) return false;
  const b = value as Record<string, unknown>;
  return (
    typeof b.id === "string" &&
    b.id.length > 0 &&
    typeof b.name === "string" &&
    typeof b.type === "string" &&
    BODY_TYPES.includes(b.type as BodyType) &&
    typeof b.x === "number" &&
    b.x >= 0 &&
    b.x <= 1 &&
    typeof b.y === "number" &&
    b.y >= 0 &&
    b.y <= 1 &&
    (b.description === undefined || typeof b.description === "string")
  );
}

/**
 * Validate and normalize an unknown value (e.g. parsed JSON) into Body[].
 * Throws with a descriptive message on the first malformed entry so the admin
 * import surfaces a useful error instead of silently loading bad data.
 */
export function parseBodies(value: unknown): Body[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected the dataset to be a JSON array of bodies.");
  }
  const bodies: Body[] = [];
  const seen = new Set<string>();
  value.forEach((entry, i) => {
    if (!isBody(entry)) {
      throw new Error(`Body at index ${i} is invalid or missing required fields.`);
    }
    if (seen.has(entry.id)) {
      throw new Error(`Duplicate body id "${entry.id}" at index ${i}.`);
    }
    seen.add(entry.id);
    bodies.push(entry);
  });
  return bodies;
}

/** The bundled dataset, validated at module load. */
export const bodies: Body[] = parseBodies(rawBodies);

export function getBodyById(id: string): Body | undefined {
  return bodies.find((b) => b.id === id);
}
