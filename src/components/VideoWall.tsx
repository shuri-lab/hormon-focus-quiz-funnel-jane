import { useState } from 'react';

/* Nine women, on camera.
 *
 * EACH CARD IS A POSTER UNTIL IT IS PRESSED. Nine Vimeo embeds would be nine
 * iframes and several megabytes for a visitor who watches none, so the
 * player replaces the poster only on the card she chooses.
 *
 * ONE AT A TIME. Opening a second closes the first, because two testimonials
 * talking over each other is worse than neither. Closing puts the poster
 * back, so a card can be played again.
 *
 * Ported from the landing page, which does the same thing with a DOM script
 * and innerHTML. Here it is state, so React owns the swap and there is no
 * markup being rebuilt underneath it.
 */
const CLIPS: [id: string, hash: string][] = [
  ['948965910', '92f77779fc'],
  ['948966113', 'f3208c6af4'],
  ['948966175', '1b5b185021'],
  ['948966221', 'e9d03a3138'],
  ['948966260', '24b0393551'],
  ['948966331', 'f36ce92619'],
  ['948966385', '62d3de5dd3'],
  ['948966430', 'c476465217'],
  ['948966468', '7bcd8e816d'],
];

function Play() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.2v13.6a1 1 0 0 0 1.53.85l10.6-6.8a1 1 0 0 0 0-1.7L9.53 4.35A1 1 0 0 0 8 5.2z" />
    </svg>
  );
}

export function VideoWall() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="vidGrid">
      {CLIPS.map(([id, hash], i) => (
        <div className={`vid${open === i ? ' on' : ''}`} key={id}>
          {open === i ? (
            <iframe
              src={`https://player.vimeo.com/video/${id}?h=${hash}&autoplay=1&title=0&byline=0&portrait=0`}
              title={`Customer video ${i + 1}`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="vidPoster"
              onClick={() => setOpen(i)}
              aria-label={`Play customer video ${i + 1}`}
            >
              <img
                src={`/img/video/v${i + 1}.webp`}
                alt=""
                width={520}
                height={924}
                loading="lazy"
                decoding="async"
              />
              <span className="vidPlay" aria-hidden="true"><Play /></span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
