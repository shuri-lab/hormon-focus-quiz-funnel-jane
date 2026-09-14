import { useQuiz } from '../context';
import { useAutoAdvance } from '../useAutoAdvance';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { TileGrid } from '../../components/TileGrid';
import { SingleChoice, MultiChoice } from '../../components/controls';
import { RatingLine, Stars, VerifiedCheck } from '../../components/icons';
import {
  AGE_OPTIONS, PERIOD_OPTIONS, CAUSE_OPTIONS, REG_OPTIONS, SEV_OPTIONS,
  HELPED_OPTIONS, MOOD_LABELS, MARKER_LABELS, TRIED_LABELS, REVIEWS,
  REG_PHRASE, symPhrase,
} from '../../lib/content';
import type {
  Age, Periods, StopCause, Regularity, Severity, Helped,
} from '../../lib/logic';
import { useEffect, useState } from 'react';

/* ---------------------------------------------------------------- s1 ---- */

/* The question is the page. Whatever angle brought her here is handled by
   the landing page in front of this, so screen one stays the same for every
   ad — only the pre-selection differs. */
export function S1() {
  const { S, toggle, next } = useQuiz();
  return (
    <Screen id="s1">
      <p className="eyebrow">Let us build your hormone plan</p>
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

/* ---------------------------------------------------------------- s2 ---- */

export function S2() {
  const { S, set, next } = useQuiz();
  const pick = useAutoAdvance(next);
  return (
    <Screen id="s2">
      <p className="eyebrow">About you</p>
      <ScreenTitle>What is your age?</ScreenTitle>
      <p className="qsub">This helps us personalize your results.</p>
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

/* Lisa. She names the symptoms rather than praising the product. */
export function S3() {
  const { next } = useQuiz();
  const v = REVIEWS[0];
  return (
    <Screen id="s3">
      <p className="eyebrow">You are in the right place</p>
      <ScreenTitle>Women with your symptoms have already done this.</ScreenTitle>
      <div className="rev">
        <div className="rs"><Stars n={v.r} /></div>
        <p>&ldquo;{v.b}&rdquo;</p>
        <div className="foot">
          <b>{v.n}</b>
          <span className="vbadge"><VerifiedCheck />Verified buyer</span>
        </div>
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
      <p className="qsub">This one question tells me the most.</p>
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
      <p className="qsub">These tell me which stage you are in.</p>
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
      <ScreenTitle>How often does this hit you?</ScreenTitle>
      <p className="qsub">Thinking about {symPhrase(S)}.</p>
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

/* The mechanism. The vessel fills after the screen has settled, so the
   movement reads as an explanation rather than a page still loading. */
export function S9() {
  const { S, next } = useQuiz();
  const [filled, setFilled] = useState(false);
  const reg = S.reg ? REG_PHRASE[S.reg] : '';

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 340);
    return () => clearTimeout(t);
  }, []);

  return (
    <Screen id="s9">
      <p className="eyebrow">Here is what is going on</p>
      <ScreenTitle>All of it comes from one place.</ScreenTitle>
      <div className="mech">
        <p className="mechTop">Every month your body makes hormones. Then it has to clear them out again.</p>
        <div className="mechFig">
          <div className="vessel" role="img" aria-label="Most of what your body makes is cleared out. The part that stays in builds up.">
            <span className="vGap" style={{ height: filled ? '36%' : '100%' }} />
            <span className="vFill" style={{ height: filled ? '64%' : '0%' }} />
            <span className="vLine" style={{ bottom: filled ? '64%' : '0%' }} />
          </div>
          <div className="mechKey">
            <div className="keyRow">
              <span className="keySwatch gap" />
              <div><b>What stays in</b><span>The part that does not leave. It builds up month after month.</span></div>
            </div>
            <div className="keyRow">
              <span className="keySwatch out" />
              <div><b>What leaves</b><span>Cleared out through your gut.</span></div>
            </div>
          </div>
        </div>
        <p className="mechCap">Made each month</p>
      </div>
      <div className="block key">
        <p className="lead">The part that does not leave is what you have been feeling.</p>
        {reg && <p style={{ marginTop: 10 }}>Your periods being <strong>{reg}</strong> helps me place which stage you are in.</p>}
      </div>
      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>So why has nothing worked? &rarr;</button>
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
      <p className="eyebrow">And did it work</p>
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
