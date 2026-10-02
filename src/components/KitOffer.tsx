import { useState } from 'react';
import { SHOP_BASE } from '../lib/logic';
import { shopUrl, track } from '../lib/analytics';
import {
  KIT_TAGLINE, KIT_TOTAL_VALUE, KIT_VALUE, MONEY_BACK_BADGE, ONE_MONTH_PRICE, PLAN_NAME,
  PROTOCOL_PRICE, SHOT_KIT, SHOT_KIT_BOTTLE, SUBSCRIBE_PRICE, dailyPrice, money, perDay,
  type OfferKind,
} from '../lib/offer';
import {
  BOTTLE_NAME, BOTTLE_SUPPLY, FREE_SHIPPING, KIT_BADGE, KIT_CTA, KIT_EYEBROW, KIT_HEAD_PRE,
  KIT_HEAD_SUB, KIT_TODAY_LABEL, KIT_TOTAL_LABEL, ONCE_CADENCE, ONCE_LABEL, PROMISE_BODY,
  PROMISE_EYEBROW, PROMISE_FINE, PROMISE_HEAD, SUB_CADENCE, SUB_LABEL, SUB_NOTE, SUB_PILL,
  TRUST_ITEMS, kitHeadPrice,
} from '../lib/kitCopy';

/* THE OFFER, AS IT IS ON JJ'S OWN PAGE.
 *
 * David's block from hormonefocus.jjsmithonline.com, rebuilt here so the quiz
 * ends on the offer that is already selling: the kit as the lead card with
 * its value stack, then one bottle underneath with a one-time or a
 * subscription choice. Same words, same prices, same cart links.
 *
 * The links go through shopUrl(), so whatever the ad sent her with reaches
 * Shopify the way it does from the page.
 */

function Tick() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

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

/** The kit's own cart link, for any button on the page that buys it. */
export function kitHref(outcome: string, angle: string): string {
  return shopUrl(SHOP_BASE, outcome, angle, 'protocol');
}

export function KitOffer({ outcome, angle }: Props) {
  /* One bottle, bought once or on subscription. The kit has no such choice. */
  const [bottle, setBottle] = useState<Extract<OfferKind, 'single' | 'subscribe'>>('single');
  const bottlePrice = bottle === 'single' ? ONE_MONTH_PRICE : SUBSCRIBE_PRICE;
  const bottleCta = bottle === 'single'
    ? `Get 1 bottle · ${money(ONE_MONTH_PRICE)}`
    : `${SUB_LABEL} · ${money(SUBSCRIBE_PRICE)}`;

  const choose = (kind: 'single' | 'subscribe') => {
    if (kind === bottle) return;
    setBottle(kind);
    track.selectOption(kind, kind === 'single' ? ONE_MONTH_PRICE : SUBSCRIBE_PRICE);
  };

  return (
    <div className="kitOffer" id="kit-offer">
      <div className="kitIntro">
        <p className="kitEyebrow">{KIT_EYEBROW}</p>
        <h2 className="kitH2">{KIT_HEAD_PRE}<em>{kitHeadPrice()}</em>.</h2>
        <p className="kitSub">{KIT_HEAD_SUB}</p>
      </div>

      {/* ------------------------------------------------- the kit ---- */}
      <div className="kitCard kitLead">
        <div className="kitBadge">{KIT_BADGE}</div>
        <h3 className="srOnly">{PLAN_NAME}. {KIT_TAGLINE}</h3>
        <img
          className="kitShot" src={SHOT_KIT}
          alt="The 60-Day Feel Like YOU Again Kit: 2 bottles of Hormone Focus, The 60-Day Hormone Fix eBook, Hormone Healthy Recipes eBook and Daily Symptom Tracker"
          width={768} height={576} decoding="async"
        />

        <ul className="kitVs">
          {KIT_VALUE.map(([what, worth]) => (
            <li key={what}>
              <span className="kitVsName"><span className="kitVsTick"><Tick /></span>{what}</span>
              <span className="kitVsVal"><s>{worth}</s></span>
            </li>
          ))}
        </ul>

        <div className="kitDeal">
          <div className="kitDealCol">
            <span className="kitDealL">{KIT_TOTAL_LABEL}</span>
            <s className="kitDealWas">{KIT_TOTAL_VALUE}</s>
            <span className="kitShip"><Truck /> {FREE_SHIPPING}</span>
          </div>
          <div className="kitDealCol kitDealNow">
            <span className="kitDealL">{KIT_TODAY_LABEL}</span>
            <span className="kitNow">{money(PROTOCOL_PRICE)}</span>
            <span className="kitDay">{dailyPrice()} a day</span>
          </div>
        </div>

        {/* Same tab, and no rel: noreferrer would strip the Referer Shopify
            attributes on. */}
        <a
          className="cta kitBtn" href={kitHref(outcome, angle)} data-offer="protocol"
          onClick={() => track.checkout(outcome, PROTOCOL_PRICE)}
        >
          {KIT_CTA} <Arrow />
        </a>
      </div>

      <p className="kitOr"><span>OR</span></p>

      {/* ---------------------------------------------- one bottle ---- */}
      <div className="kitCard kitQuiet">
        <div className="kitBottleHead">
          <img src={SHOT_KIT_BOTTLE} alt="Hormone Focus, one bottle" width={800} height={800}
            loading="lazy" decoding="async" />
          <div>
            <p className="kitBottleName">{BOTTLE_NAME}</p>
            <p className="kitBottleSupply">{BOTTLE_SUPPLY}</p>
          </div>
        </div>

        <div className="kitOpts" role="radiogroup" aria-label="How to buy one bottle">
          <button
            type="button" role="radio" aria-checked={bottle === 'single'}
            className={`kitOpt${bottle === 'single' ? ' on' : ''}`}
            onClick={() => choose('single')}
          >
            <span className="kitDot" aria-hidden="true" />
            <span className="kitOptName">
              <b>{ONCE_LABEL}</b>
              <small>{ONCE_CADENCE}</small>
            </span>
            <span className="kitOptCost">
              <b>{money(ONE_MONTH_PRICE)}</b>
              <small>{perDay('single')} a day</small>
            </span>
          </button>

          <button
            type="button" role="radio" aria-checked={bottle === 'subscribe'}
            className={`kitOpt${bottle === 'subscribe' ? ' on' : ''}`}
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

        <a
          className="cta kitBtn kitBtnQuiet"
          href={shopUrl(SHOP_BASE, outcome, angle, bottle)} data-offer={bottle}
          onClick={() => track.checkout(outcome, bottlePrice)}
        >
          {bottleCta} <Arrow />
        </a>
      </div>

      <div className="kitTrust">
        {TRUST_ITEMS.map((t, i) => (
          <span key={t}>{i === 0 ? <Shield /> : <Truck />} {t}</span>
        ))}
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
