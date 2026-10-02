/* The switch for the review build, and the one thing the quiz itself needs
 * from it. Kept apart from review.ts so the real build pulls in nothing else.
 *
 * The build mode is a constant the bundler knows, so outside `--mode review`
 * every branch behind REVIEW is dead code and is dropped.
 */
import type { QuizState } from '../lib/logic';
import { createState } from '../lib/logic';

export const REVIEW = import.meta.env.MODE === 'review';

/* The answers a jump wants the quiz to start from. Held here rather than in
   sessionStorage, which a shared page may not be allowed to use. */
let pending: QuizState | null = null;

export function setPreset(state: Partial<QuizState> | undefined): void {
  pending = { ...createState(), ...state };
}

/**
 * Read by the quiz as it mounts. Cleared a tick later rather than at once,
 * because React may run a state initialiser twice and both runs must agree.
 */
export function takePreset(): QuizState | null {
  const out = pending;
  if (out) setTimeout(() => { if (pending === out) pending = null; }, 0);
  return out;
}
