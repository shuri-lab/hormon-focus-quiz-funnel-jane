import { useEffect, useRef, useState } from 'react';
import { fetchReviews, withText, type ReviewsData } from '../lib/okendo';
import { Stars } from './icons';

/**
 * "What women are saying", read live from Okendo.
 *
 * WHY IT IS LAZY. Reading every review is two requests and about 25KB, and
 * most women never scroll this far. It fetches when the section is within a
 * screen of the viewport and not before.
 *
 * WHY IT FALLS BACK RATHER THAN FAILING. Okendo being slow, blocked by an ad
 * blocker, or down is not something she should have to see. The authored
 * reviews the page already carries render instead, and the only thing lost
 * is the live count.
 */
export function OkendoWall({ fallback, count = 6 }: { fallback: React.ReactNode; count?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ReviewsData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;

    const ac = new AbortController();
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      fetchReviews(ac.signal)
        .then(setData)
        .catch((e: unknown) => {
          if ((e as { name?: string })?.name !== 'AbortError') setFailed(true);
        });
    };

    /* A screen's warning, so it has arrived by the time she reaches it. */
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { start(); io.disconnect(); } },
      { rootMargin: '100% 0px' },
    );
    io.observe(el);

    return () => { io.disconnect(); ac.abort(); };
  }, []);

  const live = data ? withText(data.reviews, count) : [];

  return (
    <div className="okWall" ref={box}>
      {data && live.length > 0 ? (
        <>
          <p className="okMeta">
            <Stars n={5} />
            <b>{data.average.toFixed(1)}</b>
            <span>
              from {data.total.toLocaleString('en-US')} verified review
              {data.total === 1 ? '' : 's'}
            </span>
          </p>

          <div className="okList">
            {live.map((r) => (
              <figure className="okRev" key={r.reviewId}>
                <Stars n={Math.round(r.rating)} />
                {r.title && <p className="okTitle">{r.title}</p>}
                <blockquote>{r.body}</blockquote>
                <figcaption>
                  {r.reviewer?.displayName ?? 'Verified buyer'}
                  {r.reviewer?.isVerified && <span className="okVb"> · Verified buyer</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      ) : (
        /* Not loaded yet, or Okendo could not be reached. Either way she
           reads customers rather than a spinner or an apology. */
        <div className="okFallback" data-okendo={failed ? 'failed' : 'pending'}>
          {fallback}
        </div>
      )}
    </div>
  );
}
