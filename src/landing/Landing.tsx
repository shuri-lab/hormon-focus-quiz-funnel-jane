import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { angleBySlug, angleTitle } from '../lib/angles';
import { usePageMeta } from '../lib/usePageMeta';
import { track } from '../lib/analytics';
import {
  REVIEWS, QUIZ_DISCLAIMER, FDA_DISCLAIMER, CUSTOMERS, CHIP_PROGRAMS, REVIEW_SOURCE,
  HERO_IMG, HERO_ALT,
} from '../lib/content';
import { Stars } from '../components/icons';

const CTA_LABEL = 'GET MY HORMONE PLAN';
const PRIVACY_LINE = 'Private, and no answer is ever shared.';

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="var(--plum)" />
      <path d="M7.5 12.4l3 3 6-6.5" stroke="#fff" strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Stars plus the 4.9. The review count sits beside it on the proof section. */
function Rate() {
  return <div className="rate"><Stars n={5} /><b>4.9</b></div>;
}

/* ONE chip, exactly as the source file renders it. The wording is scoped to
   JJ's programs: 800,000 is books and challenges and never a Hormone Focus
   customer count. Jane approved this wording on 15 September 2026. */
function Chips() {
  return (
    <div className="chips">
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

/** Closes every section, as the reference page does. */
function Cta({ to }: { to: string }) {
  return <Link className="cta" to={to}>{CTA_LABEL} &nbsp;&rarr;</Link>;
}

export function Landing() {
  const { slug } = useParams();
  const angle = angleBySlug(slug);
  const quizHref = angle.slug ? `/${angle.slug}/quiz` : '/quiz';

  const heroCta = useRef<HTMLAnchorElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  usePageMeta({
    title: angleTitle(angle),
    description: angle.description,
    image: HERO_IMG,
  });

  useEffect(() => { track.landingView(angle.slug); }, [angle.slug]);

  /* The sticky bar shows whenever the hero button is off screen. There is
     always exactly one call to action visible, and never two at once. */
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

  const lead = REVIEWS[0];

  return (
    <div className="app landing">
      <main className="appMain">

        {/* ------------------------------------------------ 1. HERO ----- */}
        {/* The logo sits OUTSIDE .hero, as in the source file: on desktop the
            hero becomes two columns and the lockup stays above both. */}
        <section className="lpHero">
          <div className="screen">
            <div className="lpLogo">
              <b>HORMONE<i>FOCUS</i></b>
              <span>by JJ Smith</span>
            </div>

            <div className="hero">
              <div className="herocopy">
                <Chips />

                <h1 className="lpH1">{angle.h1a} <em>{angle.h1b}</em></h1>
                <p className="lpSub">({angle.paren}).</p>

                <div className="getline">
                  <CheckMark />
                  <p>Get your <u>free personal</u> hormone plan in <u>2 minutes</u></p>
                </div>

                {/* .heroCta is the hook e2e/funnel.spec.ts uses to find the
                    first button and to assert exactly one CTA is on screen. */}
                <div className="heroCta">
                  <Link className="cta" to={quizHref} ref={heroCta}>{CTA_LABEL} &nbsp;&rarr;</Link>
                </div>
                <Rate />
                <p className="priv">{PRIVACY_LINE}</p>
              </div>

              <div className="heroimg">
                <img src={HERO_IMG} alt={HERO_ALT} width={760} height={636}
                  fetchPriority="high" decoding="async" />
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------- 2. WHAT IS GOING ON ----- */}
        <section className="lpSec first">
          <div className="screen">
            <p className="eyebrow">Step one</p>
            <h2 className="sech">First, find out what is <em>really going on</em></h2>
            <ul className="recogbox">
              {angle.lines.map((l) => <li key={l}>{l}</li>)}
            </ul>
            <p className="secBody">{angle.closer}</p>
            <Cta to={quizHref} />
          </div>
        </section>

        {/* --------------------------------------- 3. HOW IT WORKS ----- */}
        <section className="lpSec">
          <div className="screen">
            <p className="eyebrow">How it works</p>
            <h2 className="sech">Three steps, <em>two minutes</em></h2>

            <div className="step">
              <span className="stepn">1</span>
              <div>
                <b>Take the two-minute check.</b>
                <span>A few honest questions about what you are feeling.</span>
              </div>
            </div>
            <div className="step">
              <span className="stepn">2</span>
              <div>
                <b>Get your hormone read.</b>
                <span>Which stage you are in, read from your answers.</span>
              </div>
            </div>
            <div className="step">
              <span className="stepn">3</span>
              <div>
                <b>Find out what helps.</b>
                <span>What fits your stage, and what to do next.</span>
              </div>
            </div>

            <Cta to={quizHref} />
          </div>
        </section>

        {/* --------------------------------------- 4. SOCIAL PROOF ----- */}
        <section className="lpSec">
          <div className="screen">
            <p className="eyebrow">Real women</p>
            <h2 className="sech">Women who could not <em>name it either</em></h2>

            <div className="proofGrid">
              {CUSTOMERS.map((src) => (
                <img key={src} src={src} alt="Customer with Hormone Focus"
                  width={300} height={400} loading="lazy" decoding="async" />
              ))}
            </div>

            <Rate />
            <p className="rev">&ldquo;{lead.b}&rdquo;</p>
            <p className="revwho">{lead.n} &middot; verified buyer</p>
            <p className="tiny">{REVIEW_SOURCE}</p>

            <Cta to={quizHref} />
          </div>
        </section>

        {/* --------------------------------------------- 5. CLOSER ----- */}
        <section className="lpSec">
          <div className="screen">
            <h2 className="sech">Ready to find out what is <em>really going on?</em></h2>
            <p className="secBody">
              Take the two-minute check and get your personal hormone plan, free.
              What you learn is yours to keep.
            </p>
            <Cta to={quizHref} />
            <p className="priv">{PRIVACY_LINE}</p>

            {/* Both sentences, on every route. The brief makes this non-negotiable. */}
            <div className="fine">
              <p>{QUIZ_DISCLAIMER}</p>
              <p>{FDA_DISCLAIMER}</p>
            </div>
          </div>
        </section>
      </main>

      {showSticky && (
        <div className="stickyCta">
          <div className="container" style={{ padding: 0 }}>
            <Cta to={quizHref} />
          </div>
        </div>
      )}
    </div>
  );
}
