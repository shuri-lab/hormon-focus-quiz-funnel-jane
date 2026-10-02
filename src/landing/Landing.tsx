import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { angleBySlug, angleTitle } from '../lib/angles';
import { usePageMeta } from '../lib/usePageMeta';
import { track } from '../lib/analytics';
import {
  COVER_CTA, COVER_SUB, FDA_DISCLAIMER, HERO_IMG, IMG, QUIZ_DISCLAIMER,
} from '../lib/content';

/* Three symptoms, three different women. No product and no review: she has
   not been told anything about herself yet, so nothing is sold here. */
const STRIP = [IMG.weight, IMG.sweats, IMG.sleep];

/**
 * THE COVER. One screen: the headline, one line, one button.
 *
 * It used to be five sections, with a rating, a customer photograph holding
 * the bottle, three steps, a review and four buttons. Jane's call: it was
 * messy and confusing. The promise is one sentence, so the page is too.
 *
 * The headline leads with what she already recognises. Hormones and
 * perimenopause are the reveal at the end, not the premise at the start.
 */
export function Landing() {
  const { slug } = useParams();
  const angle = angleBySlug(slug);
  const quizHref = angle.slug ? `/${angle.slug}/quiz` : '/quiz';

  usePageMeta({
    title: angleTitle(angle),
    description: angle.description,
    image: HERO_IMG,
  });

  useEffect(() => { track.landingView(angle.slug); }, [angle.slug]);

  return (
    <div className="app landing cover">
      <main className="appMain">
        <section className="lpHero">
          <div className="screen">
            <div className="lpLogo">
              <b>HORMONE<i>FOCUS</i></b>
              <span>by JJ Smith</span>
            </div>

            <div className="coverBody">
              <h1 className="lpH1">{angle.h1a} <em>{angle.h1b}</em></h1>
              <p className="coverSub">{COVER_SUB}</p>

              {/* .heroCta is the hook e2e/funnel.spec.ts uses to find the button. */}
              <div className="heroCta">
                <Link className="cta" to={quizHref}>{COVER_CTA} &nbsp;&rarr;</Link>
              </div>

              <div className="coverStrip" aria-hidden="true">
                {STRIP.map((src) => (
                  <img key={src} src={src} alt="" width={540} height={405} decoding="async" />
                ))}
              </div>

              <div className="fine">
                <p>{QUIZ_DISCLAIMER}</p>
                <p>{FDA_DISCLAIMER}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
