import { useEffect } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '../lib/usePageMeta';
import { track } from '../lib/analytics';
import { BOTTLE } from '../lib/content';
import { BuyOptions, useOfferChoice } from '../components/BuyOptions';
import {
  PLANS, PLAN_BUY_HEADING, PLAN_BUY_SUB, PLAN_EYEBROW, PLAN_HEADINGS,
  fill, isArchetype, planDescription, planTitle, type PlanReader,
} from '../lib/planCopy';
import { DOCTOR_LINE, OFFER_FINE_PRINT, FOOTER_LINE } from '../lib/offerCopy';

/**
 * THE STARTER GUIDE, as a page she owns.
 *
 * This is what makes "arrives today" true before a single email exists. She
 * finishes the quiz, taps one link, and reads a plan with her result, her
 * signs count and how often it hits her, written before she ever pays
 * anything. The same URL is what the post-quiz email links to later.
 *
 * WHY A PAGE AND NOT A PDF: a page can be corrected in an hour, and a PDF is
 * wrong forever. It also means the plan can carry the offer at its foot
 * without being a sales letter at the top — she gets the plan either way, and
 * that is the point of giving it away.
 *
 * WHAT THE LINK CARRIES: name, signs and freq, all optional. Every one of them
 * has neutral wording behind it, because a page that greets her as
 * {first name} is worse than a page that does not greet her at all.
 *
 * OUTCOME D NEVER ARRIVES HERE. The doctor route has no archetype, no plan and
 * no offer, and the quiz does not render a link to this page on it.
 */
export function PlanPage() {
  const { archetype } = useParams();
  const [params] = useSearchParams();

  /* Not one of ours is not a typo to be guessed at. Send her to the front
     door rather than to a plan written for somebody else. */
  if (!isArchetype(archetype)) return <Navigate to="/" replace />;

  return <Plan archetype={archetype} params={params} />;
}

function Plan({
  archetype, params,
}: {
  archetype: keyof typeof PLANS;
  params: URLSearchParams;
}) {
  const v = PLANS[archetype];

  const rawSigns = Number(params.get('signs'));
  const reader: PlanReader = {
    name: (params.get('name') ?? '').trim().slice(0, 40),
    /* 0 of 14 is not a plan anybody needs, and a stray ?signs=abc is not a
       number. Either way we fall back to the neutral wording. */
    signs: Number.isInteger(rawSigns) && rawSigns > 0 && rawSigns <= 14 ? rawSigns : null,
    frequency: (params.get('freq') ?? '').trim().slice(0, 40),
  };

  const { chosen, choose } = useOfferChoice();

  usePageMeta({
    title: planTitle(reader),
    description: planDescription(v),
    image: BOTTLE,
    /* Her name is in the query string. This page is not for a search index. */
    noindex: true,
  });

  useEffect(() => { track.planView(archetype); }, [archetype]);

  const doctor = (
    <section className="planSec" key="doctor">
      <h2 className="planH2">{PLAN_HEADINGS.doctor}</h2>
      <p className="planDoctor">{v.doctor}</p>
    </section>
  );

  return (
    <div className="app offer plan">
      <main className="appMain">
        <section className="planTop">
          <div className="screen">
            <div className="ofLogo">
              <b>HORMONE<i>FOCUS</i></b>
              <span>by JJ Smith</span>
            </div>

            <p className="eyebrow">{PLAN_EYEBROW}</p>
            <h1 className="planH1" data-plan-title>{planTitle(reader)}</h1>

            <section className="planSec">
              <h2 className="planH2">{PLAN_HEADINGS.result}</h2>
              <p className="planLead" data-plan-result>{fill(v.result, reader)}</p>
            </section>

            <section className="planSec">
              <h2 className="planH2">{PLAN_HEADINGS.going}</h2>
              {v.going.map((line) => <p key={line}>{fill(line, reader)}</p>)}
            </section>

            {/* Version E moves the doctor line up, because a stage that
                arrived early is worth a conversation before a plan. */}
            {v.doctorFirst && doctor}

            <section className="planSec">
              <h2 className="planH2">{PLAN_HEADINGS.week}</h2>
              <p>{fill(v.week, reader)}</p>
            </section>

            <section className="planSec">
              <h2 className="planH2">{PLAN_HEADINGS.howTo}</h2>
              <p>{fill(v.howTo, reader)}</p>
            </section>

            <section className="planSec">
              <h2 className="planH2">{PLAN_HEADINGS.expect}</h2>
              <p>{fill(v.expect, reader)}</p>
            </section>

            {!v.doctorFirst && doctor}

            <section className="planSec">
              <h2 className="planH2">{PLAN_HEADINGS.sixtyDays}</h2>
              <p className="planLead">{fill(v.sixtyDays, reader)}</p>
            </section>
          </div>
        </section>

        {/* The plan is hers either way. The bottles are what it is built on. */}
        <section className="ofCloser">
          <div className="screen">
            <h2 className="ofH2">{PLAN_BUY_HEADING}</h2>
            <p className="ofSub">{PLAN_BUY_SUB}</p>
            <BuyOptions
              chosen={chosen}
              onChoose={choose}
              outcome={`plan_${archetype}`}
              angle={archetype}
              name="plan"
            />
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
    </div>
  );
}
