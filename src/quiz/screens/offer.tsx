import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuiz } from '../context';
import { Screen, ScreenTitle } from '../../components/Screen';
import { OkendoWall } from '../../components/OkendoWall';
import { VideoWall } from '../../components/VideoWall';
import { mainConcern, stateKey } from '../../lib/logic';
import {
  NEXT_EYEBROW, OFFER_DISCLAIMER, triedLine,
} from '../../lib/content';
import {
  BRIDGE, KIT_CLOSE, KIT_FOCUS_CLAIM, KIT_INTRO, KIT_PIECES, KIT_PIECES_TITLE,
  KIT_PIECE_IDS, KIT_TITLE, PRI, START_TITLE, WHY60, WHY60_TITLE,
  cardAcks, threeCards, underCardAcks,
} from '../../lib/resultCopy';
import { FacebookComment, Faces, Quote, RatingBadge } from '../../components/Proof';
import { kitProof } from '../../lib/reviews';
import { PROTOCOL_PRICE, dailyPrice, money } from '../../lib/offer';
import { INGREDIENTS } from '../../lib/offerCopy';
import {
  CLOSE_CTA, CLOSE_HEAD, HF_BODY, HF_EYEBROW, HF_HEAD, KIT_CTA, KIT_FAQ, KIT_FAQ_EYEBROW,
  KIT_FAQ_HEAD, PROOF_ALL_LINK, PROOF_EYEBROW, PROOF_HEAD, PROOF_MORE_HEAD,
  PROOF_NOTE, WHY_BODY,
  WHY_EYEBROW, WHY_HEAD,
} from '../../lib/kitCopy';
import { KitGuarantee, KitOffer, kitHref } from '../../components/KitOffer';
import { track } from '../../lib/analytics';

/* ---------------------------------------------------------------- r2 ---- */

/* WHERE TO START, AND THEN THE KIT. One page she scrolls, not a run of
   screens she taps through.
 *
 * REORDERED 8 OCTOBER 2026, to Jane's pack. The page used to open "Your 60-day
 * plan for your weight", which promised a plan before she had read one. It now
 * says where to start, gives her the three things, names the hard part about
 * doing them (the bridge), and only then offers the Kit as the answer to that.
 *
 * The order: where to start, named for the concern she picked; her three
 * things; the bridge; the Kit, its opening, why it runs sixty days for HER
 * concern, and the four pieces; women who have done it, before the price; the
 * offer; more proof, why sixty days, the formula, the guarantee, questions,
 * one last review and the button again.
 *
 * The ingredient sentences (DIM, Calcium D-Glucarate, BioPerine) are not on
 * this page any more. They are on the offer page below, where she is reading
 * about the product rather than about what to do next. */
/** Respect the setting rather than animate over it. */
const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function R2() {
  const { S, angle } = useQuiz();
  const outcome = stateKey(S);
  const main = mainConcern(S);
  const proof = kitProof(main);
  const tried = triedLine(S);
  const cards = threeCards(S);
  const acks = cardAcks(S, cards);
  const underAcks = underCardAcks(S);
  const href = kitHref(outcome, angle.slug);

  /* The bar shows wherever the page has no call to action of its own in
     view, and stays off the legal text at the foot.
   *
   * It used to watch only the offer block, with an IntersectionObserver that
   * fired on `boundingClientRect.bottom < 0`. That is true only once the
   * block is entirely above the viewport, which on this page meant the bar
   * appeared at the very bottom and nowhere else — and there it sat on top
   * of the disclaimer. Both regions are measured now, the way Jane's
   * landing page does it. */
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

    /* NOT ON ARRIVAL. The bar used to be up before she had moved, which
       reads as a pop-up rather than something the page offered her. One
       screen of scrolling first: by then she is reading, and the bar is a
       way back to the price rather than an interruption of the first
       sentence. */
    const SCROLLED_ENOUGH = () => window.scrollY > window.innerHeight * 0.75;

    const update = () => setSticky(
      SCROLLED_ENOUGH()
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

  return (
    <Screen id="r2">
      <p className="eyebrow">{NEXT_EYEBROW}</p>
      <ScreenTitle className="rTitle">
        {main ? START_TITLE[main] : 'Start with these 3'}
      </ScreenTitle>

      {/* Her first three things, chosen from what she ticked rather than a
          generic list, with what she has already tried acknowledged inside
          the card it belongs to. Three, never more. Then the kit as the
          answer to the question the three raise. */}
      <div className="block">
        {tried && <p>{tried}</p>}
        <div className="priCards">
          {cards.map((id) => (
            <div key={id} className="priCard">
              <b>{PRI[id].title}</b>
              {acks[id] && <span className="priAck">{acks[id]}</span>}
              <span>{PRI[id].body}</span>
            </div>
          ))}
        </div>
        {underAcks.map((line) => <p key={line}>{line}</p>)}
      </div>

      {/* The hard part, named before the thing that helps with it. */}
      <p className="bridge">{BRIDGE}</p>

      <div className="nextHow">
        <p className="nextHowQ">{KIT_TITLE}</p>
        {KIT_INTRO.map((para, i) => (
          <p key={para} className={i === 0 ? 'lead' : undefined}>{para}</p>
        ))}

        {/* Why sixty days, under its own heading, said about the thing she
            actually came for. */}
        {main && (
          <div className="why60">
            <p className="why60T">{WHY60_TITLE}</p>
            <p>{WHY60[main]}</p>
          </div>
        )}

        {/* One row per piece: an image slot on the left, one line on the
            right. The slots are empty until David supplies the pictures.
            `kitPieceShot` and not `kitShot`: that one is already the product
            photograph on the offer below, and reusing it restyled the wrong
            image. */}
        <p className="blabel kitPiecesT">{KIT_PIECES_TITLE}</p>
        <div className="kitRows">
          {KIT_PIECE_IDS.map((id) => (
            <div key={id} className={`kitRow kitRow-${id}`}>
              <div className="kitPieceShot" data-kit-shot={id} aria-hidden="true" />
              <div className="kitSay">
                <span>{KIT_PIECES[id]}</span>
                {/* The claim is never the headline: it sits under the dose
                    line, small, on the bottle row alone. */}
                {id === 'focus' && <small className="kitClaim">{KIT_FOCUS_CLAIM}</small>}
              </div>
            </div>
          ))}
        </div>

        <p>{KIT_CLOSE}</p>
        <p className="nextSign">JJ Smith</p>
      </div>

      {/* Women who have done it, before she reaches the price. */}
      <section className="kitSec preProof" data-proof="pre">
        <p className="kitEyebrow">{PROOF_EYEBROW}</p>
        <h2 className="kitH2">{PROOF_HEAD}</h2>
        <Faces count={6} />
        <RatingBadge />
        {proof.lead[0] && <Quote review={proof.lead[0]} />}
        <FacebookComment />
        {/* A way down to all of them, rather than asking her to scroll and
            hope. Same move as JJ's page: the rating is the link. */}
        <a className="kitAllRevs" href="#all-reviews">{PROOF_ALL_LINK}</a>
      </section>

      {/* ------------------------------------------------ the offer ---- */}
      <section className="kitBand" ref={offer}>
        <KitOffer outcome={outcome} angle={angle.slug} />
      </section>

      {/* THE GUARANTEE ANSWERS THE PRICE, so it follows it rather than
          sitting five screens below. The questions follow the guarantee for
          the same reason: both are what she wants the moment she has seen
          what it costs. David's order. */}
      <section className="kitBand teal">
        <KitGuarantee />
      </section>

      {/* ------------------------------------------------- questions ---- */}
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


      {/* ------------------------------------------- proof, block 1 ---- */}
      <section className="kitSec">
        <Faces count={12} />
        <div className="kitRevs" data-proof="lead">
          {proof.lead.slice(1).map((r) => <Quote key={r.name} review={r} />)}
        </div>
        <p className="kitNote">{PROOF_NOTE}</p>
      </section>

      {/* ------------------------------------------------ why 60 days ---- */}
      <section className="kitSec">
        <p className="kitEyebrow">{WHY_EYEBROW}</p>
        <h2 className="kitH2">{WHY_HEAD}</h2>
        {WHY_BODY.map((p) => <p className="kitBody" key={p}>{p}</p>)}
      </section>

      {/* ---------------------------------- Hormone Focus, the formula ---- */}
      <section className="kitSec">
        <p className="kitEyebrow">{HF_EYEBROW}</p>
        <h2 className="kitH2">{HF_HEAD}</h2>
        <p className="kitBody">{HF_BODY}</p>
        <div className="kitMg">
          {INGREDIENTS.map(([dose, name, what]) => (
            <div key={name}>
              <b>{dose}</b>
              <span><strong>{name}.</strong> {what}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------- proof, block 2 ----
          LIVE FROM OKENDO, the same store and product JJ's page reads, so the
          two cannot disagree about what customers said. The authored reviews
          below are the fallback: if Okendo is slow, blocked or down she reads
          customers rather than a spinner. */}
      <section className="kitSec" id="all-reviews">
        <h2 className="kitH2">{PROOF_MORE_HEAD}</h2>
        {/* Nine of them on camera, before the written ones. */}
        <VideoWall />
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
        <p className="kitNote">{PROOF_NOTE}</p>
      </section>

      {/* --------------------------------------------- the guarantee ---- */}
      {/* ------------------------------- one last review, and the button ---- */}
      <section className="kitSec kitClose">
        <div data-proof="closing"><Quote review={proof.closing} long /></div>
        <h2 className="kitH2">{CLOSE_HEAD}</h2>
        <a
          className="cta kitBtn" href={href} data-offer="protocol" data-close
          onClick={() => track.checkout(outcome, PROTOCOL_PRICE)}
        >
          {CLOSE_CTA} &nbsp;&rarr;
        </a>
        <p className="kitNote">{money(PROTOCOL_PRICE)} · free shipping · 60-day money-back guarantee</p>
      </section>

      <p className="fine" ref={foot}>*{OFFER_DISCLAIMER}</p>

      {/* PORTALLED TO <body> ON PURPOSE, and this is not a style choice.
          The screen wrapper .rise keeps a transform after its entrance
          animation — matrix(1,0,0,1,0,0), an identity, but not `none`. A
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
          <button
            type="button" className="cta kitBtn" data-sticky
            onClick={() => offer.current?.scrollIntoView({
              behavior: prefersReducedMotion() ? 'auto' : 'smooth',
              block: 'start',
            })}
          >
            {KIT_CTA}
          </button>
        </div>
      ), document.body)}
    </Screen>
  );
}
