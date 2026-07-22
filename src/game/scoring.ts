import type { Point } from "../types";

export const ROUNDS_PER_GAME = 20;
export const MAX_ROUND_SCORE = 5000;
export const MAX_GAME_SCORE = ROUNDS_PER_GAME * MAX_ROUND_SCORE;

/**
 * Aspect-corrected distance between two normalized points.
 *
 * Normalized coords live in a unit square, but the map is wider than it is tall,
 * so a horizontal gap looks larger on screen than the same gap vertically.
 * Scaling dx by the aspect ratio makes distance match what the player perceives.
 * Result ranges from 0 (exact) to sqrt(aspect^2 + 1) (opposite corners).
 */
export function mapDistance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

/**
 * Difficulty knob. Score is MAX_ROUND_SCORE at distance 0 and decays
 * exponentially with distance. Raise DECAY to punish misses harder, lower it to
 * be more forgiving. Meant to be tuned once the real galaxy image is in place.
 */
const DECAY = 5;
const VALIDITY_RADIUS = 0.01;

/** Score a single round: 0..MAX_ROUND_SCORE, full points for a guess closer
 * than VALIDITY_RADIUS. */
export function scoreRound(guess: Point, target: Point): number {
  const d = mapDistance(guess, target);
  return Math.min(
    MAX_ROUND_SCORE,
    Math.round(MAX_ROUND_SCORE * Math.exp(-DECAY * (d - VALIDITY_RADIUS))),
  );
}
