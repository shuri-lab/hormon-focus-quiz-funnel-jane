import { useState } from 'react';
import { SHOP_BASE } from '../lib/logic';
import { shopUrl, track } from '../lib/analytics';
import {
  DEFAULT_OFFER, OFFER_OPTIONS, money, optionFor, type OfferKind,
} from '../lib/offer';
import { CART_NOTE, GUARANTEE_LEAD, GUARANTEE_REST, SHIPPING_LINE } from '../lib/offerCopy';

/**
 * THE ONE OFFER IN THE CODE.
 *
 * The offer pages and the screen at the end of the quiz render this same
 * component, so a price, a bundle or a cart rule changes in one place. The
 * rows come from OFFER_OPTIONS and the links from shopUrl(), which is where
 * the three cart modes live.
 *
 * The Protocol arrives chosen. That is the offer; the single bottle is the
 * fallback for a woman who will not start with two.
 *
 * CONTROLLED ON PURPOSE. A page shows this block twice — once in the hero and
 * once in the closer — and a woman who picks the single bottle at the top must
 * not find the Protocol re-selected at the bottom. The page owns the choice and
 * both blocks read it.
 */

export function useOfferChoice(initial: OfferKind = DEFAULT_OFFER) {
  const [chosen, setChosen] = useState<OfferKind>(initial);

  /* Only a real change is an event. Re-tapping the selected row is not. */
  const choose = (kind: OfferKind) => {
    if (kind === chosen) return;
    setChosen(kind);
    track.selectOption(kind, optionFor(kind).price);
  };

  return { chosen, choose };
}

interface Props {
  chosen: OfferKind;
  onChoose: (kind: OfferKind) => void;
  /** Carried to the cart as hf_outcome. */
  outcome: string;
  /** Carried to the cart as utm_term, unless the ad sent one. */
  angle: string;
  /** Distinguishes the hero block from the closer block for the radio group. */
  name: string;
}

export function BuyOptions({ chosen, onChoose, outcome, angle, name }: Props) {
  const option = optionFor(chosen);
  const href = shopUrl(SHOP_BASE, outcome, angle, chosen);

  return (
    <div className="buy" data-af="cta">
      <div className="buyRows" role="radiogroup" aria-label="Choose how much to start with">
        {OFFER_OPTIONS.map((o) => (
          <button
            key={o.kind}
            type="button"
            role="radio"
            id={`${name}-${o.kind}`}
            aria-checked={o.kind === chosen}
            className={`buyRow${o.kind === chosen ? ' on' : ''}`}
            onClick={() => onChoose(o.kind)}
          >
            <span className="buyDot" aria-hidden="true" />
            <span className="buyWhat">
              <b>
                {o.title}
                {o.badge && <span className="buyBadge">{o.badge}</span>}
              </b>
              <small>{o.detail}</small>
            </span>
            <span className="buyPrice">
              {money(o.price)}
              <small>{o.priceNote}</small>
            </span>
          </button>
        ))}
      </div>

      {/* Same tab, deliberately: she is leaving for the cart, and a new tab
          would leave a dead page behind her. No rel, either — noreferrer
          would strip the Referer that Shopify attributes on. */}
      <a
        className="cta buyBtn"
        href={href}
        data-offer={chosen}
        onClick={() => track.checkout(outcome, option.price)}
      >
        {option.cta} &nbsp;&rarr;
      </a>

      <p className="buyNote">{CART_NOTE}</p>

      {chosen === 'single' ? (
        <p className="buyShip">{SHIPPING_LINE}</p>
      ) : null}

      <div className="guar" data-af="guarantee">
        <span className="guarTick" aria-hidden="true">&#10003;</span>
        <p><b>{GUARANTEE_LEAD}</b>{GUARANTEE_REST}</p>
      </div>
    </div>
  );
}
