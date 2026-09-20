import { Link } from 'react-router-dom';
import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { score, stateKey } from '../../lib/logic';
import {
  BOTTLE, CUSTOMERS, FDA_DISCLAIMER, OFFER_DISCLAIMER, SEV_PHRASE, TRIED_WHY, VERDICT,
} from '../../lib/content';
import { Stars } from '../../components/icons';
import { RATING, REVIEW_COUNT } from '../../lib/reviews';
import {
  GUARANTEE_DAYS, PROTOCOL_DISCOUNT_CODE, PROTOCOL_VARIANT_ID, showInternalNotes,
} from '../../lib/offer';
import { BuyOptions, useOfferChoice } from '../../components/BuyOptions';
import { PLAN_LINK_LABEL, planHref } from '../../lib/planCopy';
import type { Severity } from '../../lib/logic';

function Guarantee() {
  return (
    <>
      <div className="sealWrap">
        <span className="seal"><b>SEE<br />RESULTS</b><i>or it is free</i></span>
        <div className="sealTxt">
          <b>Sixty days. Up to two bottles.</b>
          <span>Empty or full. If you do not feel the difference, tell us and we send your money back.</span>
        </div>
      </div>
      <p className="microDisc">Results may vary based on individual. No results guaranteed.</p>
    </>
  );
}

/* ---------------------------------------------------------------- r4 ---- */

export function R4() {
  const { S, next } = useQuiz();
  const why = S.tried.map((k) => TRIED_WHY[k]).filter(Boolean);

  return (
    <Screen id="r4">
      <p className="eyebrow">What you have already tried</p>
      <ScreenTitle className="rTitle">Why nothing has worked.</ScreenTitle>

      <div className="block">
        {why.length
          ? why.map(([head, tail], i) => <p key={i}><strong>{head}</strong> {tail}</p>)
          : (
            <p>
              <strong>You have not tried anything for this yet.</strong> Most women have not.
              Nobody tells you there is anything to try.
            </p>
          )}
      </div>

      <div className="block key"><p className="lead">None of it was aimed at the cause.</p></div>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>So what does? &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* --------------------------------------------------------------- r4b ---- */

export function R4b() {
  const { next } = useQuiz();
  return (
    <Screen id="r4b">
      <p className="eyebrow">What does</p>
      <ScreenTitle className="rTitle">Two capsules a day.</ScreenTitle>

      <div className="shot">
        <img src={BOTTLE} alt="Hormone Focus" width={620} height={540} loading="lazy" decoding="async" />
      </div>

      <div className="badges">
        <span className="badge">{GUARANTEE_DAYS}-day guarantee</span>
        <span className="badge">No diet changes</span>
        <span className="badge">Two capsules a day</span>
      </div>

      <div className="block key">
        <p className="lead">Most hormone supplements only do half the job.</p>
        <p>They break it down. They do not carry it out. So it goes back in.</p>
        <p><strong>Hormone Focus is a 3-in-1 blend that does all three.</strong></p>
        <div className="formula">
          <div className="ing"><b>Breaks it down &mdash; <em>DIM</em></b><i>From broccoli and cabbage.</i></div>
          <div className="ing"><b>Carries it out &mdash; <em>Calcium D-Glucarate</em></b><i>So it does not come back.</i></div>
          <div className="ing"><b>Helps you absorb both &mdash; <em>BioPerine</em></b><i>From black pepper.</i></div>
        </div>
      </div>

      <Guarantee />

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>How fast does it work? &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- r5 ---- */

export function R5() {
  const { next } = useQuiz();
  return (
    <Screen id="r5">
      <p className="eyebrow">You asked</p>
      <ScreenTitle className="rTitle">This is how fast it works.</ScreenTitle>

      <div className="protocol">Take two capsules a day</div>

      <div className="steps">
        <div className="step">
          <b className="n">1</b>
          <div className="t"><b>The first month</b><span>Your body needs a full cycle before it can show you anything. The first thing most women notice is <em>less bloating and water retention.</em>*</span></div>
        </div>
        <div className="step">
          <b className="n">2</b>
          <div className="t"><b>From today</b><span>Your plan is already written: what to change this week, and what customers report at two weeks, four, and sixty.</span></div>
        </div>
        <div className="step">
          <b className="n">3</b>
          <div className="t"><b>Day thirty</b><span>The point most women say they can tell.</span></div>
        </div>
        <div className="step">
          <b className="n">4</b>
          <div className="t"><b>Day sixty</b><span>The guarantee is still running. It outlasts the bottle by a month, on purpose.</span></div>
        </div>
      </div>

      <p className="fine">*{FDA_DISCLAIMER}</p>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>Who else is doing this? &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- r6 ---- */

export function R6() {
  const { next } = useQuiz();
  return (
    <Screen id="r6">
      <p className="eyebrow">Who else is doing this</p>
      <ScreenTitle className="rTitle">You would be in good company.</ScreenTitle>

      {/* 800,000 is scoped to books and challenges. It is never a Hormone Focus
          customer count, and it never appears on a button. */}
      <div className="block key">
        <p className="lead">JJ&rsquo;s books and challenges have helped over 800,000 women.</p>
        <p>Hormone Focus is the one she made for what happens to your hormones.</p>
      </div>

      <div className="selfieGrid">
        {CUSTOMERS.map((src) => (
          <img key={src} src={src} alt="" width={170} height={265} loading="lazy" decoding="async" />
        ))}
      </div>
      <p className="selfieCap">Real customers, from JJ&rsquo;s own product page.</p>

      <div className="ratingBlock" style={{ marginTop: 14 }}>
        <div className="ratingBig">{RATING}</div>
        <div className="ratingStars"><Stars /></div>
        <p className="ratingSub">from {REVIEW_COUNT} verified reviews of Hormone Focus</p>
      </div>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>See what it costs &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- r7 ---- */

export function R7() {
  const { S, angle, restart } = useQuiz();
  const outcome = stateKey(S);
  const v = VERDICT[outcome];
  const sc = score(S);

  /* THE SAME OFFER AS /offer. The rows, the prices, the value stack and the
     three cart modes all come from BuyOptions, so the quiz cannot drift away
     from the pages. */
  const { chosen, choose } = useOfferChoice();
  const plan = planHref(S);

  return (
    <Screen id="r7">
      <p className="eyebrow">Based on your answers</p>
      <ScreenTitle className="rTitle">
        Here is where I would start you, {S.name.trim() || 'you'}.
      </ScreenTitle>
      <p className="rDeck">
        {v.name} &middot; {sc.raw} of 14 signs
        {S.sev && ` · ${SEV_PHRASE[S.sev as Severity]}`}
      </p>

      <div className="shot">
        <img src={BOTTLE} alt="Hormone Focus" width={620} height={540} loading="lazy" decoding="async" />
      </div>

      {/* The Starter Guide is a page she can open now, so the value stack is
          not promising her an email that does not exist yet. */}
      {plan && (
        <p className="planLink">
          <Link to={plan}>{PLAN_LINK_LABEL} &rarr;</Link>
        </p>
      )}

      <div className="offer quizBuy">
        <BuyOptions
          chosen={chosen}
          onChoose={choose}
          outcome={outcome}
          angle={angle.slug}
          name="quiz"
        />
      </div>

      <button type="button" className="cta ghost" onClick={restart}>Start the check again</button>

      {showInternalNotes() && (
        <div className="warn">
          <b>Internal note — not shown to customers.</b> The Plan link runs on the
          discount code {PROTOCOL_DISCOUNT_CODE ?? 'that is not set yet'} while
          PROTOCOL_VARIANT_ID is {PROTOCOL_VARIANT_ID ?? 'null'}, so the code has to
          exist in the store before this button is worth anything. The subscription row
          stays unrendered until there is a plan behind it. No 3 or 6-month bundle
          exists yet.
        </div>
      )}

      <p className="fine">{OFFER_DISCLAIMER}</p>
    </Screen>
  );
}
