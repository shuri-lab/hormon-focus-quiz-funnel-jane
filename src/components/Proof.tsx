import { Stars } from './icons';
import {
  FB_COMMENT, OKENDO_MARK, PROOF_FACES, RATING, REVIEW_COUNT, type Review,
} from '../lib/reviews';

/* SOCIAL PROOF, as it already runs on JJ's offer page.
 *
 * The faces, the 4.9 with the Okendo mark beside it, and one Facebook
 * comment. Every review shown with them is a customer's own words, quoted in
 * full, with "Individual results vary" under it. */

/** "★★★★★ 4.9 · 171 reviews · Verified by Okendo". The count never travels without the rating. */
export function RatingBadge() {
  return (
    <p className="pfRating">
      <span className="pfStars"><Stars n={5} /></span>
      <b>{RATING}</b>
      <span>· {REVIEW_COUNT} reviews · Verified by</span>
      <img src={OKENDO_MARK} alt="Okendo" width={315} height={68} loading="lazy" decoding="async" />
    </p>
  );
}

/** Customers holding the bottle, from JJ's page. */
export function Faces({ count = 12 }: { count?: number }) {
  return (
    <div className={`pfFaces n${count}`}>
      {PROOF_FACES.slice(0, count).map((src) => (
        <img key={src} src={src} alt="A Hormone Focus customer" width={300} height={468}
          loading="lazy" decoding="async" />
      ))}
    </div>
  );
}

/** A customer's words, exactly as she wrote them. */
export function Quote({ review, long = false }: { review: Review; long?: boolean }) {
  return (
    <blockquote className={`kitRev${long ? ' long' : ''}`}>
      <span className="kitRevStars"><Stars n={5} /></span>
      <p>&ldquo;{review.body}&rdquo;</p>
      <cite>
        <b>{review.name}</b>
        {review.verified ? ' · verified buyer' : ' · Hormone Focus customer'}
      </cite>
    </blockquote>
  );
}

/** The Facebook comment, as the picture JJ's page shows. */
export function FacebookComment() {
  return (
    <figure className="pfFb">
      <img src={FB_COMMENT.src} alt={FB_COMMENT.alt} width={900} height={649}
        loading="lazy" decoding="async" />
    </figure>
  );
}
