import { useQuiz } from '../context';
import { Screen, ScreenTitle, ActionBar } from '../../components/Screen';
import { BRAND, mainConcern, seesOffer, stateKey } from '../../lib/logic';
import {
  BOTTLE, CUSTOMERS, FDA_DISCLAIMER, HELPED_NOTE, NEXT_STEP, NEXT_WATCH, OFFER_DISCLAIMER,
  QUIZ_DISCLAIMER, SHORT, TRIED_NOTE, VERDICT,
} from '../../lib/content';
import { Stars } from '../../components/icons';
import { RATING, REVIEW_COUNT } from '../../lib/reviews';
import { GUARANTEE_DAYS, KIT_CONTENTS, PLAN_NAME } from '../../lib/offer';
import { OfferCards } from '../../components/OfferCards';
import {
  GUARANTEE_HEADLINE, GUARANTEE_LINK_TEXT, GUARANTEE_SUB_PRE, GUARANTEE_SUB_REST,
  REFUND_POLICY_URL,
} from '../../lib/offerCopy';
import type { SymptomId } from '../../lib/logic';

function Guarantee() {
  return (
    <>
      <div className="sealWrap">
        <span className="seal"><b>SEE<br />RESULTS</b><i>or it is free</i></span>
        {/* The same words as the buy block, from the same constants. Two
            guarantees worded two ways is one guarantee nobody believes. */}
        <div className="sealTxt">
          <b>{GUARANTEE_HEADLINE}</b>
          <span>
            {GUARANTEE_SUB_PRE}
            <a href={REFUND_POLICY_URL} target="_blank" rel="noopener noreferrer">
              {GUARANTEE_LINK_TEXT}
            </a>
            {GUARANTEE_SUB_REST}
          </span>
        </div>
      </div>
      <p className="microDisc">Results may vary based on individual. No results guaranteed.</p>
    </>
  );
}

/* ---------------------------------------------------------------- r4 ---- */

/* WHERE TO START. The free part of the result, and the last screen for every
   outcome the kit is not offered to.
 *
 * It used to be "Why nothing has worked", which told her that her bedtime and
 * her plate were never the problem. The check cannot know that, and food,
 * movement and sleep are three of the five steps in JJ's own plan. So this
 * screen keeps what she is doing, and gives her one thing to add. */
export function R4() {
  const { S, next, restart } = useQuiz();
  const tried = S.tried.map((k) => TRIED_NOTE[k]).filter(Boolean);
  const main = mainConcern(S) as SymptomId;
  const step = NEXT_STEP[main];
  const offered = seesOffer(S);

  return (
    <Screen id="r4">
      <p className="eyebrow">Your next step</p>
      <ScreenTitle className="rTitle">Where to start.</ScreenTitle>

      {tried.length > 0 && (
        <div className="block">
          <p className="blabel">What you have already done</p>
          {tried.map(([head, tail], i) => <p key={i}><strong>{head}</strong> {tail}</p>)}
          {S.helped && HELPED_NOTE[S.helped] && <p>{HELPED_NOTE[S.helped]}</p>}
        </div>
      )}

      {step && (
        <div className="block key">
          <p className="blabel">One thing to start with, for {SHORT[main]}</p>
          <p className="lead">{step.step}</p>
          <p>{step.why}</p>
          <p>{NEXT_WATCH}</p>
        </div>
      )}

      {offered ? (
        <ActionBar>
          <button type="button" className="cta" onClick={() => next()}>How JJ&rsquo;s kit fits in &rarr;</button>
        </ActionBar>
      ) : (
        <>
          <a className="cta soft" href={BRAND} target="_blank" rel="noopener noreferrer">
            More from JJ Smith
          </a>
          <button type="button" className="cta ghost" onClick={restart}>Start the check again</button>
          <p className="fine">{QUIZ_DISCLAIMER}</p>
        </>
      )}
    </Screen>
  );
}

/* --------------------------------------------------------------- r4b ---- */

/* The kit, as the way to put the next steps into practice. Not two capsules
   as the whole answer, and no "no diet changes": the kit ships with recipes
   and a plan whose first step is how she eats. */
export function R4b() {
  const { next } = useQuiz();
  return (
    <Screen id="r4b">
      <p className="eyebrow">If you want help doing it</p>
      <ScreenTitle className="rTitle">{PLAN_NAME}.</ScreenTitle>

      <div className="shot">
        <img src={BOTTLE} alt="Hormone Focus" width={620} height={540} loading="lazy" decoding="async" />
      </div>

      <div className="badges">
        <span className="badge">{GUARANTEE_DAYS}-day guarantee</span>
        <span className="badge">Free shipping</span>
        <span className="badge">Two capsules a day</span>
      </div>

      <div className="block key">
        <p className="lead">JJ built the kit for this stage. It is the supplement and the plan together.</p>
        <div className="formula">
          {KIT_CONTENTS.map(([what, detail]) => (
            <div className="ing" key={what}><b>{what}</b><i>{detail}</i></div>
          ))}
        </div>
      </div>

      <div className="block">
        <p className="blabel">What is in Hormone Focus</p>
        <p>
          A 3-in-1 blend: <strong>DIM</strong>, from broccoli and cabbage,{' '}
          <strong>Calcium D-Glucarate</strong> and <strong>BioPerine</strong>, from black pepper.
          Hormone Focus supports hormone balance for women in perimenopause and menopause.*
        </p>
      </div>

      <Guarantee />

      <p className="fine">*{FDA_DISCLAIMER}</p>

      <ActionBar>
        <button type="button" className="cta" onClick={() => next()}>What does the kit ask of me? &rarr;</button>
      </ActionBar>
    </Screen>
  );
}

/* ---------------------------------------------------------------- r5 ---- */

/* What she does, not what she will feel. No symptom is promised by a day. */
export function R5() {
  const { next } = useQuiz();
  return (
    <Screen id="r5">
      <p className="eyebrow">What you would be doing</p>
      <ScreenTitle className="rTitle">What the kit asks of you.</ScreenTitle>

      <div className="protocol">Two capsules a day, with a meal</div>

      <div className="steps">
        <div className="step">
          <b className="n">1</b>
          <div className="t"><b>Start</b><span>Take two capsules a day with a meal, and open the ebook. JJ&rsquo;s plan has five steps: Eat, Train, Replace, Release and Track.</span></div>
        </div>
        <div className="step">
          <b className="n">2</b>
          <div className="t"><b>Build</b><span>Work through the steps at your own pace. The recipes are there for the first one.</span></div>
        </div>
        <div className="step">
          <b className="n">3</b>
          <div className="t"><b>Record</b><span>Mark the Daily Symptom Tracker. It takes a minute, and it is how you will see what is changing.</span></div>
        </div>
        <div className="step">
          <b className="n">4</b>
          <div className="t"><b>Decide</b><span>Look back over your tracker and judge it for yourself. The guarantee is there if it is not for you.</span></div>
        </div>
      </div>

      <p className="fine">Individual results vary. {FDA_DISCLAIMER}</p>

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
      <p className="fine">These are reviews of Hormone Focus, the supplement in the kit. Individual results vary.</p>

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

  return (
    <Screen id="r7">
      <p className="eyebrow">Based on your answers</p>
      <ScreenTitle className="rTitle">
        Here is where I would start you, {S.name.trim() || 'you'}.
      </ScreenTitle>
      <p className="rDeck">
        Your answers point to {v.name.toLowerCase()}. This is the kit JJ built for that stage.
        Whether it is right for you is your call.
      </p>

      {/* No bottle photograph above the cards: each card carries its own
          product shot. The kit card names its three digital pieces as the
          bonus line. */}
      <OfferCards outcome={outcome} angle={angle.slug} stack={false} />

      <button type="button" className="cta ghost" onClick={restart}>Start the check again</button>

      <p className="fine">{OFFER_DISCLAIMER}</p>
    </Screen>
  );
}
