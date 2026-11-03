/* THE PRE-OFFER SCREENS SAY HER SYMPTOMS BACK, NOT A SAMPLE WOMAN'S.
 *
 * `cause` opens on what is behind her result and then names the things she is
 * living with. That sentence was written once, for a woman with weight, sleep
 * and mood, and shown to everybody: a woman who ticked hot flashes and
 * bloating read three complaints she had never made. David called it on
 * 30 October, against the result page, which has always read her own answers.
 *
 * So this file is about two things: that every symptom she can tick HAS a
 * phrase, and that the sentence is grammatical at every length she can
 * produce. She may tick one or all six.
 */
import { test, expect } from 'vitest';
import { TILES } from '../src/lib/logic';
import type { SymptomId } from '../src/lib/logic';
import {
  CAUSE_BODY_1_DEFAULT, CAUSE_BODY_BREAKDOWN, CAUSE_HEAD, CAUSE_IMG_ALT,
  CAUSE_IMG_CAP, CAUSE_SYMPTOM, MEET_LEAD, PLAN_STEP_1, causeBody, stageGroup,
} from '../src/lib/nurtureCopy';
import { SHOT_CAUSE } from '../src/lib/offer';
import { claimHits } from './claimRules';

const ALL = TILES.map(([id]) => id);

test('every symptom she can tick has a phrase, and no symptom is missing one', () => {
  /* Keyed off TILES rather than the type, so a seventh tile added to the quiz
     fails here rather than rendering "undefined" in the middle of a
     sentence. */
  for (const id of ALL) {
    expect(CAUSE_SYMPTOM[id], `${id} has no phrase`).toBeTruthy();
  }
  expect(Object.keys(CAUSE_SYMPTOM).sort()).toEqual([...ALL].sort());
});

test('the sentence is grammatical at one, two and three symptoms', () => {
  expect(causeBody(['sleep'])).toBe(
    'That extra estrogen is behind **the nights you lie awake**.',
  );
  expect(causeBody(['sleep', 'mood'])).toBe(
    'That extra estrogen is behind **the nights you lie awake** '
    + 'and **the moods that come from nowhere**.',
  );
  expect(causeBody(['weight', 'sleep', 'mood'])).toBe(
    'That extra estrogen is behind **the weight that will not budge**, '
    + '**the nights you lie awake**, and **the moods that come from nowhere**.',
  );
});

test('three at most, and the one she ranked first leads', () => {
  /* She can tick all six. "Behind A, B, C, D, E and F" is a list, not a
     sentence, and the three she cares about most are the ones she ranked. */
  const all = causeBody(ALL as SymptomId[]);
  expect(all.split('**').length - 1, 'six phrases would be twelve markers').toBe(6);
  expect(all.startsWith(`That extra estrogen is behind **${CAUSE_SYMPTOM[ALL[0]]}**`)).toBe(true);

  const hers = causeBody(['sweats', 'bloat']);
  expect(hers, 'her main concern comes first')
    .toBe('That extra estrogen is behind **the heat that hits without warning** '
      + 'and **the belly that will not settle**.');
});

test('a state with no symptoms still reads as a sentence', () => {
  /* Only a deep link into /quiz/whats-happening can do this, and it must not
     produce "That extra estrogen is behind ." */
  expect(causeBody([])).toBe(CAUSE_BODY_1_DEFAULT);
  expect(causeBody([])).toMatch(/\.$/);
});

test('no phrase, and no sentence built from them, makes a claim', () => {
  /* The phrases name the moment she notices something. None of them may read
     as the product acting on it: that is the line between "the nights you lie
     awake" and anything with a verb aimed at sleep. */
  for (const [id, phrase] of Object.entries(CAUSE_SYMPTOM)) {
    expect(claimHits(phrase), `${id}: ${phrase}`).toEqual([]);
  }
  /* And in the sentence, where the verb "is behind" joins them. */
  for (const ids of [['weight'], ['sleep', 'sweats'], ALL as SymptomId[]]) {
    expect(claimHits(causeBody(ids as SymptomId[])), ids.join('+')).toEqual([]);
  }
});

test('the markers are balanced, everywhere she can land', () => {
  /* Rich splits on ** and bolds the odd segments, so an unclosed pair would
     silently bold the rest of the paragraph. */
  for (const ids of [[], ['mood'], ['mood', 'energy'], ALL as SymptomId[]]) {
    const n = causeBody(ids as SymptomId[]).split('**').length - 1;
    expect(n % 2, `odd number of markers for [${ids.join(', ')}]`).toBe(0);
  }
});

/* ------------------------------------------ the two stages, 3 November -- */

test('the stage group is the one thing that decides which mechanism she reads', () => {
  /* C and E run on LESS estrogen. Telling a woman whose periods stopped years
     ago that her problem is "too much estrogen" is a page describing somebody
     else, so the mechanism splits on exactly those two outcomes. */
  expect(stageGroup('A')).toBe('clear');
  expect(stageGroup('B')).toBe('clear');
  expect(stageGroup('C')).toBe('breakdown');
  expect(stageGroup('E')).toBe('breakdown');
  /* D never reaches these screens, and anything unrecognised reads as the
     wording that was there before the split. */
  expect(stageGroup('D')).toBe('clear');
  expect(stageGroup('')).toBe('clear');
});

test('neither group is told the other group\'s mechanism', () => {
  /* The whole point: "clearing" belongs to the women who still make plenty,
     "breaking down" to the women who do not, and never the other way. */
  const clear = [CAUSE_HEAD.clear, CAUSE_IMG_CAP.clear, PLAN_STEP_1.clear, MEET_LEAD.clear]
    .join(' ').toLowerCase();
  const breakdown = [
    CAUSE_HEAD.breakdown, CAUSE_IMG_CAP.breakdown, PLAN_STEP_1.breakdown,
    MEET_LEAD.breakdown, CAUSE_BODY_BREAKDOWN,
  ].join(' ').toLowerCase();

  expect(clear, 'the clear group is told about clearing').toContain('clear');
  expect(breakdown, 'the breakdown group is told about breaking down')
    .toContain('break');
  expect(breakdown, 'the breakdown group must never be told it has extra estrogen')
    .not.toMatch(/too much estrogen|extra estrogen|clear the extra/);
});

test('the breakdown group is promised nothing', () => {
  /* She cannot turn the clock back, and no line of hers may suggest a symptom
     will settle. The clear group's second paragraph says exactly that, which
     is why she does not get it. */
  const hers = [
    CAUSE_HEAD.breakdown, CAUSE_IMG_CAP.breakdown, CAUSE_BODY_BREAKDOWN,
    PLAN_STEP_1.breakdown, MEET_LEAD.breakdown,
  ];
  for (const line of hers) {
    expect(claimHits(line), line).toEqual([]);
    expect(line, `"${line}" names a symptom`)
      .not.toMatch(/belly|weight|sleep|hot flash|sweat|mood|bloat|energy/i);
    expect(line, `"${line}" promises a change`)
      .not.toMatch(/settle|budge|better|improve|fix/i);
  }
});

test('every stage-split line has both halves', () => {
  /* A missing half would render "undefined" in a headline, which is the kind
     of thing that ships on a Friday. */
  for (const [name, rec] of [
    ['CAUSE_HEAD', CAUSE_HEAD], ['CAUSE_IMG_CAP', CAUSE_IMG_CAP],
    ['CAUSE_IMG_ALT', CAUSE_IMG_ALT], ['PLAN_STEP_1', PLAN_STEP_1],
    ['MEET_LEAD', MEET_LEAD],
  ] as [string, Record<string, string>][]) {
    for (const g of ['clear', 'breakdown']) {
      expect(rec[g], `${name}.${g} is missing`).toBeTruthy();
    }
    expect(Object.keys(rec).sort(), `${name} has an extra key`)
      .toEqual(['breakdown', 'clear']);
  }
});

test('each group gets the picture of its own mechanism', () => {
  /* An overflowing glass shown to a woman whose estrogen is low is a picture
     of the opposite of her problem. */
  expect(SHOT_CAUSE.clear).toBe('/img/nurture-estrogen.webp');
  expect(SHOT_CAUSE.breakdown).toBe('/img/nurture-estrogen-low.webp');
  expect(SHOT_CAUSE.clear).not.toBe(SHOT_CAUSE.breakdown);
  /* And the alt text describes the picture it is attached to. */
  expect(CAUSE_IMG_ALT.clear).toMatch(/overflow/i);
  expect(CAUSE_IMG_ALT.breakdown).toMatch(/third|drain/i);
});
