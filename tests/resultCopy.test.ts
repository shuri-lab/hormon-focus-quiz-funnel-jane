/* THE RESULTS UPDATE, 6 OCTOBER 2026.
 *
 * `src/lib/resultCopy.ts` holds Jane's words as data. These tests hold the
 * SELECTION: which of those words each woman is shown, and how many. The copy
 * gate in `tests/copy.test.ts` already checks what the strings may say.
 *
 * The rules being held here come from the handover:
 *  - three cards, de-duplicated, never more than three
 *  - an acknowledgement appears only with the matching `tried` answer
 *  - means-C is what C and E both read
 *  - D never reaches r1 or r2, which logic.test.ts already holds green
 */
import { test, expect } from 'vitest';
import { createState, path, stateKey } from '../src/lib/logic';
import type { QuizState, SymptomId, TriedId, WantId } from '../src/lib/logic';
import {
  ACK, CLOSE, EARLY_DOCTOR_LINE, HEAD, MEANS, PAT, PRI, STAGE_LINE, SYM, SYM_SLEEP,
  WANT_CARD, cardAcks, meansFor, symExtra, threeCards, underCardAcks,
} from '../src/lib/resultCopy';
import { RESULT } from '../src/lib/content';
import { claimHits } from './claimRules';

const SYMPTOMS: SymptomId[] = ['weight', 'sleep', 'energy', 'sweats', 'bloat', 'mood'];
const WANTS: WantId[] = ['body', 'sleep', 'energy', 'cool', 'clear', 'understand'];

function state(over: Partial<QuizState> = {}): QuizState {
  return { ...createState(), ...over };
}

/* ------------------------------------------------------- the three cards -- */

test('the three cards never exceed three, whatever she ticked', () => {
  const S = state({ sym: [...SYMPTOMS], main: 'mood', want: 'understand' });
  expect(threeCards(S).length).toBe(3);
});

test('the three cards never repeat one', () => {
  for (const want of WANTS) {
    for (const main of SYMPTOMS) {
      const S = state({ sym: [...SYMPTOMS], main, want });
      const cards = threeCards(S);
      expect(new Set(cards).size, `repeat with main=${main} want=${want}`).toBe(cards.length);
    }
  }
});

test('the card she says bothers her most comes first', () => {
  for (const main of SYMPTOMS) {
    const S = state({ sym: [...SYMPTOMS], main });
    expect(threeCards(S)[0], `main=${main}`).toBe(main);
  }
});

test('what she wants most fills a place only when she ticked fewer than three', () => {
  /* One symptom, so the want has room. */
  const one = state({ sym: ['weight'], main: 'weight', want: 'understand' });
  expect(threeCards(one)).toEqual(['weight', 'track']);

  /* Three symptoms, so it does not. */
  const three = state({ sym: ['weight', 'sleep', 'energy'], main: 'weight', want: 'understand' });
  expect(threeCards(three)).toEqual(['weight', 'sleep', 'energy']);
  expect(threeCards(three)).not.toContain('track');
});

test('the want never duplicates a symptom she already ticked', () => {
  const S = state({ sym: ['weight', 'sleep'], main: 'weight', want: 'body' });
  const cards = threeCards(S);
  expect(new Set(cards).size).toBe(cards.length);
  expect(cards.filter((c) => c === 'weight').length).toBe(1);
});

test('every card id that can be chosen has copy behind it', () => {
  for (const want of WANTS) {
    for (const main of SYMPTOMS) {
      const S = state({ sym: [main], main, want });
      for (const id of threeCards(S)) {
        expect(PRI[id], `no copy for card ${id}`).toBeTruthy();
        expect(PRI[id].title.length).toBeGreaterThan(0);
        expect(PRI[id].body.length).toBeGreaterThan(0);
        /* The brief asks for a title of six words or fewer. */
        expect(PRI[id].title.trim().split(/\s+/).length, `${id} title too long`)
          .toBeLessThanOrEqual(6);
      }
    }
  }
});

test('every want maps to a card that exists', () => {
  for (const want of WANTS) expect(PRI[WANT_CARD[want]]).toBeTruthy();
});

/* ------------------------------------------------- the acknowledgements -- */

test('an acknowledgement appears only with the matching tried answer', () => {
  const sym: SymptomId[] = ['weight', 'sleep', 'energy'];

  const none = cardAcks(state({ sym, main: 'weight' }), ['weight', 'sleep', 'energy']);
  expect(Object.keys(none)).toEqual([]);

  const food = cardAcks(state({ sym, main: 'weight', tried: ['food'] }), ['weight', 'sleep', 'energy']);
  expect(food.weight).toBe(ACK.food);
  expect(food.sleep).toBeUndefined();
});

test('the sleep acknowledgement falls back from the sleep card to the sweats card', () => {
  const onSleep = cardAcks(state({ tried: ['sleep'] }), ['sleep', 'weight', 'mood']);
  expect(onSleep.sleep).toBe(ACK.sleep);

  const onSweats = cardAcks(state({ tried: ['sleep'] }), ['sweats', 'weight', 'mood']);
  expect(onSweats.sweats).toBe(ACK.sleep);

  /* Neither card is showing, so the line does not appear at all. */
  const neither = cardAcks(state({ tried: ['sleep'] }), ['weight', 'mood', 'bloat']);
  expect(Object.keys(neither)).toEqual([]);
});

test('the gym acknowledgement falls back from the energy card to the weight card', () => {
  const onEnergy = cardAcks(state({ tried: ['gym'] }), ['energy', 'bloat', 'mood']);
  expect(onEnergy.energy).toBe(ACK.gym);

  const onWeight = cardAcks(state({ tried: ['gym'] }), ['weight', 'bloat', 'mood']);
  expect(onWeight.weight).toBe(ACK.gym);
});

test('food keeps the weight card when she ticked food and gym together', () => {
  const both = cardAcks(state({ tried: ['food', 'gym'] }), ['weight', 'bloat', 'mood']);
  expect(both.weight, 'food owns the weight card, gym does not overwrite it').toBe(ACK.food);
});

test('supplements and the doctor sit under the cards, not inside one', () => {
  expect(underCardAcks(state({ tried: ['supps'] }))).toEqual([ACK.supps]);
  expect(underCardAcks(state({ tried: ['doctor'] }))).toEqual([ACK.doctor]);
  expect(underCardAcks(state({ tried: ['supps', 'doctor'] }))).toEqual([ACK.supps, ACK.doctor]);
});

test('waiting and doing nothing say nothing at all', () => {
  for (const t of ['wait', 'nothing'] as TriedId[]) {
    expect(underCardAcks(state({ tried: [t] }))).toEqual([]);
    expect(Object.keys(cardAcks(state({ tried: [t] }), ['weight', 'sleep', 'energy']))).toEqual([]);
  }
});

/* --------------------------------------------------- what this means ----- */

test('means-C is what C and E both read', () => {
  expect(meansFor('C')).toBe(MEANS.C);
  expect(meansFor('E'), 'early menopause reads the periods-stopped block').toBe(MEANS.C);
  expect(meansFor('A')).toBe(MEANS.A);
  expect(meansFor('B')).toBe(MEANS.B);
});

test('every outcome that reaches r1 has a block, and none is empty', () => {
  for (const outcome of ['A', 'B', 'C', 'E'] as const) {
    const block = meansFor(outcome);
    expect(block.length, `${outcome} has no paragraphs`).toBeGreaterThan(0);
    for (const para of block) expect(para.trim().length).toBeGreaterThan(0);
  }
});

/* --------------------------------------------- the per-symptom closers --- */

test('every symptom has a closing line, a heading and a paragraph', () => {
  for (const id of SYMPTOMS) {
    expect(CLOSE[id], `close-${id}`).toBeTruthy();
    expect(HEAD[id], `head-${id}`).toBeTruthy();
    expect(SYM[id], `sym-${id}`).toBeTruthy();
  }
});

test('every pattern she can answer has a line', () => {
  for (const p of ['monthly', 'comego', 'weekly', 'daily', 'untracked'] as const) {
    expect(PAT[p], `pat-${p}`).toBeTruthy();
  }
});

test('the extra sleep sentence appears only for sweats, energy and mood', () => {
  for (const main of SYMPTOMS) {
    const withSleep = state({ sym: [main, 'sleep'], main });
    const got = symExtra(withSleep, main);
    if (main === 'sweats' || main === 'energy' || main === 'mood') {
      expect(got, `${main} + sleep`).toBe(SYM_SLEEP[main]);
    } else {
      expect(got, `${main} + sleep must not add a sleep sentence`).toBe('');
    }
  }
});

test('the extra sleep sentence never appears when she did not tick sleep', () => {
  for (const main of SYMPTOMS) {
    expect(symExtra(state({ sym: [main], main }), main), `${main} alone`).toBe('');
  }
});

/* ------------------------------------------------------ the doctor route -- */

test('a doctor state still reaches neither result page', () => {
  /* Under 40 with periods stopped and no medical reason is D. */
  const S = state({ sym: ['weight'], main: 'weight', age: 'under-40', cycle: 'stopped', twelve: 'yes' });
  expect(stateKey(S)).toBe('D');
  const seen = path(S);
  expect(seen, 'D never sees the result page').not.toContain('r1');
  expect(seen, 'D never sees the kit page').not.toContain('r2');
  expect(seen, 'D never reaches the email gate').not.toContain('gate');
});

/* ------------------------------------------- the softening, 7 October --- */

/* THE RULE, agreed with Jane on 7 October 2026: a stage word never stands
 * alone as her result, and no sentence says she HAS or IS IN a stage. The
 * result POINTS TO a stage, the stage is something MANY WOMEN DESCRIBE, and
 * one line says it is a normal stage with real support.
 *
 * `tests/copy.test.ts` already reads every string in resultCopy.ts. These two
 * tests pin the sentences the softening turns on, so moving them to a module
 * the gate does not walk, or quietly reinstating "you are in", fails here. */

test('the two softening lines pass the claim gate', () => {
  for (const [name, line] of [['STAGE_LINE', STAGE_LINE], ['EARLY_DOCTOR_LINE', EARLY_DOCTOR_LINE]] as const) {
    expect(line.trim().length, `${name} is empty`).toBeGreaterThan(0);
    expect(claimHits(line), `${name}: ${line}`).toEqual([]);
  }
});

test('the stage line says it is normal and that there is support, without promising anything', () => {
  expect(STAGE_LINE).toContain('normal stage');
  expect(STAGE_LINE).toContain('not an illness');
  expect(STAGE_LINE).toContain('real support');
});

test('only early menopause is sent to a doctor, and it is the one with a blood test', () => {
  expect(EARLY_DOCTOR_LINE).toContain('doctor');
  expect(EARLY_DOCTOR_LINE).toContain('blood test');
  /* It must not read as the safety exit, which is route D and a screen of its
     own. This is a suggestion on a result page, never an instruction. */
  expect(EARLY_DOCTOR_LINE.toLowerCase()).not.toContain('stop taking');
});

test('no outcome line tells her she has a stage or is in one', () => {
  const BANNED = ['match the pattern', 'you have', 'you are in'];
  for (const [outcome, copy] of Object.entries(RESULT)) {
    const line = copy.line.toLowerCase();
    for (const phrase of BANNED) {
      expect(line.includes(phrase), `RESULT.${outcome}.line says "${phrase}": ${copy.line}`).toBe(false);
    }
    /* And it must actively point instead. */
    expect(copy.line.startsWith('Your answers may point to'), `RESULT.${outcome}.line: ${copy.line}`).toBe(true);
  }
});

test('what this means says many women describe it, on the two stage results', () => {
  expect(MEANS.B[MEANS.B.length - 1]).toContain('many women describe');
  expect(MEANS.C[MEANS.C.length - 1]).toContain('Many women describe');
  /* A is a hormonal imbalance rather than a life stage, so it gets no such
     line. The brief leaves means-A alone. */
  expect(MEANS.A.join(' ')).not.toContain('many women describe');
});
