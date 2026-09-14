/* Two questions, asked on every commit.
 *
 * 1. EQUIVALENCE — does src/lib/logic.ts still agree with the vanilla
 *    reference/quiz.js that was verified by hand? This runs the original
 *    source in a sandbox and compares both implementations across the whole
 *    input space. `reference/quiz.js` is kept ONLY for this test. Delete it
 *    and this test skips itself; the conformance tests below still apply.
 *
 * 2. CONFORMANCE — does src/lib/logic.ts do what docs/routing-table.md says?
 *    This one is permanent. The table is the specification; if the code and
 *    the table disagree, the code is wrong.
 */
import { test, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  createState, stateKey, periScore, path, shouldSkip,
  type QuizState, type Age, type Periods, type StopCause, type Regularity, type ScreenId,
} from '../src/lib/logic';

const HERE = dirname(fileURLToPath(import.meta.url));
const VANILLA = join(HERE, '..', 'reference', 'quiz.js');

/* ------------------------------------------------------ the input space -- */

const AGES: Age[] = ['u30', '30s', '40s', '50s', '60'];
const PERIODS: Periods[] = ['yes', 'changing', 'stopped'];
const CAUSES: (StopCause | '')[] = ['coil', 'pill', 'surgery', 'treatment', 'none', ''];
const REGS: (Regularity | '')[] = ['clock', 'abit', 'allover', ''];
const PERI_MARKERS = ['skipped', 'heavier', 'closer'] as const;

/** Every combination that can change the outcome. */
function* combinations(): Generator<QuizState> {
  for (const age of AGES) {
    for (const periods of PERIODS) {
      // stopCause is only asked when periods have stopped
      const causes = periods === 'stopped' ? CAUSES : ([''] as const);
      // cycle regularity is only asked when they have not
      const regs = periods === 'stopped' ? ([''] as const) : REGS;
      for (const stopCause of causes) {
        for (const reg of regs) {
          for (const sweats of [false, true]) {
            for (let m = 0; m <= PERI_MARKERS.length; m++) {
              const S = createState();
              S.age = age;
              S.periods = periods;
              S.stopCause = stopCause;
              S.reg = reg;
              S.sym = sweats ? ['sweats'] : [];
              S.markers = PERI_MARKERS.slice(0, m) as QuizState['markers'];
              yield S;
            }
          }
        }
      }
    }
  }
}

function label(S: QuizState) {
  return `age=${S.age} periods=${S.periods} cause=${S.stopCause || '-'} ` +
    `reg=${S.reg || '-'} sweats=${S.sym.includes('sweats')} markers=${S.markers.length}`;
}

/* ------------------------------------- 1. equivalence with the original -- */

/** Lift the pure functions out of the vanilla IIFE and run them in isolation. */
function loadVanilla(): (next: unknown) => { key: string; peri: number } {
  const src = readFileSync(VANILLA, 'utf8');
  const need = [
    /var MARKERS=\[[\s\S]*?\];/,
    /var S=\{sym:[\s\S]*?\};/,
    /function has\(id\)\{[\s\S]*?\}/,
    /function periScore\(\)\{[\s\S]*?\n\}/,
    /function explained\(\)\{.*?\}/,
    /function older\(\)\{.*?\}/,
    /function under40\(\)\{.*?\}/,
    /function docReason\(\)\{[\s\S]*?\n\}/,
    /function masked\(\)\{.*?\}/,
    /function stateKey\(\)\{[\s\S]*?\n\}/,
  ];
  const parts = need.map((re) => {
    const m = src.match(re);
    if (!m) throw new Error('could not lift ' + re);
    return m[0];
  });
  const body = parts.join('\n') +
    '\nreturn function(next){ S = next; return {key: stateKey(), peri: periScore()}; };';
  return new Function(body)();
}

test.skipIf(!existsSync(VANILLA))(
  'src/lib/logic.ts agrees with the hand-verified reference/quiz.js everywhere',
  () => {
    const vanilla = loadVanilla();
    let n = 0;
    for (const S of combinations()) {
      const want = vanilla(JSON.parse(JSON.stringify(S)));
      expect(stateKey(S), 'stateKey differs: ' + label(S)).toBe(want.key);
      expect(periScore(S), 'periScore differs: ' + label(S)).toBe(want.peri);
      n++;
    }
    expect(n, 'expected a large input space').toBeGreaterThan(500);
  },
);

/* ------------------------------- 2. conformance with the routing table --- */

test('D: cancer treatment routes to a doctor at every age', () => {
  for (const age of AGES) {
    const S = createState();
    S.age = age; S.periods = 'stopped'; S.stopCause = 'treatment';
    expect(stateKey(S), 'age ' + age).toBe('D');
  }
});

test('D: surgery routes to a doctor under 50, and to C at 50 and over', () => {
  for (const age of AGES) {
    const S = createState();
    S.age = age; S.periods = 'stopped'; S.stopCause = 'surgery';
    expect(stateKey(S), 'age ' + age).toBe((age === '50s' || age === '60') ? 'C' : 'D');
  }
});

test('D: still bleeding at 60 or over goes to a doctor', () => {
  for (const periods of ['yes', 'changing'] as Periods[]) {
    const S = createState();
    S.age = '60'; S.periods = periods;
    expect(stateKey(S), periods).toBe('D');
  }
});

test('D: periods stopped under 40 with nothing to explain it', () => {
  for (const age of ['u30', '30s'] as Age[]) {
    for (const cause of ['none', ''] as (StopCause | '')[]) {
      const S = createState();
      S.age = age; S.periods = 'stopped'; S.stopCause = cause;
      expect(stateKey(S), age + '/' + cause).toBe('D');
    }
  }
});

test('under 30 is never perimenopause, whatever the symptom load', () => {
  for (const S of combinations()) {
    if (S.age !== 'u30') continue;
    expect(stateKey(S), label(S)).not.toBe('B');
  }
});

test('E: periods stopped in her forties with nothing to explain it', () => {
  for (const cause of ['none', ''] as (StopCause | '')[]) {
    const S = createState();
    S.age = '40s'; S.periods = 'stopped'; S.stopCause = cause;
    expect(stateKey(S), cause).toBe('E');
  }
});

test('C: periods stopped at 50 or over with nothing to explain it', () => {
  for (const age of ['50s', '60'] as Age[]) {
    const S = createState();
    S.age = age; S.periods = 'stopped'; S.stopCause = 'none';
    expect(stateKey(S), age).toBe('C');
  }
});

test('masked bleed: coil and pill read on age and symptoms', () => {
  const cases: [Age, string][] = [['60', 'C'], ['50s', 'C'], ['40s', 'B'], ['u30', 'A']];
  for (const cause of ['coil', 'pill'] as StopCause[]) {
    for (const [age, expected] of cases) {
      const S = createState();
      S.age = age; S.periods = 'stopped'; S.stopCause = cause;
      expect(stateKey(S), cause + '/' + age).toBe(expected);
    }
  }
});

test('masked bleed at 30 to 39 needs periScore 5 or more for B', () => {
  const low = createState();
  low.age = '30s'; low.periods = 'stopped'; low.stopCause = 'coil';
  low.sym = ['sweats']; low.markers = ['skipped'];                          // 2 + 1 = 3
  expect(periScore(low)).toBe(3);
  expect(stateKey(low)).toBe('A');

  const high = createState();
  high.age = '30s'; high.periods = 'stopped'; high.stopCause = 'coil';
  high.sym = ['sweats']; high.markers = ['skipped', 'heavier', 'closer'];   // 2 + 3 = 5
  expect(periScore(high)).toBe(5);
  expect(stateKey(high)).toBe('B');
});

test('still cycling: the age thresholds', () => {
  const S = createState();
  S.age = '50s'; S.periods = 'yes';
  expect(stateKey(S), '50s is always B').toBe('B');

  const forties = createState();
  forties.age = '40s'; forties.periods = 'yes';             // periScore 1, from age
  expect(periScore(forties)).toBe(1);
  expect(stateKey(forties), '40s below threshold').toBe('A');

  forties.sym = ['sweats'];                                 // 1 + 2 = 3
  expect(stateKey(forties), '40s at threshold').toBe('B');

  const thirties = createState();
  thirties.age = '30s'; thirties.periods = 'yes';
  thirties.sym = ['sweats']; thirties.reg = 'allover';       // 2 + 2 = 4
  expect(stateKey(thirties), '30s below threshold').toBe('A');
  thirties.markers = ['skipped'];                            // 5
  expect(stateKey(thirties), '30s at threshold').toBe('B');
});

/* -------------------------------------- 3. the doctor route is an exit --- */

test('the doctor route never reaches the offer, and the offer never reaches it', () => {
  let doctors = 0, sellers = 0;
  for (const S of combinations()) {
    const seen = path(S);
    if (stateKey(S) === 'D') {
      doctors++;
      expect(seen, 'D must see rDoc: ' + label(S)).toContain('rDoc');
      for (const offer of ['r4', 'r4b', 'r5', 'r6', 'r7'] as ScreenId[]) {
        expect(seen, 'D must never see ' + offer + ': ' + label(S)).not.toContain(offer);
      }
    } else {
      sellers++;
      expect(seen, 'only D sees rDoc: ' + label(S)).not.toContain('rDoc');
      expect(seen, 'everyone else reaches the offer: ' + label(S)).toContain('r7');
    }
  }
  expect(doctors, 'both routes must be exercised').toBeGreaterThan(0);
  expect(sellers, 'both routes must be exercised').toBeGreaterThan(0);
});

test('the cycle questions are asked of exactly the right group', () => {
  for (const S of combinations()) {
    const seen = path(S);
    if (S.periods === 'stopped') {
      expect(seen, 'stopped must be asked why: ' + label(S)).toContain('s4b');
      expect(seen, 'stopped is never asked about regularity: ' + label(S)).not.toContain('s5');
    } else {
      expect(seen, 'only stopped is asked why: ' + label(S)).not.toContain('s4b');
      expect(seen, 'still cycling is asked about regularity: ' + label(S)).toContain('s5');
    }
  }
});

test('every state reaches a terminal screen', () => {
  for (const S of combinations()) {
    const seen = path(S);
    const last = seen[seen.length - 1];
    expect(['r7', 'rDoc'], 'ended at ' + last + ': ' + label(S)).toContain(last);
    expect(new Set(seen).size, 'no screen repeats: ' + label(S)).toBe(seen.length);
  }
});

test('shouldSkip and path agree', () => {
  for (const S of combinations()) {
    const seen = new Set(path(S));
    for (const id of ['s4b', 's5', 'rDoc', 'r4', 'r7'] as ScreenId[]) {
      expect(seen.has(id), id + ': ' + label(S)).toBe(!shouldSkip(S, id));
    }
  }
});
