/* THE HORMONE CHECK — routing, with no user interface attached.
 *
 * REBUILT 2 OCTOBER 2026. The quiz went from eleven questions to seven. The
 * five outcomes are the ones it has always had; what changed is the set of
 * answers they are read from. Three old inputs (how regular, the cycle-marker
 * list, why her periods stopped) are now one cycle question and one
 * conditional follow-up.
 *
 * The specification is `docs/routing-table.md`. If the two ever disagree,
 * the table wins and this file is wrong. `tests/logic.test.ts` walks every
 * combination of answers that can change the outcome and holds this file to
 * the table.
 */

/* ---------------------------------------------------------------- types -- */

/** The ids are what Klaviyo stores as `age_band`, so they read as words. */
export type Age = 'under-40' | '40-44' | '45-49' | '50-54' | '55-59' | '60-plus';

/** "What has been happening with your cycle lately?" */
export type Cycle = 'same' | 'unpredictable' | 'skipping' | 'stopped' | 'masked' | 'unsure';

/** "Has it been at least 12 months?" Asked only when her periods have stopped. */
export type Twelve = 'yes' | 'no' | 'unsure' | 'medsurg';

/** "When do you notice these changes most?" Never changes the outcome. */
export type Pattern = 'monthly' | 'comego' | 'weekly' | 'daily' | 'untracked';

export type SymptomId = 'weight' | 'sleep' | 'energy' | 'sweats' | 'bloat' | 'mood';

/** 'nothing' is exclusive. */
export type TriedId = 'food' | 'gym' | 'sleep' | 'supps' | 'doctor' | 'wait' | 'nothing';

export type WantId = 'body' | 'sleep' | 'energy' | 'cool' | 'clear' | 'understand';

/** 'A' Imbalance · 'B' Perimenopause · 'C' Menopause · 'D' Doctor · 'E' Early menopause */
export type Outcome = 'A' | 'B' | 'C' | 'D' | 'E';
export type DocReason = 'young' | 'late' | '';

export interface QuizState {
  sym: SymptomId[];
  /** The one she says bothers her most. Asked only when she picked more than one. */
  main: SymptomId | '';
  age: Age | '';
  cycle: Cycle | '';
  /** Asked only when cycle is 'stopped'. */
  twelve: Twelve | '';
  pattern: Pattern | '';
  tried: TriedId[];
  want: WantId | '';
  name: string;
  email: string;
  /**
   * She came from JJ's own list, so the email screen is stepped over.
   *
   * Seeded once from the link when the quiz state is created. It lives on
   * the state rather than being read from storage inside shouldSkip, which
   * keeps that function pure and keeps the 560-combination routing test
   * honest: a value it does not set is a value that cannot change routing.
   */
  skipEmail: boolean;
  /** Ticked opt-in. No address is sent anywhere while this is false. */
  consent: boolean;
}

/** The complete shape. Every field, and what it may hold. */
export function createState(): QuizState {
  return {
    sym: [], main: '', age: '', cycle: '', twelve: '', pattern: '',
    tried: [], want: '',
    name: '', email: '', consent: false, skipEmail: false,
  };
}

/* ----------------------------------------------------------- the tables -- */

/* [id, label] — the order is the order she sees them. */
export const TILES: [SymptomId, string][] = [
  ['weight', 'Stubborn weight gain'],
  ['sleep', 'Poor sleep'],
  ['energy', 'Low energy'],
  ['sweats', 'Hot flashes or night sweats'],
  ['bloat', 'Bloating'],
  ['mood', 'Mood swings or brain fog'],
];

/* ------------------------------------------------------------ predicates -- */

export function has(S: QuizState, id: SymptomId): boolean {
  return S.sym.indexOf(id) > -1;
}

/**
 * The symptom her result leads with.
 *
 * Her own answer where she gave one and it is still ticked; otherwise the
 * first thing she picked, in the order the tiles are shown. It never changes
 * the outcome. It only decides what her result opens on.
 */
export function mainConcern(S: QuizState): SymptomId | '' {
  if (S.main && has(S, S.main)) return S.main;
  const first = TILES.filter(([id]) => has(S, id))[0];
  return first ? first[0] : '';
}

/** Everything else she ticked, in tile order. */
export function otherConcerns(S: QuizState): SymptomId[] {
  const main = mainConcern(S);
  return TILES.map(([id]) => id).filter((id) => has(S, id) && id !== main);
}

export function under40(S: QuizState): boolean {
  return S.age === 'under-40';
}

export function forties(S: QuizState): boolean {
  return S.age === '40-44' || S.age === '45-49';
}

export function fifties(S: QuizState): boolean {
  return S.age === '50-54' || S.age === '55-59';
}

/** Fifty or over. */
export function older(S: QuizState): boolean {
  return fifties(S) || S.age === '60-plus';
}

/**
 * How strongly her answers lean towards perimenopause.
 *
 * The same idea the eleven-question quiz scored, read from fewer answers:
 * hot flashes or night sweats (+2), a cycle that is less predictable (+2) or
 * skipping (+3), and her age (forties +1, fifty and over +2).
 */
export function periScore(S: QuizState): number {
  let n = 0;
  if (has(S, 'sweats')) n += 2;
  if (S.cycle === 'unpredictable') n += 2;
  if (S.cycle === 'skipping') n += 3;
  if (forties(S)) n += 1;
  if (older(S)) n += 2;
  return n;
}

/**
 * Something other than her stage is deciding what her cycle does: birth
 * control, medication or surgery. Her cycle cannot tell us anything, so she
 * is read on her age and what she is noticing, and the result says so.
 */
export function masked(S: QuizState): boolean {
  return S.cycle === 'masked' || (S.cycle === 'stopped' && S.twelve === 'medsurg');
}

/**
 * Why we would send her to a doctor instead of giving her a read.
 *
 * KEPT TO TWO CASES, on Jane's instruction of 2 October 2026 to keep the
 * doctor route as small as it can be. Both are things no supplement page
 * should talk over:
 *
 *  - 'young': her periods have stopped and she is under forty, with no birth
 *    control, medication or surgery to explain it.
 *  - 'late': she is sixty or over and still having periods that come and go.
 *
 * Everything else that used to be sent here (surgery, medication) is now read
 * on age and symptoms, with the talk-to-your-doctor line on the kit page.
 */
export function docReason(S: QuizState): DocReason {
  if (S.cycle === 'stopped' && S.twelve && S.twelve !== 'medsurg' && under40(S)) return 'young';
  if (S.age === '60-plus' && (S.cycle === 'unpredictable' || S.cycle === 'skipping')) return 'late';
  return '';
}

/* -------------------------------------------------------------- routing -- */

/** The one function this whole file exists for. */
export function stateKey(S: QuizState): Outcome {
  if (docReason(S)) return 'D';

  /* Birth control, medication or surgery: read on age and symptoms. */
  if (masked(S)) {
    if (older(S)) return 'C';
    if (forties(S)) return 'B';
    return periScore(S) >= 5 ? 'B' : 'A';
  }

  /* PERIODS STOPPED.
   *
   * FIFTY AND OVER IS MENOPAUSE, WHATEVER SHE SAYS ABOUT THE TWELVE MONTHS.
   * Jane, 8 October 2026, from the route table review. The rule used to read
   * the follow-up first, which made the answer inconsistent across one age
   * band: at 50 to 59, "not sure" gave menopause but "no" gave perimenopause.
   * A woman in her fifties whose periods have stopped was then told she was in
   * "the years before your periods stop", which is wrong to her whatever the
   * textbook says about twelve months.
   *
   * The forties are unchanged and still read the follow-up: twelve months or
   * more is menopause, or early menopause at 40 to 44; under twelve months or
   * not sure is perimenopause. Under forty left on the doctor route above, and
   * medication or surgery was read as `masked` above. */
  if (S.cycle === 'stopped') {
    if (older(S)) return 'C';
    if (S.twelve === 'yes') return S.age === '40-44' ? 'E' : 'C';
    return 'B';
  }

  /* She still has a cycle, or she is not sure what it is doing. */
  if (S.age === '60-plus') return 'C';
  if (fifties(S)) return 'B';
  if (forties(S)) return periScore(S) >= 3 ? 'B' : 'A';
  return periScore(S) >= 5 ? 'B' : 'A';
}

/* --------------------------------------------------------------- flow ---- */

export type ScreenId =
  | 'q1' | 'q2' | 'q3' | 'q4' | 'q4b' | 'q5' | 'q6' | 'q7'
  | 'load' | 'gate'
  | 'r1' | 'r2' | 'rDoc';

export const FLOW: ScreenId[] = [
  'q1', 'q2', 'q3', 'q4', 'q4b', 'q5', 'q6', 'q7',
  'load', 'gate',
  'r1', 'r2', 'rDoc',
];

/** The seven she is told about. */
export const QUESTION_TOTAL = 7;

/**
 * Where each question sits in "2 of 7".
 *
 * Fixed rather than counted from what she will be asked, so the total never
 * changes under her and the number never goes backwards. The follow-up shares
 * its parent's number; a skipped question is a step she simply does not see.
 */
export const QUESTION_NUMBER: Partial<Record<ScreenId, number>> = {
  q1: 1, q2: 2, q3: 3, q4: 4, q4b: 4, q5: 5, q6: 6, q7: 7,
};

/** The two result pages. */
export const REVEAL: ScreenId[] = ['r1', 'r2'];

/** Everything between the cycle questions and rDoc. A doctor-route state sees none of it. */
const AFTER_CYCLE: ScreenId[] = ['q5', 'q6', 'q7', 'load', 'gate', 'r1', 'r2'];

/**
 * Is docReason() settled yet? It needs her age and her cycle answer, and the
 * follow-up when her periods have stopped. Mid-quiz the state is half empty,
 * so this guards the exit from firing on an answer she has not given.
 */
export function docDecided(S: QuizState): boolean {
  if (!S.age || !S.cycle) return false;
  return S.cycle !== 'stopped' || Boolean(S.twelve);
}

/**
 * WHICH RESULTS ARE SHOWN THE KIT.
 *
 * Jane's decision of 2 October 2026: every result but the doctor route. It
 * replaces the rule of 22 September, which showed the kit to perimenopause
 * only. One line to change if the decision moves again.
 */
export const OFFER_OUTCOMES: Outcome[] = ['A', 'B', 'C', 'E'];

export function seesOffer(S: QuizState): boolean {
  return OFFER_OUTCOMES.includes(stateKey(S));
}

/** Settled, and the answer is the doctor. */
export function doctorExit(S: QuizState): boolean {
  return docDecided(S) && stateKey(S) === 'D';
}

/**
 * Should this screen be skipped for this state?
 *
 * The doctor route is the important one: `D` sees `rDoc` and nothing after
 * her cycle answer. No more questions, no name, NO EMAIL GATE, no result
 * page, no kit. Everyone else skips `rDoc`. The two are mutually exclusive by
 * construction.
 */
export function shouldSkip(S: QuizState, id: ScreenId): boolean {
  /* One symptom needs no ranking. */
  if (id === 'q2') return S.sym.length < 2;
  if (id === 'q4b') return S.cycle !== 'stopped';
  if (doctorExit(S) && AFTER_CYCLE.includes(id)) return true;
  if (id === 'rDoc') return stateKey(S) !== 'D';
  if (id === 'r2') return !seesOffer(S);
  /* THE EMAIL SCREEN, STEPPED OVER FOR A WOMAN ALREADY ON THE LIST. Last,
     so every refusal above it still wins: the doctor route still exits
     before the gate whether or not she arrived from an email. */
  if (id === 'gate') return S.skipEmail;
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
/**
 * The Shopify cart permalink: variant 41200079175791, quantity 1.
 *
 * `storefront=true` is what makes this the CART rather than the checkout.
 * Drop it and Shopify takes her straight to payment, skipping the cart page
 * — that is a different funnel and not the one we are running. shopUrl() in
 * analytics.ts re-asserts the flag rather than trusting this string, so an
 * edit here that loses it cannot quietly change the destination.
 */
export const SHOP_BASE =
  'https://shop.jjsmithonline.com/cart/41200079175791:1?storefront=true';
export const BRAND = 'https://www.jjsmithonline.com/';
