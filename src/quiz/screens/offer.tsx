import { useEffect, useRef, useState } from 'react';
import { useQuiz } from '../context';
import { Screen, ScreenTitle } from '../../components/Screen';
import { mainConcern, stateKey } from '../../lib/logic';
import {
  NEXT_BRIDGE, NEXT_INTRO, NEXT_LEAD, NEXT_STEPS, NEXT_TITLE, OFFER_DISCLAIMER, triedLine,
} from '../../lib/content';
import { FacebookComment, Faces, Quote, RatingBadge } from '../../components/Proof';
import { kitProof } from '../../lib/reviews';
import { KIT_CONTENTS, PROTOCOL_PRICE, money } from '../../lib/offer';
import { INGREDIENTS } from '../../lib/offerCopy';
import {
  CLOSE_CTA, CLOSE_HEAD, HF_BODY, HF_EYEBROW, HF_HEAD, KIT_CTA, KIT_FAQ, KIT_FAQ_EYEBROW,
  KIT_FAQ_HEAD, PARTS_EYEBROW, PARTS_HEAD, PROOF_EYEBROW, PROOF_HEAD, PROOF_MORE_HEAD,
  PROOF_NOTE, WHY_BODY, WHY_EYEBROW, WHY_HEAD,
} from '../../lib/kitCopy';
import { KitGuarantee, KitOffer, kitHref } from '../../components/KitOffer';
import { track } from '../../lib/analytics';

/* ---------------------------------------------------------------- r2 ---- */

/* WHAT TO DO NEXT, AND THE KIT. One page she scrolls, not a run of screens
   she taps through.
 *
 * The order is the brief's: what to do, the kit, proof, why sixty days, what
 * Hormone Focus is, more proof, the guarantee, questions, one last review
 * and the button again. The reviews sit after the result on purpose. She has
 * already thought "this sounds like me"; now she is deciding. */
export function R2() {
  const { S, angle } = useQuiz();
  const outcome = stateKey(S);
  const proof = kitProof(mainConcern(S));
  const tried = triedLine(S);
  const href = kitHref(outcome, angle.slug);

  /* The bar appears once the offer has scrolled away above her, so there is
     never a second buy button on screen beside the first. */
  const offer = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    const el = offer.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setSticky(!entry.isIntersecting && entry.boundingClientRect.bottom < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Screen id="r2">
      <p className="eyebrow">Your next step</p>
      <ScreenTitle className="rTitle">{NEXT_TITLE}</ScreenTitle>

      <div className="block">
        {tried && <p>{tried}</p>}
        <p className="lead">{NEXT_LEAD}</p>
        <p>{NEXT_INTRO}</p>
        <ul className="nextList">
          {NEXT_STEPS.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <p className="lead">{NEXT_BRIDGE}</p>
      </div>

      {/* ------------------------------------------------ the offer ---- */}
      <section className="kitBand" ref={offer}>
        <KitOffer outcome={outcome} angle={angle.slug} />
      </section>

      {/* ------------------------------------------- proof, block 1 ---- */}
      <section className="kitSec">
        <p className="kitEyebrow">{PROOF_EYEBROW}</p>
        <h2 className="kitH2">{PROOF_HEAD}</h2>
        <Faces count={12} />
        <RatingBadge />
        <div className="kitRevs" data-proof="lead">
          {proof.lead.map((r) => <Quote key={r.name} review={r} />)}
        </div>
        <p className="kitNote">{PROOF_NOTE}</p>
      </section>

      {/* ---------------------------------- what each part of it does ---- */}
      <section className="kitSec">
        <p className="kitEyebrow">{PARTS_EYEBROW}</p>
        <h2 className="kitH2">{PARTS_HEAD}</h2>
        <div className="formula">
          {KIT_CONTENTS.map(([what, detail]) => (
            <div className="ing" key={what}><b>{what}</b><i>{detail}</i></div>
          ))}
        </div>
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

      {/* ------------------------------------------- proof, block 2 ---- */}
      <section className="kitSec">
        <h2 className="kitH2">{PROOF_MORE_HEAD}</h2>
        <RatingBadge />
        <div className="kitRevs" data-proof="more">
          {proof.more.map((r) => <Quote key={r.name} review={r} />)}
        </div>
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

      <p className="fine">*{OFFER_DISCLAIMER}</p>

      {sticky && (
        <div className="kitSticky">
          <span><b>{money(PROTOCOL_PRICE)}</b> free shipping</span>
          <a
            className="cta kitBtn" href={href} data-offer="protocol" data-sticky
            onClick={() => track.checkout(outcome, PROTOCOL_PRICE)}
          >
            {KIT_CTA}
          </a>
        </div>
      )}
    </Screen>
  );
}
