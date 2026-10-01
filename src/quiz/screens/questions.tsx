import { useQuiz } from '../context';
import { useAutoAdvance } from '../useAutoAdvance';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { TileGrid } from '../../components/TileGrid';
import { SingleChoice, MultiChoice } from '../../components/controls';
import { RatingLine } from '../../components/icons';
import {
  AGE_OPTIONS, PERIOD_OPTIONS, CAUSE_OPTIONS, REG_OPTIONS, SEV_OPTIONS,
  HELPED_OPTIONS, MOOD_LABELS, MARKER_LABELS, TRIED_LABELS, SHORT,
} from '../../lib/content';
import { TILES, has, mainConcern } from '../../lib/logic';
import type {
  Age, Periods, StopCause, Regularity, Severity, Helped, SymptomId,
} from '../../lib/logic';

/* ---------------------------------------------------------------- s1 ---- */

/* The question is the page. Whatever angle brought her here is handled by
   the landing page in front of this, so screen one stays the same for every
   ad — only the pre-selection differs. */
export function S1() {
  const { S, toggle, next } = useQuiz();
  return (
    <Screen id="s1">
      <p className="eyebrow">The Hormone Check</p>
      <ScreenTitle>What changes have frustrated you the most?</ScreenTitle>
      <p className="qsub">Select all that apply.</p>
      <TileGrid selected={S.sym} onToggle={(id) => toggle('sym', id)} />
      <div className="footTrust"><RatingLine /></div>
      <ActionBar>
        <button type="button" className="cta" disabled={!S.sym.length} onClick={() => next()}>
          {S.sym.length ? `Continue with ${S.sym.length} selected` : 'Select at least one'}
        </button>
      </ActionBar>
    </Screen>
  );
}

/* --------------------------------------------------------------- s1b ---- */

/* Five ticks do not say which one she came here about. This asks, and only
   when there is something to rank: one symptom skips the screen. The answer
   never changes her result. It decides which concern her first step is for. */
export function S1b() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  const options = TILES.filter(([id]) => has(S, id)).map(([id, label]) => [id, label] as [string, string]);
  return (
    <Screen id="s1b">
      <p className="eyebrow">The Hormone Check</p>
      <ScreenTitle>Which of these is bothering you most?</ScreenTitle>
      <p className="qsub">Your result will start with this one.</p>
      <SingleChoice
        name="What is bothering you most"
        options={options}
        value={S.main}
        onPick={(v: SymptomId) => pick(() => set({ main: v }))}
      />
    </Screen>
  );
}

/* ---------------------------------------------------------------- s2 ---- */

export function S2() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="s2">
      <p className="eyebrow">About you</p>
      <ScreenTitle>What is your age?</ScreenTitle>
      <p className="qsub">Your age is read together with your cycle, never on its own.</p>
      <SingleChoice
        name="Your age"
        options={AGE_OPTIONS}
        value={S.age}
        onPick={(v: Age) => pick(() => set({ age: v }))}
      />
    </Screen>
  );
}

/* ---------------------------------------------------------------- s3 ---- */

/* Reassurance, and nothing sold. A product review sat here once, before she
   had been told anything about herself; it is on the proof screen now, where
   a product is actually being discussed. */
export function S3() {
  const { next } = useQuiz();
  return (
    <Screen id="s3">
      <p className="eyebrow">You are in the right place</p>
      <ScreenTitle>You are not the only one asking.</ScreenTitle>
      <div className="block key">
        <p className="lead">These changes are common after 40, and most women are never told what to look for.</p>
        <p>The next few questions are about your cycle. It is one of the most useful things this check can go on.</p>
      </div>
      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>Continue</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- s4 ---- */

export function S4() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="s4">
      <p className="eyebrow">Your cycle</p>
      <ScreenTitle>Do you still have periods?</ScreenTitle>
      <p className="qsub">Changed can mean heavier, lighter, closer together or further apart.</p>
      <SingleChoice
        name="Do you still have periods"
        options={PERIOD_OPTIONS}
        value={S.periods}
        onPick={(v: Periods) => pick(() => set({ periods: v }))}
      />
    </Screen>
  );
}

export function S4b() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="s4b">
      <p className="eyebrow">Your cycle</p>
      <ScreenTitle>Is anything else likely to be stopping them?</ScreenTitle>
      <p className="qsub">This changes the answer completely, so it is worth asking.</p>
      <SingleChoice
        name="What is stopping your periods"
        options={CAUSE_OPTIONS}
        value={S.stopCause}
        onPick={(v: StopCause) => pick(() => set({ stopCause: v }))}
      />
    </Screen>
  );
}

export function S5() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="s5">
      <p className="eyebrow">Your cycle</p>
      <ScreenTitle>And how regular are they?</ScreenTitle>
      <SingleChoice
        name="How regular are your periods"
        options={REG_OPTIONS}
        value={S.reg}
        onPick={(v: Regularity) => pick(() => set({ reg: v }))}
      />
    </Screen>
  );
}

/* ---------------------------------------------------------------- s6 ---- */

export function S6() {
  const { S, toggle, next } = useQuiz();
  return (
    <Screen id="s6">
      <p className="eyebrow">Mood and mind</p>
      <ScreenTitle>Has your mood changed lately?</ScreenTitle>
      <p className="qsub">Not how you have always been. What is different now. Select all that apply.</p>
      <MultiChoice
        name="Mood changes"
        options={MOOD_LABELS}
        values={S.mood}
        onToggle={(v) => toggle('mood', v as never)}
      />
      <ActionBar>
        <button type="button" className="cta" disabled={!S.mood.length} onClick={() => next()}>Continue</button>
        <button type="button" className="cta ghost" onClick={() => next()}>None of these</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- s7 ---- */

export function S7() {
  const { S, toggle, next } = useQuiz();
  return (
    <Screen id="s7">
      <p className="eyebrow">A few more</p>
      <ScreenTitle>Any of these in the last year?</ScreenTitle>
      <p className="qsub">Changes like these help place where you are. Select all that apply.</p>
      <MultiChoice
        name="Cycle markers"
        options={MARKER_LABELS}
        values={S.markers}
        onToggle={(v) => toggle('markers', v as never)}
      />
      <ActionBar>
        <button type="button" className="cta" disabled={!S.markers.length} onClick={() => next()}>Continue</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- s8 ---- */

export function S8() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="s8">
      <p className="eyebrow">How often</p>
      <ScreenTitle>How often does it hit you?</ScreenTitle>
      <p className="qsub">Thinking only about {SHORT[mainConcern(S) as SymptomId] ?? 'what bothers you most'}.</p>
      <SingleChoice
        name="How often"
        options={SEV_OPTIONS}
        value={S.sev}
        onPick={(v: Severity) => pick(() => set({ sev: v }))}
      />
    </Screen>
  );
}

/* ---------------------------------------------------------------- s9 ---- */

/* What these can have in common, said as a possibility. The old screen drew
   a vessel filling up and told her that was the cause of what she feels. Her
   answers cannot establish a cause, so this one explains the stage and says
   plainly what the check can and cannot do. */
export function S9() {
  const { next } = useQuiz();
  return (
    <Screen id="s9">
      <p className="eyebrow">While I put this together</p>
      <ScreenTitle>What these changes can have in common.</ScreenTitle>
      <div className="block">
        <p>In the years before your periods stop, your hormone levels start to rise and fall less evenly than they used to.</p>
        <p>That shift can show up in more than one place at once: heat, sleep, weight that moves to the middle, bloating, mood.</p>
      </div>
      <div className="block key">
        <p className="lead">This check cannot tell you the cause. It can tell you which stage your answers fit.</p>
      </div>
      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>Two more questions &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* --------------------------------------------------------------- s10 ---- */

export function S10() {
  const { S, toggle, next } = useQuiz();
  return (
    <Screen id="s10">
      <p className="eyebrow">What you have tried</p>
      <ScreenTitle>What have you already tried?</ScreenTitle>
      <p className="qsub">Select all that apply.</p>
      <MultiChoice
        name="What you have tried"
        options={TRIED_LABELS}
        values={S.tried}
        onToggle={(v) => toggle('tried', v as never)}
      />
      <ActionBar>
        <button type="button" className="cta" disabled={!S.tried.length} onClick={() => next()}>Continue</button>
        <button type="button" className="cta ghost" onClick={() => next()}>Nothing yet</button>
      </ActionBar>
    </Screen>
  );
}

/* --------------------------------------------------------------- s11 ---- */

export function S11() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="s11">
      <p className="eyebrow">What you have tried</p>
      <ScreenTitle>Did any of it help?</ScreenTitle>
      <SingleChoice
        name="Did any of it help"
        options={HELPED_OPTIONS}
        value={S.helped}
        onPick={(v: Helped) => pick(() => set({ helped: v }))}
      />
    </Screen>
  );
}
