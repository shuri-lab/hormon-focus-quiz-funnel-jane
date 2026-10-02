/* THE REVIEW BUILD.
 *
 * `npm run build:review` makes a copy of the funnel that can be handed round
 * for review as a single shared page: no address bar to rely on, nothing sent
 * to Klaviyo, no tracking scripts, and a bar across the top that jumps
 * straight to each result.
 *
 * Everything here is OFF in the real build. VITE_REVIEW is replaced at build
 * time, so with the flag unset the bundler drops this code and the customer
 * never downloads it.
 */
import type { QuizState, ScreenId } from '../lib/logic';
import { createState } from '../lib/logic';

export const REVIEW = import.meta.env.VITE_REVIEW === '1';

export interface Jump {
  label: string;
  /** Where in the app, and which quiz screen. */
  route: '/' | '/quiz';
  screen?: ScreenId;
  /** The answers that produce it. */
  state?: Partial<QuizState>;
}

const who = { name: 'Renee', email: 'renee@example.com', consent: true };

/** One tap to each thing worth reviewing, with the answers that lead there. */
export const JUMPS: Jump[] = [
  { label: 'Cover', route: '/' },
  { label: 'Question 1', route: '/quiz', screen: 'q1' },
  {
    label: 'Email screen', route: '/quiz', screen: 'gate',
    state: { sym: ['sleep', 'weight'], main: 'sleep', age: '45-49', cycle: 'unpredictable', pattern: 'weekly', tried: ['food'], want: 'sleep' },
  },
  {
    label: 'Result: perimenopause', route: '/quiz', screen: 'r1',
    state: { ...who, sym: ['weight', 'sleep', 'energy'], main: 'sleep', age: '45-49', cycle: 'unpredictable', pattern: 'weekly', tried: ['food', 'gym'], want: 'sleep' },
  },
  {
    label: 'Result: menopause', route: '/quiz', screen: 'r1',
    state: { ...who, sym: ['sleep', 'sweats'], main: 'sweats', age: '50-54', cycle: 'stopped', twelve: 'yes', pattern: 'daily', tried: ['doctor'], want: 'cool' },
  },
  {
    label: 'Result: early menopause', route: '/quiz', screen: 'r1',
    state: { ...who, sym: ['sleep', 'mood'], main: 'mood', age: '40-44', cycle: 'stopped', twelve: 'yes', pattern: 'comego', tried: ['supps'], want: 'clear' },
  },
  {
    label: 'Result: hormone changes', route: '/quiz', screen: 'r1',
    state: { ...who, sym: ['energy', 'bloat'], main: 'bloat', age: '40-44', cycle: 'same', pattern: 'monthly', tried: ['nothing'], want: 'body' },
  },
  {
    label: 'Kit page', route: '/quiz', screen: 'r2',
    state: { ...who, sym: ['weight', 'sleep', 'energy'], main: 'sleep', age: '45-49', cycle: 'unpredictable', pattern: 'weekly', tried: ['food', 'gym'], want: 'sleep' },
  },
  {
    label: 'Doctor route', route: '/quiz', screen: 'rDoc',
    state: { sym: ['sweats'], age: '60-plus', cycle: 'skipping' },
  },
];

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
