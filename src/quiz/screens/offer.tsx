import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuiz } from '../context';
import { Screen, ScreenTitle } from '../../components/Screen';
import { OkendoWall } from '../../components/OkendoWall';
import { VideoWall } from '../../components/VideoWall';
import { mainConcern, stateKey } from '../../lib/logic';
import { OFFER_DISCLAIMER } from '../../lib/content';
/* KIT_PIECES, KIT_PIECE_IDS, KIT_PIECES_TITLE and KIT_FOCUS_CLAIM are no
   longer imported. The "What's inside" rows were the same four things the
   kit card's own value stack already lists, with prices, directly under a
   photograph of all four. David called it on 16 October: it was the offer
   said twice. The copy is still exported and still under the claim gate.
   The structure-function line that rode on the bottle row is not lost
   either: "DIM. Supports healthy estrogen metabolism." says it in the
   ingredient table a section below. */
import {
  FacebookComment, Faces, PhotoRail, PressRail, Quote, RatingBadge,
} from '../../components/Proof';
import { kitProof } from '../../lib/reviews';
import { REVIEW_COUNT } from '../../lib/reviews';
import { SINGLE_AFTER_DISCOUNT, money, singleDailyPrice } from '../../lib/offer';
import { INGREDIENTS } from '../../lib/offerCopy';
/* HERO_HEAD, HERO_HEAD_DEFAULT and HERO_SUB_BY_STAGE are no longer imported:
   the hero sells the package now, so its headline and sub are the kit's
   rather than her symptom's. HOW_HEAD and HOW_BODY went the same way, step
   one of the plan being the dose. CLOSE_HEAD said "Your first bottle"; the
   kit's closer replaces it. All six are still exported and still gated. */
import {
  CLOSE_CTA, HERO_CTA, HERO_EYEBROW, HERO_RISK, HF_EYEBROW, HF_HEAD,
  KIT_CLOSE_HEAD, KIT_FAQ, KIT_FAQ_EYEBROW, KIT_FAQ_HEAD, KIT_HERO_HEAD,
  KIT_HERO_SUB, KIT_SHOT_ALT, MECH_EYEBROW, MECH_HEAD,
  PLAN_EYEBROW, PLAN_HEAD, PLAN_STEP_1, PLAN_STEP_1_BODY, PLAN_STEP_2,
  PLAN_STEP_2_BODY, PLAN_STEP_3, PLAN_STEP_3_BODY, PROOF_EYEBROW, PROOF_HEAD,
  PROOF_MORE_HEAD, PROOF_NOTE, SINGLE_DISCOUNT_NOTE, STICKY_CTA, TEASER_HEAD,
  TRUST_LEAD,
  WHY_OPENER, WHY_PRODUCT, WHY_STAGE,
} from '../../lib/kitCopy';
import { KitGuarantee, KitOffer, KitPrice, kitHref } from '../../components/KitOffer';
import { SHOT_KIT_HERO } from '../../lib/offer';
import { track } from '../../lib/analytics';
import { useHydrated } from '../../lib/useHydrated';

/* ---------------------------------------------------------------- r2 ---- */

/* THE OFFER PAGE, REBUILT FOR CONVERSION. 16 October 2026, David's brief.
 *
 * WHAT WAS WRONG. The page opened with three free tips and reached the price
 * at section six of fourteen. A woman arriving here has just read her result:
 * she is as warm as she will ever be, and the first thing she met was generic
 * advice she could act on without buying anything. The brief's figure is that
 * 60% never scroll past the first screen, and the first screen had no offer on
 * it at all.
 *
 * THE ORDER NOW. The outcome she came for, with proof and a button, then the
 * offer directly under it while she is still warm; what is in the kit; why it
 * works when trying harder has not; the wall of women; what she will actually
 * do on the plan; the questions and the guarantee; and the closer.
 *
 * THE TIPS ARE NOT GONE, which was the one thing worth getting right. They
 * come back lower as the plan in action, and threeCards() maps onto the three
 * steps exactly: her two symptom cards are what she does on step two, and the
 * tracker is step three. So she still reads her own answers back, she reads
 * them as the plan rather than instead of it, and nothing personal was lost
 * by moving them.
 *
 * THE MECHANISM SECTION INVENTS NOTHING. Its two sentences are her own result
 * page read back: the stage sentence for her outcome and the closing line for
 * the symptom she named. Both were already approved and both are already
 * about her.
 *
 * WHAT WENT. The bridge paragraph ("These are the first three things I would
 * work on ... this is why I built the Kit") pointed from the tips to the kit,
 * and the kit now comes first, so the sentence was backwards. It is still
 * exported from resultCopy.ts and still under the copy gate; it is just not
 * rendered here. START_TITLE is in the same position: the headline over her
 * three things is the plan heading now.
 */

/** Respect the setting rather than animate over it. */
const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A, B, C and E reach this page. D exits to the doctor screen before it. */
type Stage = keyof typeof HERO_EYEBROW;
const stageOf = (outcome: string): Stage =>
  (outcome in HERO_EYEBROW ? outcome as Stage : 'A');

export function R2() {
  const { S, angle } = useQuiz();
  const outcome = stateKey(S);
  const main = mainConcern(S);
  const proof = kitProof(main);
  /* threeCards, cardAcks, underCardAcks and triedLine are gone with the
     plan section they fed. Her answers still key the hero headline and the
     "why it works" opener; what left is the homework. */
  /* Rebuilt once she is in a browser, for the reason in useHydrated.ts: the
     server has no sessionStorage, so this link was being served with her
     attribution missing and never rebuilt. */
  const hydrated = useHydrated();
  const href = useMemo(() => kitHref(outcome, angle.slug), [outcome, angle.slug, hydrated]);

  /* The bar shows wherever the page has no call to action of its own in
     view, and stays off the legal text at the foot.
   *
   * It used to watch only the offer block, with an IntersectionObserver that
   * fired on `boundingClientRect.bottom < 0`. That is true only once the
   * block is entirely above the viewport, which on this page meant the bar
   * appeared at the very bottom and nowhere else. Both regions are measured
   * now, the way Jane's landing page does it. */
  const offer = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLParagraphElement>(null);
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const onScreen = (el: Element | null, bottomBias: number) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.bottom > 0 && r.top < vh * bottomBias;
    };

    /* ONE FULL SCREEN, NOT THREE QUARTERS OF ONE. The hero now carries its own
       button, so the bar has nothing to add until the hero has gone: at 0.75
       it arrived while the hero CTA was still on screen and offered her the
       same thing twice. */
    const SCROLLED_PAST_THE_HERO = () => window.scrollY > window.innerHeight;

    const update = () => setSticky(
      SCROLLED_PAST_THE_HERO()
      && !onScreen(offer.current, 0.85)
      && !onScreen(foot.current, 1),
    );

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const toOffer = () => offer.current?.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });

  return (
    <Screen id="r2">
      {/* ------------------------------------------------- 1. the hero ----
          THE KIT, NOT THE BOTTLE, from 29 October. Her stage, the package by
          name, what is in it, the picture of all four pieces, the rating,
          the value against the price, a button, and the risk taken off it.

          THE PERSONALISED HEADLINE CAME OUT HERE. It was her own symptom
          read back ("Feel comfortable in your own clothes again"); the
          brief's headline sells the package instead. She is still read back
          twice on this page: the eyebrow is her stage, and "why it works"
          below opens on the symptom she named. */}
      <section className="kitHero">
        {/* THREE, NOT FOUR. The kit's name sat on its own plum line between
            the eyebrow and the headline, which made four stacked lines before
            she reached the picture. The name is in the headline now. */}
        <p className="kitHeroEyebrow">{HERO_EYEBROW[stageOf(outcome)]}</p>
        <ScreenTitle className="kitHeroH1">{KIT_HERO_HEAD}</ScreenTitle>
        <p className="kitHeroSub">{KIT_HERO_SUB}</p>

        {/* 4:3, WHERE THE BOTTLE WAS SQUARE, and it carries its own name,
            tagline and price in the artwork. Everything printed into it is
            also on the page as text, which is what a screen reader, a slow
            connection and a 320px phone each need. */}
        <img
          className="kitHeroShot isKit" src={SHOT_KIT_HERO}
          alt={KIT_SHOT_ALT}
          width={768} height={576} decoding="async" fetchPriority="high"
        />

        {/* THE RATING ALONE. The hero's one woman in her own words moved to
            the proof block directly below, where the other three already
            were: the brief puts the price line in this space instead, and
            the four named reviews now sit together rather than one up here
            and three a screen away. */}
        <div className="kitHeroProof" data-proof="pre">
          <RatingBadge />
        </div>

        <KitPrice />

        <button type="button" className="cta kitBtn kitHeroCta" onClick={toOffer}>
          {HERO_CTA} &nbsp;&rarr;
        </button>
        <p className="kitHeroRisk">{HERO_RISK}</p>
      </section>

      {/* -------------------------------------- 2. proof, straight away ----
          The brief's order inside this zone: the women, then two of them in
          their own words with a way down to all of them, then the press.
          Three sections rather than one so each keeps the padding and the
          overflow behaviour it already had. */}
      <section className="kitBand surface kitStrip" data-proof="rail">
        <PhotoRail />
        {/* DIRECTLY UNDER THE WOMEN, 29 October. The press logos were a
            section of their own below the review teaser, which put two
            screens between "here are the women" and "here is where you have
            seen us". They are one proof block, so they sit together. */}
        <PressRail />
      </section>

      <section className="kitSec kitTeaser" data-proof="teaser">
        <h2 className="kitH2">{TEASER_HEAD}</h2>
        <RatingBadge />
        <div className="kitRevs">
          {proof.more.slice(1, 3).map((r) => <Quote key={r.name} review={r} />)}
        </div>
        <a className="kitAllRevs" href="#all-reviews">
          Read all {REVIEW_COUNT} reviews
        </a>
        <p className="kitNote">{PROOF_NOTE}</p>
      </section>

      {/* --------------------------------------------- 3. who JJ is ----
          Its own line now, where it used to open the review teaser. Cold
          traffic only: a woman from JJ's own list is being introduced to
          someone she already follows. */}
      {!S.skipEmail && (
        <section className="kitSec kitWho">
          <p className="kitTrustLead">{TRUST_LEAD}</p>
        </section>
      )}

      {/* ------------------------------------------- 4. why it works ----
          Her symptom, the stage it belongs to, and the one thing the product
          is said to do, then the label.

          THE BODY IS STILL BUILT FROM HER ANSWERS. The brief wrote this
          paragraph out as "In perimenopause your hormones stop staying
          steady ...", which is WHY_STAGE.B almost word for word and is
          wrong for the two outcomes that are not perimenopause: C is after
          her periods have stopped and E is early menopause. The approved
          per-stage sentences say the same thing to each of them. */}
      <section className="kitBand kitMech">
        <p className="kitEyebrow">{MECH_EYEBROW}</p>
        <h2 className="kitH2">{MECH_HEAD}</h2>
        <p className="kitBody">
          {main && `${WHY_OPENER[main]} `}
          {WHY_STAGE[stageOf(outcome)]}
        </p>
        <p className="kitBody">{WHY_PRODUCT}</p>

        <p className="kitEyebrow kitMgEyebrow">{HF_EYEBROW}</p>
        <h3 className="kitH3">{HF_HEAD}</h3>
        <div className="kitMg">
          {INGREDIENTS.map(([dose, name, what]) => (
            <div key={name}>
              <b>{dose}</b>
              <span><strong>{name}.</strong> {what}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- 5. the plan ----
          BACK, AND IT IS THE DOSAGE SECTION NOW. .kitHow held two sentences
          of "how to take it" while the page sold a bottle on its own; step
          one here is that same instruction, and steps two and three are the
          guide, the recipes and the tracker she is now being sold with it.
          HOW_HEAD and HOW_BODY are still exported and still gated. */}
      <section className="kitSec kitPlan">
        <p className="kitEyebrow">{PLAN_EYEBROW}</p>
        <h2 className="kitH2">{PLAN_HEAD}</h2>
        <ol className="kitSteps">
          <li>
            <b>{PLAN_STEP_1}</b>
            <span>{PLAN_STEP_1_BODY}</span>
          </li>
          <li>
            <b>{PLAN_STEP_2}</b>
            <span>{PLAN_STEP_2_BODY}</span>
          </li>
          <li>
            <b>{PLAN_STEP_3}</b>
            <span>{PLAN_STEP_3_BODY}</span>
          </li>
        </ol>
      </section>

      {/* ONE WOMAN IN HER OWN WORDS, DIRECTLY ABOVE THE PRICE. David, 30
          October. It is the same screenshot the proof zone carries further
          down; here it is the last thing she reads before the cost. */}
      <section className="kitSec kitPreOffer" data-proof="pre-offer">
        <FacebookComment />
      </section>

      {/* ------------------------------------------------ 6. the offer ----
          Lower than it was, which is the brief's call: the page now names
          the package, shows it, proves it and explains it before it asks.
          Same card, same two options, SAME CART LINKS. */}
      <section className="kitBand offer" ref={offer}>
        <KitOffer outcome={outcome} angle={angle.slug} />
      </section>

      {/* -------------------------------------------- 7. the guarantee ----
          Directly under the price, where it has been since 16 October. The
          guarantee is the answer to the price. */}
      <section className="kitBand teal">
        <KitGuarantee />
      </section>

      {/* ------------------------------------------ 8. the full review wall ----
          REORDERED 30 October, David: the women on camera, the photographs
          and the Facebook comment come FIRST, and the live Okendo wall sits
          directly under them as the full set.

          It was the other way round, which buried nine videos and twelve
          faces below a list of text reviews she had to scroll past. The
          things she can see now lead, and "every review" closes the zone.

          THE READ-ALL ANCHOR MOVED DOWN WITH THE REVIEWS. It was on this
          section, which was right while the wall opened it; after the
          re-order that landed her on the videos, which is not what "read all
          171 reviews" promises. It is on the reviews themselves now. */}
      <section className="kitBand surface kitStrip" data-proof="wall">
        <p className="kitEyebrow">{PROOF_EYEBROW}</p>
        <h2 className="kitH2">{PROOF_HEAD}</h2>

        <VideoWall />
        <FacebookComment />

        <Faces count={12} />
        <div className="kitRevs" data-proof="lead">
          {proof.lead.map((r) => <Quote key={r.name} review={r} />)}
        </div>

        {/* AND THEN EVERY REVIEW, read live from Okendo and carrying its
            mark. Its own heading, so the block below reads as the full set
            rather than as more of the same, and the id the Read-all link
            points at: she asked for the reviews, so she lands on them. */}
        <div id="all-reviews" className="okZone">
        <h3 className="kitH3 okHead">{PROOF_MORE_HEAD}</h3>
        <OkendoWall
          fallback={(
            <>
              <RatingBadge />
              <div className="kitRevs" data-proof="more">
                {proof.more.map((r) => <Quote key={r.name} review={r} />)}
              </div>
            </>
          )}
        />
        </div>
        <p className="kitNote">{PROOF_NOTE}</p>
      </section>

      {/* ------------------------------------------------- 9. questions ---- */}
      <section className="kitSec">
        <p className="kitEyebrow">{KIT_FAQ_EYEBROW}</p>
        <h2 className="kitH2">{KIT_FAQ_HEAD}</h2>
        <div className="kitFaq">
          {KIT_FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* --------------------------- 10. one last review, and the button ---- */}
      <section className="kitBand close kitClose">
        <div data-proof="closing"><Quote review={proof.closing} long /></div>
        <h2 className="kitH2">{KIT_CLOSE_HEAD}</h2>
        <a
          className="cta kitBtn" href={href} data-offer="single" data-close
          onClick={() => track.checkout(outcome, SINGLE_AFTER_DISCOUNT, 'single', 'quiz-kit-close')}
        >
          {CLOSE_CTA} &nbsp;&rarr;
        </a>
        <p className="kitNote">
          {money(SINGLE_AFTER_DISCOUNT)} · {SINGLE_DISCOUNT_NOTE} · 60-day money-back guarantee
        </p>
      </section>

      <p className="fine" ref={foot}>*{OFFER_DISCLAIMER}</p>

      {sticky && createPortal((
        <div className="kitSticky">
          {/* The day rate, not the ticket price. $74.99 beside a button is
              the number she has to justify; $1.25 a day is the one she can
              picture. Derived from PROTOCOL_PRICE / 60, so it follows the
              price rather than being typed beside it. */}
          <span className="kitStickyFrom">From {singleDailyPrice()} a day</span>
          {/* THIS TAKES HER TO THE OFFER, IT DOES NOT BUY. She is somewhere
              down a long page with no price in view; the honest move is to
              put the choice back in front of her and let her pick, not to
              decide for her from a bar she half-read. The buy events still
              come from the cards themselves, so nothing double-counts. */}
          <button type="button" className="cta kitBtn" data-sticky onClick={toOffer}>
            {STICKY_CTA}
          </button>
        </div>
      ), document.body)}
    </Screen>
  );
}
