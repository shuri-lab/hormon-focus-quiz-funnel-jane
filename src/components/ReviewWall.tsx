import { useState } from 'react';
import { Stars } from './icons';
import { CUSTOMERS } from '../lib/content';
import { WALL, type Review } from '../lib/reviews';

/**
 * THE WALL OF LOVE. Stacked, never a carousel.
 *
 * Under two per cent of readers reach a second slide, and the volume itself
 * is the signal — so every card is on the page at once and none of them is
 * behind an arrow.
 *
 * SIX CARDS, ALTERNATING: a photo card, then a text card, then a photo card.
 * The faces are the three the hero chip does not use, so the same three women
 * are not shown twice on one page.
 *
 * EVERY CARD IS CUT, NEVER REWRITTEN. The two lines on show are a prefix of
 * the published review, character for character, and 'Read more' opens the
 * rest of it. A test asserts the prefix, so an edit that tidies a customer's
 * spelling fails the build rather than shipping.
 */

/* The hero chip shows customer-1 to 3. These are the other three. */
const WALL_FACES = CUSTOMERS.slice(3, 6);

const ON_THE_WALL = WALL.slice(0, 6);

function Card({ review, photo }: { review: Review; photo?: string }) {
  const [open, setOpen] = useState(false);
  const excerpt = review.excerpt ?? review.body;
  const trimmed = excerpt !== review.body;

  /* An elision mark after a full stop reads as four dots. Where the cut lands
     on a sentence end, the full stop is the mark; 'Read more' says the rest is
     there. Nothing inside the quote changes either way. */
  const showEllipsis = trimmed && !/[.!?]$/.test(excerpt);

  return (
    <blockquote className={`ofRev${photo ? ' hasPhoto' : ''}`}>
      {photo && (
        <img
          className="revFace"
          src={photo}
          alt="Hormone Focus customer"
          width={300}
          height={400}
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="revBody">
        <span className="rs"><Stars n={5} /></span>
        <p>
          &ldquo;{open || !trimmed ? review.body : excerpt}
          {showEllipsis && !open && '…'}&rdquo;
        </p>
        {trimmed && (
          <button
            type="button"
            className="revMore"
            data-inline
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Read less' : 'Read more'}
          </button>
        )}
        <cite>
          <b>{review.name}</b>
          {review.verified ? ' · verified buyer' : ' · Hormone Focus customer'}
        </cite>
      </div>
    </blockquote>
  );
}

export function ReviewWall() {
  return (
    <div className="ofWall">
      {ON_THE_WALL.map((review, i) => (
        <Card
          key={review.name + review.body.slice(0, 12)}
          review={review}
          /* Every other card carries a face, starting with the first. */
          photo={i % 2 === 0 ? WALL_FACES[i / 2] : undefined}
        />
      ))}
    </div>
  );
}
