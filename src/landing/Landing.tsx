import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { angleBySlug, angleTitle } from '../lib/angles';
import { usePageMeta } from '../lib/usePageMeta';
import { track } from '../lib/analytics';
import {
  ALERT_BAR, COVER_CTA, COVER_CTA_NOTE, COVER_SUB, CUSTOMERS, FDA_DISCLAIMER,
  HERO_IMG, IMG, JJ_LOGO, PROOF_EYEBROW, QUIZ_DISCLAIMER,
} from '../lib/content';

/* All six, in the order the quiz asks about them. The generic cover has no
   one symptom to show, so it shows the lot, moving — the way JJ's own page
   runs its customer photographs past on a phone. An angle cover does have
   one, and shows that one, still and large. */
/* THE HEADLINE'S OWN ORDER. It names "stubborn weight, poor sleep, low
   energy or hot flashes", so the rail opens on weight and runs in the same
   order she just read, with the two it does not name following. A picture
   that answers the line above it is doing more than filling a row. */
const ALL_SYMPTOMS = [IMG.weight, IMG.sleep, IMG.energy, IMG.sweats, IMG.bloat, IMG.mood];

/* Four faces, as the landing page's rating badge carries. */
const FACES = CUSTOMERS.slice(0, 4);



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

  /* The symptom this version was bought for. The generic cover has none. */
  const only = angle.preselect[0];
  const hero = only ? IMG[only] : null;

  usePageMeta({
    title: angleTitle(angle),
    description: angle.description,
    image: HERO_IMG,
  });

  useEffect(() => { track.landingView(angle.slug); }, [angle.slug]);

  return (
    <div className="app landing cover">
      {/* The bar JJ's page carries, saying the one thing this page asks. */}
      <div className="alertBar">
        <span className="alertStar" aria-hidden="true">&#10022;</span>
        <span>{ALERT_BAR}</span>
      </div>

      {/* A bar of its own, as JJ's page has: white, a hairline under it, and
          the wordmark sitting in it rather than floating above the copy. */}
      <header className="masthead">
        <img className="jjLogo" src={JJ_LOGO} alt="JJ Smith" width={132} height={25} />
      </header>

      <main className="appMain">
        <section className="lpHero">
          <div className="screen">
            <div className="coverBody">
              {/* Faces before the headline: she sees women before she reads a
                  claim. Scoped to JJ's programmes, as the copy rules require —
                  never to Hormone Focus customers. */}
              {/* A pill, the way her rating badge is a pill: faces tucked
                  into the left of it, the claim set against white so it
                  reads as one object rather than a line of loose text. */}
              <p className="proofPill">
                {/* Customers, because the claim beside them counts customers.
                    Four, overlapped, as JJ's rating badge stacks them. */}
                <span className="proofFaces" aria-hidden="true">
                  {FACES.map((src) => (
                    <i key={src} style={{ backgroundImage: `url(${src})` }} />
                  ))}
                </span>
                <span>{PROOF_EYEBROW}</span>
              </p>

              <h1 className="lpH1">{angle.h1a} <em>{angle.h1b}</em></h1>
              <p className="coverSub">{COVER_SUB}</p>

              {/* .heroCta is the hook e2e/funnel.spec.ts uses to find the button. */}
              <div className="heroCta">
                <Link className="cta" to={quizHref}>{COVER_CTA} &nbsp;&rarr;</Link>
                <p className="ctaNote">{COVER_CTA_NOTE}</p>
              </div>

              {hero ? (
                /* One symptom, one picture. This version was bought for it. */
                <div className="coverShot">
                  <img src={hero} alt="" width={540} height={405} decoding="async" />
                </div>
              ) : (
                /* No single symptom to show, so all six go past. The list is
                   doubled so the loop has somewhere to travel to. */
                <div className="coverRail" aria-hidden="true">
                  <div className="coverRailTrack">
                    {[...ALL_SYMPTOMS, ...ALL_SYMPTOMS].map((src, i) => (
                      <img key={`${src}-${i}`} src={src} alt="" width={540} height={405}
                           loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
                    ))}
                  </div>
                </div>
              )}

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
