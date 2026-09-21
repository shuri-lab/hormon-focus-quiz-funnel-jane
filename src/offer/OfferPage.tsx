import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { angleBySlug } from '../lib/angles';
import { usePageMeta } from '../lib/usePageMeta';
import { shopUrl, track } from '../lib/analytics';
import { SHOP_BASE } from '../lib/logic';
import { BOTTLE, CHIP_PROGRAMS, CUSTOMERS } from '../lib/content';
import { RATING, REVIEW_COUNT, SCALE_QUOTE } from '../lib/reviews';
import { money, optionFor } from '../lib/offer';
import { BuyOptions, useOfferChoice } from '../components/BuyOptions';
import { ReviewWall } from '../components/ReviewWall';
import { Stars } from '../components/icons';
import {
  CLOSER_SUB, DOCTOR_LINE, FAQ, FAQ_EYEBROW, FAQ_HEADLINE, FOOTER_LINE,
  INGREDIENTS, LIVE_HERO, LIVE_STRIP_LEAD, LIVE_STRIP_REST, MG_EYEBROW,
  MG_HEADLINE, OFFER_FINE_PRINT, PAIN_EYEBROW, PAIN_TURN, STEPS, STEPS_EYEBROW,
  SCALE_LEAD, STEPS_HEADLINE, VALUE_HEADLINE, VALUE_PROPS, WALL_EYEBROW,
  WALL_HEADLINE, WALL_NOTE, heroFor, liveDeadlineLine, painHeadline,
  type OfferHero,
} from '../lib/offerCopy';

/**
 * THE OFFER PAGE, on our own host.
 *
 * It is the destination for every route we control, so the offer a woman sees
 * is the one we describe rather than whatever state the store page is in.
 * /offer is the master angle, /offer/<slug> swaps the hero for the ad angle,
 * and /live adds the strip at the top.
 *
 * The structure is the landing-page anatomy, in its cold-traffic order: the
 * pain point comes before the proof, because Meta traffic was scrolling a
 * minute ago and does not yet know why any of this is for her.
 *
 * ABOVE THE FOLD there are six elements and all six fit on a 390px phone
 * before the fold. They carry data-af attributes, and e2e/offer.spec.ts fails
 * the build if any of them drops below it.
 */

/** Both forms of proof, side by side. The two numbers never merge. */
function Proof() {
  return (
    <div className="chips" data-af="proof">
      <span className="chip">
        <Stars n={5} />
        <b>{RATING}</b> from {REVIEW_COUNT} reviews
      </span>
      <span className="chip">
        <span className="faces">
          {CUSTOMERS.slice(0, 3).map((src) => (
            <i key={src} style={{ backgroundImage: `url(${src})` }} />
          ))}
        </span>
        {CHIP_PROGRAMS}
      </span>
    </div>
  );
}

function Headline({ hero, af }: { hero: OfferHero; af?: string }) {
  return (
    <h1 className="ofH1" data-af={af}>
      {hero.h1a}<em>{hero.h1b}</em>{hero.h1c}
    </h1>
  );
}

interface Props {
  /** /live carries the strip and its own hero. */
  live?: boolean;
}

export function OfferPage({ live = false }: Props) {
  const { slug } = useParams();
  const angle = angleBySlug(slug);

  /* /live is not an angle, so it brings its own hero and its own recognition
     lines. Everything below the hero is the same page on every route. */
  const hero = live ? LIVE_HERO : (heroFor(angle) ?? LIVE_HERO);
  const lines = hero.lines ?? angle.lines;

  /* What the cart link reports this sale against. The quiz sends an outcome
     here; a page that never asked her anything sends the route instead. */
  const outcome = live ? 'live' : `offer_${angle.slug || 'master'}`;

  const { chosen, choose } = useOfferChoice();
  const option = optionFor(chosen);

  usePageMeta({ title: hero.title, description: hero.description, image: BOTTLE });

  useEffect(() => { track.offerView(outcome); }, [outcome]);

  /* The sticky bar shows once the hero's buy button has gone. There is always
     exactly one buy button on screen, and never two at once. */
  const heroBuy = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = heroBuy.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const deadline = live ? liveDeadlineLine() : null;

  const buy = (name: string) => (
    <BuyOptions
      chosen={chosen}
      onChoose={choose}
      outcome={outcome}
      angle={angle.slug}
      name={name}
      live={live}
    />
  );

  return (
    <div className="app offer">
      <main className="appMain">

        {/* The deadline is JJ's, said out loud on the broadcast. With
            LIVE_DEADLINE unset the strip simply does not claim one. */}
        {live && (
          <p className="liveStrip">
            <b>{LIVE_STRIP_LEAD}</b>{LIVE_STRIP_REST}
            {deadline && <span className="liveBy"> {deadline}</span>}
          </p>
        )}

        {/* --------------------------------------------- 1. ABOVE THE FOLD -- */}
        <section className="ofHero">
          <div className="screen">
            <div className="ofLogo">
              <b>HORMONE<i>FOCUS</i></b>
              <span>by JJ Smith</span>
            </div>

            <div className="ofHeroGrid">
              <div className="ofHeroCopy">
                <Proof />
                <Headline hero={hero} af="headline" />
                <p className="ofSub" data-af="sub">{hero.sub}</p>

                {/* The one line about the scale is not ours to write. It is
                    hers, published, attributed, and quoted in the claims list
                    in exactly this form as the approved way to say it. */}
                <figure className="ofScale">
                  <figcaption>{SCALE_LEAD}</figcaption>
                  <blockquote>&ldquo;{SCALE_QUOTE.body}&rdquo;</blockquote>
                  <cite>
                    <b>{SCALE_QUOTE.name}</b>
                    {SCALE_QUOTE.verified ? ' · verified buyer' : ''}
                  </cite>
                </figure>
              </div>

              <div className="ofHeroBuy" ref={heroBuy}>
                <div className="ofShot" data-af="image">
                  <img
                    src={BOTTLE}
                    alt="A bottle of Hormone Focus"
                    width={620}
                    height={540}
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                {buy('hero')}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ 2. PAIN POINT -- */}
        <section className="ofSec">
          <div className="screen">
            <p className="eyebrow">{PAIN_EYEBROW}</p>
            <h2 className="ofH2">{painHeadline(lines.length)}</h2>
            <ul className="ofRecog">
              {lines.map((l) => <li key={l}>{l}</li>)}
            </ul>
            <p className="ofTurn">{PAIN_TURN}</p>
          </div>
        </section>

        {/* --------------------------------------------- 3. WALL OF LOVE -- */}
        <section className="ofSec wash">
          <div className="screen">
            <p className="eyebrow">{WALL_EYEBROW}</p>
            <h2 className="ofH2">{WALL_HEADLINE}</h2>
            <ReviewWall />
            <p className="ofNote">{WALL_NOTE}</p>
          </div>
        </section>

        {/* ------------------------------------------- 4. FIVE VALUE PROPS -- */}
        {/* No eyebrow here: the headline carries the section on its own, and
            an eyebrow above it would only say the same words twice. */}
        <section className="ofSec">
          <div className="screen">
            <h2 className="ofH2">{VALUE_HEADLINE}</h2>
            <div className="ofVp">
              {VALUE_PROPS.map(([head, body]) => (
                <div key={head}><b>{head}</b><span>{body}</span></div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------- 5. THREE STEPS ------ */}
        <section className="ofSec wash">
          <div className="screen">
            <p className="eyebrow">{STEPS_EYEBROW}</p>
            <h2 className="ofH2">{STEPS_HEADLINE}</h2>
            <div className="ofSteps">
              {STEPS.map(([head, body], i) => (
                <div className="ofStep" key={head}>
                  <i aria-hidden="true">{i + 1}</i>
                  <div><b>{head}</b><span>{body}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------ 6. EVERY MILLIGRAM ---------- */}
        <section className="ofSec">
          <div className="screen">
            <p className="eyebrow">{MG_EYEBROW}</p>
            <h2 className="ofH2">{MG_HEADLINE}</h2>
            <div className="ofMg">
              {INGREDIENTS.map(([dose, name, what]) => (
                <div key={name}>
                  <b>{dose}</b>
                  <span><strong>{name}.</strong> {what}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- 7. THE FAQ ---- */}
        <section className="ofSec wash">
          <div className="screen">
            <p className="eyebrow">{FAQ_EYEBROW}</p>
            <h2 className="ofH2">{FAQ_HEADLINE}</h2>
            <div className="ofFaq">
              {FAQ.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------- 8. THE CLOSER ------ */}
        <section className="ofCloser">
          <div className="screen">
            <h2 className="ofH2">{hero.close}</h2>
            <p className="ofSub">{CLOSER_SUB}</p>
            {buy('closer')}
            <p className="ofDoctor">{DOCTOR_LINE}</p>
          </div>
        </section>

        <footer className="ofFoot">
          <div className="screen">
            <p>{OFFER_FINE_PRINT}</p>
            <p>{FOOTER_LINE}</p>
          </div>
        </footer>
      </main>

      {showSticky && (
        <div className="ofSticky">
          <span>
            <b>{money(option.price)}</b>
            {option.priceNote}
          </span>
          <a
            className="cta buyBtn"
            data-offer={chosen}
            href={shopUrl(SHOP_BASE, outcome, angle.slug, chosen)}
            onClick={() => track.checkout(outcome, option.price)}
          >
            {option.ctaShort} &nbsp;&rarr;
          </a>
        </div>
      )}
    </div>
  );
}
