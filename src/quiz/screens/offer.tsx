import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuiz } from '../context';
import { Screen, ScreenTitle } from '../../components/Screen';
import { OkendoWall } from '../../components/OkendoWall';
import { VideoWall } from '../../components/VideoWall';
import { mainConcern, stateKey } from '../../lib/logic';
import { OFFER_DISCLAIMER, triedLine } from '../../lib/content';
/* KIT_PIECES, KIT_PIECE_IDS, KIT_PIECES_TITLE and KIT_FOCUS_CLAIM are no
   longer imported. The "What's inside" rows were the same four things the
   kit card's own value stack already lists, with prices, directly under a
   photograph of all four. David called it on 16 October: it was the offer
   said twice. The copy is still exported and still under the claim gate.
   The structure-function line that rode on the bottle row is not lost
   either: "DIM. Supports healthy estrogen metabolism." says it in the
   ingredient table a section below. */
import {
  CLOSE, KIT_CLOSE, KIT_INTRO, KIT_TITLE, PRI, WHY60, WHY60_TITLE,
  cardAcks, meansFor, threeCards, underCardAcks,
} from '../../lib/resultCopy';
import {
  FacebookComment, Faces, PhotoRail, PressRail, Quote, RatingBadge,
} from '../../components/Proof';
import { kitProof } from '../../lib/reviews';
import { PROTOCOL_PRICE, dailyPrice, money } from '../../lib/offer';
import { INGREDIENTS } from '../../lib/offerCopy';
import {
  CLOSE_CTA, CLOSE_HEAD, HF_BODY, HF_EYEBROW, HF_HEAD, HERO_CTA, HERO_EYEBROW, HERO_HEAD,
  HERO_HEAD_DEFAULT, HERO_RISK, HERO_SUB, KIT_FAQ, KIT_FAQ_EYEBROW, KIT_FAQ_HEAD,
  MECH_EYEBROW, MECH_HEAD, PLAN_EYEBROW, PLAN_HEAD, PLAN_STEP_1, PLAN_STEP_1_BODY,
  PLAN_STEP_2, PLAN_STEP_3, PROOF_EYEBROW, PROOF_HEAD, PROOF_NOTE, STICKY_CTA,
  TRUST_LEAD,
} from '../../lib/kitCopy';
import { KitGuarantee, KitOffer, kitHref } from '../../components/KitOffer';
import { SHOT_KIT } from '../../lib/offer';
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
  const tried = triedLine(S);
  const cards = threeCards(S);
  const acks = cardAcks(S, cards);
  const underAcks = underCardAcks(S);
  /* Rebuilt once she is in a browser, for the reason in useHydrated.ts: the
     server has no sessionStorage, so this link was being served with her
     attribution missing and never rebuilt. */
  const hydrated = useHydrated();
  const href = useMemo(() => kitHref(outcome, angle.slug), [outcome, angle.slug, hydrated]);

  /* Her two symptom cards and the tracker, which is always the third. Split
     rather than re-derived, so the one source of truth stays threeCards(). */
  const tips = cards.filter((id) => id !== 'track');

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
          Everything the brief puts on the first screen: her stage, the
          outcome she came for, how it works in one line, two forms of proof,
          a button, and the risk taken off it. */}
      <section className="kitHero">
        <p className="kitHeroEyebrow">{HERO_EYEBROW[stageOf(outcome)]}</p>
        <ScreenTitle className="kitHeroH1">
          {main ? HERO_HEAD[main] : HERO_HEAD_DEFAULT}
        </ScreenTitle>
        <p className="kitHeroSub">{HERO_SUB}</p>

        <img
          className="kitHeroShot" src={SHOT_KIT}
          alt="The 60-Day Feel Like YOU Again Kit: 2 bottles of Hormone Focus, The 60-Day Hormone Fix eBook, Hormone Healthy Recipes eBook and Daily Symptom Tracker"
          width={768} height={576} decoding="async"
        />

        {/* TWO FORMS OF PROOF, ON THE FIRST SCREEN: the rating with its count,
            and one woman in her own words. The quote is verbatim from
            reviews.ts and attributed, which is the only form the claims rules
            allow.

            THE SIX OVERLAPPED FACES CAME OUT on 16 October. The photo rail
            directly below shows all twelve of the same women at a size you
            can actually see them, so the circles were the same proof twice,
            smaller, in the one place on the page where height is scarce. */}
        <div className="kitHeroProof" data-proof="pre">
          <RatingBadge />
          {proof.lead[0] && <Quote review={proof.lead[0]} />}
        </div>

        <button type="button" className="cta kitBtn kitHeroCta" onClick={toOffer}>
          {HERO_CTA} &nbsp;&rarr;
        </button>
        <p className="kitHeroRisk">{HERO_RISK}</p>
      </section>

      {/* -------------------------------------------- 2. on the plan ----
          The old opening, in its right place. Three things, because four
          reads as more effort, and her own two cards are what step two
          actually is. Then why it runs sixty days for the concern she
          named, and JJ in her own voice. */}
      <section className="kitSec kitPlan">
        <p className="kitEyebrow">{PLAN_EYEBROW}</p>
        <h2 className="kitH2">{PLAN_HEAD}</h2>
        {tried && <p className="kitBody">{tried}</p>}

        <ol className="planSteps">
          <li>
            <b className="planStepT">{PLAN_STEP_1}</b>
            <span className="planStepB">{PLAN_STEP_1_BODY}</span>
          </li>
          <li>
            <b className="planStepT">{PLAN_STEP_2}</b>
            {/* Her cards, with what she has already tried acknowledged inside
                the one it belongs to. */}
            <div className="priCards">
              {tips.map((id) => (
                <div key={id} className="priCard">
                  <b>{PRI[id].title}</b>
                  {acks[id] && <span className="priAck">{acks[id]}</span>}
                  <span>{PRI[id].body}</span>
                </div>
              ))}
            </div>
          </li>
          <li>
            <b className="planStepT">{PLAN_STEP_3}</b>
            <div className="priCards">
              <div className="priCard">
                <b>{PRI.track.title}</b>
                <span>{PRI.track.body}</span>
              </div>
            </div>
          </li>
        </ol>

        {underAcks.map((line) => <p className="kitBody" key={line}>{line}</p>)}

        {/* Why sixty days, under its own heading, said about the thing she
            actually came for. */}
        {main && (
          <div className="why60">
            <p className="why60T">{WHY60_TITLE}</p>
            <p>{WHY60[main]}</p>
          </div>
        )}

        <div className="nextHow">
          <p className="nextHowQ">{KIT_TITLE}</p>
          {KIT_INTRO.map((para, i) => (
            <p key={para} className={i === 0 ? 'lead' : undefined}>{para}</p>
          ))}
          <p>{KIT_CLOSE}</p>
          <p className="nextSign">JJ Smith</p>
        </div>
      </section>

      {/* ------------------------------------------- 3. why it works ----
          The one thing that makes this more than the free advice she could
          have had: it is aimed at the hormones, which is why trying harder
          has not worked. The two sentences under the heading are her own
          result page, so no new claim arrives with the new section. */}
      <section className="kitSec kitMech">
        <p className="kitEyebrow">{MECH_EYEBROW}</p>
        <h2 className="kitH2">{MECH_HEAD}</h2>
        {/* THE FIRST TWO SENTENCES, NOT THE SECOND ONE ALONE.
            The mechanism sentence is index 1 of her block, and taking it on
            its own broke outcome A: MEANS.A[1] opens "When it slips", and
            what slips is the rhythm named in the sentence before it, which
            left the paragraph starting on a pronoun with nothing to point
            at. Two sentences stand up for all three outcomes. The third,
            where there is one, is the "many women describe the same" line,
            which belongs on the result page and not here. */}
        {meansFor(outcome).slice(0, 2).map((para) => (
          <p className="kitBody" key={para}>{para}</p>
        ))}
        {main && <p className="kitBody kitMechWhy">{CLOSE[main]}</p>}
        <p className="kitBody">{HF_BODY}</p>

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

      {/* ------------------------------------------ 4. trust and proof ----
          EVERY PROOF BLOCK THE PAGE ALREADY HAD, GATHERED INTO ONE ZONE and
          moved above the price. Not one of them is new and not one was
          rebuilt: the photo rail, the press marks, the live Okendo wall with
          its authored fallback, the nine women on camera, the Facebook
          comment, the twelve faces and the three named testimonials are the
          same components with the same props they had when they were split
          across two sections further down.

          The order is the brief's: the women, where JJ has been seen, what
          customers wrote, what they said on camera, the comment, then the
          three long ones.

          LIVE FROM OKENDO, the same store and product JJ's page reads, so the
          two cannot disagree about what customers said. The authored reviews
          are the fallback: if Okendo is slow, blocked or down she reads
          customers rather than a spinner. */}
      <section className="kitSec kitStrip" id="all-reviews" data-proof="rail">
        {/* WHO SHE IS, FOR SOMEONE WHO HAS NEVER HEARD OF HER. Cold traffic
            only: a woman who arrived from JJ's own list is being introduced
            to someone she already follows, which reads as a page that has
            not noticed who it is talking to. Same flag the email screen is
            stepped over on. */}
        {!S.skipEmail && <p className="kitTrustLead">{TRUST_LEAD}</p>}

        <p className="kitEyebrow">{PROOF_EYEBROW}</p>
        <h2 className="kitH2">{PROOF_HEAD}</h2>

        <PhotoRail />
        <PressRail />

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

        <VideoWall />
        <FacebookComment />

        <Faces count={12} />
        <div className="kitRevs" data-proof="lead">
          {proof.lead.slice(1).map((r) => <Quote key={r.name} review={r} />)}
        </div>
        <p className="kitNote">{PROOF_NOTE}</p>
      </section>

      {/* ------------------------------------------------ 5. the offer ----
          Moved up from section six. Same cards, same prices, same cart
          links; the one-time bottle is off the page and the subscription is
          the single alternative. */}
      <section className="kitBand" ref={offer}>
        <KitOffer outcome={outcome} angle={angle.slug} />
      </section>

      {/* -------------------------------------------- 6. the guarantee ----
          MOVED UP 16 OCTOBER, at David's request: it used to sit five
          sections below, after the questions. The guarantee is the answer to
          the price, so it belongs against the price. */}
      <section className="kitBand teal">
        <KitGuarantee />
      </section>

      {/* ------------------------------------------------- 7. questions ---- */}
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

      {/* ---------------------------- 8. one last review, and the button ---- */}
      <section className="kitSec kitClose">
        <div data-proof="closing"><Quote review={proof.closing} long /></div>
        <h2 className="kitH2">{CLOSE_HEAD}</h2>
        <a
          className="cta kitBtn" href={href} data-offer="protocol" data-close
          onClick={() => track.checkout(outcome, PROTOCOL_PRICE, 'protocol', 'quiz-kit-close')}
        >
          {CLOSE_CTA} &nbsp;&rarr;
        </a>
        <p className="kitNote">{money(PROTOCOL_PRICE)} · free shipping · 60-day money-back guarantee</p>
      </section>

      <p className="fine" ref={foot}>*{OFFER_DISCLAIMER}</p>

      {/* PORTALLED TO <body> ON PURPOSE, and this is not a style choice.
          The screen wrapper .rise keeps a transform after its entrance
          animation: matrix(1,0,0,1,0,0), an identity, but not `none`. A
          transformed ancestor becomes the containing block for its fixed
          descendants, so position:fixed anchored to .rise instead of the
          viewport and this bar rendered 8,694px down the page, present and
          visible in the DOM and never once on screen. Out here it cannot
          happen again whatever an ancestor does. */}
      {sticky && createPortal((
        <div className="kitSticky">
          {/* The day rate, not the ticket price. $74.99 beside a button is
              the number she has to justify; $1.25 a day is the one she can
              picture. Derived from PROTOCOL_PRICE / 60, so it follows the
              price rather than being typed beside it. */}
          <span className="kitStickyFrom">From {dailyPrice()} a day</span>
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
