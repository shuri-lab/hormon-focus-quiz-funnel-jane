import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createState, docReason, nextId, prevId, stateKey, QUESTION_NUMBER, QUESTION_TOTAL, REVEAL,
  shouldSkip, type QuizState, type ScreenId,
} from '../lib/logic';
import { track } from '../lib/analytics';
import type { Angle } from '../lib/angles';
import { QuizCtx, type QuizApi } from './context';
import { REVIEW, takePreset } from '../review/flag';

/* v3: the seven-question quiz. An answer saved by the old quiz does not fit
   the new questions, so it is left behind rather than restored. */
const STORE_KEY = 'hf_quiz_state_v3';

function load(): QuizState | null {
  /* The review build's jump buttons hand the quiz a set of answers to start from. */
  if (REVIEW) {
    const preset = takePreset();
    if (preset) return preset;
  }
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return { ...createState(), ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function save(S: QuizState) {
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch { /* private browsing */ }
}

export function QuizProvider({ angle, children }: { angle: Angle; children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [S, setS] = useState<QuizState>(() => {
    const restored = load();
    if (restored) return restored;
    // The ad already told us what she came for. Do not ask her again.
    return { ...createState(), sym: [...angle.preselect] };
  });

  /* The screen lives in history state, so the device back button walks the
     funnel backwards instead of leaving it. */
  const here = ((location.state as { screen?: ScreenId } | null)?.screen ?? 'q1') as ScreenId;

  useEffect(() => { save(S); }, [S]);

  const set = useCallback((patch: Partial<QuizState>) => {
    setS((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggle = useCallback(<K extends 'sym' | 'tried'>(
    key: K, value: QuizState[K][number],
  ) => {
    setS((prev) => {
      const list = prev[key] as string[];
      const i = list.indexOf(value as string);
      let out = i > -1 ? [...list.slice(0, i), ...list.slice(i + 1)] : [...list, value as string];

      // 'Nothing yet' is exclusive, in both directions.
      if (key === 'tried') {
        if (value === 'nothing') out = i > -1 ? [] : ['nothing'];
        else out = out.filter((m) => m !== 'nothing');
      }
      return { ...prev, [key]: out } as QuizState;
    });
  }, []);

  /* `here` is read from history but `S` may have just changed in the same
     tick, so route off the freshest state rather than a stale render. */
  const latest = useRef(S);
  latest.current = S;

  const goTo = useCallback((id: ScreenId | undefined, replace = false) => {
    if (!id) return;
    navigate(location.pathname + location.search, { state: { screen: id }, replace });
  }, [navigate, location.pathname, location.search]);

  /* A double-tap on Continue used to fire two navigations and skip a screen —
     easy to do on a phone, and invisible until somebody lands on the offer
     without seeing the price ladder. One advance per screen, whatever the
     thumb does. */
  const advancedFrom = useRef<ScreenId | null>(null);

  const next = useCallback((opts?: { replace?: boolean }) => {
    if (advancedFrom.current === here) return;
    advancedFrom.current = here;
    goTo(nextId(latest.current, here), opts?.replace);
  }, [goTo, here]);

  const back = useCallback(() => {
    // Prefer real history so the transition matches the device gesture.
    if (window.history.state?.idx > 0) navigate(-1);
    else goTo(prevId(latest.current, here), true);
  }, [navigate, goTo, here]);

  const restart = useCallback(() => {
    const fresh = { ...createState(), sym: [...angle.preselect] };
    setS(fresh);
    try { sessionStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
    goTo('q1');
  }, [angle.preselect, goTo]);

  /* -------------------------------------------------------- progress --- */

  const live = useCallback((ids: ScreenId[]) => ids.filter((k) => !shouldSkip(S, k)), [S]);

  const questionStep = useMemo(() => {
    const n = QUESTION_NUMBER[here];
    return n ? { index: n, total: QUESTION_TOTAL } : null;
  }, [here]);

  const revealStep = useMemo(() => {
    const shown = live(REVEAL);
    const i = shown.indexOf(here);
    return i > -1 ? { index: i + 1, total: shown.length } : null;
  }, [live, here]);

  /* ------------------------------------------------------- analytics --- */

  const seen = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (seen.current.has(here)) return;
    seen.current.add(here);

    if (here === 'q1') track.quizStart(angle.slug);
    if (questionStep) track.quizStep(here, questionStep.index, questionStep.total);
    if (here === 'load') track.quizComplete(stateKey(latest.current));
    if (here === 'r1') track.resultView(stateKey(latest.current));
    if (here === 'r2') track.offerView(stateKey(latest.current));
    if (here === 'rDoc') track.doctorRoute(docReason(latest.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [here]);

  const value = useMemo<QuizApi>(() => ({
    S, angle, here, set, toggle, next, back, restart,
    canBack: here !== 'q1' && here !== 'load',
    questionStep, revealStep,
  }), [S, angle, here, set, toggle, next, back, restart, questionStep, revealStep]);

  return <QuizCtx.Provider value={value}>{children}</QuizCtx.Provider>;
}
