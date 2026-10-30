import { useState } from 'react';
import { SHOP_BASE } from '../lib/logic';
import { shopUrl, track } from '../lib/analytics';
import {
  DEFAULT_OFFER, NEXT_BATCH, SHOW_BATCH_LINE, SHOW_DAILY_PRICE, valueStackFor,
  batchCount, dailyPrice, money, optionFor, optionsFor,
  type OfferKind, type OfferOption, type StackItem,
} from '../lib/offer';
import {
  GUARANTEE_HEADLINE, GUARANTEE_LINK_TEXT, GUARANTEE_SUB_PRE,
  GUARANTEE_SUB_REST, REFUND_POLICY_URL,
  SHIPPING_LINE, STACK_HEADING, batchLine, liveDeadlineLine,
} from '../lib/offerCopy';

/**
 * THE ONE OFFER IN THE CODE.
 *
 * The offer pages, the Starter Guide page and the screen at the end of the
 * quiz render this same component, so a price, a bundle or a cart rule changes
 * in one place. The rows come from OFFER_OPTIONS, the stack from valueStackFor
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

/**
 * The promise first, the policy underneath it.
 *
 * She is deciding whether to risk $79.99 on something that has not worked
 * before, so the line that answers her goes in the size she will actually
 * read, and the policy that backs it sits under it with the policy itself one
 * tap away.
 */
export function Guarantee() {
  return (
    <div className="guar" data-af="guarantee">
      <span className="guarTick" aria-hidden="true">&#10003;</span>
      <div>
        <p className="guarBig">{GUARANTEE_HEADLINE}</p>
        <p className="guarSmall">
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

/**
 * What she gets for the money, named line by line.
 *
 * `kind` is not optional on purpose. The stack argues for the price directly
 * above it, so a caller that does not say which row is selected is a caller
 * about to sell two bottles to somebody buying one.
 */
export function ValueStack({ kind, items, heading }: {
  kind?: OfferKind;
  /**
   * The rows, where the caller has its own set.
   *
   * ADDED FOR THE KIT, 29 October 2026. The quiz page sells a package whose
   * rows are not any of the three `kind`s, and the alternative was a second
   * copy of this markup on that page. `kind` is still how every other surface
   * asks, and one of the two is required.
   */
  items?: StackItem[];
  /** Overrides STACK_HEADING, or omit the heading entirely with ''. */
  heading?: string;
}) {
  const rows = items ?? valueStackFor(kind ?? DEFAULT_OFFER);
  const head = heading ?? STACK_HEADING;

  return (
    <div className="stack" data-af="stack">
      {head && <p className="stackH">{head}</p>}
      <ul>
        {rows.map((item) => (
          <li key={item.what}>
            <span className="stackWhat">
              {item.bonus && <span className="stackBonus">Bonus</span>}
              {item.what}
            </span>
            {/* A free bonus shows BOTH: what it is worth, struck, and that
                she is not paying it. A number with nothing marking it free
                reads as something she is being charged for. */}
            <span className="stackWorth">
              {item.free ? <><s>{item.worth}</s> free</> : item.worth}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * THE PRICE ROWS, on their own, so a second surface can use them.
 *
 * Split out of BuyOptions below on 29 October 2026 at David's instruction that
 * the quiz offer page stop carrying its own copy of this markup. BuyOptions
 * passes exactly what it passed before, so /offer, /live and /plan render the
 * same DOM they always did; the kit page passes its own options and its own
 * hrefs. Nothing about the rows themselves changed except the struck-through
 * `was`, which only appears on a row that has one.
 */
export function BuyRows({ options, chosen, onChoose, name, label }: {
  options: OfferOption[];
  chosen: OfferKind;
  onChoose: (kind: OfferKind) => void;
  /** Distinguishes one block's radio group from another's. */
  name: string;
  label: string;
}) {
  return (
    <div className="buyRows" role="radiogroup" aria-label={label}>
      {options.map((o) => (
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
            {o.was !== undefined && <small className="buyWas"><s>{money(o.was)}</s></small>}
            <small>{o.priceNote}</small>
          </span>
        </button>
      ))}
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
      <BuyRows
        options={optionsFor(live)} chosen={chosen} onChoose={onChoose}
        name={name} label="Choose how much to start with"
      />

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
        onClick={() => track.checkout(outcome, option.price, chosen, 'buy-options')}
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
      <ValueStack kind={chosen} />
    </div>
  );
}
