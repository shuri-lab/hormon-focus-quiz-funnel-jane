import { SHOP_BASE } from '../lib/logic';
import { useHydrated } from '../lib/useHydrated';
import { useMemo } from 'react';
import { shopUrl, track } from '../lib/analytics';
import {
  KIT_BUY_CTA, MONEY_BACK_BADGE, ONE_MONTH_PRICE, QUIZ_KIT_ROWS,
  QUIZ_KIT_SAVING, QUIZ_KIT_VALUE_TOTAL, SHOT_KIT_HERO, SINGLE_AFTER_DISCOUNT,
  SINGLE_DISCOUNT_CODE, SUBSCRIBE_PRICE, money, singleDailyPrice,
} from '../lib/offer';
/* FREE_SHIPPING, ONCE_LABEL, ONCE_CADENCE, SUB_LABEL, SUB_CADENCE, SUB_NOTE,
   SUB_PILL, SUB_OR, SUB_BEST_VALUE, OFFER_ONCE_NOTE and KIT_FREE_LABEL are no
   longer imported: the row copy moved into kitOptions() in offer.ts when the
   rows became the shared BuyRows, and "free" is now ValueStack's own word.
   All of them are still exported and still gated. */
import {
  FREE_SHIPPING, KIT_BATCH_SHOWN, KIT_EYEBROW, KIT_INCLUDED_HEAD, KIT_NOW_LABEL,
  KIT_ONCE_NOTE, KIT_SAVE_PREFIX, KIT_SHOT_ALT, KIT_STACK_HEAD, KIT_SUB_NOTE,
  KIT_SUB_PER, KIT_TODAY_LABEL, KIT_TOTAL_LABEL, KIT_WAS_LABEL,
  OFFER_CARD_HEAD, OFFER_CARD_SUB, OFFER_ONCE_NOTE, PROMISE_BODY,
  PROMISE_EYEBROW, PROMISE_FINE, PROMISE_HEAD, SUB_BEST_VALUE, SUB_LABEL,
  SUB_PILL, TRUST_ITEMS, kitBatchLine,
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

function Tick() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

/**
 * THE PRICE, AS A BLOCK RATHER THAN A SENTENCE.
 *
 * It was one line reading "$146.99 value, today $45.00". Three facts in the
 * shape the offer pages use: what it is worth, struck through; what she pays,
 * large; and what she keeps, in a badge. Shown under the hero, from the same
 * component as the card below, so the two can never drift apart.
 */
export function KitPrice() {
  return (
    <div className="kitPrice">
      <p className="kitPriceWas">
        <span>{KIT_TOTAL_LABEL}</span> <s>{QUIZ_KIT_VALUE_TOTAL}</s>
      </p>
      <p className="kitPriceNow">
        <span>{KIT_TODAY_LABEL}</span> <b>{money(SINGLE_AFTER_DISCOUNT)}</b>
      </p>
      <p className="kitPriceSave">{KIT_SAVE_PREFIX} {QUIZ_KIT_SAVING}</p>
    </div>
  );
}

/**
 * WHAT SHE GETS, BUILT LIKE JANE'S LANDING PAGE.
 *
 * David, 30 October: the shared ValueStack read as a receipt, and the stack
 * on hormonefocus.jjsmithonline.com reads as an offer. The difference is
 * structural rather than decorative, so this is modelled on that block:
 *
 *   - the things she gets, each with a tick and a price struck through,
 *   - the three bonuses as cards of their own WITH THE ARTWORK, because a
 *     bonus she can see is worth more than a bonus she can read,
 *   - a total, struck, on its own tinted row.
 *
 * NOT THE SHARED ValueStack, and deliberately. /offer, /live and /plan have
 * no artwork for their rows and their above-the-fold budget is measured in a
 * test; changing how they look was not asked for. The two differ in layout
 * only, and both read the same StackItem[].
 */
function KitStack() {
  const items = QUIZ_KIT_ROWS.filter((i) => !i.bonus);
  const bonuses = QUIZ_KIT_ROWS.filter((i) => i.bonus);

  return (
    <div className="kitVs" data-af="stack">
      <p className="kitVsH">{KIT_INCLUDED_HEAD}</p>

      <ul className="kitVsList">
        {items.map((it) => (
          <li key={it.what}>
            <span className="kitVsName">
              {/* THE THING ITSELF WHERE THERE IS A PICTURE OF IT, and the
                  tick where there is not. The bottle row sat under three
                  bonus rows that each showed their artwork, which made the
                  one thing she is actually buying the only line with
                  nothing to look at. */}
              {it.img
                ? <img className="kitVsImg" src={it.img} alt="" width={180} height={180}
                    loading="lazy" decoding="async" />
                : <span className="kitVsTick"><Tick /></span>}
              <span>{it.what}</span>
            </span>
            <span className={`kitVsVal${it.worth.startsWith('$') ? ' struck' : ''}`}>
              {it.worth}
            </span>
          </li>
        ))}
      </ul>

      <div className="kitVsBonuses">
        {bonuses.map((b) => (
          <div className="kitVsBonus" key={b.what}>
            {b.img && (
              <img className="kitVsBonusImg" src={b.img} alt="" width={180} height={180}
                loading="lazy" decoding="async" />
            )}
            <span className="kitVsBonusMain">
              <span className="kitVsBonusTag">Bonus</span>
              <span className="kitVsBonusLabel">{b.what}</span>
            </span>
            <span className="kitVsVal struck">{b.worth}</span>
          </div>
        ))}
      </div>

      <div className="kitVsTotal">
        <span>{KIT_TOTAL_LABEL}</span>
        <span className="kitVsTotalV struck">{QUIZ_KIT_VALUE_TOTAL}</span>
      </div>
    </div>
  );
}

export function KitOffer({ outcome, angle }: Props) {
  /* TWO DEAL BOXES, EACH WITH ITS OWN BUTTON, where this was a radio group
     with one shared button. David's call of 30 October: the radio rows did
     not read as an offer, and Jane's own page puts each option in a box she
     can say yes to. Nothing about where they GO changed.

     WHAT THIS COSTS, and it is worth saying out loud: there is no longer a
     selection to record, so hf_option_selected no longer fires on this page.
     The event still fires from the offer pages' own rows, and the two buy
     events it used to sit between, hf_offer_viewed and hf_cta_clicked, are
     both unchanged.

     THE DISCOUNT RIDES ON THE ONE-TIME BOTTLE AND NOTHING ELSE. The
     subscription carries its own 20% in Shopify, and stacking a second code
     on it is neither possible (one discount parameter) nor wanted. */

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

  return (
    <div className="kitOffer" id="kit-offer">
      <div className="kitIntro">
        <p className="kitEyebrow">{KIT_EYEBROW}</p>
        <h2 className="kitH2">{KIT_STACK_HEAD}</h2>
      </div>

      <div className="kitCard kitLead">
        <div className="kitBottleHead">
          <img src={SHOT_KIT_HERO} alt={KIT_SHOT_ALT} width={768} height={576}
            decoding="async" />
          <div>
            <p className="kitBottleName">{OFFER_CARD_HEAD}</p>
            <p className="kitBottleSupply">{OFFER_CARD_SUB}</p>
          </div>
        </div>

        <KitStack />

        {/* THE DEAL. The badge sits on the border, as on her page, so the
            crossed-out price and the one she pays read as one movement. */}
        <div className="kitDeal">
          <span className="kitDealBadge">
            {KIT_WAS_LABEL} <s>{money(ONE_MONTH_PRICE)}</s> &middot; {KIT_NOW_LABEL}
          </span>
          <div className="kitDealNow">
            <span className="kitDealNum">{money(SINGLE_AFTER_DISCOUNT)}</span>
          </div>
          <p className="kitDealNote">
            {KIT_ONCE_NOTE} &middot; {singleDailyPrice()} a day
          </p>
          <a
            className="cta kitBtn" href={once} data-offer="single"
            onClick={() => track.checkout(outcome, SINGLE_AFTER_DISCOUNT, 'single', 'kit-main')}
          >
            {KIT_BUY_CTA} <Arrow />
          </a>
          <p className="kitDealFine">{OFFER_ONCE_NOTE}</p>
        </div>

        <div className="kitOr"><span>or</span></div>

        <div className="kitDeal2">
          <span className="kitDeal2Badge">{SUB_BEST_VALUE} &middot; {SUB_PILL}</span>
          <div className="kitDeal2Now">
            <s>{money(ONE_MONTH_PRICE)}</s>
            <span className="kitDeal2Num">{money(SUBSCRIBE_PRICE)}</span>
            <span className="kitDeal2Per">{KIT_SUB_PER}</span>
          </div>
          {/* THE PILL IS BACK. Free shipping is the only thing this option
              has that the bottle does not, and as words in a grey note it
              read as small print. */}
          <p className="kitDeal2Ship">
            <span className="kitShip"><Truck /> {FREE_SHIPPING}</span>
          </p>
          <p className="kitDealNote">{KIT_SUB_NOTE}</p>
          {/* THE SAME BUTTON AS THE ONE ABOVE, 30 October. It was outlined,
              which read as the lesser of the two rather than as the other
              one, and David asked for them to match. */}
          <a
            className="cta kitBtn" href={sub} data-offer="subscribe"
            onClick={() => track.checkout(outcome, SUBSCRIBE_PRICE, 'subscribe', 'kit-sub')}
          >
            {SUB_LABEL} <Arrow />
          </a>
        </div>

        {/* TRUE, SAID ONCE, NO TIMER. Rendered here rather than through
            SHOW_BATCH_LINE, which is the global switch and is off for the
            offer pages at David's request. */}
        {KIT_BATCH_SHOWN && <p className="buyBatch kitBatch">{kitBatchLine()}</p>}

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
