import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import {
  TILES, BRAND, docReason, has, mainConcern, masked, otherConcerns, stateKey,
} from '../../lib/logic';
import {
  CANNOT_TELL, DOC, DOC_TITLE, IMG, MASKED_NOTE, PATTERN_SHORT, QUIZ_DISCLAIMER, RESULT,
  STAGE_FACT, WANT_PHRASE, cycleShort,
} from '../../lib/content';
import {
  CLOSE, EARLY_DOCTOR_LINE, HEAD, PAT, STAGE_LINE, SYM, meansFor, symExtra,
} from '../../lib/resultCopy';
import type { Outcome, SymptomId } from '../../lib/logic';

const LABEL = Object.fromEntries(TILES) as Record<SymptomId, string>;

/* ---------------------------------------------------------------- r1 ---- */

/* HER RESULT. What her answers POINT TO, at the top, in one sentence. Then
 * what she told us, with the same pictures she tapped, what it means with her
 * own symptoms in it, and one fact about women at her stage.
 *
 * SOFTENED 7 OCTOBER. The stage word never stands alone as her result, and no
 * sentence says she has or is in a stage: the headline is `copy.line`, which
 * always begins "Your answers point to", and `copy.name` (the bare stage word,
 * which still feeds Klaviyo's `result_route`) is not printed on the screen.
 * STAGE_LINE then says it is a normal stage with real support.
 *
 * It never tells her she might be one thing or another: she gets one of four
 * answers. */
export function R1() {
  const { S, next, forgetKnown } = useQuiz();
  const outcome = stateKey(S) as Exclude<Outcome, 'D'>;
  const copy = RESULT[outcome] ?? RESULT.A;
  const main = mainConcern(S);
  const picked = main ? [main, ...otherConcerns(S)] : [];
  const cycle = cycleShort(S);
  /* Her own, where she typed one at the gate; otherwise the first name the
     email link carried, because a woman from JJ's list never sees the gate. */
  const name = S.name.trim() || (S.known?.name ?? '').trim();
  const fact = STAGE_FACT[outcome] ?? STAGE_FACT.A;

  return (
    <Screen id="r1">
      <div className="resHero">
        <p className="resKicker">{name ? `${name}, your Hormone Check result` : 'Your Hormone Check result'}</p>
        <ScreenTitle className="resName">{copy.line}</ScreenTitle>
        {/* SHE CAME FROM JJ'S LIST, so she was never asked for an address. If
            the link was forwarded, or she is reading somebody else's email,
            this is her way to the gate — and taking it clears the identity in
            the link and asks her properly, consent box included. */}
        {S.known && (
          <p className="resNotYou">
            <button type="button" onClick={forgetKnown}>
              {S.known.name ? `Not ${S.known.name}? Enter your email.` : 'Not you? Enter your email.'}
            </button>
          </p>
        )}
      </div>

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

      {/* What this means: the stage in Jane's words, then the one line that
          ties it to the thing she said bothers her most, then how often it
          hits her. All of it is data in resultCopy.ts, keyed by outcome,
          symptom and pattern. None of it is built from her tile label. */}
      <div className="block">
        <p className="blabel">What this means</p>
        {meansFor(outcome).map((para) => <p key={para}>{para}</p>)}
        {masked(S) && <p>{MASKED_NOTE}</p>}
        {main && <p>{CLOSE[main]}</p>}
        <p>{STAGE_LINE}</p>
        {outcome === 'E' && <p>{EARLY_DOCTOR_LINE}</p>}
        {S.pattern && <p>{PAT[S.pattern]}</p>}
      </div>

      {main && (
        <div className="block">
          <p className="blabel">{HEAD[main]}</p>
          <p>{SYM[main]}</p>
          {symExtra(S, main) && <p>{symExtra(S, main)}</p>}
        </div>
      )}

      {S.want && (
        <div className="block key">
          <p className="blabel">What you want most</p>
          <p className="lead">{WANT_PHRASE[S.want]}</p>
        </div>
      )}

      {/* One fact about women at her stage, and no product yet: the kit and
          the women who use it come on the next page. */}
      <section className="resFact" data-proof="result">
        <p className="blabel">You are not the only one</p>
        <p className="resFactBig">{fact.fact}</p>
        <p>{fact.line}</p>
        <p className="resFactSrc">Source: {fact.source}</p>
      </section>

      <p className="fine">{CANNOT_TELL}</p>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>
          SHOW ME WHAT TO DO NEXT &rarr;
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
