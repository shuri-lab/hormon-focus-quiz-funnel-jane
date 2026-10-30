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
  CAUSE_BODY_1_DEFAULT, CAUSE_SYMPTOM, causeBody,
} from '../src/lib/nurtureCopy';
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
