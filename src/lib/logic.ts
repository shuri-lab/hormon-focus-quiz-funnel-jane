/* THE HORMONE CHECK — routing and scoring, with no user interface attached.
 *
 * This is a TYPED PORT of Jane's `src/logic.js`. Same branches, same order,
 * same comparisons. Nothing here was re-authored.
 *
 * The specification is `docs/routing-table.md`. If the two ever disagree,
 * the table wins and this file is wrong.
 *
 * `tests/logic.equivalence.test.ts` runs Jane's original `reference/quiz.js`
 * in a sandbox and asserts both implementations agree across 560 combinations,
 * so this port cannot have drifted. Read `docs/PORTING.md` before touching it.
 */

/* ---------------------------------------------------------------- types -- */

export type Age = 'u30' | '30s' | '40s' | '50s' | '60';
export type Periods = 'yes' | 'changing' | 'stopped';
export type StopCause = 'coil' | 'pill' | 'surgery' | 'treatment' | 'none';
export type Regularity = 'clock' | 'abit' | 'allover';
export type Severity = 'rare' | 'monthly' | 'weekly' | 'daily';
export type Helped = 'temp' | 'little' | 'none' | 'worse';
export type SymptomId = 'sweats' | 'weight' | 'sleep' | 'bloat' | 'mood' | 'energy';
export type MoodId = 'irritable' | 'anxious' | 'flat' | 'notme';
export type MarkerId = 'skipped' | 'heavier' | 'closer' | 'pms' | 'tender' | 'none';
export type TriedId = 'food' | 'gym' | 'sleep' | 'dim' | 'doctor' | 'bloods' | 'wait';

/** 'A' Imbalance · 'B' Perimenopause · 'C' Menopause · 'D' Doctor · 'E' Early menopause */
export type Outcome = 'A' | 'B' | 'C' | 'D' | 'E';
export type DocReason = 'treatment' | 'surgery' | 'young' | 'late' | '';

export interface QuizState {
  sym: SymptomId[];
  age: Age | '';
  periods: Periods | '';
  stopCause: StopCause | '';
  /** Not asked when periods have stopped. */
  reg: Regularity | '';
  mood: MoodId[];
  /** 'none' is exclusive. */
  markers: MarkerId[];
  sev: Severity | '';
  tried: TriedId[];
  helped: Helped | '';
  name: string;
  email: string;
  /** Ticked opt-in. No address is sent anywhere while this is false. */
  consent: boolean;
}

/** The complete shape. Every field, and what it may hold. */
export function createState(): QuizState {
  return {
    sym: [], age: '', periods: '', stopCause: '', reg: '',
    mood: [], markers: [], sev: '', tried: [], helped: '',
    name: '', email: '', consent: false,
  };
}

/* ----------------------------------------------------------- the tables -- */

type Weight = 'peri' | 'shared' | 'none';

/* [id, label, weighting, group] — order is the order she sees them, and it
   follows the 114 customer reviews rather than the store page. */
export const TILES: [SymptomId, string, Weight, string][] = [
  ['sweats', 'Hot flashes or night sweats', 'peri', 'nights'],
  ['weight', 'Weight that will not shift', 'shared', 'body'],
  ['sleep', 'Poor sleep', 'shared', 'nights'],
  ['bloat', 'Bloating most days', 'shared', 'body'],
  ['mood', 'Mood swings and brain fog', 'shared', 'head'],
  ['energy', 'Low energy', 'shared', 'energy'],
];

export const MOOD: [MoodId, string, Weight][] = [
  ['irritable', 'Snapping at people, when I never used to', 'shared'],
  ['anxious', 'Anxious in a way I did not used to be', 'shared'],
  ['flat', 'Flat, or crying at nothing', 'shared'],
  ['notme', 'I do not feel like myself any more', 'shared'],
];

export const MARKERS: [MarkerId, string, Weight][] = [
  ['skipped', 'I have skipped a period', 'peri'],
  ['heavier', 'My periods are heavier or longer', 'peri'],
  ['closer', 'They come closer together, or further apart', 'peri'],
  ['pms', 'My PMS is worse than it used to be', 'shared'],
  ['tender', 'Breast tenderness before my period', 'shared'],
  ['none', 'None of these', 'none'],
];

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  rare: 1, monthly: 2, weekly: 3, daily: 4,
};

export interface Group { k: string; name: string; ids: SymptomId[] }

export const GROUPS: Group[] = [
  { k: 'body', name: 'Weight and bloating', ids: ['weight', 'bloat'] },
  { k: 'nights', name: 'Sleep and temperature', ids: ['sleep', 'sweats'] },
  { k: 'head', name: 'Mood and mind', ids: ['mood'] },
  { k: 'energy', name: 'Energy', ids: ['energy'] },
];

/* ------------------------------------------------------------ predicates -- */

export function has(S: QuizState, id: SymptomId): boolean {
  return S.sym.indexOf(id) > -1;
}

export function periScore(S: QuizState): number {
  let n = 0;
  if (has(S, 'sweats')) n += 2;
  S.markers.forEach((m) => {
    const r = MARKERS.filter((x) => x[0] === m)[0];
    if (r && r[2] === 'peri') n++;
  });
  if (S.reg === 'allover') n += 2;
  else if (S.reg === 'abit') n++;
  if (S.age === '40s') n++;
  if (S.age === '50s') n += 2;
  if (S.age === '60') n += 2;
  return n;
}

export function explained(S: QuizState): boolean {
  return Boolean(S.stopCause) && S.stopCause !== 'none';
}

export function older(S: QuizState): boolean {
  return S.age === '50s' || S.age === '60';
}

export function under40(S: QuizState): boolean {
  return S.age === 'u30' || S.age === '30s';
}

/**
 * Why we would send her to a doctor instead of giving her a read.
 * Returns '' when we are confident enough to answer her ourselves.
 */
export function docReason(S: QuizState): DocReason {
  if (S.periods !== 'stopped') return S.age === '60' ? 'late' : '';
  if (S.stopCause === 'treatment') return 'treatment';          // not our call, at any age
  if (S.stopCause === 'surgery' && !older(S)) return 'surgery';  // we never asked about her ovaries
  if (!explained(S) && under40(S)) return 'young';               // stopping before forty is not menopause
  return '';
}

/**
 * When the bleed is being suppressed, her cycle cannot tell us anything.
 * Read her by symptoms and age instead, and say so on the result.
 */
export function masked(S: QuizState): boolean {
  return S.periods === 'stopped' && (S.stopCause === 'coil' || S.stopCause === 'pill');
}

/* -------------------------------------------------------------- routing -- */

/** The one function this whole file exists for. */
export function stateKey(S: QuizState): Outcome {
  if (S.periods === 'stopped') {
    if (docReason(S)) return 'D';
    if (masked(S)) {
      if (older(S)) return 'C';
      if (S.age === '40s') return 'B';
      if (S.age === '30s') return periScore(S) >= 5 ? 'B' : 'A';
      return 'A';
    }
    if (S.stopCause === 'surgery') return 'C';  // fifties and over; younger went to D above
    if (S.age === '40s') return 'E';
    if (under40(S)) return 'D';
    return 'C';
  }
  /* she still has periods, changed or not */
  if (docReason(S)) return 'D';
  if (older(S)) return 'B';
  if (S.age === '40s') return periScore(S) >= 3 ? 'B' : 'A';
  if (S.age === '30s') return periScore(S) >= 5 ? 'B' : 'A';
  return 'A';                                   // under thirty is never perimenopause
}

export function confidence(S: QuizState): string {
  const p = periScore(S);
  if (stateKey(S) === 'D') return 'Worth checking properly';
  if (masked(S)) return 'Read from your symptoms';
  if (S.periods === 'stopped') return 'Clear';
  if (p >= 5 || p <= 1) return 'Clear';
  return 'Two things overlapping';
}

/* -------------------------------------------------------------- scoring -- */

export interface Score { raw: number; max: number; pct: number }

export function score(S: QuizState): Score {
  const raw = S.sym.length + S.mood.length +
    S.markers.filter((m) => m !== 'none').length;
  return {
    raw,
    max: 14,
    pct: Math.min(100, Math.round((raw / 14) * 70 + ((SEVERITY_WEIGHT[S.sev as Severity] || 1) / 4) * 30)),
  };
}

export function groupCount(S: QuizState, g: Group): number {
  let n = 0;
  g.ids.forEach((i) => { if (has(S, i)) n++; });
  if (g.k === 'head') n += S.mood.length;
  return n;
}

export function groupMax(g: Group): number {
  return g.k === 'head' ? 1 + MOOD.length : g.ids.length;
}

/* --------------------------------------------------------------- flow ---- */

export type ScreenId =
  | 's1' | 's2' | 's3' | 's4' | 's4b' | 's5' | 's6' | 's7' | 's8' | 's9'
  | 's10' | 's11' | 's12' | 's13'
  | 'r1' | 'r2' | 'rDoc' | 'r4' | 'r4b' | 'r5' | 'r6' | 'r7';

export const FLOW: ScreenId[] = [
  's1', 's2', 's3', 's4', 's4b', 's5', 's6', 's7', 's8', 's9',
  's10', 's11', 's12', 's13',
  'r1', 'r2', 'rDoc', 'r4', 'r4b', 'r5', 'r6', 'r7',
];

/** The screens that count toward the progress bar. */
export const QUESTIONS: ScreenId[] = ['s1', 's2', 's4', 's4b', 's5', 's6', 's7', 's8', 's10', 's11'];

/** The reveal, which is paced differently from the questions. */
export const REVEAL: ScreenId[] = ['r1', 'r2', 'rDoc', 'r4', 'r4b', 'r5', 'r6', 'r7'];

/** Everything between s4b and rDoc. A doctor-route state sees none of it. */
const EXIT_AT_S4B: ScreenId[] = [
  's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 'r1', 'r2',
];

/**
 * Is docReason() settled yet? It needs her age and whether her periods have
 * stopped. Mid-quiz the state is half empty, so this guards the exit from
 * firing on an answer she has not given: a sixty-year-old is only 'late'
 * once we know she is still bleeding.
 *
 * It deliberately does NOT wait on stopCause. Every screen the exit skips
 * sits after s4b in FLOW, so by the time one is evaluated s4b has already
 * been shown or skipped; and a stopped state with no cause given still
 * routes to D, which must exit like any other.
 */
export function docDecided(S: QuizState): boolean {
  return Boolean(S.age && S.periods);
}

/** Settled, and the answer is the doctor. */
export function doctorExit(S: QuizState): boolean {
  return docDecided(S) && stateKey(S) === 'D';
}

/**
 * Should this screen be skipped for this state?
 *
 * The doctor route is the important one: `D` sees `rDoc` and nothing after
 * it — no offer, no price, no upsell. Everyone else skips `rDoc` and sees
 * the offer sequence. The two are mutually exclusive by construction.
 */
export function shouldSkip(S: QuizState, id: ScreenId): boolean {
  if (id === 's4b') return S.periods !== 'stopped';
  /* THE DOCTOR EXIT. docReason() is settled by s2 (age), s4 (periods) and,
     where she has stopped, s4b (why). The moment it is settled and the
     answer is D, she leaves: no further questions, no name, NO EMAIL GATE,
     and no reveal but rDoc. Taking an address from a woman we are about to
     refuse, in order to market to her later, was the bug this closes. */
  if (doctorExit(S) && EXIT_AT_S4B.includes(id)) return true;
  if (id === 's5') return S.periods === 'stopped';
  if (id === 'rDoc') return stateKey(S) !== 'D';
  if (id === 'r4' || id === 'r4b' || id === 'r5' || id === 'r6' || id === 'r7') {
    return stateKey(S) === 'D';
  }
  return false;
}

/** The next screen after `from`, skipping whatever this state skips. */
export function nextId(S: QuizState, from: ScreenId): ScreenId | undefined {
  let i = FLOW.indexOf(from) + 1;
  while (i < FLOW.length && shouldSkip(S, FLOW[i])) i++;
  return FLOW[i];
}

/** The previous screen before `from`, skipping whatever this state skips. */
export function prevId(S: QuizState, from: ScreenId): ScreenId | undefined {
  let i = FLOW.indexOf(from) - 1;
  while (i > 0 && shouldSkip(S, FLOW[i])) i--;
  return i >= 0 ? FLOW[i] : undefined;
}

/** Every screen this state will actually see, start to finish. */
export function path(S: QuizState): ScreenId[] {
  const out: ScreenId[] = [];
  let id: ScreenId | undefined = FLOW[0];
  while (id) {
    out.push(id);
    id = nextId(S, id);
  }
  return out;
}

/* ------------------------------------------------------- the two links --- */

/* The only two places this funnel may send anyone. The doctor route goes to
   the brand site. It must never link to the shop. */
export const SHOP_BASE = 'https://shop.jjsmithonline.com/products/hormonal-imbalance';
export const BRAND = 'https://www.jjsmithonline.com/';
