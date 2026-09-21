import { SHOP_BASE } from '../lib/logic';
import { shopUrl, track } from '../lib/analytics';
import {
  DEFAULT_OFFER, GUARANTEE_SEAL, GUARANTEE_DAYS, NEXT_BATCH, SHOW_BATCH_LINE,
  SHOW_DAILY_PRICE, type OfferCard, batchCount, dailyPrice, offerCards, optionFor,
} from '../lib/offer';
import { ValueStack } from './BuyOptions';
import {
  GUARANTEE_HEADLINE, GUARANTEE_LINK_TEXT, GUARANTEE_SUB_PRE, GUARANTEE_SUB_REST,
  REFUND_POLICY_URL, batchLine, liveDeadlineLine,
} from '../lib/offerCopy';

/* Two glyphs, inline, because two icons do not earn a sprite request. */

function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true"
    >
      <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <rect x="2" y="7" width="14" height="10" rx="2" />
      <path d="M16 10h3l3 3v4h-6z" />
      <circle cx="6.5" cy="19" r="1.8" />
      <circle cx="18" cy="19" r="1.8" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <path d="M5 12h13" /><path d="M12 5l7 7-7 7" />
    </svg>
  );
}

interface CardProps {
  card: OfferCard;
  outcome: string;
  angle: string;
}

/**
 * One offer, complete.
 *
 * Each card carries its own button rather than feeding a shared one. Three
 * prices with one button underneath asks her to hold a selection in her head
 * while she reads; three buttons let her decide and act in the same gesture,
 * which is the whole reason this layout reads calmer than the rows did.
 */
function Card({ card, outcome, angle }: CardProps) {
  const href = shopUrl(SHOP_BASE, outcome, angle, card.kind);
  const price = optionFor(card.kind).price;

  return (
    <div className="ocCol">
      <div className={`oc oc-${card.kind}`}>
        {card.badge && <div className="ocBadge">{card.badge}</div>}

        {/* Shots and words are one unit, so they can sit as a column on a
            desktop and as a row on a phone — picture left, price right —
            without either one moving independently. Jane's page does the
            same, with the same two wrappers. */}
        <div className="ocHead">
          <div className="ocShots">
            <img src={card.shot} alt="" width={300} height={380} loading="lazy" decoding="async" />
            {card.shotGuide && (
              <img
                className="ocShotGuide" src={card.shotGuide} alt=""
                width={220} height={280} loading="lazy" decoding="async"
              />
            )}
          </div>

          <div className="ocMain">
            <p className="ocKicker">{card.kicker}</p>
            <p className="ocSupply">{card.supply}</p>

            <p className="ocPrice">
              {card.was && <span className="ocWas">{card.was}</span>}
              <span className="ocNow">{card.now}</span>
            </p>
            <p className="ocDay">{card.perDay} a day</p>
            <p className="ocTerms">{card.terms}</p>

            {card.saving && (
              <p className="ocShip"><TruckIcon /> Save {card.saving}</p>
            )}
          </div>
        </div>

        {/* Pushes the button to the bottom so three cards of different
            heights still line their buttons up on a desktop. */}
        <div className="ocFill" />

        {card.bonus && (
          <p className="ocBonus">
            <img src={card.shotGuide ?? card.shot} alt="" width={90} height={110} loading="lazy" />
            <span><b>Bonus:</b> {card.bonus}</span>
          </p>
        )}

        {/* Same tab. No rel — noreferrer would strip the Referer Shopify
            attributes on, and noopener means nothing without a new window. */}
        <a
          className={`cta ocCta${card.kind === 'protocol' ? '' : ' ocCtaSoft'}`}
          href={href}
          data-offer={card.kind}
          onClick={() => track.checkout(outcome, price)}
        >
          {card.cta} <Arrow />
        </a>
      </div>

      <p className="ocGuarantee">
        <ShieldIcon /> <span>{GUARANTEE_DAYS}-day money-back guarantee</span>
      </p>
    </div>
  );
}

/**
 * The guarantee, said once and said loudly.
 *
 * It sits under all three cards rather than inside each, because it is the
 * same promise whichever she picks, and because a seal repeated three times
 * is decoration where a seal shown once is a guarantee.
 */
export function GuaranteePanel() {
  return (
    <div className="ocGuard" data-af="guarantee">
      <img
        className="ocSeal" src={GUARANTEE_SEAL} alt=""
        width={180} height={170} loading="lazy" decoding="async"
      />
      <div className="ocGuardText">
        {/* Jane's wording, unchanged: the promise leads and the policy backs
            it. Only the seal beside it is new. */}
        <p className="ocGuardLead">{GUARANTEE_HEADLINE}</p>
        <p className="ocGuardBody">
          {GUARANTEE_SUB_PRE}
          <a href={REFUND_POLICY_URL} target="_blank" rel="noopener noreferrer">
            {GUARANTEE_LINK_TEXT}
          </a>
          {GUARANTEE_SUB_REST}
        </p>
      </div>
    </div>
  );
}

interface Props {
  /** Carried to the cart as hf_outcome. */
  outcome: string;
  /** Carried to the cart as utm_term, unless the ad sent one. */
  angle: string;
  /** Jane's rule: the Live sells the two-bottle plan and nothing else. */
  live?: boolean;
}

/** The offers, side by side on a desktop and stacked on a phone. */
export function OfferCards({ outcome, angle, live = false }: Props) {
  const cards = offerCards().filter((c) => !(live && c.kind === 'subscribe'));
  const deadline = live ? liveDeadlineLine() : null;

  return (
    <div className="ocWrap">
      {/* data-af="cta" marks where the offer begins. The fold budget asks
          that she can SEE it start without scrolling; three stacked cards
          cannot fit a 390px phone entirely, and Jane's own landing page does
          not try — its offers are a band partway down. */}
      <div className="ocGrid" data-af="cta">
        {cards.map((card, i) => (
          <div className="ocSlot" key={card.kind}>
            {i > 0 && <p className="ocOr"><span>or</span></p>}
            <Card card={card} outcome={outcome} angle={angle} />
          </div>
        ))}
      </div>
      {/* The Plan's day rate, said in her terms. The cards carry the number;
          this is the sentence that makes the number mean something, and it
          was on the page before the cards were. */}
      {SHOW_DAILY_PRICE && !live && (
        <p className="buyDaily ocLine">
          {dailyPrice()} a day. Less than the coffee that stopped helping.
        </p>
      )}

      {deadline && <p className="buyDeadline ocLine">{deadline}</p>}

      {/* True scarcity, said once, and never a countdown. On a Live the
          deadline IS the scarcity, so the batch line stands down rather than
          stacking a second reason to hurry under the first. */}
      {SHOW_BATCH_LINE && !deadline && (
        <p className="buyBatch ocLine">{batchLine(batchCount(), NEXT_BATCH)}</p>
      )}

      <GuaranteePanel />

      {/* What she gets, named line by line. The cards carry the prices; this
          carries the argument for them, and it is the Plan's because the
          Plan is what the page sells. */}
      <ValueStack kind={DEFAULT_OFFER} />
    </div>
  );
}
