import { createContext, useContext } from 'react';
import type { QuizState, ScreenId } from '../lib/logic';
import type { Angle } from '../lib/angles';

export interface QuizApi {
  S: QuizState;
  angle: Angle;
  here: ScreenId;
  /** Merge fields into the state. */
  set: (patch: Partial<QuizState>) => void;
  /** Add or remove a value from one of the array fields. */
  toggle: <K extends 'sym' | 'tried'>(key: K, value: QuizState[K][number]) => void;
  next: (opts?: { replace?: boolean }) => void;
  back: () => void;
  restart: () => void;
  canBack: boolean;
  /** "2 of 7", or null on screens that are not questions. */
  questionStep: { index: number; total: number } | null;
  /** Reveal progress, or null outside the reveal. */
  revealStep: { index: number; total: number } | null;
}

export const QuizCtx = createContext<QuizApi | null>(null);

export function useQuiz(): QuizApi {
  const api = useContext(QuizCtx);
  if (!api) throw new Error('useQuiz must be used inside <QuizProvider>');
  return api;
}
