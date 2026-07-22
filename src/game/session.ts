import type { Body, Point } from "../types";
import { ROUNDS_PER_GAME, scoreRound } from "./scoring";

export interface Round {
  body: Body;
  /** The player's click for this round, or null until they guess. */
  guess: Point | null;
  /** Points earned this round, or null until the guess is submitted. */
  score: number | null;
}

export interface GameSession {
  rounds: Round[];
  currentIndex: number;
  totalScore: number;
  finished: boolean;
}

/** Fisher-Yates shuffle returning the first `count` items (does not mutate input). */
function pickRandom<T>(items: readonly T[], count: number): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

/**
 * Start a new game with up to ROUNDS_PER_GAME distinct random bodies. If the pool
 * has fewer bodies than that, the game simply has fewer rounds.
 */
export function createSession(pool: readonly Body[], count = ROUNDS_PER_GAME): GameSession {
  const targets = pickRandom(pool, Math.min(count, pool.length));
  return {
    rounds: targets.map((body) => ({ body, guess: null, score: null })),
    currentIndex: 0,
    totalScore: 0,
    finished: false,
  };
}

export function currentRound(session: GameSession): Round {
  return session.rounds[session.currentIndex];
}

export function isLastRound(session: GameSession): boolean {
  return session.currentIndex >= session.rounds.length - 1;
}

/** Record and score the current round's guess. Returns a new session. */
export function applyGuess(session: GameSession, guess: Point): GameSession {
  const rounds = session.rounds.slice();
  const i = session.currentIndex;
  const target = { x: rounds[i].body.x, y: rounds[i].body.y };
  const score = scoreRound(guess, target);
  rounds[i] = { ...rounds[i], guess, score };
  return { ...session, rounds, totalScore: session.totalScore + score };
}

/** Finalize the current round as a miss (no guess, 0 points). Returns a new session. */
export function applyMiss(session: GameSession): GameSession {
  const rounds = session.rounds.slice();
  const i = session.currentIndex;
  rounds[i] = { ...rounds[i], guess: null, score: 0 };
  return { ...session, rounds };
}

/** Advance to the next round, or mark the game finished. Returns a new session. */
export function advance(session: GameSession): GameSession {
  const nextIndex = session.currentIndex + 1;
  if (nextIndex >= session.rounds.length) {
    return { ...session, finished: true };
  }
  return { ...session, currentIndex: nextIndex };
}
