import { useEffect } from 'react';
import { useQuiz } from '../context';
import { submitListLead } from '../../lib/leads';
import { readListLink } from '../../lib/listLink';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import {
  TILES, BRAND, docReason, has, kindExit, mainConcern, masked, otherConcerns, stateKey,
} from '../../lib/logic';
import {
  DOC, DOC_TITLE, IMG, MASKED_NOTE, QUIZ_DISCLAIMER, RESULT, STAGE_FACT, cycleShort,
} from '../../lib/content';
/* HEAD, PAT, STAGE_LINE, SYM, meansFor, missLine and symExtra are no longer
   imported. The result page carried the whole explanation while it was the
   last thing before the price; `cause`, `plan` and `meet` carry it now, so
   this page names her result and hands over. All seven are still exported
   and still read by the copy gate. */
import {
  PERI_STAT, RESULT_CASE, RESULT_FINE, RESULT_PILL, RESULT_REASSURE, RESULT_TO_PLAN_V5, pairLine,
  resultKicker, stageBlock,
} from '../../lib/resultCopy';
import type { Outcome, SymptomId } from '../../lib/logic';

const LABEL = Object.fromEntries(TILES) as Record<SymptomId, string>;

/* ---------------------------------------------------------------- r1 ---- */

/* HER RESULT. What her answers MAY POINT TO, at the top, in one sentence. Then
 * what she told us, with the same pictures she tapped, what it means with her
 * own symptoms in it, and one fact about women at her stage.
 *
 * SOFTENED 7 OCTOBER. The stage word never stands alone as her result, and no
 * sentence says she has or is in a stage: the headline is `copy.line`, which
 * always begins "Your answers may point to", and `copy.name` (the bare stage word,
 * which still feeds Klaviyo's `result_route`) is not printed on the screen.
 * STAGE_LINE then says it is a normal stage with real support.
 *
 * It never tells her she might be one thing or another: she gets one of four
 * answers. */
export function R1() {
  const { S, angle, next } = useQuiz();
  const outcome = stateKey(S) as Exclude<Outcome, 'D'>;
  const main = mainConcern(S);
  const picked = main ? [main, ...otherConcerns(S)] : [];
  const cycle = cycleShort(S);
  const name = S.name.trim();
  const stage = stageBlock(outcome);
  const fact = STAGE_FACT[outcome] ?? STAGE_FACT.A;
  const pair = pairLine(S);

  /* Unchanged from live: a woman from JJ's list sends her completion here. */
  useEffect(() => {
    if (!S.skipEmail) return;
    void submitListLead(S, outcome, angle.slug, readListLink().profileId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen id="r1">
      {/* 1. HER RESULT. Jane's line, then her moment. Live styling. */}
      <div className="resHero d2Reveal">
        <p className="resKicker">{resultKicker(name)}</p>
        <ScreenTitle className="resName">{(RESULT[outcome] ?? RESULT.A).line}</ScreenTitle>
        <p className="resReassure">{RESULT_REASSURE}</p>
        {/* The success pill, in the offer page's green saving-pill style. */}
        <p className="kitPriceSave">{RESULT_PILL}</p>
      </div>

      {/* 2. WHAT SHE TOLD US. Unchanged: the pictures she tapped. The
          "How often" fact left with q5. */}
      {picked.length > 0 && (
        <section className="resSec">
          <p className="blabel">What you told us</p>
          <div className={`resPics n${Math.min(picked.length, 4)}`}>
            {picked.map((id, i) => (
              <figure key={id} className={i === 0 ? 'main' : ''}>
                <img src={IMG[id]} alt="" width={540} height={405} loading="lazy" decoding="async" />
                <figcaption>
                  {i === 0 && picked.length > 1 && <b>Bothers you most</b>}
                  {LABEL[id]}
                </figcaption>
              </figure>
            ))}
          </div>
          {cycle && (
            <dl className="resFacts">
              <div><dt>Your cycle</dt><dd>{cycle}</dd></div>
            </dl>
          )}
        </section>
      )}

      {/* 3. ONE STAGE BLOCK: what this stage is and why, with the cut cause
          screen's estrogen picture (lower estrogen after periods stop). */}
      <section className="resSec">
        <p className="blabel">{stage.title}</p>
        <figure className="nFig">
          <img src={stage.img} alt="" width={600} height={300} decoding="async"
            style={{ display: 'block', width: '100%', height: 'auto' }} />
          <figcaption className="nCap">{stage.caption}</figcaption>
        </figure>
        {stage.lines.map((l) => <p key={l} className="rDeck">{l}</p>)}
        {pair && <p className="rDeck">{pair}</p>}
        {masked(S) && <p className="resMeansNote">{MASKED_NOTE}</p>}
      </section>

      {/* 4. ONE STAT, the live big-number card, from the live STAGE_FACT. */}
      {/* 4. ONE STAT, the live big-number card. B: how long this stage lasts;
          C and E keep their live facts. */}
      <section className="resStat" data-proof="result">
        <p className="blabel">{fact.kicker}</p>
        {outcome === 'B'
          ? (
            <>
              <p className="resStatBig">{PERI_STAT.big}</p>
              <p className="resStatBigLabel">{PERI_STAT.label}</p>
            </>
          )
          : fact.big
            ? (
              <>
                <p className="resStatBig">{fact.big}</p>
                {fact.bigLabel && <p className="resStatBigLabel">{fact.bigLabel}</p>}
                <p className="resStatLine">{fact.line}</p>
              </>
            )
            : <><p className="resStatFact">{fact.fact}</p><p className="resStatLine">{fact.line}</p></>}
        <p className="resStatSrc">Source: {outcome === 'B' ? PERI_STAT.source : fact.source}</p>
      </section>

      {/* 5. THE CASE FOR HER PLAN, one paragraph. */}
      <p className="resHandoff">{RESULT_CASE}</p>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>
          {RESULT_TO_PLAN_V5} &rarr;
        </button>
      </ActionBar>

      {/* 6. One small line: the disclaimer and the doctor line together. */}
      <p className="fine">{RESULT_FINE}</p>
    </Screen>
  );
}

/* -------------------------------------------------------------- rDoc ---- */

/* The safety route. Its only outbound link is the brand site.
   It must never link to the shop, and it has no next screen. */
export function RDoc() {
  const { S, restart } = useQuiz();
  /* Direction 2: sixty and over gets the kind version of this screen. */
  const reason = kindExit(S) ? 'sixty' : (docReason(S) || 'young');
  const copy = DOC[reason];
  const picked = TILES.filter(([id]) => has(S, id)).map(([, label]) => label.toLowerCase());
  const list = picked.length ? picked.join(', ') : 'what you described';

  return (
    <Screen id="rDoc">
      <p className="eyebrow">Your Hormone Check</p>
      <ScreenTitle className="rTitle">
        {reason === 'sixty' ? 'Your answers are best talked through with your doctor.' : DOC_TITLE}
      </ScreenTitle>
      <p className="rDeck">{copy.deck}</p>

      <div className="block key">
        <p className="blabel">What to say</p>
        <p className="lead">&ldquo;{copy.say}&rdquo;</p>
        <p>Then tell them how long it has been, and mention {list}.</p>
      </div>

      <div className="block">
        <p className="blabel">What they may look at</p>
        <p>{copy.look}</p>
      </div>

      <a className="cta soft" href={BRAND} target="_blank" rel="noopener noreferrer">
        More from JJ Smith
      </a>
      <button type="button" className="cta ghost" onClick={restart}>Start the check again</button>

      <p className="fine">{QUIZ_DISCLAIMER}</p>
    </Screen>
  );
}
