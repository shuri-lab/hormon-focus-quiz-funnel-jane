/* THE COPY GATE.
 *
 * Hormone Focus is a dietary supplement. It may describe how it supports the
 * normal structure and function of the body, and it may quote what customers
 * say. It may not claim to treat, cure or prevent anything, and the brand's
 * own voice may not promise a result, a timeframe or a number.
 *
 * Those rules are easy to agree with and easy to break at four in the
 * afternoon with a deadline. This file is what stops a broken one shipping:
 * it reads the authored copy and fails the build.
 *
 * WHAT IT READS
 *  - src/lib/offer.ts       the prices and the option rows
 *  - src/lib/angles.ts      every route's headline, and its offer block
 *  - src/lib/offerCopy.ts   every other word the offer pages say
 *
 * WHAT IT DELIBERATELY DOES NOT READ
 *  - src/lib/reviews.ts. Those are customers' words, quoted verbatim. They
 *    use contractions and they say things the brand may not say, which is the
 *    whole reason they live in a file of their own. A separate test below
 *    checks that they are attributed and marked, which is what the rules
 *    actually require of a quote.
 */
import { test, expect } from 'vitest';
import { ANGLES } from '../src/lib/angles';
import { WALL } from '../src/lib/reviews';
import { FDA_DISCLAIMER } from '../src/lib/content';
import * as offer from '../src/lib/offer';
import * as copy from '../src/lib/offerCopy';

/* ------------------------------------------------- collecting the copy -- */

/** Every string reachable from a module's exports, with a path to find it by. */
function strings(value: unknown, path: string, out: [string, string][] = [], seen = new Set<unknown>()): [string, string][] {
  if (typeof value === 'string') {
    out.push([path, value]);
    return out;
  }
  if (typeof value === 'function' || value === null || typeof value !== 'object') return out;
  if (seen.has(value)) return out;
  seen.add(value);
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    strings(v, `${path}.${k}`, out, seen);
  }
  return out;
}

const AUTHORED: [string, string][] = [
  ...strings(offer, 'offer.ts'),
  ...strings(ANGLES, 'angles.ts'),
  ...strings(copy, 'offerCopy.ts'),
];

test('there is authored copy to check, so a broken import cannot pass silently', () => {
  expect(AUTHORED.length).toBeGreaterThan(80);
});

/* -------------------------------------------------------- contractions -- */

/* House style since 1 September 2026: no contractions in authored copy.
   A possessive is not a contraction, so JJ's programs and a customer's own
   words both pass; it's, don't and you're do not. Both apostrophes are
   matched, because a smart quote is still a contraction. */
const CONTRACTIONS = [
  /\b\w+n['’]t\b/i,
  /\b(it|that|there|here|what|who|how|where|when|this|let)['’](s|re|ve|ll|d|m)\b/i,
  /\b(i|you|we|they|he|she|who|would|could|should|might|must|do|does|did|is|are|was|were|has|have|had|will|can)['’](s|re|ve|ll|d|m|t)\b/i,
];

test('no authored string uses a contraction', () => {
  for (const [where, value] of AUTHORED) {
    for (const pattern of CONTRACTIONS) {
      expect(
        pattern.test(value),
        `${where} uses a contraction, and the house style has none: ${JSON.stringify(value)}`,
      ).toBe(false);
    }
  }
});

/* -------------------------------------------------------- banned words -- */

/**
 * Signed-off copy that predates this gate.
 *
 * One string, Jane's headline for the weight route, states the difficulty a
 * woman is already living rather than promising her a result — but it is
 * shaped exactly like the promise the gate exists to catch, and no regular
 * expression can tell the two apart. It is listed here in full, so changing a
 * single character of it puts it back under the gate.
 */
const SIGNED_OFF = new Set([
  'Why losing weight after 40 feels',
]);

/**
 * Words the brand never says, in any context.
 *
 * 'Clinically proven' needs a study on this formula and there is none.
 * 'Natural HRT' and 'alternative to HRT' compare a supplement to a drug.
 * 'Balances your hormones' states as fact what may only be supported.
 * Cure, melt and burn have no innocent use in this category.
 */
const NEVER: [RegExp, string][] = [
  [/\bcure[sd]?\b/i, 'cure is a treatment claim'],
  [/\bproven\b/i, 'proven needs a study on this formula'],
  [/\bmelts?\b|\bmelting\b/i, 'melts fat is a forbidden weight claim'],
  [/\bburns?\b|\bburning\b/i, 'burns fat is a forbidden weight claim'],
  [/natural\s+HRT|alternative\s+to\s+HRT|instead\s+of\s+HRT|better\s+than\s+HRT/i,
    'the brand never compares itself to a drug'],
  [/balances?\s+your\s+hormones/i, 'hormone balance is supported, never stated as fact'],
  [/clinically\s+(proven|tested|shown)/i, 'no study on this formula exists'],
  [/\bguarantee[sd]?\s+results\b|\bguaranteed\s+to\b/i, 'no result is guaranteed'],
  [/\blose\s+\d|\b\d+\s*(lbs|pounds)\s+(in|off)\b/i, 'a quantified weight outcome'],
];

/**
 * Words that are only forbidden when they are aimed at a symptom.
 *
 * This is the distinction the claims list actually draws. 'Stops hot flashes'
 * is a treatment claim; 'a body that stopped listening' is a woman describing
 * her life, and JJ's own approved hero says it. So the gate fires when one of
 * these verbs is pointed at one of these nouns inside the same sentence, and
 * stays quiet otherwise.
 */
const CLAIM_VERB = 'fix\\w*|end|ends|ended|ending|stop|stops|stopped|stopping'
  + '|eliminat\\w*|revers\\w*|treat|treats|treated|heals?|healed|healing'
  + '|los(?:e|es|ing)|shed|sheds|shedding';

const SYMPTOM = 'hot flash\\w*|night sweat\\w*|flashes|sweats|bloating|insomnia'
  + '|menopause|perimenopause|hormone\\w*|imbalance\\w*|anxiety|depression'
  + '|weight|belly fat|fat|pounds|lbs|symptom\\w*|cravings|mood swings|brain fog';

/* Same sentence, verb first, object within a short reach of it. */
const AIMED_AT_A_SYMPTOM = new RegExp(
  `\\b(${CLAIM_VERB})\\b[^.?!]{0,40}?\\b(${SYMPTOM})\\b`, 'i',
);

/**
 * The FDA disclaimer is prescribed wording, and the prescribed wording is the
 * one sentence on the page that has to contain 'treat, cure, or prevent'. It
 * is removed before the gate reads a string rather than exempting the whole
 * string, so anything wrapped around it is still checked.
 */
const withoutDisclaimer = (s: string) => s.split(FDA_DISCLAIMER).join(' ');

test('no authored string makes a claim the brand may not make', () => {
  for (const [where, raw] of AUTHORED) {
    if (SIGNED_OFF.has(raw)) continue;
    const value = withoutDisclaimer(raw);

    for (const [pattern, why] of NEVER) {
      expect(
        pattern.test(value),
        `${where}: ${why} — ${JSON.stringify(raw)}`,
      ).toBe(false);
    }

    const aimed = AIMED_AT_A_SYMPTOM.exec(value);
    expect(
      aimed,
      `${where}: "${aimed?.[0]}" reads as a treatment claim. Supports, helps ease `
      + `or helps with, or quote a customer saying it — ${JSON.stringify(raw)}`,
    ).toBe(null);
  }
});

/**
 * A gate that has quietly stopped firing is worse than no gate, because
 * everybody believes it. These are the strings it exists to catch and the
 * ones it must leave alone — the second list is the harder half, and every
 * line in it is copy that is actually on the pages.
 */
test('the gate fires on the claims it exists to catch', () => {
  const forbidden = [
    'Stops hot flashes.',
    'Ends night sweats for good.',
    'Fix your hormones in 30 days.',
    'Hormone Focus ends the bloating.',
    'It reverses hormone imbalance.',
    'Lose weight after 40.',
    'Treats menopause symptoms.',
  ];
  for (const s of forbidden) {
    expect(AIMED_AT_A_SYMPTOM.test(s), `the gate let this through: ${s}`).toBe(true);
  }

  const allowed = [
    'a body that stopped listening',
    'once your body stops fighting you',
    'supports a healthy weight as part of a healthy diet and regular exercise',
    'the stage where the old rules stopped working',
    'Helps ease occasional hot flashes',
    'Hot flashes can start years before your periods stop.',
  ];
  for (const s of allowed) {
    expect(AIMED_AT_A_SYMPTOM.test(s), `the gate is too blunt and caught: ${s}`).toBe(false);
  }
});

test('the never-list fires, and a possessive is not a contraction', () => {
  expect(NEVER.some(([p]) => p.test('clinically proven formula'))).toBe(true);
  expect(NEVER.some(([p]) => p.test('a natural HRT'))).toBe(true);
  expect(NEVER.some(([p]) => p.test('it balances your hormones'))).toBe(true);
  expect(NEVER.some(([p]) => p.test('melts belly fat'))).toBe(true);

  expect(CONTRACTIONS.some((p) => p.test('it is not, and you do not'))).toBe(false);
  expect(CONTRACTIONS.some((p) => p.test("800K+ women in JJ's programs"))).toBe(false);
  expect(CONTRACTIONS.some((p) => p.test("the body’s clearing of used hormones"))).toBe(false);
  expect(CONTRACTIONS.some((p) => p.test("you don't"))).toBe(true);
  expect(CONTRACTIONS.some((p) => p.test("it's free"))).toBe(true);
  expect(CONTRACTIONS.some((p) => p.test("you’re done"))).toBe(true);
});

/* ------------------------------------------- the two numbers, unmerged -- */

test('800,000 appears only in its scoped form, and never as a customer count', () => {
  for (const [where, value] of AUTHORED) {
    if (!/800/.test(value)) continue;
    expect(
      value.includes("800K+ women in JJ's programs"),
      `${where} carries the 800,000 figure in a form that is not the approved one: ${JSON.stringify(value)}`,
    ).toBe(true);
  }
});

test('the review count travels with the rating and nowhere else', () => {
  for (const [where, value] of AUTHORED) {
    expect(
      /\b1(69|70)\s+(verified\s+)?reviews?\b/i.test(value) && !/4\.9/.test(value),
      `${where} names the review count away from the 4.9: ${JSON.stringify(value)}`,
    ).toBe(false);
  }
});

/* ---------------------------------------------------- quotes stay quotes -- */

test('every review on the wall is attributed, and marked where it was cut', () => {
  expect(WALL.length, 'the wall is a wall, not a handful').toBeGreaterThanOrEqual(8);

  for (const r of WALL) {
    expect(r.name.trim().length, 'a review with no name is not attributable').toBeGreaterThan(0);
    expect(r.body.trim().length).toBeGreaterThan(20);

    /* A cut is marked with an ellipsis at the edge it was cut from. A quote
       must never be stitched together across one. */
    const inner = r.body.slice(1, -1);
    expect(
      inner.includes('…'),
      `${r.name}: an ellipsis inside a quote means two pieces were joined. Quote one contiguous span.`,
    ).toBe(false);
  }
});

test('no review has been tidied into the house style', () => {
  /* If every review reads like us, somebody has rewritten them. At least one
     contraction across the wall is the cheap proof that they are theirs. */
  const anyContraction = WALL.some((r) => CONTRACTIONS.some((p) => p.test(r.body)));
  expect(anyContraction, 'the reviews read as authored copy rather than as quotes').toBe(true);
});
