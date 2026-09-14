import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { angleBySlug } from '../lib/angles';
import { usePageMeta } from '../lib/usePageMeta';
import { track } from '../lib/analytics';
import { JJ, REVIEWS, QUIZ_DISCLAIMER, FDA_DISCLAIMER } from '../lib/content';
import { RatingLine, Stars, VerifiedCheck } from '../components/icons';

function Bullet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--good-2)" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 12.2l2.7 2.6L16 9.6" />
    </svg>
  );
}

/** Splits the headline so the phrase the ad promised can be emphasised. */
function Headline({ text, em }: { text: string; em?: string }) {
  if (!em || !text.includes(em)) return <>{text}</>;
  const [before, ...rest] = text.split(em);
  return <>{before}<em>{em}</em>{rest.join(em)}</>;
}

export function Landing() {
  const { slug } = useParams();
  const angle = angleBySlug(slug);
  const quizHref = angle.slug ? `/${angle.slug}/quiz` : '/quiz';

  const heroCta = useRef<HTMLAnchorElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  usePageMeta({
    title: angle.title,
    description: angle.description,
    image: angle.hero,
  });

  useEffect(() => { track.landingView(angle.slug); }, [angle.slug]);

  /* The sticky bar shows whenever the hero button is not on screen — which on
     a phone includes the moment she lands, because the headline and the
     picture push the real button below the fold. There is always exactly one
     call to action visible, and never two at once. */
  useEffect(() => {
    const el = heroCta.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* The angle decides which review leads; the rest follow in their own order. */
  const reviews = [
    REVIEWS[angle.review] ?? REVIEWS[0],
    ...REVIEWS.filter((_, i) => i !== angle.review),
  ];

  return (
    <div className="app">
      <header className="appHeader landingHeader">
        <div className="headerInner">
          <span className="brand">Hormone Focus</span>
          <span className="headerSpacer" />
          {/* the same proof sits under the hero button, where it is doing more
              work — on a narrow screen it only wraps and crowds the wordmark */}
          <span className="headerProof"><RatingLine /></span>
        </div>
      </header>

      <main className="appMain">
        <section className="hero">
          <div className="container wide">
            <div className="heroGrid">
              <div className="heroLede">
                <span className="heroKicker">{angle.kicker}</span>
                <h1 className="heroTitle">
                  <Headline text={angle.headline} em={angle.headlineEm} />
                </h1>
                <p className="heroSub">{angle.sub}</p>
              </div>

              {/* On a phone this sits between the promise and the proof, where
                  it carries the ad creative through. On a desktop it moves to
                  its own column beside both. */}
              <div className="heroArt">
                <img
                  src={angle.hero}
                  alt={angle.heroAlt}
                  width={540}
                  height={405}
                  fetchPriority="high"
                  decoding="async"
                />
              </div>

              <div className="heroRest">
                <ul className="bullets">
                  {angle.bullets.map((b) => (
                    <li key={b}><Bullet />{b}</li>
                  ))}
                </ul>

                <div className="heroCta">
                  <Link className="cta" to={quizHref} ref={heroCta}>{angle.cta} &rarr;</Link>
                </div>
                <div className="heroMeta">
                  <RatingLine />
                  <span className="dot" />
                  <span>Free &middot; no account needed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container wide">
            <h2 className="sectionTitle">Women with your symptoms have already done this.</h2>
            <div className="cardRow">
              {reviews.map((r) => (
                <div className="rev" key={r.n}>
                  <div className="rs"><Stars n={r.r} /></div>
                  <p>&ldquo;{r.b}&rdquo;</p>
                  <div className="foot">
                    <b>{r.n}</b>
                    <span className="vbadge"><VerifiedCheck />Verified buyer</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="ratingBlock" style={{ marginTop: 18 }}>
              <div className="ratingBig">4.9</div>
              <div className="ratingStars"><Stars /></div>
              <p className="ratingSub">from 169 verified reviews of Hormone Focus</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container wide">
            <h2 className="sectionTitle">Who is behind this check</h2>
            <div className="authorCard">
              <img src={JJ} alt="JJ Smith" width={560} height={796} loading="lazy" decoding="async" />
              <div>
                {/* 800,000 is books and challenges. It is never a supplement customer count. */}
                <p style={{ margin: 0, fontSize: 'var(--t-body)', color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--ink)' }}>JJ Smith</strong> is a nutritionist and
                  the author whose books and challenges have helped over 800,000 women.
                  Hormone Focus is the one she made for what happens to your hormones.
                </p>
                <p style={{ marginTop: 12, fontSize: 'var(--t-sub)', color: 'var(--ink-3)' }}>
                  This check asks the questions she would ask first.
                </p>
              </div>
            </div>

            <div className="heroCta" style={{ marginTop: 26 }}>
              <Link className="cta" to={quizHref}>{angle.cta} &rarr;</Link>
            </div>
            <p className="microDisc" style={{ textAlign: 'left' }}>
              Takes about two minutes. {QUIZ_DISCLAIMER}
            </p>
          </div>
        </section>
      </main>

      <footer className="siteFoot">
        <div className="container wide">
          <p>{QUIZ_DISCLAIMER}</p>
          <p>{FDA_DISCLAIMER}</p>
          <p>
            &copy; {new Date().getFullYear()} JJ Smith &middot;{' '}
            <a href="https://www.jjsmithonline.com/" target="_blank" rel="noopener noreferrer">
              jjsmithonline.com
            </a>
          </p>
        </div>
      </footer>

      {showSticky && (
        <div className="stickyCta">
          <div className="container wide" style={{ padding: 0 }}>
            <Link className="cta" to={quizHref}>{angle.cta} &rarr;</Link>
          </div>
        </div>
      )}
    </div>
  );
}
