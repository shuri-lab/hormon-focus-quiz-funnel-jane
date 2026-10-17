import { Stars } from './icons';
import {
  FB_COMMENT, OKENDO_MARK, PRESS_LOGOS, PROOF_FACES, RATING, REVIEW_COUNT, type Review,
} from '../lib/reviews';
import { PRESS_EYEBROW } from '../lib/kitCopy';

/* SOCIAL PROOF, as it already runs on JJ's offer page.
 *
 * The faces, the 4.9 with the Okendo mark beside it, and one Facebook
 * comment. Every review shown with them is a customer's own words, quoted in
 * full, with "Individual results vary" under it. */

/**
 * The score on one line, who verified it on the next.
 *
 * TWO LINES SINCE 16 OCTOBER, at David's request. It was one wrapping line,
 * and "Verified by" plus the Okendo mark is wide enough that on a phone it
 * broke wherever there happened to be room: usually after "Verified by",
 * leaving the mark stranded on a line of its own under a ragged first one.
 * Breaking it on purpose puts the number she is reading for on one line and
 * the attestation under it, which is the order she reads them in anyway.
 *
 * The count never travels without the rating.
 */
export function RatingBadge() {
  return (
    <p className="pfRating">
      <span className="pfRatingScore">
        <span className="pfStars"><Stars n={5} /></span>
        <b>{RATING}</b>
        <span>· {REVIEW_COUNT} reviews</span>
      </span>
      <span className="pfRatingBy">
        Verified by
        <img src={OKENDO_MARK} alt="Okendo" width={315} height={68} loading="lazy" decoding="async" />
      </span>
    </p>
  );
}

/**
 * The customer photographs, moving.
 *
 * THE LANDING PAGE'S OWN STRIP, rebuilt here from the same twelve files so
 * the two doors show the same women. The track holds the twelve twice and
 * slides exactly half its width, which is what makes the loop seamless: at
 * -50% the second copy is sitting precisely where the first one started, so
 * the jump back to 0 is invisible.
 *
 * EVERY IMAGE IS alt="". Twenty-four identical alt strings is noise in a
 * screen reader, and the strip is decoration: the heading above it and the
 * reviews below it are what actually carry the proof. The list is labelled
 * instead.
 *
 * It pauses on hover, and it does not move at all for a visitor who has asked
 * for reduced motion.
 */
export function PhotoRail() {
  return (
    <div className="pfRail" aria-label="Photographs of Hormone Focus customers">
      <div className="pfRailView">
        <div className="pfRailTrack">
          {[...PROOF_FACES, ...PROOF_FACES].map((src, i) => (
            <img
              key={`${src}-${i}`} src={src} alt="" width={300} height={468}
              loading="lazy" decoding="async"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Where JJ has been seen, moving the other way.
 *
 * The logos are named in alt text on the first copy of the track and blank on
 * the second, so each outlet is announced once rather than twice. Same
 * doubling and same -50% as the photographs above.
 */
export function PressRail() {
  return (
    <div className="pfPress">
      <p className="pfPressT">{PRESS_EYEBROW}</p>
      <div className="pfRailView">
        <div className="pfPressTrack">
          {[...PRESS_LOGOS, ...PRESS_LOGOS].map(([src, name, w, h], i) => (
            <img
              key={`${src}-${i}`} src={src} width={w} height={h}
              alt={i < PRESS_LOGOS.length ? name : ''}
              loading="lazy" decoding="async"
            />
          ))}
        </div>
      </div>
    </div>
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
