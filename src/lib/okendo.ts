/* The real Hormone Focus reviews, read from Okendo's public Storefront API.
 *
 * NO SECRET IS USED OR NEEDED. The subscriber id below is the public store
 * identifier Okendo puts in its own widget embed, and the endpoint is
 * unauthenticated and CORS-open. The private Merchant API key is NOT used
 * here and must never reach the browser.
 *
 * Ported from the landing page's lib/okendo.ts, which reads the same store
 * and the same product, so the quiz and the page cannot disagree about what
 * customers said.
 *
 * THE API IS LIMITED: no summary endpoint, no sort, no filter. Only `limit`
 * and the `nextUrl` cursor do anything, and reviews come back newest first.
 * So the average, the count and the histogram are computed here, which means
 * reading every review once — two requests at limit=100, and only when the
 * section is near the viewport.
 */
const STORE_ID = '602b956e-b79b-45f9-8fa5-325dae21d2e9';
const PRODUCT_ID = 'shopify-7171961258095'; // Hormone Focus, from Okendo's embed
const API = 'https://api.okendo.io/v1';
/* nextUrl comes back as a PATH BELOW /v1, not a URL — '/stores/…'. Fetching
   it as-is hits our own origin; resolving it with new URL() against the host
   drops the /v1 and 403s. It is concatenated onto the API base instead. */

const PAGE_SIZE = 100;
const MAX_PAGES = 12; // a backstop, not an expected limit

export interface OkendoReview {
  reviewId: string;
  rating: number;
  title?: string;
  body?: string;
  dateCreated: string;
  reviewer?: { displayName?: string; isVerified?: boolean };
}

export interface ReviewsData {
  reviews: OkendoReview[];
  total: number;
  average: number;
  histogram: Record<number, number>;
}

export function summarise(reviews: OkendoReview[]): ReviewsData {
  const histogram: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    const n = Math.round(r.rating);
    if (n >= 1 && n <= 5) histogram[n] += 1;
    sum += r.rating;
  }
  return {
    reviews,
    total: reviews.length,
    average: reviews.length ? sum / reviews.length : 0,
    histogram,
  };
}

/**
 * Every review for the product, followed through the cursor.
 *
 * A failure here is not an error state worth showing her: the page has
 * authored reviews of its own to fall back on, so this throws and the caller
 * decides. `signal` lets a component that unmounts stop paging.
 */
export async function fetchReviews(signal?: AbortSignal): Promise<ReviewsData> {
  const out: OkendoReview[] = [];
  let url: string | null =
    `${API}/stores/${STORE_ID}/products/${PRODUCT_ID}/reviews?limit=${PAGE_SIZE}`;

  for (let page = 0; url && page < MAX_PAGES; page += 1) {
    let json: { reviews?: OkendoReview[]; nextUrl?: string | null };
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`okendo ${res.status}`);
      json = await res.json();
    } catch (e) {
      /* A LATER PAGE FAILING MUST NOT COST THE EARLIER ONES. The first page
         is a hundred reviews and plenty to show; losing all of them because
         the fourth request timed out would be the worst of both. The first
         page still throws, because then there is nothing to show. */
      if (page === 0 || (e as { name?: string })?.name === 'AbortError') throw e;
      break;
    }
    out.push(...(json.reviews ?? []));
    url = json.nextUrl ? API + json.nextUrl : null;
  }

  return summarise(out);
}

/** Newest first is how they arrive; this is the n with something to read. */
export const withText = (reviews: OkendoReview[], n: number): OkendoReview[] =>
  reviews.filter((r) => (r.body ?? '').trim().length > 40).slice(0, n);
