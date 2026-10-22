import { SHOP_BASE } from '../lib/logic';
import { useHydrated } from '../lib/useHydrated';
import { useMemo } from 'react';
import { shopUrl, track } from '../lib/analytics';
import {
  MONEY_BACK_BADGE, ONE_MONTH_PRICE, SHOT_KIT_BOTTLE, SINGLE_AFTER_DISCOUNT,
  SINGLE_DISCOUNT_CODE, SUBSCRIBE_PRICE, money, singleDailyPrice,
} from '../lib/offer';
import {
  BOTTLE_SUPPLY, FREE_SHIPPING, KIT_EYEBROW, KIT_HEAD_PRE, KIT_HEAD_SUB,
  KIT_TODAY_LABEL, OFFER_HEAD, PROMISE_BODY, PROMISE_EYEBROW, PROMISE_FINE,
  PROMISE_HEAD, SINGLE_BADGE, SINGLE_CTA, SINGLE_DISCOUNT_NOTE, SINGLE_NAME,
  SINGLE_ONCE, SINGLE_WAS_LABEL, SUB_ALT_LEAD, SUB_ALT_NAME, SUB_CADENCE,
  SUB_LABEL, SUB_NOTE, SUB_PILL, TRUST_ITEMS,
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
  /* THE LINKS ARE REBUILT ONCE SHE IS IN A BROWSER. The host renders this on
     a server, where sessionStorage does not exist, so shopUrl() cannot see
     her attribution and every cart link shipped without a utm_*. Reading
     this gives the second render that rebuilds them. See useHydrated.ts. */
  const hydrated = useHydrated();
  const lead = useMemo(
    () => kitHref(outcome, angle),
    [outcome, angle, hydrated],
  );
  const sub = useMemo(
    () => shopUrl(SHOP_BASE, outcome, angle, 'subscribe'),
    [outcome, angle, hydrated],
  );

  return (
    <div className="kitOffer" id="kit-offer">
      <div className="kitIntro">
        <p className="kitEyebrow">{KIT_EYEBROW}</p>
        <h2 className="kitH2">{OFFER_HEAD}</h2>
        {/* The day rate leads rather than headlines: $74.99 beside a button is
            the number she has to justify, and this is the one she can picture.
            Her page's own line, kept. */}
        <p className="kitSub">
          {KIT_HEAD_PRE}<em>{singleDailyPrice()} a day</em>. {KIT_HEAD_SUB}
        </p>
      </div>

      {/* --------------------------------------- the single bottle ---- */}
      {/* THE SAME CARD THE KIT USED, with the kit taken out of it. Every
          class here is the one that was already styled: kitCard kitLead, the
          badge, kitDeal and its two columns, the button and the trust row.
          What changed is what the card sells.

          GONE WITH THE KIT: its photograph, its four-line value stack and
          the $196.99 total. Those described a product this page no longer
          offers. /offer and /plan still sell it and are untouched. */}
      <div className="kitCard kitLead">
        <div className="kitBadge">{SINGLE_BADGE}</div>

        <div className="kitBottleHead">
          <img src={SHOT_KIT_BOTTLE} alt="Hormone Focus, one bottle" width={800} height={800}
            decoding="async" />
          <div>
            <p className="kitBottleName">{SINGLE_NAME}</p>
            <p className="kitBottleSupply">{BOTTLE_SUPPLY}</p>
            <p className="kitBottleSupply">{SINGLE_ONCE}</p>
          </div>
        </div>

        <div className="kitDeal">
          <div className="kitDealCol">
            <span className="kitDealL">{SINGLE_WAS_LABEL}</span>
            <s className="kitDealWas">{money(ONE_MONTH_PRICE)}</s>
          </div>
          <div className="kitDealCol kitDealNow">
            <span className="kitDealL">{KIT_TODAY_LABEL}</span>
            <span className="kitNow">{money(SINGLE_AFTER_DISCOUNT)}</span>
            <span className="kitDay">{singleDailyPrice()} a day</span>
          </div>
        </div>

        {/* What the checkout will actually do, said plainly. She types
            nothing: the code rides on the link. */}
        <p className="kitNote kitDiscountNote">{SINGLE_DISCOUNT_NOTE}</p>

        {/* Same tab, and no rel: noreferrer would strip the Referer Shopify
            attributes on. */}
        <a
          className="cta kitBtn" href={lead} data-offer="single"
          onClick={() => track.checkout(outcome, SINGLE_AFTER_DISCOUNT, 'single', 'kit-main')}
        >
          {SINGLE_CTA} <Arrow />
        </a>

        {/* DIRECTLY UNDER THE BUTTON, which is where risk reversal earns its
            keep. Neither line claims free shipping, which the bottle does not
            get: the 10% code occupies the one discount parameter Shopify
            takes, so HF60FREESHIP cannot ride with it. */}
        <div className="kitTrust">
          {TRUST_ITEMS.map((t, i) => (
            <span key={t}>{i === 0 ? <Shield /> : <Truck />} {t}</span>
          ))}
        </div>
      </div>

      <p className="kitOr"><span>OR</span></p>

      {/* --------------------------------------- the one alternative ---- */}
      <div className="kitCard kitQuiet">
        <p className="kitAltLead">{SUB_ALT_LEAD}</p>

        <div className="kitBottleHead">
          <img src={SHOT_KIT_BOTTLE} alt="Hormone Focus, one bottle" width={800} height={800}
            loading="lazy" decoding="async" />
          <div>
            <p className="kitBottleName">
              {SUB_ALT_NAME} <i className="kitPill">{SUB_PILL}</i>
            </p>
            <p className="kitBottleSupply">{BOTTLE_SUPPLY}</p>
          </div>
        </div>

        <div className="kitAltRow">
          <span className="kitAltTerms">
            <b>{SUB_CADENCE}</b>
            <span className="kitShip"><Truck /> {FREE_SHIPPING}</span>
            <small>{SUB_NOTE}</small>
          </span>
          {/* The crossed price is the same bottle bought one at a time, which
              is a real saving and not an invented one. */}
          <span className="kitAltCost">
            <b>{money(SUBSCRIBE_PRICE)}</b>
            <small><s>{money(ONE_MONTH_PRICE)}</s></small>
          </span>
        </div>

        <a
          className="cta kitBtn kitBtnQuiet"
          href={sub} data-offer="subscribe"
          onClick={() => track.checkout(outcome, SUBSCRIBE_PRICE, 'subscribe', 'kit-bottle')}
        >
          {SUB_LABEL} · {money(SUBSCRIBE_PRICE)} <Arrow />
        </a>
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
