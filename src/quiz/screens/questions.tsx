import { useQuiz } from '../context';
import { useAutoAdvance } from '../useAutoAdvance';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { TileGrid } from '../../components/TileGrid';
import { SingleChoice, MultiChoice } from '../../components/controls';
import {
  AGE_OPTIONS, CYCLE_OPTIONS, PATTERN_OPTIONS, TRIED_OPTIONS, TWELVE_OPTIONS,
  WANT_OPTIONS, mentioned,
} from '../../lib/content';
import { TILES, has } from '../../lib/logic';
import type { Age, Cycle, Pattern, SymptomId, Twelve, WantId } from '../../lib/logic';

/* SEVEN QUESTIONS, and nothing between them.
 *
 * No explainer screens, no reviews, no product. Each question changes her
 * result, what her result says back to her, or what she is shown next. One
 * that does none of those does not belong here.
 */

/* ---------------------------------------------------------------- q1 ---- */

/* The lowest-friction way in: she sees herself before she is asked her age
   or anything about her cycle. Whatever angle brought her here arrives
   already ticked. */
export function Q1() {
  const { S, toggle, next } = useQuiz();
  return (
    <Screen id="q1">
      <ScreenTitle>What has been bothering you lately?</ScreenTitle>
      <p className="qsub">Select all that apply.</p>
      <TileGrid selected={S.sym} onToggle={(id) => toggle('sym', id)} />
      <ActionBar>
        <button type="button" className="cta" disabled={!S.sym.length} onClick={() => next()}>
          Continue
        </button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- q2 ---- */

/* Question one says what she is living with. This says what she cares about
   most, and only the ones she ticked are offered. One tick skips the screen. */
export function Q2() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  const options = TILES.filter(([id]) => has(S, id)).map(([id, label]) => [id, label] as [string, string]);
  return (
    <Screen id="q2">
      <ScreenTitle>Which one bothers you the most?</ScreenTitle>
      <SingleChoice
        name="Which one bothers you the most"
        options={options}
        value={S.main}
        onPick={(v: SymptomId) => pick(() => set({ main: v }))}
      />
    </Screen>
  );
}

/* ---------------------------------------------------------------- q3 ---- */

export function Q3() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="q3">
      <ScreenTitle>How old are you?</ScreenTitle>
      <SingleChoice
        name="How old are you"
        options={AGE_OPTIONS}
        value={S.age}
        onPick={(v: Age) => pick(() => set({ age: v }))}
      />
    </Screen>
  );
}

/* ---------------------------------------------------------------- q4 ---- */

/* One question where there used to be four. Changing her answer clears the
   follow-up, so an old "yes, twelve months" cannot ride along with a new
   "less predictable". */
export function Q4() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="q4">
      <ScreenTitle>What has been happening with your cycle (monthly periods) lately?</ScreenTitle>
      <SingleChoice
        name="What has been happening with your cycle"
        options={CYCLE_OPTIONS}
        value={S.cycle}
        onPick={(v: Cycle) => pick(() => set(v === S.cycle ? { cycle: v } : { cycle: v, twelve: '' }))}
      />
    </Screen>
  );
}

/* Only for "It has stopped completely". */
export function Q4b() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="q4b">
      <ScreenTitle>Has it been at least 12 months since your last one?</ScreenTitle>
      <SingleChoice
        name="Has it been at least 12 months"
        options={TWELVE_OPTIONS}
        value={S.twelve}
        onPick={(v: Twelve) => pick(() => set({ twelve: v }))}
      />
    </Screen>
  );
}

/* ---------------------------------------------------------------- q5 ---- */

/* The check promises a pattern. This is the question that looks for one, and
   it opens by saying her own answers back to her. */
export function Q5() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  const list = mentioned(S);
  return (
    <Screen id="q5">
      {list && <p className="qlead">You mentioned {list}.</p>}
      <ScreenTitle>When do you notice these changes most?</ScreenTitle>
      <SingleChoice
        name="When do you notice these changes most"
        options={PATTERN_OPTIONS}
        value={S.pattern}
        onPick={(v: Pattern) => pick(() => set({ pattern: v }))}
      />
    </Screen>
  );
}

/* ---------------------------------------------------------------- q6 ---- */

/* Asked so her result can acknowledge the effort. It is never turned into
   "and that is why it failed". */
export function Q6() {
  const { S, toggle, next } = useQuiz();
  return (
    <Screen id="q6">
      <ScreenTitle>What have you already tried?</ScreenTitle>
      <p className="qsub">Select all that apply.</p>
      <MultiChoice
        name="What you have already tried"
        options={TRIED_OPTIONS}
        values={S.tried}
        onToggle={(v) => toggle('tried', v as never)}
      />
      <ActionBar>
        <button type="button" className="cta" disabled={!S.tried.length} onClick={() => next()}>
          Continue
        </button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- q7 ---- */

export function Q7() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="q7">
      <ScreenTitle>What do you want most right now?</ScreenTitle>
      <SingleChoice
        name="What you would choose"
        options={WANT_OPTIONS}
        value={S.want}
        onPick={(v: WantId) => pick(() => set({ want: v }))}
      />
    </Screen>
  );
}
