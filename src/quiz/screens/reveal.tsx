import { useEffect } from 'react';
import { useQuiz } from '../context';
import { submitListLead } from '../../lib/leads';
import { readListLink } from '../../lib/listLink';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import {
  TILES, BRAND, docReason, has, mainConcern, masked, otherConcerns, stateKey,
} from '../../lib/logic';
import {
  CANNOT_TELL, DOC, DOC_TITLE, IMG, MASKED_NOTE, PATTERN_SHORT, QUIZ_DISCLAIMER, RESULT,
  STAGE_FACT, WANT_PHRASE, cycleShort,
} from '../../lib/content';
/* HEAD, PAT, STAGE_LINE, SYM, meansFor, missLine and symExtra are no longer
   imported. The result page carried the whole explanation while it was the
   last thing before the price; `cause`, `plan` and `meet` carry it now, so
   this page names her result and hands over. All seven are still exported
   and still read by the copy gate. */
import {
  CLOSE, EARLY_DOCTOR_LINE, MISS_LEAD, MISS_TITLE, RESULT_REASSURE, UNIFY,
  WANT_HANDOFF, WANT_HANDOFF_UNDERSTAND, meansShortFor, resultKicker,
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
  const copy = RESULT[outcome] ?? RESULT.A;
  const main = mainConcern(S);
  const picked = main ? [main, ...otherConcerns(S)] : [];
  const cycle = cycleShort(S);
  const name = S.name.trim();
  const fact = STAGE_FACT[outcome] ?? STAGE_FACT.A;

  /* SHE PRESSED NOTHING, SO THIS IS WHERE THE EVENT GOES.
   *
   * A woman who typed her address sends HF Quiz Completed by pressing the
   * button on the email screen. A woman from JJ's list never sees that
   * screen, so her completion is sent when her result opens instead.
   *
   * submitListLead is the one that decides whether anything leaves: without
   * a profile id it sends nothing and reports success, which is the
   * skip_email=1 test mode, and it refuses a second send in the same
   * session so a reload or the back button cannot run JJ's flow twice. */
  useEffect(() => {
    if (!S.skipEmail) return;
    void submitListLead(S, outcome, angle.slug, readListLink().profileId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen id="r1">
      {/* ------------------------------------------------ 1. her result ----
          THE HEADLINE IS RESULT[outcome].line, VERBATIM. It always begins
          "Your answers may point to", which is the softening the whole page
          is built on: the quiz suggests, it never diagnoses. Shortening it
          or rewording it is the one edit this file must never make. */}
      <div className="resHero">
        <p className="resKicker">{resultKicker(name)}</p>
        <ScreenTitle className="resName">{copy.line}</ScreenTitle>
        <p className="resReassure">{RESULT_REASSURE}</p>
      </div>

      {/* ------------------------------------------ 2. what she told us ----
          Unchanged: the same pictures she tapped, the one she said bothers
          her most flagged, and the two facts she gave about her pattern and
          her cycle. Lighter styling only. */}
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
          {(S.pattern || cycle) && (
            <dl className="resFacts">
              {S.pattern && <div><dt>How often</dt><dd>{PATTERN_SHORT[S.pattern]}</dd></div>}
              {cycle && <div><dt>Your cycle</dt><dd>{cycle}</dd></div>}
            </dl>
          )}
        </section>
      )}

      {/* --------------------------------------- 3. what this means ----
          TWO LINES, WHERE THERE WERE SIX PARAGRAPHS AND TWO SECTIONS.

          The old page carried meansFor() in full, a separate "Why your
          sleep changed" block built from SYM and HEAD, and the PAT line, for
          about four hundred words before she reached the hand-off. It had to:
          it was the last thing before the price. Three screens explain the
          cause now, so this is the stage in one line and her own symptom in
          the next. MEANS, SYM, HEAD, PAT and STAGE_LINE are all still
          exported and still gated; they simply stop rendering here.

          STILL KEYED TO HER. meansShortFor() reads her outcome and CLOSE
          reads the symptom she said bothers her most, exactly as before. */}
      <div className="resMeans">
        <p className="resMeansLead">{meansShortFor(outcome)}</p>
        {/* THE UNIFY CLAUSE ONLY WHERE THERE IS SOMETHING TO UNIFY. She can
            tick one symptom or four; telling a woman who named one that "it
            is one thing, not several" is answering a question she did not
            ask. CLOSE[main] still reads her own symptom either way. */}
        {main && (
          <p className="resMeansSym">
            {CLOSE[main]}{picked.length > 1 ? UNIFY : ''}
          </p>
        )}
        {masked(S) && <p className="resMeansNote">{MASKED_NOTE}</p>}
        {/* EARLY MENOPAUSE IS TOLD TO SEE A DOCTOR, and it is told here
            rather than in the fine print at the foot. It is the one piece of
            advice on this page that could matter medically. */}
        {outcome === 'E' && <p className="resDoctor">{EARLY_DOCTOR_LINE}</p>}
      </div>

      {/* ------------------------------------------------ 4. the hook ----
          Effort was never the missing piece. The line now points at the next
          screen instead of explaining, which is what lets `cause` open on the
          reason rather than repeating this one. missLine(S) is no longer
          rendered: it was a second line making a claim about what she had
          already tried, and the hook reads shorter without it. */}
      <div className="resHook">
        <p className="resHookTitle">
          <span className="resHookIcon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16.5v.01" />
            </svg>
          </span>
          {MISS_TITLE}
        </p>
        <p className="resHookBody">{MISS_LEAD}</p>
      </div>

      {/* ------------------------------------ 5. she is not the only one ----
          The number pulled large where the fact has one, and the sentence it
          came from under it. `big` lives beside its own fact in content.ts,
          so this is outcome-aware without a second table to keep in step. */}
      <section className="resStat" data-proof="result">
        {/* THE KICKER IS THE FACT'S OWN. It read "You are not the only one"
            over a large "four years", which is not a number of women. It is
            true of a count (A and E) and false of a duration or an average
            age, so it belongs to the fact rather than to this component. */}
        <p className="blabel">{fact.kicker}</p>
        {fact.big
          ? (
            <>
              <p className="resStatBig">{fact.big}</p>
              {/* And what the number IS, directly under it. */}
              {fact.bigLabel && <p className="resStatBigLabel">{fact.bigLabel}</p>}
            </>
          )
          : <p className="resStatFact">{fact.fact}</p>}
        <p className="resStatLine">{fact.line}</p>
        <p className="resStatSrc">Source: {fact.source}</p>
      </section>

      {/* -------------------------------------------- 6. the hand-off ----
          What she said she wants, and the line that hands her to the next
          screen. A woman who came to understand what is happening gets the
          version that pivots to showing her, rather than promising again. */}
      {S.want && (
        <div className="resWant">
          <p className="resWantLead">{WANT_PHRASE[S.want]}</p>
          <p className="resHandoff">
            {S.want === 'understand' ? WANT_HANDOFF_UNDERSTAND : WANT_HANDOFF}
          </p>
        </div>
      )}

      <p className="fine">{CANNOT_TELL}</p>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>
          SHOW ME WHAT IS GOING ON &rarr;
        </button>
      </ActionBar>
    </Screen>
  );
}

/* -------------------------------------------------------------- rDoc ---- */

/* The safety route. Its only outbound link is the brand site.
   It must never link to the shop, and it has no next screen. */
export function RDoc() {
  const { S, restart } = useQuiz();
  const reason = docReason(S) || 'young';
  const copy = DOC[reason];
  const picked = TILES.filter(([id]) => has(S, id)).map(([, label]) => label.toLowerCase());
  const list = picked.length ? picked.join(', ') : 'what you described';

  return (
    <Screen id="rDoc">
      <p className="eyebrow">Your Hormone Check</p>
      <ScreenTitle className="rTitle">{DOC_TITLE}</ScreenTitle>
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
