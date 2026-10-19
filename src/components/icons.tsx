
export function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="var(--star)" className={className} aria-hidden="true">
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
    </svg>
  );
}

export function Tick() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/**
 * A row of stars, and the row is the point.
 *
 * THE BUG THIS FIXES, 19 October 2026. This returned a bare fragment of
 * <svg> elements and relied on whatever contained them to lay them out. An
 * <svg> is display:inline by default, so in a plain block they happened to
 * flow along a line and everything looked right locally for weeks.
 *
 * The deployed host injects a CSS reset ours does not, of the shape every
 * modern reset ships:
 *
 *   img, svg, video, canvas { display: block; }
 *
 * Under it the five stars became five blocks and stacked vertically, one per
 * line, down the side of every live Okendo review. Local was inline, live was
 * block, and nothing in this repo was wrong enough to find by reading it.
 *
 * So the row is owned here rather than borrowed from the caller. .pfStars and
 * .kitRevStars already wrapped their stars in a flex box and were accidentally
 * immune; OkendoWall and the chips on /offer dropped the fragment straight
 * into a block and were not. A flex wrapper lays its children in a row whether
 * they are inline or block, so the reset cannot reach them.
 */
export function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="starRow">
      {Array.from({ length: n }, (_, i) => <Star key={i} />)}
    </span>
  );
}

