/* The commercial numbers, in one place, because some of them are not
   confirmed yet and somebody will have to change them.
 *
 * NOTHING that sells is allowed to hard-code a price, a variant id or a
 * discount code anywhere else. The offer screen at the end of the quiz and
 * the offer pages at /offer, /offer/:slug and /live all read this file, so
 * there is one offer in the code rather than two that drift apart.
 *
 * THE PRICES ARE JJ'S PAGE'S. The kit at $74.99 with free shipping, one
 * bottle at $49.99, and the subscription at $39.99 every 30 days, as
 * hormonefocus.jjsmithonline.com sells them (checked 2 October 2026).
 *
 * THE NAME. She reads "The 60-Day Feel Like YOU Again Kit". We write
 * PROTOCOL_ in the constant names because that is what the store, the
 * discount code and the analytics call it, and renaming those would break
 * live links. The word never reaches her: tests/copy.test.ts fails the build
 * if it appears in a string she could read.
 */

/* ------------------------------------------------------------- prices -- */

export const ONE_MONTH_PRICE = 49.99;
/**
 * Two bottles, sixty days, free shipping.
 *
 * Everything the Plan says about itself divides out of this one number: the
 * per-bottle line, the saving against two singles, and the day rate. Move it
 * and the card, the row and the stack all move together.
 */
export const PROTOCOL_PRICE = 74.99;
/**
 * Per bottle every four weeks, free shipping.
 *
 * 39.99, confirmed by David. It was 44.99 here, which he had confirmed
 * earlier on the reasoning that it was 10% off a 49.99 bottle — and 44.99 is
 * exactly that. 39.99 is 20% off, so SUBSCRIBE_SAVING moves with the price
 * rather than being left to contradict it. The two are only ever right or
 * wrong together, which is why they sit in the same comment.
 */
export const SUBSCRIBE_PRICE = 39.99;
export const SUBSCRIBE_SAVING = '20%';
export const GUARANTEE_DAYS = 60;

export const money = (n: number) => `$${n.toFixed(2)}`;

/** Two bottles at the Protocol price, shown per bottle. */
export const PROTOCOL_PER_BOTTLE = PROTOCOL_PRICE / 2;

/* --------------------------------------------------------- the name -- */

/**
 * What the two-bottle option is called, everywhere she sees it.
 *
 * Magnet reason, avatar, interval and container in four words: sixty days,
 * women over 40, a plan. "Protocol" is a delivery vehicle and it is our word
 * for it, not hers.
 */
/* RENAMED 30 October 2026, David: the kit is "The Feel Like YOU Again Kit"
   and the 60-Day wording comes off its name.
   WHAT KEEPS ITS SIXTY DAYS, because none of it is the kit's name: the
   60-Day Happiness Guarantee is the refund window and a policy term, The
   60-Day Hormone Fix is the ebook's own title, and PLAN_SHORT below still
   names the TWO-bottle pack on /offer, which really is sixty days of it. */
export const PLAN_NAME = 'The Feel Like YOU Again Kit';
export const PLAN_SHORT = 'The 60-Day Kit';

/** The three digital pieces, as one line for a card. */
export const KIT_BONUS =
  'The 60-Day Hormone Fix ebook, Hormone Healthy Recipes and the Daily Symptom Tracker';

/**
 * JJ's own value stack, line for line as it reads on her offer page
 * (hormonefocus.jjsmithonline.com, read 2 October 2026). The quiz shows the
 * same kit at the same price with the same arithmetic, so the two doors
 * cannot describe two different offers.
 */
export const KIT_VALUE: [string, string][] = [
  ['2 Bottles of Hormone Focus', '$99.99'],
  ['The 60-Day Hormone Fix eBook', '$49'],
  ['Hormone Healthy Recipes eBook', '$29'],
  ['Daily Symptom Tracker', '$19'],
];
export const KIT_TOTAL_VALUE = '$196.99';

/** The line under the kit's name, on her page and on the kit image. */
export const KIT_TAGLINE = 'Better Sleep. Less Stubborn Belly. More Energy. More YOU.';

/** The kit shot and the one-bottle shot, as on her page. */
export const SHOT_KIT = '/img/kit-60-day.webp';
export const SHOT_KIT_BOTTLE = '/img/kit-one-bottle.webp';
export const MONEY_BACK_BADGE = '/img/money-back-badge.webp';

/* ----------------------------------------------- what the cart needs -- */

/** The live Hormone Focus variant on shop.jjsmithonline.com. */
export const SINGLE_VARIANT_ID = '41200079175791';

/**
 * The dedicated two-bottle variant — "Hormone Focus Bundle - 2 Bottles".
 *
 * This is now the mechanism. One bundle, quantity 1, priced in Shopify, so
 * the Protocol link no longer depends on a discount code existing: the cart
 * shows PROTOCOL_PRICE because the variant costs that, not because a code
 * was applied on arrival. The code below is the backup it was designed to be.
 */
export const PROTOCOL_VARIANT_ID: string | null = '54330638663791';

/**
 * The discount code that makes two bottles cost PROTOCOL_PRICE while there is
 * no two-bottle variant. Shopify applies it on arrival at the cart.
 *
 * Null hides the code link, which would otherwise send her to a cart holding
 * two bottles at full price.
 */
export const PROTOCOL_DISCOUNT_CODE: string | null = 'PROTOCOL';

/**
 * The code the kit link carries on JJ's own page, which is what gives the kit
 * its free shipping at the cart. The quiz sends the same link the page does,
 * so Shopify sees one offer from two doors.
 */
export const KIT_SHIPPING_CODE: string | null = 'HF60FREESHIP';

/**
 * Ten percent off one bottle, for the quiz offer page only.
 *
 * VERIFIED AGAINST THE LIVE CHECKOUT, 22 October 2026, by typing it into
 * Shopify's own discount field and by loading the cart permalink that carries
 * it. Both produce the same thing on variant 41200079175791:
 *
 *   Subtotal $49.99 · Order discount JJTEN -$4.99 · Total USD $45.00
 *
 * The code David first gave was JJ10, and Shopify answered that one with
 * "Enter a valid discount code". Nothing was built on it. Do not change this
 * string without putting the new one through the same check: a code the page
 * promises and the cart refuses is worse than no discount at all.
 *
 * NOT ON /offer. Those pages sell the same bottle at full price and are out
 * of this change's scope, so the code is threaded through cartPath by the
 * caller rather than baked into the single-bottle path.
 */
export const SINGLE_DISCOUNT_CODE: string | null = 'JJTEN';

/**
 * What Shopify actually charges for one bottle with that code: $45.00.
 *
 * NOT 44.99, AND NOT ARITHMETIC. Ten percent of 49.99 is 4.999, Shopify
 * rounds the DISCOUNT to $4.99 rather than the total to $44.99, and the
 * customer pays $45.00. Computing it here would print a price a cent under
 * what she is charged, which is the exact failure the page must not have.
 * Read off the live checkout and written down.
 */
export const SINGLE_AFTER_DISCOUNT = 45.00;

/* ------------------------------------------ the quiz page's 60-Day Kit -- */

/**
 * WHAT THE QUIZ OFFER PAGE SELLS, as of 29 October 2026: the bottle and the
 * three digital pieces together, under the name JJ already uses for them.
 *
 * ONE BOTTLE, NOT TWO, which is the whole reason this is its own array and
 * not KIT_VALUE above. JJ's page sells the kit as two bottles against a
 * $196.99 value. This page sells ONE bottle with the same three bonuses, so
 * the arithmetic is genuinely different and reading both off one array would
 * put a two-bottle value over a one-bottle order.
 *
 * NOTHING NEW IS PROMISED HERE. The three pieces are the ones already named
 * in KIT_BONUS and already listed in BONUSES for the offer pages. What is
 * new is only that they are priced, which is what makes a value stack a
 * value stack.
 *
 * WHAT SHOPIFY ACTUALLY SHIPS IS STILL ONE BOTTLE. The kit has no variant of
 * its own yet, so every button on that page still buys SINGLE_VARIANT_ID.
 * The three bonuses are a fulfilment promise this repo cannot keep on its
 * own; see the note on the page itself.
 */
const BONUS_FIX_WORTH = 49;
const BONUS_RECIPES_WORTH = 29;
const BONUS_TRACKER_WORTH = 19;

/** Whole dollars print without cents, as they do on JJ's own stack. */
const worth = (n: number): string => (Number.isInteger(n) ? `$${n}` : money(n));

/* Typed as StackItem so the offer pages' own ValueStack component renders
   these rows, rather than the quiz page carrying a second copy of the same
   markup. KitRow was that second type and is gone. */
export const QUIZ_KIT_ROWS: StackItem[] = [
  {
    what: 'Hormone Focus, 30-day supply', worth: worth(ONE_MONTH_PRICE),
    img: '/img/kit-bottle-thumb.webp',
  },
  {
    what: 'The 60-Day Hormone Fix', worth: worth(BONUS_FIX_WORTH),
    free: true, bonus: true, img: '/img/kit-guide-thumb.webp',
  },
  {
    what: 'Hormone Healthy Recipes', worth: worth(BONUS_RECIPES_WORTH),
    free: true, bonus: true, img: '/img/kit-recipes-thumb.webp',
  },
  {
    what: 'The Daily Symptom Tracker', worth: worth(BONUS_TRACKER_WORTH),
    free: true, bonus: true, img: '/img/kit-tracker-thumb.webp',
  },
  {
    what: 'The 60-Day Happiness Guarantee', worth: 'included',
    /* THE SEAL ITSELF, not a tick. David, 30 October: the row carries the
       same badge the guarantee band further down the page carries.

       THE SAME FILE, deliberately. That band renders MONEY_BACK_BADGE too,
       so this costs no second request: whichever of the two she reaches
       first warms the cache for the other. */
    img: MONEY_BACK_BADGE,
  },
];

/**
 * The sum of the rows above, COMPUTED.
 *
 * Typed, it is a number that goes stale the first time a price moves and
 * nobody notices, which is the same class of mistake as the $44.99 note
 * further up. A test holds it to $146.99 so a deliberate change still has to
 * be a deliberate change.
 */
const QUIZ_KIT_VALUE_NUM =
  ONE_MONTH_PRICE + BONUS_FIX_WORTH + BONUS_RECIPES_WORTH + BONUS_TRACKER_WORTH;

export const QUIZ_KIT_VALUE_TOTAL = money(QUIZ_KIT_VALUE_NUM);

/**
 * What the price block says she keeps: $101.99.
 *
 * Subtracted rather than typed, for the same reason the total is summed. The
 * badge beside a price is the first thing anybody checks with a calculator.
 */
export const QUIZ_KIT_SAVING = money(QUIZ_KIT_VALUE_NUM - SINGLE_AFTER_DISCOUNT);

/** The kit shot for the quiz page's hero: the bottle and all three pieces. */
export const SHOT_KIT_HERO = '/img/kit-60-day-hero.webp';

/* The two strings the kit's own rows need. They live here rather than in
   kitCopy.ts because kitCopy imports from this file; kitCopy re-exports them
   under the names the page already uses, so there is one source and no cycle.
   Both are read by the copy gate either way. */
export const KIT_BUY_CTA = 'Get my Kit';
export const KIT_DISCOUNT_NOTE = '10% off applied at checkout';

/** True when the subscription plan exists. False keeps the option unrendered. */
export const SUBSCRIPTION_LIVE = true;

/** The Shopify selling plan: one bottle, delivered every four weeks. */
export const SUBSCRIBE_SELLING_PLAN_ID = '5529010287';

/**
 * The subscription's OWN variant, which is not the single bottle.
 *
 * It was 41200079175791 — the one-off variant with a plan attached. It is
 * its own variant now, so the two cannot be confused in the store or in a
 * report, and changing the one-off price can no longer move what a
 * subscriber pays.
 */
export const SUBSCRIBE_VARIANT_ID = '54355951845487';

/**
 * Where the subscription is bought.
 *
 * NOT a cart permalink. A selling plan cannot be expressed in the
 * /cart/<variant>:<qty> form, so this is the /cart/add form instead, which
 * Shopify accepts over GET: it adds the line with its plan attached and
 * redirects to the cart — the same place the other two land, by a different
 * door. `storefront=true` is meaningless on this endpoint and is ignored;
 * what must survive is `selling_plan`, and cartUrlRequirements() below is
 * what a test holds it to.
 */
export const SUBSCRIBE_PATH =
  `/cart/add?id=${SUBSCRIBE_VARIANT_ID}&quantity=1` +
  `&selling_plan=${SUBSCRIBE_SELLING_PLAN_ID}`;

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
  /**
   * The price this row is down FROM, struck through beside it.
   *
   * ADDED FOR THE KIT, 29 October 2026, and optional so every row that had no
   * crossed-out price still has none. /offer and /live are untouched.
   */
  was?: number;
}

const SINGLE_OPTION: OfferOption = {
  kind: 'single',
  title: '1 bottle · 30 days',
  detail: `${money(ONE_MONTH_PRICE)} per bottle`,
  cta: 'Get 1 bottle',
  ctaShort: 'Get 1 bottle',
  price: ONE_MONTH_PRICE,
  priceNote: 'plus shipping',
};

const PROTOCOL_OPTION: OfferOption = {
  kind: 'protocol',
  title: `2 bottles · ${PLAN_SHORT}`,
  detail: `${money(PROTOCOL_PER_BOTTLE)} per bottle · free shipping`,
  /* What she is buying, not what she is starting. The row label still names
     the Plan; the button names the bottles. */
  cta: 'Get my kit',
  ctaShort: 'Get my kit',
  price: PROTOCOL_PRICE,
  priceNote: 'free shipping',
  badge: 'Best Seller',
};

const SUBSCRIBE_OPTION: OfferOption = {
  kind: 'subscribe',
  title: 'Monthly delivery',
  detail: 'One bottle every 4 weeks · skip, pause or cancel any time',
  cta: 'Subscribe & save',
  ctaShort: 'Subscribe & save',
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

/** The Plan is what we sell. It is chosen for her, on every page. */
export const DEFAULT_OFFER: OfferKind = 'protocol';

/** The subscription never shows on /live, whatever SUBSCRIPTION_LIVE says; on /offer and the quiz it shows only when the flag is on. */
export const optionsFor = (live: boolean): OfferOption[] =>
  (live ? OFFER_OPTIONS.filter((o) => o.kind !== 'subscribe') : OFFER_OPTIONS);

export const optionFor = (kind: OfferKind): OfferOption =>
  OFFER_OPTIONS.find((o) => o.kind === kind) ?? PROTOCOL_OPTION;

/**
 * THE KIT'S TWO ROWS, in the same shape as every other row on the site.
 *
 * A FUNCTION, NOT A CONST, because singleDailyPrice() is declared further down
 * this file; a const here would read it during module initialisation and get
 * undefined. Called at render, it is simply there.
 *
 * SEPARATE FROM OFFER_OPTIONS ON PURPOSE. Those three rows are what /offer,
 * /live and /plan sell, at full price, and the kit is a different offer at a
 * different price with a discount code on it. Putting it in that array would
 * put it on those pages.
 *
 * THE KINDS ARE STILL 'single' AND 'subscribe', which is what keeps the cart
 * honest: they are the two things Shopify actually sells here, and the kit has
 * no variant of its own yet.
 */
export function kitOptions(): OfferOption[] {
  return [
    {
      kind: 'single',
      title: 'One-time purchase',
      detail: `Delivered once \u00b7 ${KIT_DISCOUNT_NOTE}`,
      cta: KIT_BUY_CTA,
      ctaShort: KIT_BUY_CTA,
      price: SINGLE_AFTER_DISCOUNT,
      was: ONE_MONTH_PRICE,
      priceNote: `${singleDailyPrice()} a day`,
    },
    {
      kind: 'subscribe',
      title: 'Subscribe & save',
      detail: 'Delivered every month \u00b7 free shipping \u00b7 pause anytime',
      cta: 'Subscribe & save',
      ctaShort: 'Subscribe & save',
      price: SUBSCRIBE_PRICE,
      was: ONE_MONTH_PRICE,
      priceNote: 'per delivery',
      badge: 'Best value \u00b7 20% off',
    },
  ];
}

/* ------------------------------------------------------- the offer cards -- */

/** The product shots. The cards carry these, which is why the quiz result
    screen no longer needs a bottle photograph of its own above them. */
export const SHOT_ONE = '/img/offer-1-bottle.png';
export const SHOT_TWO = '/img/offer-2-bottles.png';
/** The seal, which is the guarantee said in one glance. */
export const GUARANTEE_SEAL = '/img/guarantee-seal.webp';

/** Days of supply each row buys. Four weeks is 28, not a month. */
const SUPPLY_DAYS: Record<OfferKind, number> = {
  single: 30,
  protocol: 60,
  subscribe: 28,
};

/**
 * What a row costs a day.
 *
 * The day rate is the only number that compares three prices bought over
 * three different lengths of time, so every card carries one.
 */
export const perDay = (kind: OfferKind): string =>
  money(optionFor(kind).price / SUPPLY_DAYS[kind]);

export interface OfferCard {
  kind: OfferKind;
  /** Small-caps label at the top of the card. */
  kicker: string;
  /** How long it lasts, under the kicker. */
  supply: string;
  /** The struck-through price, only where there is a real saving. */
  was?: string;
  now: string;
  perDay: string;
  /** The small line under the price — OFFER_OPTIONS' own priceNote. */
  terms: string;
  /** Shown on the Plan only, where there is a real saving to name. */
  saving?: string;
  /** Named, pictured, and never handed over before she has bought. */
  bonus?: string;
  cta: string;
  badge?: string;
  /** Which product shot sits at the top. */
  shot: string;
  /** The guide shot beside it, on the plan that includes it. */
  shotGuide?: string;
}

/**
 * The three cards, in the order she reads them.
 *
 * Every number is derived rather than typed twice: the saving is the two
 * singles minus the plan, and the day rates come from perDay(). Change a
 * price in one place above and all three cards follow.
 */
export function offerCards(): OfferCard[] {
  const saving = ONE_MONTH_PRICE * 2 - PROTOCOL_PRICE;

  /* THE WORDS ARE THE ONES WE ALREADY HAD. The card layout comes from Jane's
     landing page; the copy inside it comes from OFFER_OPTIONS, unchanged, so
     the redesign cannot quietly rename the Plan or drop a price note. The
     day rate is the one line the cards add, and it is arithmetic. */
  const card = (kind: OfferKind, extra: Partial<OfferCard>): OfferCard => {
    const o = optionFor(kind);
    return {
      kind,
      kicker: o.title,
      supply: o.detail,
      now: money(o.price),
      perDay: perDay(kind),
      terms: o.priceNote,
      badge: o.badge,
      cta: o.cta,
      shot: SHOT_ONE,
      ...extra,
    };
  };

  return [
    card('single', {}),
    card('protocol', {
      was: money(ONE_MONTH_PRICE * 2),
      saving: money(saving),
      bonus: KIT_BONUS,
      shot: SHOT_TWO,
    }),
    card('subscribe', { was: money(ONE_MONTH_PRICE) }),
  ];
}

/* -------------------------------------------------- what she gets -- */

export interface StackItem {
  /** The thing itself. */
  what: string;
  /** What it is worth to her, in her terms. */
  worth: string;
  /** Named as a bonus, because a bonus named is worth more than one folded in. */
  bonus?: boolean;
  /**
   * Free with this offer: `worth` is struck through and "free" shown beside it.
   *
   * A bonus with no number against it is worth nothing in a value stack, and a
   * number with nothing marking it free reads as something she is paying for.
   * The kit's three bonuses need both at once.
   */
  free?: boolean;
  /**
   * A picture of the thing, for a stack that shows its bonuses rather than
   * only listing them. Added 30 October with the kit's own stack; the offer
   * pages' rows have none and render exactly as before.
   */
  img?: string;
}

/**
 * The value stack, under the price on every surface that sells.
 *
 * Two of these cost nothing to give and already exist: the Starter Guide is a
 * page we write once, and the Cheat Sheet is the gift the store already sends
 * on orders over $40. Naming them is the whole point — an unnamed inclusion is
 * worth nothing, and she is deciding whether $84.99 is a lot of money.
 *
 * Edited here and nowhere else. The offer pages and the quiz offer screen both
 * render this array.
 */
/** Free shipping is worth this, and only two of the three rows get it. */
const SHIPPING_WORTH = '$7.95';

/* The two bonuses and the guarantee are the same whichever row she is on:
   both bonuses are things we already own, and the guarantee is store policy
   rather than a property of the order. Only the top of the stack changes. */
const BONUSES: StackItem[] = [
  { what: 'The 60-Day Hormone Fix, JJ\u2019s ebook and 5-step plan', worth: 'included', bonus: true },
  { what: 'Hormone Healthy Recipes', worth: 'included', bonus: true },
  { what: 'The Daily Symptom Tracker', worth: 'included', bonus: true },
];

const GUARANTEE_ITEM: StackItem = {
  what: 'The 60-Day Happiness Guarantee',
  worth: 'or it is free',
};

/**
 * What she gets, for the row she is actually on.
 *
 * This used to be one flat array, which meant the stack sold two bottles and
 * free shipping while she had one bottle selected and the row beside it said
 * "plus shipping". The stack is the argument for the price directly above it,
 * so it has to be the argument for HER price.
 *
 * The single has no free-shipping line at all rather than a crossed-out one:
 * shipping is not in it, and listing what she is not getting under a heading
 * reading "What is in it" is the kind of thing that loses an order.
 */
export function valueStackFor(kind: OfferKind): StackItem[] {
  if (kind === 'single') {
    return [
      {
        what: 'One bottle of Hormone Focus, 30 days',
        worth: money(ONE_MONTH_PRICE),
      },
      GUARANTEE_ITEM,
    ];
  }

  if (kind === 'subscribe') {
    return [
      {
        what: 'One bottle of Hormone Focus, every 4 weeks',
        worth: `${money(ONE_MONTH_PRICE)} bought one at a time`,
      },
      { what: 'Free shipping, every delivery', worth: SHIPPING_WORTH },
      GUARANTEE_ITEM,
    ];
  }

  return [
    {
      what: 'Two bottles of Hormone Focus, 60 days',
      worth: `${money(ONE_MONTH_PRICE * 2)} bought one at a time`,
    },
    { what: 'Free shipping', worth: SHIPPING_WORTH },
    ...BONUSES,
    GUARANTEE_ITEM,
  ];
}

/** The Plan's stack, which is what a page shows before she touches anything. */
export const VALUE_STACK: StackItem[] = valueStackFor(DEFAULT_OFFER);

/* ------------------------------------------------------- the switches -- */

/**
 * Three lines that are true today and may not be true next month. Each one is
 * a flag rather than a paragraph somebody has to find and delete, and each
 * renders one line or nothing at all.
 */

/** Under the price: what the Plan costs a day. Off at David's request. */
export const SHOW_DAILY_PRICE = false;

/**
 * Near the button: real stock, said once.
 *
 * This is the only scarcity on the page and it is true. There is no countdown
 * and no timer, here or anywhere else — a fake deadline is an FTC problem in
 * this category and this audience has seen enough of them to distrust ours.
 * Take this line down the day it stops being true.
 */
/* The batch line. Off at David's request. */
export const SHOW_BATCH_LINE = false;
export const BATCH_ON_SHELF = 2280;
export const NEXT_BATCH = 'December';

/**
 * The Live deadline, on /live only. Null renders nothing at all.
 *
 * Set it to the words JJ says out loud on the broadcast, and unset it the
 * morning after. A deadline she is given and we do not keep is worse than no
 * deadline, so this stays null unless somebody is keeping it.
 */
export const LIVE_DEADLINE: string | null = null;

/** The kit price over sixty days, to the cent. Still used by /offer. */
export const dailyPrice = (): string => money(PROTOCOL_PRICE / 60);

/**
 * One discounted bottle over the thirty days it lasts: $1.50.
 *
 * The quiz offer page leads with the bottle now, so $1.25 a day is the wrong
 * number there: that is the kit's rate, over sixty days, and the kit is not
 * on that page any more.
 */
export const singleDailyPrice = (): string => money(SINGLE_AFTER_DISCOUNT / 30);

/** 2280 reads as 2,280. */
export const batchCount = (): string => BATCH_ON_SHELF.toLocaleString('en-US');

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
export function cartPath(kind: OfferKind, discount: string | null = null): string {
  if (kind === 'subscribe') return SUBSCRIBE_PATH;

  if (kind === 'protocol') {
    if (PROTOCOL_VARIANT_ID) {
      const ship = KIT_SHIPPING_CODE
        ? `&discount=${encodeURIComponent(KIT_SHIPPING_CODE)}`
        : '';
      return `/cart/${PROTOCOL_VARIANT_ID}:1?storefront=true${ship}`;
    }
    const code = PROTOCOL_DISCOUNT_CODE
      ? `&discount=${encodeURIComponent(PROTOCOL_DISCOUNT_CODE)}`
      : '';
    return `/cart/${SINGLE_VARIANT_ID}:2?storefront=true${code}`;
  }

  /* THE DISCOUNT IS THE CALLER'S, NOT THIS PATH'S. /offer and /plan sell the
     same bottle at full price and call this with nothing, so they are
     unchanged; the quiz offer page passes SINGLE_DISCOUNT_CODE. Shopify takes
     one `discount` parameter, so a code here is instead of a code, never as
     well as one. */
  const code = discount ? `&discount=${encodeURIComponent(discount)}` : '';
  return `/cart/${SINGLE_VARIANT_ID}:1?storefront=true${code}`;
}

