/* CONFORMANCE — does src/lib/logic.ts do what docs/routing-table.md says?
 *
 * The table is the specification; if the code and the table disagree, the
 * code is wrong.
 *
 * The quiz was rebuilt on 2 October 2026 from eleven questions to seven. The
 * five outcomes are unchanged, but they are read from different answers, so
 * the old equivalence test against reference/quiz.js no longer applies and is
 * gone. reference/quiz.js is history now, not a specification.
 */
import { test, expect } from 'vitest';

import {
  createState, stateKey, periScore, path, shouldSkip, mainConcern, otherConcerns, masked,
  docReason, seesOffer, OFFER_OUTCOMES, QUESTION_NUMBER, QUESTION_TOTAL,
  type QuizState, type Age, type Cycle, type Twelve, type ScreenId, type Outcome,
} from '../src/lib/logic';

/* ------------------------------------------------------ the input space -- */

const AGES: Age[] = ['under-40', '40-44', '45-49', '50-54', '55-59', '60-plus'];
const CYCLES: Cycle[] = ['same', 'unpredictable', 'skipping', 'stopped', 'masked', 'unsure'];
const TWELVES: Twelve[] = ['yes', 'no', 'unsure', 'medsurg'];

const FORTIES: Age[] = ['40-44', '45-49'];
const FIFTIES: Age[] = ['50-54', '55-59'];
const FIFTY_PLUS: Age[] = ['50-54', '55-59', '60-plus'];

function make(over: Partial<QuizState>): QuizState {
  return { ...createState(), sym: ['sleep'], ...over };
}

/** Every combination of answers that can change the outcome. */
function* combinations(): Generator<QuizState> {
  for (const age of AGES) {
    for (const cycle of CYCLES) {
      /* The follow-up is only asked when her periods have stopped. */
      const twelves = cycle === 'stopped' ? TWELVES : ([''] as const);
      for (const twelve of twelves) {
        for (const sweats of [false, true]) {
          yield make({ age, cycle, twelve, sym: sweats ? ['sweats', 'sleep'] : ['sleep'] });
        }
      }
    }
  }
}

function label(S: QuizState) {
  return `age=${S.age} cycle=${S.cycle} twelve=${S.twelve || '-'} sweats=${S.sym.includes('sweats')}`;
}

/* --------------------------------- 1. conformance with the routing table -- */

test('D: periods stopped under forty, with nothing else to explain it', () => {
  for (const twelve of ['yes', 'no', 'unsure'] as Twelve[]) {
    const S = make({ age: 'under-40', cycle: 'stopped', twelve });
    expect(docReason(S), twelve).toBe('young');
    expect(stateKey(S), twelve).toBe('D');
  }
});

test('D: periods still coming and going at sixty or over', () => {
  for (const cycle of ['unpredictable', 'skipping'] as Cycle[]) {
    const S = make({ age: '60-plus', cycle });
    expect(docReason(S), cycle).toBe('late');
    expect(stateKey(S), cycle).toBe('D');
  }
});

test('the doctor route is those two cases and nothing else', () => {
  /* Jane, 2 October 2026: keep the doctor route as small as it can be. If a
     third case is ever added, it is added here on purpose. */
  let doctors = 0;
  for (const S of combinations()) {
    const young = S.age === 'under-40' && S.cycle === 'stopped' && S.twelve !== 'medsurg';
    const late = S.age === '60-plus' && (S.cycle === 'unpredictable' || S.cycle === 'skipping');
    expect(stateKey(S) === 'D', label(S)).toBe(young || late);
    if (stateKey(S) === 'D') doctors++;
  }
  expect(doctors).toBe(10);
});

test('medication or surgery is read on age, not sent to a doctor', () => {
  for (const age of AGES) {
    for (const S of [
      make({ age, cycle: 'masked' }),
      make({ age, cycle: 'stopped', twelve: 'medsurg' }),
    ]) {
      expect(masked(S), label(S)).toBe(true);
      expect(stateKey(S), label(S)).not.toBe('D');
      const want: Outcome = FIFTY_PLUS.includes(age) ? 'C' : FORTIES.includes(age) ? 'B' : 'A';
      expect(stateKey(S), label(S)).toBe(want);
    }
  }
});

test('C: periods stopped for twelve months, at 45 or over', () => {
  for (const age of ['45-49', '50-54', '55-59', '60-plus'] as Age[]) {
    expect(stateKey(make({ age, cycle: 'stopped', twelve: 'yes' })), age).toBe('C');
  }
});

test('E: periods stopped for twelve months before 45', () => {
  expect(stateKey(make({ age: '40-44', cycle: 'stopped', twelve: 'yes' }))).toBe('E');
  /* And it is the only way to reach E. */
  for (const S of combinations()) {
    if (stateKey(S) !== 'E') continue;
    expect(label(S)).toContain('age=40-44 cycle=stopped twelve=yes');
  }
});

test('periods stopped for under twelve months is perimenopause, until sixty', () => {
  for (const age of [...FORTIES, ...FIFTIES]) {
    expect(stateKey(make({ age, cycle: 'stopped', twelve: 'no' })), age).toBe('B');
  }
  expect(stateKey(make({ age: '60-plus', cycle: 'stopped', twelve: 'no' }))).toBe('C');
});

test('stopped, and not sure how long: read on age', () => {
  for (const age of FORTIES) {
    expect(stateKey(make({ age, cycle: 'stopped', twelve: 'unsure' })), age).toBe('B');
  }
  for (const age of FIFTY_PLUS) {
    expect(stateKey(make({ age, cycle: 'stopped', twelve: 'unsure' })), age).toBe('C');
  }
});

test('still cycling in her forties: the threshold is periScore 3', () => {
  for (const age of FORTIES) {
    const quiet = make({ age, cycle: 'same' });                 // 1, from age
    expect(periScore(quiet)).toBe(1);
    expect(stateKey(quiet), age).toBe('A');

    const flashes = make({ age, cycle: 'same', sym: ['sweats'] });   // 1 + 2
    expect(periScore(flashes)).toBe(3);
    expect(stateKey(flashes), age).toBe('B');

    expect(stateKey(make({ age, cycle: 'unpredictable' })), age).toBe('B');   // 1 + 2
    expect(stateKey(make({ age, cycle: 'skipping' })), age).toBe('B');        // 1 + 3
    expect(stateKey(make({ age, cycle: 'unsure' })), age).toBe('A');
  }
});

test('still cycling in her fifties is perimenopause', () => {
  for (const age of FIFTIES) {
    for (const cycle of ['same', 'unpredictable', 'skipping', 'unsure'] as Cycle[]) {
      expect(stateKey(make({ age, cycle })), `${age}/${cycle}`).toBe('B');
    }
  }
});

test('sixty or over, cycle "the same" or "not sure": read as menopause, not sent to a doctor', () => {
  /* "About the same as usual" from a woman of 62 most likely means nothing
     has changed since her periods stopped. It is not evidence of bleeding. */
  for (const cycle of ['same', 'unsure'] as Cycle[]) {
    expect(stateKey(make({ age: '60-plus', cycle })), cycle).toBe('C');
  }
});

test('under forty reaches perimenopause only on a heavy load', () => {
  expect(stateKey(make({ age: 'under-40', cycle: 'same' }))).toBe('A');
  expect(stateKey(make({ age: 'under-40', cycle: 'skipping' }))).toBe('A');                    // 3
  expect(stateKey(make({ age: 'under-40', cycle: 'unpredictable', sym: ['sweats'] }))).toBe('A'); // 4
  expect(stateKey(make({ age: 'under-40', cycle: 'skipping', sym: ['sweats'] }))).toBe('B');   // 5
});

test('the whole input space lands on the expected outcome spread', () => {
  const count: Record<Outcome, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let total = 0;
  for (const S of combinations()) {
    count[stateKey(S)]++;
    total++;
  }
  /* 108 states, and where each of them lands. If a branch is reordered, a
     comparison flipped or a threshold moved, the split moves with it and this
     fails even when every named case above still passes. */
  expect(total, 'the input space itself changed size').toBe(108);
  expect(count).toEqual({ A: 15, B: 49, C: 32, D: 10, E: 2 });
});

/* -------------------------------------- 2. the doctor route is an exit --- */

test('the doctor route stops at the cycle question and never reaches the email gate', () => {
  let seenD = 0;
  for (const S of combinations()) {
    if (stateKey(S) !== 'D') continue;
    seenD++;
    const seen = path(S);
    expect(seen[seen.length - 1], label(S)).toBe('rDoc');
    for (const id of ['q5', 'q6', 'q7', 'load', 'gate', 'r1', 'r2'] as ScreenId[]) {
      expect(seen, `D must never see ${id}: ${label(S)}`).not.toContain(id);
    }
  }
  expect(seenD).toBe(10);
});

test('everyone else sees her result and then the kit, and never the doctor screen', () => {
  for (const S of combinations()) {
    if (stateKey(S) === 'D') continue;
    const seen = path(S);
    expect(seen, label(S)).not.toContain('rDoc');
    expect(seen, label(S)).toContain('gate');
    expect(seen, label(S)).toContain('r1');
    expect(seesOffer(S), label(S)).toBe(true);
    expect(seen[seen.length - 1], label(S)).toBe('r2');
    expect(new Set(seen).size, 'no screen repeats: ' + label(S)).toBe(seen.length);
  }
});

test('every result but the doctor route is shown the kit', () => {
  /* Jane's decision of 2 October 2026. Change OFFER_OUTCOMES and this test
     together, on purpose, or not at all. */
  expect(OFFER_OUTCOMES).toEqual(['A', 'B', 'C', 'E']);
});

test('the twelve-month question is asked only when her periods have stopped', () => {
  for (const S of combinations()) {
    expect(path(S).includes('q4b'), label(S)).toBe(S.cycle === 'stopped');
  }
});

test('the doctor exit waits for the follow-up before it fires', () => {
  /* Under forty and stopped is only a doctor case once we know medication or
     surgery is not the reason. Until she answers, she is still in the quiz. */
  const S = make({ age: 'under-40', cycle: 'stopped', twelve: '' });
  expect(shouldSkip(S, 'q4b')).toBe(false);
  expect(docReason(S)).toBe('');
});

test('shouldSkip and path agree', () => {
  for (const S of combinations()) {
    const seen = new Set(path(S));
    for (const id of ['q4b', 'q5', 'gate', 'r1', 'r2', 'rDoc'] as ScreenId[]) {
      expect(seen.has(id), id + ': ' + label(S)).toBe(!shouldSkip(S, id));
    }
  }
});

/* ---------------------------------------------- 3. the seven questions --- */

test('seven questions, numbered so the count never goes backwards', () => {
  expect(QUESTION_TOTAL).toBe(7);
  const order: ScreenId[] = ['q1', 'q2', 'q3', 'q4', 'q4b', 'q5', 'q6', 'q7'];
  const numbers = order.map((id) => QUESTION_NUMBER[id] as number);
  expect(numbers).toEqual([1, 2, 3, 4, 4, 5, 6, 7]);
  /* The loader, the gate and the result pages are not questions. */
  for (const id of ['load', 'gate', 'r1', 'r2', 'rDoc'] as ScreenId[]) {
    expect(QUESTION_NUMBER[id], id).toBeUndefined();
  }
});

test('she is asked what bothers her most only when there is something to rank', () => {
  const one = { ...createState(), sym: ['sleep'] } as QuizState;
  const two = { ...createState(), sym: ['weight', 'sleep'] } as QuizState;
  expect(shouldSkip(one, 'q2')).toBe(true);
  expect(shouldSkip(two, 'q2')).toBe(false);
});

test('her result leads with her own answer, and falls back to the first tile she picked', () => {
  const S = { ...createState(), sym: ['sleep', 'weight', 'energy'] } as QuizState;
  /* No answer given: tile order decides, and weight is the first tile. */
  expect(mainConcern(S)).toBe('weight');
  expect(mainConcern({ ...S, main: 'sleep' })).toBe('sleep');
  expect(otherConcerns({ ...S, main: 'sleep' })).toEqual(['weight', 'energy']);
  /* An answer she has since unticked does not survive. */
  expect(mainConcern({ ...S, sym: ['weight'], main: 'sleep' })).toBe('weight');
  expect(mainConcern(createState())).toBe('');
});

test('the pattern, what she tried and what she wants never change her result', () => {
  for (const S of combinations()) {
    const base = stateKey(S);
    expect(stateKey({ ...S, pattern: 'untracked' }), label(S)).toBe(base);
    expect(stateKey({ ...S, pattern: 'daily', tried: ['supps', 'doctor'], want: 'cool' }), label(S)).toBe(base);
    expect(stateKey({ ...S, main: 'sleep' }), label(S)).toBe(base);
  }
});
