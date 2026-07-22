import { useCallback, useState } from "react";
import { bodies } from "../data/bodies";
import type { Point } from "../types";
import {
  advance,
  applyGuess,
  applyMiss,
  createSession,
  currentRound,
  isLastRound,
  type GameSession,
  type Round,
} from "./session";

/** Within a round: placing/confirming a guess, then reviewing the reveal. */
export type RoundPhase = "guessing" | "revealed";

export const DEFAULT_SECONDS_PER_ROUND = 15;

export interface GameController {
  session: GameSession | null;
  round: Round | null;
  roundNumber: number;
  totalRounds: number;
  phase: RoundPhase;
  /** The click the player has placed but not yet submitted. */
  pendingGuess: Point | null;
  isLast: boolean;
  /** Seconds allotted to each round for the current/most-recent game. */
  secondsPerRound: number;
  start: (secondsPerRound?: number) => void;
  reset: () => void;
  placeGuess: (point: Point) => void;
  submitGuess: () => void;
  /** Timer expired: submit the pending guess, or record a miss if none. */
  timeUp: () => void;
  nextRound: () => void;
}

/**
 * Owns the whole player game lifecycle: starting a session, placing/submitting a
 * guess for the current round, revealing the result, then advancing. Also holds
 * the per-round time limit chosen before launch.
 */
export function useGame(): GameController {
  const [session, setSession] = useState<GameSession | null>(null);
  const [phase, setPhase] = useState<RoundPhase>("guessing");
  const [pendingGuess, setPendingGuess] = useState<Point | null>(null);
  const [secondsPerRound, setSecondsPerRound] = useState(
    DEFAULT_SECONDS_PER_ROUND,
  );

  const start = useCallback((seconds?: number) => {
    if (seconds !== undefined) setSecondsPerRound(seconds);
    setSession(createSession(bodies));
    setPhase("guessing");
    setPendingGuess(null);
  }, []);

  const reset = useCallback(() => {
    setSession(null);
    setPhase("guessing");
    setPendingGuess(null);
  }, []);

  const placeGuess = useCallback(
    (point: Point) => {
      if (phase === "guessing")
        setPendingGuess({ x: point.x, y: point.y + 0.0005 });
      // to counteract an odd offset
    },
    [phase],
  );

  const submitGuess = useCallback(() => {
    if (phase !== "guessing" || !session || !pendingGuess) return;
    setSession(applyGuess(session, pendingGuess));
    setPhase("revealed");
  }, [phase, session, pendingGuess]);

  const timeUp = useCallback(() => {
    if (phase !== "guessing" || !session) return;
    setSession(
      pendingGuess ? applyGuess(session, pendingGuess) : applyMiss(session),
    );
    setPhase("revealed");
  }, [phase, session, pendingGuess]);

  const nextRound = useCallback(() => {
    if (phase !== "revealed" || !session) return;
    setSession(advance(session));
    setPhase("guessing");
    setPendingGuess(null);
  }, [phase, session]);

  const round = session ? currentRound(session) : null;

  return {
    session,
    round,
    roundNumber: session ? session.currentIndex + 1 : 0,
    totalRounds: session ? session.rounds.length : 0,
    phase,
    pendingGuess,
    isLast: session ? isLastRound(session) : false,
    secondsPerRound,
    start,
    reset,
    placeGuess,
    submitGuess,
    timeUp,
    nextRound,
  };
}
