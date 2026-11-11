import { test, expect } from 'vitest';
import { createState, type QuizState } from '../src/lib/logic';
import { DAY_ONE, PLAN_BRIDGE, planHeading } from '../src/lib/resultCopy';
import { COVER_SUB, GOAL_OPTIONS } from '../src/lib/content';

const S = (p: Partial<QuizState>): QuizState => ({ ...createState(), ...p });

test('Direction 2: the goal question offers five wants and never "understand"', () => {
  expect(GOAL_OPTIONS.map(([id]) => id)).toEqual(['sleep', 'body', 'clear', 'energy', 'cool']);
});

test('Direction 2: the plan heading names her symptoms', () => {
  expect(planHeading(S({ sym: ['sweats', 'sleep'], main: 'sweats' }))).toBe('Your 60-day plan for night sweats and poor sleep');
  expect(planHeading(S({ sym: ['weight'], main: 'weight' }))).toBe('Your 60-day plan for stubborn weight');
  expect(planHeading(S({}))).toBe('Your 60-day plan');
});

test('Direction 2: one story from the cover to the plan, and no promise to end or fix anything', () => {
  /* Jane, 11 Nov: the opening echoes the Kit's own name, "The 60-Day Feel
     Like YOU Again Kit"; she keeps outcome lines on pages. */
  expect(COVER_SUB).toBe('Take this 1-minute Hormone Check and get your personal 60-Day Feel Like You Again Plan.');
  expect(COVER_SUB).not.toMatch(/free/i);
  for (const line of [DAY_ONE, PLAN_BRIDGE]) {
    expect(line).not.toMatch(/(fix|end|cure|stop|get rid|guarantee|will)/i);
  }
});

import {
  FEEL_BODY, NOT_ALONE, RESULT_CLOSE, signs, whatItIs, whyItHappens,
} from '../src/lib/resultCopy';
test('Direction 2: the result explains and names no product or price', () => {
  const peri = S({ sym: ['sweats', 'sleep'], main: 'sweats', cycle: 'unpredictable' });
  const lines = [
    ...(['A', 'B', 'C', 'E'] as const).flatMap((o) => [whatItIs(o).title, whatItIs(o).body, whyItHappens(o)]),
    ...signs(peri, 'B').map((g) => g.text), ...NOT_ALONE, FEEL_BODY, RESULT_CLOSE,
  ];
  for (const l of lines) expect(l).not.toMatch(/Hormone Focus|Kit|\$|capsule|supplement/i);
  /* The signs she picked are the ones ticked. */
  expect(signs(peri, 'B').filter((g) => g.hers).map((g) => g.text)).toEqual([
    'Hot flashes or night sweats', 'Waking at 3 AM', 'Periods that come early or late',
  ]);
});

import { planSteps } from '../src/lib/resultCopy';
test('Direction 2: the four plan steps name no product, and are shaped by her symptoms', () => {
  const st = planSteps(S({ sym: ['sweats', 'sleep'], main: 'sweats' }));
  expect(st.map((s) => s.title)).toEqual([
    'Know what is behind your night sweats', 'Eat for this stage',
    'Support your changing hormones', 'Track how you feel',
  ]);
  expect(st[0].body).toContain('a warm room, wine, spicy food or stress');
  expect(st[2].body).toBe('Your hormones are changing, so your body needs steady daily support, not one quick answer.');
  expect(st[2].mine).toBe('For the night sweats you told us about.');
  for (const s of st) expect(`${s.title} ${s.body} ${s.mine}`).not.toMatch(/Hormone Focus|Kit|JJ|Recipes|Tracker/);
});

import { planTriedLine } from '../src/lib/resultCopy';
test('Direction 2: the tried line says what she has tried and that the plan brings it together', () => {
  expect(planTriedLine(S({ tried: ['sleep', 'supps'] }))).toBe(
    'You have already tried working on your sleep and supplements. This plan brings it together.');
  expect(planTriedLine(S({ tried: ['nothing'] }))).toBe('');
});

import { pairLine, stageBlock, FEEL_SHORT, whyItHappens as why2 } from '../src/lib/resultCopy';
import { STAGE_FACT } from '../src/lib/content';
import { writeFileSync } from 'node:fs';
test('Direction 2: after periods stop (C, E), nothing says estrogen swings or goes up and down', () => {
  const SWING = /up and down|swing|uneven/i;
  const dump: Record<string, string[]> = {};
  for (const o of ['A', 'B', 'C', 'E'] as const) {
    for (const main of ['sweats', 'sleep', 'weight', 'bloat', 'energy', 'mood'] as const) {
      const st = S({ sym: [main, main === 'sleep' ? 'sweats' : 'sleep'], main, cycle: o === 'C' || o === 'E' ? 'stopped' : 'unpredictable' });
      const lines = [
        STAGE_FACT[o].line, stageBlock(o).title, ...stageBlock(o).lines, FEEL_SHORT, whatItIs(o).title, whatItIs(o).body,
        ...signs(st, o).map((g) => g.text), ...NOT_ALONE, why2(o), pairLine(st), FEEL_BODY, RESULT_CLOSE,
        ...planSteps(st, o).flatMap((p) => [p.title, p.body, p.mine]),
      ].filter(Boolean);
      dump[`${o}/${main}`] = lines;
      if (o === 'C' || o === 'E') {
        for (const l of lines) {
          /* Her sign list may still name "Mood swings": that is her symptom, not estrogen. */
          if (/mood swings/i.test(l)) continue;
          expect(l, `${o}/${main}`).not.toMatch(SWING);
          expect(l, `${o}/${main}`).not.toMatch(/perimenopause|your cycle/i);
        }
      }
    }
  }
  if (process.env.D2_DUMP) writeFileSync(process.env.D2_DUMP, JSON.stringify(dump, null, 1));
});
