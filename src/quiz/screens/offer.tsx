import { useEffect, useRef, useState } from 'react';
import { useQuiz } from '../context';
import { Screen, ScreenTitle } from '../../components/Screen';
import { OkendoWall } from '../../components/OkendoWall';
import { mainConcern, stateKey } from '../../lib/logic';
import {
  NEXT_BRIDGE, NEXT_EYEBROW, NEXT_HOW, NEXT_HOW_PIECES, NEXT_INTRO, NEXT_LEAD, NEXT_STEPS,
  OFFER_DISCLAIMER, nextTitle, triedLine,
} from '../../lib/content';
import { FacebookComment, Faces, Quote, RatingBadge } from '../../components/Proof';
import { kitProof } from '../../lib/reviews';
import { PROTOCOL_PRICE, money } from '../../lib/offer';
import { INGREDIENTS } from '../../lib/offerCopy';
import {
  CLOSE_CTA, CLOSE_HEAD, HF_BODY, HF_EYEBROW, HF_HEAD, KIT_CTA, KIT_FAQ, KIT_FAQ_EYEBROW,
  KIT_FAQ_HEAD, PROOF_EYEBROW, PROOF_HEAD, PROOF_MORE_HEAD, PROOF_NOTE, WHY_BODY,
  WHY_EYEBROW, WHY_HEAD,
} from '../../lib/kitCopy';
import { KitGuarantee, KitOffer, kitHref } from '../../components/KitOffer';
import { track } from '../../lib/analytics';

/* ---------------------------------------------------------------- r2 ---- */

/* HER 60 DAYS, AND THE KIT. One page she scrolls, not a run of screens she
   taps through.
 *
 * The order: her 60-day plan, named for the concern she picked; the five
 * things to do; the question she is asking (how?); the kit as the answer,
 * piece by piece; women who have done it, before the price; the offer; more
 * proof, why sixty days, the formula, the guarantee, questions, one last
 * review and the button again. */
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

    const update = () => setSticky(
      !onScreen(offer.current, 0.85) && !onScreen(foot.current, 1),
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
      <ScreenTitle className="rTitle">{nextTitle(main)}</ScreenTitle>

      {/* What to do, then the question she is already asking, then the kit as
          the answer to it, piece by piece. */}
      <div className="block">
        {tried && <p>{tried}</p>}
        <p className="lead">{NEXT_LEAD}</p>
        <p>{NEXT_INTRO}</p>
        <ul className="nextList">
          {NEXT_STEPS.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>

      <div className="nextHow">
        <p className="nextHowQ">{NEXT_HOW}</p>
        <p className="lead">{NEXT_BRIDGE}</p>
        <div className="nextPieces">
          {NEXT_HOW_PIECES.map(([what, does]) => (
            <div key={what}><b>{what}</b><span>{does}</span></div>
          ))}
        </div>
        <p className="nextSign">JJ Smith</p>
      </div>

      {/* Women who have done it, before she reaches the price. */}
      <section className="kitSec preProof" data-proof="pre">
        <p className="kitEyebrow">{PROOF_EYEBROW}</p>
        <h2 className="kitH2">{PROOF_HEAD}</h2>
        <Faces count={6} />
        <RatingBadge />
        {proof.lead[0] && <Quote review={proof.lead[0]} />}
      </section>

      {/* ------------------------------------------------ the offer ---- */}
      <section className="kitBand" ref={offer}>
        <KitOffer outcome={outcome} angle={angle.slug} />
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
      <section className="kitSec">
        <h2 className="kitH2">{PROOF_MORE_HEAD}</h2>
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
        <FacebookComment />
        <p className="kitNote">{PROOF_NOTE}</p>
      </section>

      {/* --------------------------------------------- the guarantee ---- */}
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

      {sticky && (
        <div className="kitSticky">
          <span><b>{money(PROTOCOL_PRICE)}</b> free shipping</span>
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
      )}
    </Screen>
  );
}
