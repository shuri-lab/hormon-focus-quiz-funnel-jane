import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createState, nextId, prevId, stateKey, QUESTIONS, REVEAL, shouldSkip,
  type QuizState, type ScreenId,
} from '../lib/logic';
import { track } from '../lib/analytics';
import type { Angle } from '../lib/angles';
import { QuizCtx, type QuizApi } from './context';

const STORE_KEY = 'hf_quiz_state';

function load(): QuizState | null {
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
  const here = ((location.state as { screen?: ScreenId } | null)?.screen ?? 's1') as ScreenId;

  useEffect(() => { save(S); }, [S]);

  const set = useCallback((patch: Partial<QuizState>) => {
    setS((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggle = useCallback(<K extends 'sym' | 'mood' | 'markers' | 'tried'>(
    key: K, value: QuizState[K][number],
  ) => {
    setS((prev) => {
      const list = prev[key] as string[];
      const i = list.indexOf(value as string);
      let out = i > -1 ? [...list.slice(0, i), ...list.slice(i + 1)] : [...list, value as string];

      // 'None of these' is exclusive, in both directions.
      if (key === 'markers') {
        if (value === 'none') out = i > -1 ? [] : ['none'];
        else out = out.filter((m) => m !== 'none');
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
    goTo('s1');
  }, [angle.preselect, goTo]);

  /* -------------------------------------------------------- progress --- */

  const live = useCallback((ids: ScreenId[]) => ids.filter((k) => !shouldSkip(S, k)), [S]);

  const questionStep = useMemo(() => {
    const asked = live(QUESTIONS);
    const i = asked.indexOf(here);
    return i > -1 ? { index: i + 1, total: asked.length } : null;
  }, [live, here]);

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

    if (here === 's1') track.quizStart(angle.slug);
    if (questionStep) track.quizStep(here, questionStep.index, questionStep.total);
    if (here === 'r1') track.resultView(stateKey(latest.current));
    if (here === 'r7') track.offerView(stateKey(latest.current));
    if (here === 'rDoc') track.doctorRoute(stateKey(latest.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [here]);

  const value = useMemo<QuizApi>(() => ({
    S, angle, here, set, toggle, next, back, restart,
    canBack: here !== 's1' && here !== 's12',
    questionStep, revealStep,
  }), [S, angle, here, set, toggle, next, back, restart, questionStep, revealStep]);

  return <QuizCtx.Provider value={value}>{children}</QuizCtx.Provider>;
}
