import { SHOP_BASE } from '../lib/logic';
import { useHydrated } from '../lib/useHydrated';
import { useMemo } from 'react';
import { shopUrl, track } from '../lib/analytics';
import {
  KIT_BUY_CTA, KIT_DISCOUNT_CODE, MONEY_BACK_BADGE, ONE_MONTH_PRICE,
  SHOT_BOTTLE_THUMB, SHOT_KIT_FULL,
  QUIZ_KIT_AFTER_DISCOUNT, QUIZ_KIT_ROWS, QUIZ_KIT_VALUE_TOTAL, SHOT_KIT_BOTTLE, SHOT_KIT_HERO,
  SINGLE_AFTER_DISCOUNT, SINGLE_DISCOUNT_CODE, SUBSCRIBE_PRICE, money,
  singleDailyPrice,
} from '../lib/offer';
/* FREE_SHIPPING, ONCE_LABEL, ONCE_CADENCE, SUB_LABEL, SUB_CADENCE, SUB_NOTE,
   SUB_PILL, SUB_OR, SUB_BEST_VALUE, OFFER_ONCE_NOTE and KIT_FREE_LABEL are no
   longer imported: the row copy moved into kitOptions() in offer.ts when the
   rows became the shared BuyRows, and "free" is now ValueStack's own word.
   All of them are still exported and still gated. */
import {
  BOTTLE_CTA, BOTTLE_FULL_LABEL, BOTTLE_HERO_HEAD, BOTTLE_SAVE, BOTTLE_SHOT_ALT,
  BOTTLE_WHATYOUGET, FREE_SHIPPING, HF_NAME,
  KIT_BATCH_SHOWN, KIT_EYEBROW, KIT_INCLUDED_HEAD,
  COMPARE_HEAD, COMPARE_KIT_LABEL, COMPARE_KIT_SUB, COMPARE_KIT_TODAY,
  COMPARE_ONE_LABEL, COMPARE_ONE_SUB, COMPARE_RIBBON, COMPARE_WHY,
  KIT_OFFER_PILL, KIT_ONCE_NOTE, KIT_SHOT_ALT, KIT_STACK_HEAD, KIT_SUB_NOTE,
  KIT_SUB_PER, KIT_TODAY_LABEL, KIT_TOTAL_LABEL,
  OFFER_CARD_HEAD, OFFER_CARD_SUB, OFFER_ONCE_NOTE, PROMISE_BODY,
  PROMISE_EYEBROW, PROMISE_FINE, PROMISE_HEAD, SUB_BEST_VALUE, SUB_LABEL,
  TRUST_ITEMS, WELCOME_DETAIL, WELCOME_LABEL, WELCOME_WHY_SHORT,
  bottleBatchLine, compareKitPrice, compareSub, kitSaving, subLockLine,
  welcomeSaving,
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
  /**
   * WHICH OFFER THIS IS. 'kit' is the page preserved at /quiz/offer-kit, with
   * the three guides and the $146.99 value stack. 'bottle' is what the main
   * walk ends on: the same two deal boxes, the same cart links, and one line
   * saying what is in the box instead of a stack with nothing in it.
   */
  variant?: 'bottle' | 'kit';
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
export function kitHref(
  outcome: string,
  angle: string,
  variant: 'bottle' | 'kit' = 'bottle',
): string {
  /* THE KIT BUYS THE BUNDLE, 6 November. Two bottles is what makes its
     "60-day" true, so its button carries PROTOCOL_VARIANT_ID with KIT47.
     The one-bottle offer is untouched: single variant, HORMONE25OFF. */
  return variant === 'kit'
    ? shopUrl(SHOP_BASE, outcome, angle, 'protocol', KIT_DISCOUNT_CODE)
    : shopUrl(SHOP_BASE, outcome, angle, 'single', SINGLE_DISCOUNT_CODE);
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
  /* THE BOTTLE PAGE'S BLOCK, WITH THE KIT'S NUMBERS. 6 November: the two
     offer pages set the same three facts two different ways, and the bottle's
     is the one that works. Same markup, same classes, so a change to one is
     a change to both rather than a thing to remember. */
  return (
    <div className="kitPrice isWelcome">
      <p className="kitWelcome">
        <b>{KIT_OFFER_PILL}</b>
      </p>

      <p className="kitPriceRow">
        <span className="kitPriceFull">
          <small>{KIT_TOTAL_LABEL}</small>
          <s className="kitWas isBig">{QUIZ_KIT_VALUE_TOTAL}</s>
        </span>
        <span className="kitPriceToday">
          <small>{KIT_TODAY_LABEL}</small>
          <b>{money(QUIZ_KIT_AFTER_DISCOUNT)}</b>
        </span>
      </p>

      <p className="kitPriceSave">{kitSaving()}</p>
    </div>
  );
}

/**
 * THE STEAL, SHOWN RATHER THAN DESCRIBED.
 *
 * Two sentences used to say this under the button: that the kit costs less
 * than one bottle, and that the price belongs to her Hormone Check. Both
 * true, both read as small print. Side by side the two prices make the
 * argument without being read.
 *
 * THE $49.99 IS NOT STRUCK. It is a real price that a real person pays for
 * one bottle today, not a "was": striking it would turn a fair comparison
 * into a fake discount. The contrast between the cards is the point.
 */
export function KitCompare() {
  return (
    <div className="kitCompare">
      {/* THE ARGUMENT FIRST, THE EVIDENCE SECOND. This was one line under
          the cards, which left her to work out what the two prices were for
          after she had already read them. */}
      <header className="kitCmpHead">
        <h2 className="kitCmpTitle">{COMPARE_HEAD}</h2>
        <p className="kitCmpLead">{compareSub()}</p>
      </header>

      <div className="kitCmpCards">
        <div className="kitCmp">
          <p className="kitCmpLabel">{COMPARE_ONE_LABEL}</p>
          <img className="kitCmpShot" src={SHOT_BOTTLE_THUMB} alt=""
            width={180} height={180} loading="lazy" decoding="async" />
          <p className="kitCmpPrice">{money(ONE_MONTH_PRICE)}</p>
          <p className="kitCmpSub">{COMPARE_ONE_SUB}</p>
        </div>

        <div className="kitCmp isKit">
          <span className="kitCmpRibbon">{COMPARE_RIBBON}</span>
          <p className="kitCmpLabel">{COMPARE_KIT_LABEL}</p>
          {/* THE WHOLE KIT, not two bottles: the card's price is being
              compared against all five things. See SHOT_KIT_FULL. */}
          <img className="kitCmpShot isFull" src={SHOT_KIT_FULL} alt=""
            width={600} height={267} loading="lazy" decoding="async" />
          <p className="kitCmpPrice">
            {compareKitPrice()}
            <small className="kitCmpToday">{COMPARE_KIT_TODAY}</small>
          </p>
          <p className="kitCmpSub">{COMPARE_KIT_SUB}</p>
        </div>
      </div>

      <p className="kitCmpWhy">{COMPARE_WHY}</p>
    </div>
  );
}

/**
 * THE BOTTLE'S PRICE, for the variant that sells one.
 *
 * THE SAME THREE FACTS AND NONE OF THE KIT'S. KitPrice above totals a value
 * stack: $146.99 of things, $45 today, $101.99 kept. There are no bonuses in
 * this offer, so the only honest version is the bottle's own price struck
 * down to what she pays and the saving that actually is.
 */
export function BottlePrice() {
  return (
    <div className="kitPrice isWelcome">
      {/* THE OFFER, NAMED AND FIRST. At 10% this was a footnote under the
          price; at 25% it is the strongest thing on the page, so it is said
          before the numbers rather than inferred from them.

          IT WAS A BORDERED CARD WITH A RIBBON AND AN ARROW for an hour on
          5 November. David looked at it and asked for this back, so the card
          is gone and the exclusivity line with it: that sentence is on the
          offer card, under the button, which is where she is deciding. */}
      <p className="kitWelcome">
        <b>{WELCOME_LABEL}</b>
        <span>{WELCOME_DETAIL}</span>
      </p>

      {/* BOTH PRICES ON ONE LINE, each under its own label, with the old one
          ruled through the way the value stack rules its rows. It was 13px
          grey type: you could not tell at a glance that the bottle is
          normally $49.99, which is the whole argument. */}
      <p className="kitPriceRow">
        <span className="kitPriceFull">
          <small>{BOTTLE_FULL_LABEL}</small>
          <s className="kitWas isBig">{money(ONE_MONTH_PRICE)}</s>
        </span>
        <span className="kitPriceToday">
          <small>{KIT_TODAY_LABEL}</small>
          <b>{money(SINGLE_AFTER_DISCOUNT)}</b>
        </span>
      </p>

      <p className="kitPriceSave">{welcomeSaving()}</p>
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
  /* THE GUARANTEE CLOSES THE STACK, not sits second. The rows split three
     ways rather than two: what she is buying, the bonuses she is given, and
     then the guarantee, which is a promise about the order rather than a
     thing in the box. A row priced in money is one of the first kind. */
  const items = QUIZ_KIT_ROWS.filter((i) => !i.bonus && i.worth.startsWith('$'));
  const bonuses = QUIZ_KIT_ROWS.filter((i) => i.bonus);
  const promises = QUIZ_KIT_ROWS.filter((i) => !i.bonus && !i.worth.startsWith('$'));

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

      {promises.length > 0 && (
        <ul className="kitVsList kitVsPromises">
          {promises.map((it) => (
            <li key={it.what}>
              <span className="kitVsName">
                {it.img
                  ? <img className="kitVsImg" src={it.img} alt="" width={180} height={180}
                      loading="lazy" decoding="async" />
                  : <span className="kitVsTick"><Tick /></span>}
                <span>{it.what}</span>
              </span>
              <span className="kitVsVal">{it.worth}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="kitVsTotal">
        <span>{KIT_TOTAL_LABEL}</span>
        <span className="kitVsTotalV struck">{QUIZ_KIT_VALUE_TOTAL}</span>
      </div>
    </div>
  );
}

export function KitOffer({ outcome, angle, variant = 'kit' }: Props) {
  const isKit = variant === 'kit';
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
  const once = useMemo(
    () => kitHref(outcome, angle, variant),
    [outcome, angle, variant, hydrated],
  );
  const sub = useMemo(
    () => shopUrl(SHOP_BASE, outcome, angle, 'subscribe'),
    [outcome, angle, hydrated],
  );

  return (
    <div className="kitOffer" id="kit-offer">
      <div className="kitIntro">
        <p className="kitEyebrow">{KIT_EYEBROW}</p>
        <h2 className="kitH2">{isKit ? KIT_STACK_HEAD : BOTTLE_HERO_HEAD}</h2>
      </div>

      <div className="kitCard kitLead">
        <div className="kitBottleHead">
          {isKit
            ? <img src={SHOT_KIT_HERO} alt={KIT_SHOT_ALT} width={768} height={576}
                decoding="async" />
            : <img src={SHOT_KIT_BOTTLE} alt={BOTTLE_SHOT_ALT} width={800} height={800}
                decoding="async" />}
          <div>
            <p className="kitBottleName">{isKit ? OFFER_CARD_HEAD : HF_NAME}</p>
            <p className="kitBottleSupply">
              {isKit ? OFFER_CARD_SUB : BOTTLE_WHATYOUGET}
            </p>
          </div>
        </div>

        {/* THE STACK IS THE KIT'S. There is nothing to total on the bottle:
            one line above says what is in the box, and inventing a stack for
            it would be a value claim with no bonuses behind it. */}
        {isKit && <KitStack />}

        {/* THE DEAL. The badge sits on the border, as on her page, so the
            crossed-out price and the one she pays read as one movement. */}
        <div className="kitDeal">
          {/* THE BADGE NAMES THE SAVING, not the old price. David, 2 November:
              the struck $49.99 was legible only inside this pill, at 12.5px
              on a purple fill, which is the smallest type on the card for one
              of the two numbers that matter most. It is in the price row
              below now, at the size the subscription box sets it, and the
              badge says what she keeps instead. */}
          <span className="kitDealBadge">
            {isKit ? `${KIT_TOTAL_LABEL} ${QUIZ_KIT_VALUE_TOTAL}` : BOTTLE_SAVE}
          </span>
          <div className="kitDealNow">
            {/* THE KIT IS STRUCK AGAINST TWO BOTTLES, not one: that is what
                is in the box, and $99.98 is what those cost bought singly. */}
            {/* THE ANCHOR IS THE WHOLE KIT, never a line in it. It struck
                $99.99, the two-bottle row, which quietly argued the kit is
                worth two bottles rather than $196.99 of things. */}
            <s className="kitWas">
              {isKit ? QUIZ_KIT_VALUE_TOTAL : money(ONE_MONTH_PRICE)}
            </s>
            <span className="kitDealNum">
              {money(isKit ? QUIZ_KIT_AFTER_DISCOUNT : SINGLE_AFTER_DISCOUNT)}
            </span>
          </div>
          <p className="kitDealNote">
            {KIT_ONCE_NOTE}
            {!isKit && <> &middot; {singleDailyPrice()} a day</>}
          </p>
          <a
            className="cta kitBtn" href={once} data-offer={isKit ? 'protocol' : 'single'}
            onClick={() => track.checkout(
              outcome,
              isKit ? QUIZ_KIT_AFTER_DISCOUNT : SINGLE_AFTER_DISCOUNT,
              isKit ? 'protocol' : 'single',
              'kit-main',
            )}
          >
            {isKit ? KIT_BUY_CTA : BOTTLE_CTA} <Arrow />
          </a>
          {!isKit && <p className="kitDealFine">{OFFER_ONCE_NOTE}</p>}
          {/* The same fact as the hero's, in one line, where she is actually
              clicking. */}
          {!isKit && <p className="kitDealWhy">{WELCOME_WHY_SHORT}</p>}
        </div>

        {/* THE SUBSCRIPTION IS OFF THE KIT PAGE, 6 November. At $47 for two
            bottles the kit is $23.50 a bottle and the subscription is $39.99,
            so the alternative was worse on every axis: more per bottle, less
            in the box, and a commitment. One-time only here.

            IT STAYS ON THE ONE-BOTTLE OFFER, where $39.99 a month against
            $37.50 once is a real choice about what happens in month two. */}
        {!isKit && (
          <>
            <div className="kitOr"><span>or</span></div>

            <div className="kitDeal2">
              <span className="kitDeal2Badge">{SUB_BEST_VALUE}</span>
              <div className="kitDeal2Now">
                <s className="kitWas">{money(ONE_MONTH_PRICE)}</s>
                <span className="kitDeal2Num">{money(SUBSCRIBE_PRICE)}</span>
                <span className="kitDeal2Per">{KIT_SUB_PER}</span>
              </div>
              <p className="kitDeal2Ship">
                <span className="kitShip"><Truck /> {FREE_SHIPPING}</span>
              </p>
              <p className="kitDealNote kitSubLock">{subLockLine()}</p>
              <p className="kitDealNote">{KIT_SUB_NOTE}</p>
              <a
                className="cta kitBtn" href={sub} data-offer="subscribe"
                onClick={() => track.checkout(outcome, SUBSCRIBE_PRICE, 'subscribe', 'kit-sub')}
              >
                {SUB_LABEL} <Arrow />
              </a>
            </div>
          </>
        )}

        {/* TRUE, SAID ONCE, NO TIMER. Rendered here rather than through
            SHOW_BATCH_LINE, which is the global switch and is off for the
            offer pages at David's request.

            THE BOTTLE PAGE ONLY, since 6 November: David asked for the
            kit's line, which counted kits rather than bottles, to come off
            the page. */}
        {!isKit && KIT_BATCH_SHOWN && (
          <p className="buyBatch kitBatch">{bottleBatchLine()}</p>
        )}

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
