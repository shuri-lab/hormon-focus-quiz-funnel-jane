/* The commercial numbers, in one place, because some of them are not
   confirmed yet and somebody will have to change them.
 *
 * NOTHING that sells is allowed to hard-code a price, a variant id or a
 * discount code anywhere else. The offer screen at the end of the quiz and
 * the offer pages at /offer, /offer/:slug and /live all read this file, so
 * there is one offer in the code rather than two that drift apart.
 *
 * OPEN BEFORE ADS RUN (carried over from Jane's note on the offer screen):
 *  - SUBSCRIBE_PRICE is derived from the subscribe-and-save on the live
 *    product page. It is not confirmed, and SUBSCRIPTION_LIVE keeps the
 *    option off the page until the plan exists.
 *  - No 3 or 6-month bundle exists. The ladder shows one.
 *  - The Starter Guide does not exist. It is promised as step 1.
 *
 * The on-screen warning about all three now renders only in development or
 * with ?debug=1, so the team still sees it in review and a customer never does.
 */

/* ------------------------------------------------------------- prices -- */

export const ONE_MONTH_PRICE = 49.99;
/** Two bottles, sixty days, free shipping. */
export const PROTOCOL_PRICE = 84.99;
/** Per bottle every thirty days, free shipping. Not live yet. */
export const SUBSCRIBE_PRICE = 39.99;
export const SUBSCRIBE_SAVING = '10%';
export const GUARANTEE_DAYS = 60;

export const money = (n: number) => `$${n.toFixed(2)}`;

/** Two bottles at the Protocol price, shown per bottle. */
export const PROTOCOL_PER_BOTTLE = PROTOCOL_PRICE / 2;

/* ----------------------------------------------- what the cart needs -- */

/** The live Hormone Focus variant on shop.jjsmithonline.com. */
export const SINGLE_VARIANT_ID = '41200079175791';

/**
 * A dedicated two-bottle variant. Null until it exists in Shopify.
 *
 * Set this and the Protocol button switches from the discount-code link to a
 * single-variant link on the next deploy. Nothing else has to change, and the
 * discount code below becomes the backup rather than the mechanism.
 */
export const PROTOCOL_VARIANT_ID: string | null = null;

/**
 * The discount code that makes two bottles cost PROTOCOL_PRICE while there is
 * no two-bottle variant. Shopify applies it on arrival at the cart.
 *
 * Null hides the code link, which would otherwise send her to a cart holding
 * two bottles at full price.
 */
export const PROTOCOL_DISCOUNT_CODE: string | null = 'PROTOCOL';

/** True when the subscription plan exists. False keeps the option unrendered. */
export const SUBSCRIPTION_LIVE = false;

/** Where a subscription would be bought, once there is a plan to buy. */
export const SUBSCRIBE_PATH = '/products/hormonal-imbalance';

/* ------------------------------------------------------- the options -- */

/** Which of the three things she is buying. Carried through to the cart link. */
export type OfferKind = 'single' | 'protocol' | 'subscribe';

export interface OfferOption {
  kind: OfferKind;
  /** The row title. */
  title: string;
  /** The line under the title. */
  detail: string;
  /** What the button reads when this row is chosen. */
  cta: string;
  /** The same button in the sticky bar, where there is room for less. */
  ctaShort: string;
  /** The price shown on the right of the row, and sent with begin_checkout. */
  price: number;
  /** The small line under the price. */
  priceNote: string;
  /** The pill beside the title, where there is one. */
  badge?: string;
}

const SINGLE_OPTION: OfferOption = {
  kind: 'single',
  title: '1 bottle · 30 days',
  detail: `${money(ONE_MONTH_PRICE)} per bottle`,
  cta: 'Get one bottle',
  ctaShort: 'Get one bottle',
  price: ONE_MONTH_PRICE,
  priceNote: 'plus shipping',
};

const PROTOCOL_OPTION: OfferOption = {
  kind: 'protocol',
  title: '2 bottles · 60-Day Protocol',
  detail: `${money(PROTOCOL_PER_BOTTLE)} per bottle · free shipping`,
  cta: 'Start the 60-Day Protocol',
  ctaShort: 'Start the Protocol',
  price: PROTOCOL_PRICE,
  priceNote: 'free shipping',
  badge: 'Best Seller',
};

const SUBSCRIBE_OPTION: OfferOption = {
  kind: 'subscribe',
  title: 'Protocol Subscription',
  detail: 'One bottle every 30 days · skip, pause or cancel any time',
  cta: 'Start the subscription',
  ctaShort: 'Subscribe',
  price: SUBSCRIBE_PRICE,
  priceNote: 'per delivery · free shipping',
  badge: 'Best value',
};

/**
 * The rows, in the order they are shown. The subscription appears only when
 * there is a plan behind it, so the flag is the only thing that has to change
 * on the day Loop is set up.
 */
export const OFFER_OPTIONS: OfferOption[] = SUBSCRIPTION_LIVE
  ? [SINGLE_OPTION, PROTOCOL_OPTION, SUBSCRIBE_OPTION]
  : [SINGLE_OPTION, PROTOCOL_OPTION];

/** The Protocol is what we sell. It is chosen for her, on every page. */
export const DEFAULT_OFFER: OfferKind = 'protocol';

export const optionFor = (kind: OfferKind): OfferOption =>
  OFFER_OPTIONS.find((o) => o.kind === kind) ?? PROTOCOL_OPTION;

/* --------------------------------------------------------- cart paths -- */

/**
 * The path and query the cart link carries, by mode. The origin comes from
 * SHOP_BASE in logic.ts, so the store host is still named in one place.
 *
 *  1 · single      /cart/<single>:1?storefront=true
 *  2 · by code     /cart/<single>:2?storefront=true&discount=PROTOCOL
 *  3 · by variant  /cart/<protocol>:1?storefront=true
 *
 * Mode 2 runs while PROTOCOL_VARIANT_ID is null. Mode 3 takes over the moment
 * it is set. With neither a variant nor a code, the Protocol falls back to two
 * bottles at full price rather than to a broken link.
 */
export function cartPath(kind: OfferKind): string {
  if (kind === 'subscribe') return SUBSCRIBE_PATH;

  if (kind === 'protocol') {
    if (PROTOCOL_VARIANT_ID) {
      return `/cart/${PROTOCOL_VARIANT_ID}:1?storefront=true`;
    }
    const code = PROTOCOL_DISCOUNT_CODE
      ? `&discount=${encodeURIComponent(PROTOCOL_DISCOUNT_CODE)}`
      : '';
    return `/cart/${SINGLE_VARIANT_ID}:2?storefront=true${code}`;
  }

  return `/cart/${SINGLE_VARIANT_ID}:1?storefront=true`;
}

/** True when the internal warning block should render. Never true for a customer. */
export function showInternalNotes(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return new URLSearchParams(window.location.search).get('debug') === '1';
  } catch {
    return false;
  }
}
