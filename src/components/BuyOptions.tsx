import { useState } from 'react';
import { SHOP_BASE } from '../lib/logic';
import { shopUrl, track } from '../lib/analytics';
import {
  DEFAULT_OFFER, NEXT_BATCH, OFFER_OPTIONS, SHOW_BATCH_LINE,
  SHOW_DAILY_PRICE, VALUE_STACK, batchCount, dailyPrice, money, optionFor,
  type OfferKind,
} from '../lib/offer';
import {
  GUARANTEE_LINK_TEXT, GUARANTEE_PRE, GUARANTEE_REST, REFUND_POLICY_URL,
  SHIPPING_LINE, STACK_HEADING, batchLine, liveDeadlineLine,
} from '../lib/offerCopy';

/**
 * THE ONE OFFER IN THE CODE.
 *
 * The offer pages, the Starter Guide page and the screen at the end of the
 * quiz render this same component, so a price, a bundle or a cart rule changes
 * in one place. The rows come from OFFER_OPTIONS, the stack from VALUE_STACK
 * and the links from shopUrl(), which is where the three cart modes live.
 *
 * The Plan arrives chosen. That is the offer; the single bottle is the honest
 * smaller option for a woman who will not start with two, and it is priced
 * where it really is rather than inflated to make the Plan look better.
 *
 * CONTROLLED ON PURPOSE. A page shows this block twice — once in the hero and
 * once in the closer — and a woman who picks the single bottle at the top must
 * not find the Plan re-selected at the bottom. The page owns the choice and
 * both blocks read it.
 *
 * THE ORDER IS THE FOLD. Rows, daily price, button, batch line, guarantee, and
 * only then the stack. The guarantee stays glued to the button because it is
 * the line that answers the doubt the button creates, and because all six
 * above-the-fold elements have to fit a 390px phone. The stack is the first
 * thing she meets when she scrolls a finger's width.
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

/** The guarantee, verbatim from the policy, with the policy one tap away. */
export function Guarantee() {
  return (
    <div className="guar" data-af="guarantee">
      <span className="guarTick" aria-hidden="true">&#10003;</span>
      <p>
        <b>
          {GUARANTEE_PRE}
          <a href={REFUND_POLICY_URL} target="_blank" rel="noopener noreferrer">
            {GUARANTEE_LINK_TEXT}
          </a>
        </b>
        {GUARANTEE_REST}
      </p>
    </div>
  );
}

/** What she gets for the money, named line by line. */
export function ValueStack() {
  return (
    <div className="stack" data-af="stack">
      <p className="stackH">{STACK_HEADING}</p>
      <ul>
        {VALUE_STACK.map((item) => (
          <li key={item.what}>
            <span className="stackWhat">
              {item.bonus && <span className="stackBonus">Bonus</span>}
              {item.what}
            </span>
            <span className="stackWorth">{item.worth}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface Props {
  chosen: OfferKind;
  onChoose: (kind: OfferKind) => void;
  /** Carried to the cart as hf_outcome. */
  outcome: string;
  /** Carried to the cart as utm_term, unless the ad sent one. */
  angle: string;
  /** Distinguishes one block from another for the radio group. */
  name: string;
  /** /live only. The deadline line renders under the button where one is set. */
  live?: boolean;
}

export function BuyOptions({ chosen, onChoose, outcome, angle, name, live = false }: Props) {
  const option = optionFor(chosen);
  const href = shopUrl(SHOP_BASE, outcome, angle, chosen);
  const deadline = live ? liveDeadlineLine() : null;

  return (
    <div className="buy">
      {/* data-af="cta" is the ONE call to action the fold budget counts: the
          rows, the price and the button. The lines under it answer the doubt
          the button creates and are measured separately. */}
      <div className="buyCta" data-af="cta">
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

      {/* Only under the Plan, because the Plan is what sixty days divides. */}
      {SHOW_DAILY_PRICE && chosen === 'protocol' && (
        <p className="buyDaily">
          {dailyPrice()} a day. Less than the coffee that stopped helping.
        </p>
      )}

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
      </div>

      {deadline && <p className="buyDeadline">{deadline}</p>}

      {/* True scarcity, said once, and never a countdown.

          On a Live with a deadline the deadline IS the scarcity, so the batch
          line stands down rather than stacking a second reason to hurry under
          the first. It also buys back the height the deadline costs, which is
          what keeps the guarantee above the fold on a 390px phone. */}
      {SHOW_BATCH_LINE && !deadline && (
        <p className="buyBatch">{batchLine(batchCount(), NEXT_BATCH)}</p>
      )}

      {chosen === 'single' && <p className="buyShip">{SHIPPING_LINE}</p>}

      <Guarantee />
      <ValueStack />
    </div>
  );
}
