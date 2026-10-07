/* THE CLAIM RULES, SHARED.
 *
 * These were written inside `tests/copy.test.ts` on 2 October 2026 and moved
 * here on 7 October so a second test file can hold a single string to the same
 * gate without restating the patterns. NOTHING about them changed in the move:
 * every pattern below was spliced out of that file byte for byte, and
 * `copy.test.ts` still reads every authored string through them.
 *
 * Hormone Focus is a dietary supplement. It may describe how it supports the
 * normal structure and function of the body, and it may quote what customers
 * say. It may not claim to treat, cure or prevent anything, and the brand's
 * own voice may not promise a result, a timeframe or a number.
 */
import { FDA_DISCLAIMER } from '../src/lib/content';

/* ------------------------------------------------- collecting the copy -- */

/** Every string reachable from a module's exports, with a path to find it by. */
export function strings(value: unknown, path: string, out: [string, string][] = [], seen = new Set<unknown>()): [string, string][] {
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

/* -------------------------------------------------------- banned words -- */

/**
 * Words the brand never says, in any context.
 *
 * 'Clinically proven' needs a study on this formula and there is none.
 * 'Natural HRT' and 'alternative to HRT' compare a supplement to a drug.
 * 'Balances your hormones' states as fact what may only be supported.
 * Cure, melt and burn have no innocent use in this category.
 */
export const NEVER: [RegExp, string][] = [
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

/* Verb first, object within a short reach of it, and NO clause boundary in
   between. A treatment claim puts the symptom straight after the verb —
   "stops hot flashes", "fix your hormones". Reaching across a comma is how a
   gate catches "your periods stop, when your hormones stop keeping time",
   which is a woman's stage being described and not a promise about a pill. */
export const AIMED_AT_A_SYMPTOM = new RegExp(
  `\\b(${CLAIM_VERB})\\b[^.?!,;:]{0,24}?\\b(${SYMPTOM})\\b`, 'i',
);

/**
 * The FDA disclaimer is prescribed wording, and the prescribed wording is the
 * one sentence on the page that has to contain 'treat, cure, or prevent'. It
 * is removed before the gate reads a string rather than exempting the whole
 * string, so anything wrapped around it is still checked.
 */
export const withoutDisclaimer = (s: string) => s.split(FDA_DISCLAIMER).join(' ');

/** Every reason this string may not ship. Empty means it passes the claim gate. */
export function claimHits(raw: string): string[] {
  const value = withoutDisclaimer(raw);
  const out: string[] = [];
  for (const [pattern, why] of NEVER) {
    if (pattern.test(value)) out.push(why);
  }
  const aimed = AIMED_AT_A_SYMPTOM.exec(value);
  if (aimed) out.push(`"${aimed[0]}" reads as a treatment claim`);
  return out;
}
