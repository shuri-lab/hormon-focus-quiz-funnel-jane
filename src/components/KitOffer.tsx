import { SHOP_BASE } from '../lib/logic';
import { useHydrated } from '../lib/useHydrated';
import { useMemo, useState } from 'react';
import { shopUrl, track } from '../lib/analytics';
import {
  MONEY_BACK_BADGE, ONE_MONTH_PRICE, SHOT_KIT_BOTTLE, SINGLE_AFTER_DISCOUNT,
  SINGLE_DISCOUNT_CODE, SUBSCRIBE_PRICE, money, singleDailyPrice,
} from '../lib/offer';
import {
  FREE_SHIPPING, HERO_CTA, KIT_EYEBROW, OFFER_CARD_HEAD, OFFER_CARD_SUB,
  OFFER_ONCE_NOTE, ONCE_CADENCE, ONCE_LABEL, PROMISE_BODY, PROMISE_EYEBROW,
  PROMISE_FINE, PROMISE_HEAD, SUB_CADENCE, SUB_LABEL, SUB_NOTE, SUB_PILL,
  TRUST_ITEMS,
} from '../lib/kitCopy';

/* THE OFFER, AS IT IS ON JJ'S OWN PAGE.
 *
 * David's block from hormonefocus.jjsmithonline.com, rebuilt here so the quiz
 * ends on the offer that is already selling: the kit as the lead card with its
 * value stack, and one alternative underneath it.
 *
 * TWO CHOICES, NOT THREE, since 16 October 2026. The 30-day one-time bottle is
 * off this page at David's instruction. It cost MORE than the subscription for
 * the same bottle ($49.99 against $39.99), which made it the one row nobody
 * should pick, and it set her up to stop at day 30, before the plan she has
 * just read about has finished.
 *
 * THE PRODUCT IS UNTOUCHED. SINGLE_OPTION, SINGLE_VARIANT_ID, ONE_MONTH_PRICE
 * and its cart path are all exactly where they were in offer.ts, and /offer,
 * /offer/:slug, /live and /plan still sell it. Only this page stopped offering
 * it. The crossed-out price on the subscription below is still that bottle, so
 * the number has not left the page either.
 *
 * THE KIT LEADS, DELIBERATELY. With no sales yet, price is not the proven
 * blocker, so leading on the cheapest row would train her into the option most
 * likely to make her quit early. The subscription is the one lower-commitment
 * alternative and it is kept quiet underneath. Once the events are live,
 * kit-first against subscription-first is the first real test to run.
 *
 * The links go through shopUrl(), so whatever the ad sent her with reaches
 * Shopify the way it does from the page.
 */

function Truck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="14" height="10" rx="2" />
      <path d="M16 10h3l3 3v4h-6z" />
      <circle cx="6.5" cy="19" r="1.8" />
      <circle cx="18" cy="19" r="1.8" />
    </svg>
  );
}

function Shield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13" /><path d="M12 5l7 7-7 7" />
    </svg>
  );
}

interface Props {
  /** For begin_checkout. Never put in the cart link. */
  outcome: string;
  angle: string;
}

/**
 * The lead offer's cart link, for any button on this page that buys it.
 *
 * ONE BOTTLE WITH THE 10% CODE since 22 October, where this was the kit. The
 * name is kept so the closer and the rest of the page keep working through
 * one helper; what changed is what the page leads with, not how it links.
 * SINGLE_DISCOUNT_CODE is passed here and nowhere else, which is what keeps
 * /offer and /plan selling the same bottle at full price.
 */
export function kitHref(outcome: string, angle: string): string {
  return shopUrl(SHOP_BASE, outcome, angle, 'single', SINGLE_DISCOUNT_CODE);
}

export function KitOffer({ outcome, angle }: Props) {
  /* TWO OPTIONS AND ONE BUTTON, which is the shape this card had before the
     kit took it over on 16 October. The radio group, its dot, the cost
     column and the pill are all the classes that were already styled for it
     in kit.css; nothing here is a new component.

     THE DISCOUNT RIDES ON THE ONE-TIME BOTTLE AND NOTHING ELSE. The
     subscription already carries its own 20% in Shopify, and stacking a
     second code on it is neither possible (one discount parameter) nor
     wanted. */
  const [pick, setPick] = useState<'single' | 'subscribe'>('single');

  /* THE LINKS ARE REBUILT ONCE SHE IS IN A BROWSER. The host renders this on
     a server, where sessionStorage does not exist, so shopUrl() cannot see
     her attribution and every cart link shipped without a utm_*. Reading
     this gives the second render that rebuilds them. See useHydrated.ts. */
  const hydrated = useHydrated();
  const once = useMemo(() => kitHref(outcome, angle), [outcome, angle, hydrated]);
  const sub = useMemo(
    () => shopUrl(SHOP_BASE, outcome, angle, 'subscribe'),
    [outcome, angle, hydrated],
  );

  const chosen = pick === 'single'
    ? { href: once, price: SINGLE_AFTER_DISCOUNT, label: `${HERO_CTA} · ${money(SINGLE_AFTER_DISCOUNT)}` }
    : { href: sub, price: SUBSCRIBE_PRICE, label: `${SUB_LABEL} · ${money(SUBSCRIBE_PRICE)}` };

  const choose = (kind: 'single' | 'subscribe') => {
    if (kind === pick) return;
    setPick(kind);
    track.selectOption(kind, kind === 'single' ? SINGLE_AFTER_DISCOUNT : SUBSCRIBE_PRICE);
  };

  return (
    <div className="kitOffer" id="kit-offer">
      <div className="kitIntro">
        <p className="kitEyebrow">{KIT_EYEBROW}</p>
        <h2 className="kitH2">{OFFER_CARD_HEAD}</h2>
        <p className="kitSub">{OFFER_CARD_SUB}</p>
      </div>

      <div className="kitCard kitLead">
        <div className="kitBottleHead">
          <img src={SHOT_KIT_BOTTLE} alt="Hormone Focus, one bottle" width={800} height={800}
            decoding="async" />
          <div>
            <p className="kitBottleName">{OFFER_CARD_HEAD}</p>
            <p className="kitBottleSupply">{OFFER_CARD_SUB}</p>
          </div>
        </div>

        <div className="kitOpts" role="radiogroup" aria-label="How to buy Hormone Focus">
          <button
            type="button" role="radio" aria-checked={pick === 'single'}
            className={`kitOpt${pick === 'single' ? ' on' : ''}`}
            onClick={() => choose('single')}
          >
            <span className="kitDot" aria-hidden="true" />
            <span className="kitOptName">
              <b>{ONCE_LABEL}</b>
              <small>{ONCE_CADENCE}</small>
              <span className="kitOptExtra">
                <small className="kitDiscountNote">{OFFER_ONCE_NOTE}</small>
              </span>
            </span>
            <span className="kitOptCost">
              <b>{money(SINGLE_AFTER_DISCOUNT)}</b>
              <small><s>{money(ONE_MONTH_PRICE)}</s></small>
              <small>{singleDailyPrice()} a day</small>
            </span>
          </button>

          <button
            type="button" role="radio" aria-checked={pick === 'subscribe'}
            className={`kitOpt${pick === 'subscribe' ? ' on' : ''}`}
            onClick={() => choose('subscribe')}
          >
            <span className="kitDot" aria-hidden="true" />
            <span className="kitOptName">
              <b>{SUB_LABEL} <i className="kitPill">{SUB_PILL}</i></b>
              <small>{SUB_CADENCE}</small>
              <span className="kitOptExtra">
                <span className="kitShip"><Truck /> {FREE_SHIPPING}</span>
                <small>{SUB_NOTE}</small>
              </span>
            </span>
            <span className="kitOptCost">
              <b>{money(SUBSCRIBE_PRICE)}</b>
              <small><s>{money(ONE_MONTH_PRICE)}</s></small>
            </span>
          </button>
        </div>

        {/* Same tab, and no rel: noreferrer would strip the Referer Shopify
            attributes on. The href and the label both follow the option she
            picked, so the button can never buy the other one. */}
        <a
          className="cta kitBtn" href={chosen.href} data-offer={pick}
          onClick={() => track.checkout(outcome, chosen.price, pick, 'kit-main')}
        >
          {chosen.label} <Arrow />
        </a>

        <div className="kitTrust">
          {TRUST_ITEMS.map((t, i) => (
            <span key={t}>{i === 0 ? <Shield /> : <Truck />} {t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The guarantee band, as on her page: the badge, the promise, the terms. */
export function KitGuarantee() {
  return (
    <div className="kitPromise">
      <img src={MONEY_BACK_BADGE} alt="60-day money-back guarantee" width={411} height={410}
        decoding="async" />
      <p className="kitPromiseEyebrow">{PROMISE_EYEBROW}</p>
      <h2 className="kitPromiseH">{PROMISE_HEAD}</h2>
      <p className="kitPromiseBody">{PROMISE_BODY}</p>
      <p className="kitPromiseFine">{PROMISE_FINE}</p>
    </div>
  );
}
