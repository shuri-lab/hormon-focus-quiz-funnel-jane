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
  ACK, BRIDGE, CLOSE, EARLY_DOCTOR_LINE, HEAD, KIT_CLOSE, KIT_FOCUS_CLAIM, KIT_INTRO,
  KIT_PIECES, KIT_PIECES_TITLE, KIT_PIECE_IDS, KIT_TITLE, MEANS, PAT, PRI, STAGE_LINE,
  START_TITLE, SYM, SYM_SLEEP, WANT_CARD, WHY60, WHY60_TITLE,
  cardAcks, meansFor, symExtra, threeCards, underCardAcks,
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

/* ALWAYS THREE, AND THE TRACKER IS ALWAYS THE THIRD. Jane, 9 October 2026.
 *
 * This replaced "the want fills a place only when she ticked fewer than
 * three", which let a woman who ticked three symptoms have three symptom
 * cards and never the tracker, and a woman who ticked one have only two
 * cards. Writing it down works for every result, so every result gets it. */

test('the tracker is the third card, whatever she ticked', () => {
  /* Two of hers: her own two, then the tracker. The want has no room. */
  expect(threeCards(state({ sym: ['weight', 'sleep'], main: 'weight', want: 'body' })))
    .toEqual(['weight', 'sleep', 'track']);

  /* One of hers, and the want points back at it, so the fallback fills two. */
  expect(threeCards(state({ sym: ['weight'], main: 'weight', want: 'body' })))
    .toEqual(['weight', 'sleep', 'track']);

  /* Same, and the fallback avoids repeating sleep by reaching for weight. */
  expect(threeCards(state({ sym: ['sleep'], main: 'sleep', want: 'sleep' })))
    .toEqual(['sleep', 'weight', 'track']);

  /* Three or more of hers: the first two, then the tracker. It no longer
     crowds the tracker out. */
  expect(threeCards(state({ sym: ['weight', 'sleep', 'energy'], main: 'weight', want: 'understand' })))
    .toEqual(['weight', 'sleep', 'track']);
});

test('every path gives exactly three cards, with track last and no repeats', () => {
  const states: QuizState[] = [state(), state({ sym: [...SYMPTOMS] })];
  for (const want of ['', ...WANTS] as (WantId | '')[]) {
    for (const main of ['', ...SYMPTOMS] as (SymptomId | '')[]) {
      states.push(state({ sym: main ? [main] : [], main, want }));
      states.push(state({ sym: [...SYMPTOMS], main, want }));
      for (const other of SYMPTOMS) {
        states.push(state({ sym: main && other !== main ? [main, other] : [other], main, want }));
      }
    }
  }

  for (const S of states) {
    const cards = threeCards(S);
    const where = `main=${S.main || '-'} want=${S.want || '-'} sym=[${S.sym.join()}]`;
    expect(cards.length, `three cards: ${where}`).toBe(3);
    expect(cards[2], `track is last: ${where}`).toBe('track');
    expect(new Set(cards).size, `no repeats: ${where}`).toBe(3);
    /* And the tracker never sneaks into the first two. */
    expect(cards.slice(0, 2), `track only once: ${where}`).not.toContain('track');
    /* Every id shown has copy behind it. */
    for (const id of cards) expect(PRI[id], `${id} has copy: ${where}`).toBeTruthy();
  }
});

test('the one that bothers her most is still the first card', () => {
  for (const main of SYMPTOMS) {
    const S = state({ sym: [...SYMPTOMS], main });
    expect(threeCards(S)[0], `main=${main}`).toBe(main);
  }
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

/* --------------------------------- the result page, 8 October 2026 ------ */

/* THE ORDER SHE READS IT IN: where to start, her three things, the bridge,
 * then the Kit, why it runs sixty days for her concern, and what is inside.
 * These hold the copy; the e2e walk holds the order on the screen. */

test('every symptom has a start headline, and it says where to start', () => {
  for (const id of SYMPTOMS) {
    expect(START_TITLE[id], `START_TITLE.${id}`).toBeTruthy();
    expect(START_TITLE[id].startsWith('Start with these 3 for'), START_TITLE[id]).toBe(true);
  }
  expect(Object.keys(START_TITLE).sort()).toEqual([...SYMPTOMS].sort());
  /* The promise it replaced is gone: this page no longer opens with a plan. */
  for (const id of SYMPTOMS) expect(START_TITLE[id]).not.toContain('60-day plan');
});

test('every symptom has a why-sixty-days line, and every one is attributed', () => {
  expect(Object.keys(WHY60).sort()).toEqual([...SYMPTOMS].sort());
  for (const id of SYMPTOMS) {
    expect(WHY60[id], `WHY60.${id}`).toBeTruthy();
    /* A timeline is only ours to state if somebody else stated it first. */
    expect(WHY60[id].includes('Many women tell me'), `WHY60.${id} is unattributed`).toBe(true);
    expect(WHY60[id]).toContain('first month');
    expect(WHY60[id]).toContain('second month');
  }
});

test('the new paragraphs are the strings Jane sent, to the character', () => {
  expect(BRIDGE).toBe(
    "These are the first three things I'd work on. None of them are complicated, "
    + 'but doing them consistently when life gets busy is where it gets harder. '
    + 'This is why I built the Feel Like YOU Again Kit.',
  );

  expect(KIT_TITLE).toBe('The 60-Day Feel Like YOU Again Kit');

  /* Two paragraphs, in order, so the screen can put air between them. */
  expect(KIT_INTRO).toHaveLength(2);
  expect(KIT_INTRO[0]).toBe(
    "I put the Feel Like YOU Again Kit together so you don't have to piece all of "
    + 'this together on your own. It gives you 60 days to stay with the same simple '
    + 'plan instead of changing things every few days.',
  );
  expect(KIT_INTRO[1]).toBe(
    'Hormones change slowly, and so do habits, so I want you looking at more than '
    + 'a few good days.',
  );

  expect(WHY60_TITLE).toBe('Why 60 days?');
  expect(KIT_PIECES_TITLE).toBe("What's inside");

  expect(KIT_CLOSE).toBe(
    'Not one more thing to try. Just one plan built around feeling like you again.',
  );
});

test('the four kit pieces are one line each, in the order she reads them', () => {
  expect(KIT_PIECE_IDS).toEqual(['guide', 'recipes', 'tracker', 'focus']);
  for (const id of KIT_PIECE_IDS) {
    expect(KIT_PIECES[id], id).toBeTruthy();
    /* One line: a title sentence and a short one after it, no paragraph. */
    expect(KIT_PIECES[id].length, `${id} is too long for a row`).toBeLessThan(110);
  }
  expect(KIT_PIECES.focus).toContain('Two capsules with a meal every day');
});

/* THE INGREDIENT SENTENCES ARE OFF THIS PAGE, 8 October 2026.
 *
 * DIM, Calcium D-Glucarate and BioPerine stay on the offer page, where she is
 * reading about the product. On the result page she is reading about what to
 * do next, and the bottle carries one claim, small, under the dose line. */
test('the result page carries one claim about the bottle, and not the formula', () => {
  expect(KIT_FOCUS_CLAIM).toBe('Hormone Focus supports healthy estrogen metabolism.');

  const everything = [
    BRIDGE, ...KIT_INTRO, KIT_TITLE, KIT_CLOSE, KIT_FOCUS_CLAIM,
    ...Object.values(KIT_PIECES), ...Object.values(WHY60), ...Object.values(START_TITLE),
  ].join(' ');

  for (const ingredient of ['DIM', 'Calcium D-Glucarate', 'BioPerine']) {
    expect(everything.includes(ingredient), `${ingredient} is still on the result page`).toBe(false);
  }
});
