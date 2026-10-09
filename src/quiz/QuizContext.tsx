import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createState, docReason, nextId, prevId, stateKey, QUESTION_NUMBER, QUESTION_TOTAL, REVEAL,
  shouldSkip, type QuizState, type ScreenId,
} from '../lib/logic';
import { track } from '../lib/analytics';
import type { Angle } from '../lib/angles';
import { QuizCtx, type QuizApi } from './context';
import { FIRST_STEP, screenFromSlug, stepPath } from './steps';
import { REVIEW, takePreset } from '../review/flag';
import { readListLink } from '../lib/listLink';

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
  const { step } = useParams();

  const [S, setS] = useState<QuizState>(() => {
    /* Read every time the quiz mounts, and applied to a restored state as
       well as a fresh one: a refresh halfway through must not put the email
       screen back in front of a woman who came from the list. */
    const { skipEmail } = readListLink();
    const restored = load();
    if (restored) return { ...restored, skipEmail };
    // The ad already told us what she came for. Do not ask her again.
    return { ...createState(), sym: [...angle.preselect], skipEmail };
  });

  /* THE SCREEN IS THE URL. It used to live in history state, which meant
     every step read /quiz and nothing in the funnel could be linked to.
     Reading it from the path gives the device back button the same walk it
     had before, and gives everything else an address. */
  const here: ScreenId = screenFromSlug(step) ?? FIRST_STEP;

  /* The angle prefix, so a woman inside /bloating stays inside it. */
  const base = angle.slug ? `/${angle.slug}` : '';

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
    /* The query is carried across every step: an ad's utm_* must survive the
       walk, and the address bar is now the thing that holds it. */
    navigate({ pathname: stepPath(base, id), search: window.location.search }, { replace });
  }, [navigate, base]);

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
    const fresh = {
      ...createState(), sym: [...angle.preselect], skipEmail: readListLink().skipEmail,
    };
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
