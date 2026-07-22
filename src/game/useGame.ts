import { useCallback, useState } from "react";
import type { Point } from "../types";
import { bodies } from "../data/bodies";
import {
  advance,
  applyGuess,
  createSession,
  currentRound,
  isLastRound,
  type GameSession,
  type Round,
} from "./session";

/** Within a round: placing/confirming a guess, then reviewing the reveal. */
export type RoundPhase = "guessing" | "revealed";

export interface GameController {
  session: GameSession | null;
  round: Round | null;
  roundNumber: number;
  totalRounds: number;
  phase: RoundPhase;
  /** The click the player has placed but not yet submitted. */
  pendingGuess: Point | null;
  isLast: boolean;
  start: () => void;
  reset: () => void;
  placeGuess: (point: Point) => void;
  submitGuess: () => void;
  nextRound: () => void;
}

/**
 * Owns the whole player game lifecycle: starting a session, placing/submitting a
 * guess for the current round, revealing the result, then advancing. Kept as a
 * hook so the player page stays declarative.
 */
export function useGame(): GameController {
  const [session, setSession] = useState<GameSession | null>(null);
  const [phase, setPhase] = useState<RoundPhase>("guessing");
  const [pendingGuess, setPendingGuess] = useState<Point | null>(null);

  const start = useCallback(() => {
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
      if (phase === "guessing") setPendingGuess(point);
    },
    [phase],
  );

  const submitGuess = useCallback(() => {
    if (phase !== "guessing" || !session || !pendingGuess) return;
    setSession(applyGuess(session, pendingGuess));
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
    start,
    reset,
    placeGuess,
    submitGuess,
    nextRound,
  };
}
