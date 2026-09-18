/* THE WALL OF LOVE — CUSTOMERS' OWN WORDS.
 *
 * Every line below is a customer's, not ours, and that is the whole point of
 * keeping them in their own file.
 *
 * THE RULES, and they are not negotiable:
 *  1. VERBATIM. Each quote is a contiguous span of the published review,
 *     copied character for character — the spelling, the missing spaces, the
 *     six exclamation marks. Nothing is tidied and nothing is strengthened.
 *  2. A leading or trailing '…' marks where a longer review was cut. Two
 *     separate sentences are never stitched into one quote.
 *  3. First name as the reviewer published it.
 *  4. `verified` is the store's own verified-buyer flag. It is what decides
 *     the badge; a review without it is labelled as a customer and claims
 *     nothing more.
 *  5. 'Results vary' renders once under the wall. See offerCopy.ts.
 *
 * BECAUSE THESE ARE QUOTES, tests/copy.test.ts does not hold them to the house
 * copy rules. Customers use contractions and customers say words the brand may
 * not say. That is exactly why this file is separate from offerCopy.ts, which
 * is authored and which the gate does hold.
 *
 * Source: the published Hormone Focus reviews on the store, read 19 Sep 2026.
 * Adding one means copying it from there, not writing it here.
 */

export interface Review {
  /** As the reviewer published it. */
  name: string;
  /** The store's verified-buyer flag. */
  verified: boolean;
  /** A contiguous span of the published review. '…' marks a cut. */
  body: string;
}

export const WALL: Review[] = [
  {
    name: 'Katina S.',
    verified: true,
    body: 'I started taking Hormone Focus and all I can say is I had immediate relief in many areas. My hot flashes started to fade; I could sleep through the night and my brain fog is slowly recovering. I have all 3 in the plan and I\'m so thankful for this product! I\'m starting to feel like myself again. Thanks JJ!!!!!!',
  },
  {
    name: 'Shauna H.',
    verified: false,
    body: '…I have been taking the Hormone Focus for less than 60 days and have noticed improved changes, I haven\'t had any hot flashes, I can feel I\'m more balanced with energy, less mood swings, reduction of fat around the mid-section, back, and arms while taking hormone Focus with light exercise and healthy eating.',
  },
  {
    name: 'Toya H.',
    verified: true,
    body: 'Love the product. It works for my hot flashes and my stomach is getting flatter. I also use flat tummy focus, love that as well.',
  },
  {
    name: 'Sharon',
    verified: false,
    body: 'Hello! I\'ve been using for 8 days and already my hot flashes and night sweats have stopped. Even the bloating and water retention in my belly has come down. Now I\'m gonna see if these fat arms will get smaller. But so far so good. Loving them!',
  },
  {
    name: 'Stephanie L.',
    verified: true,
    body: 'I still have flashes, but I can see as I continue using, they are decreasing, and my belly fat is shrinking',
  },
  {
    name: 'Catonne J.',
    verified: false,
    body: 'Hormone Focus along with taking my other 3 supplements have been a game changer. I am sleeping better at night and I am starting to see the weight around my belly area decrease. Thank you JJ Smith!',
  },
  {
    name: 'QUANEZIA M.',
    verified: true,
    body: 'I\'ve been taken Hormone Focus since the Summer. I have minimum hot flashes and night sweats (the night sweats was treacherous for me at first). I\'m also losing some of the menopausal belly weight with my workout regimen and have less cravings. I\'m glad I followed my first mind... I\'m sold.',
  },
  {
    name: 'Mara',
    verified: false,
    body: 'I have been taking Hormone Focus for several months and I couldn\'t be happier with the results. It has helped tremendously with night sweats and extra weight that I couldn\'t get off. It is a must have product',
  },
  {
    name: 'Lillyana L.',
    verified: false,
    body: 'Hormone focus works! I was struggling with weight loss due to perimenopause and when I started taking this supplement,the weight started dropping.I stopped taking it for a month and the weight is slowly creeping in.Just ordered it again and will never stop taking it!',
  },
  {
    name: 'Kim',
    verified: false,
    body: 'I notice the difference when my bottle of Hormones runs out. As soon as I start taking them again I notice a reduction in hot flashes. I think has reduced the amount of weight that I would have gained if I had not been taking the Hormones. I liked to product.',
  },
];

/** The rating and the count travel together and appear nowhere else. */
export const RATING = '4.9';
export const REVIEW_COUNT = 170;
