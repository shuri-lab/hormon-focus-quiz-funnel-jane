/* Where the email goes.
 *
 * Straight to Klaviyo from the browser, as a client event on the metric
 * "HF Quiz Completed". That metric name is the trigger the post-quiz flow is
 * built on, so it is a contract: change the string here and the flow stops
 * firing, with nothing failing loudly enough to notice.
 *
 * THE KEY IN THIS FILE IS A PUBLIC KEY and belongs in browser code. It is the
 * same value readable in the page source of every site that runs Klaviyo. It
 * can create an event and a profile and nothing else — it cannot read a
 * profile back, list anything, or change what it already wrote. There is no
 * private key in this repository and none is needed for this call.
 *
 * STILL TO COME: subscribing her to the list is a SECOND call, to
 * /client/subscriptions/, and it needs the list id from Moses. Her consent is
 * already captured and timestamped below, so that id is the only thing
 * standing between here and a working subscription.
 *
 * NOTHING HERE BLOCKS HER. Every failure path resolves, because a woman who
 * has answered fourteen questions is owed her result whether or not our
 * marketing stack is having a good afternoon.
 */
import { readAttribution } from './analytics';
import { score } from './logic';
import type { QuizState, Outcome } from './logic';

/** Public, and public on purpose. See the note above. */
export const KLAVIYO_PUBLIC_KEY = 'TSTCui';

const KLAVIYO_EVENTS = 'https://a.klaviyo.com/client/events/';

/** Klaviyo pins its API by date. Moving this is a deliberate upgrade. */
const KLAVIYO_REVISION = '2024-10-15';

/** The exact metric the flow triggers on. Not a label; a contract. */
export const KLAVIYO_METRIC = 'HF Quiz Completed';

/**
 * The outcome in words, for whoever is reading a flow at nine in the evening.
 *
 * NOTE the difference from ARCHETYPE_FOR in planCopy.ts, which maps A to
 * 'imbalance'. That one is a URL slug for /plan; this one is a property a
 * person reads in a segment. They are allowed to differ and they do.
 *
 * D is absent because outcome D never reaches Klaviyo. The refusal below is
 * what enforces that; this map is what makes it impossible to name it.
 */
const OUTCOME_NAME: Record<Exclude<Outcome, 'D'>, string> = {
  A: 'hormonal-imbalance',
  B: 'perimenopause',
  C: 'menopause',
  E: 'early-menopause',
};

/** The ad parameters worth carrying onto the profile. */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

export async function submitLead(
  S: QuizState, outcome: Outcome, angle: string,
): Promise<{ ok: boolean; delivered: boolean }> {
  /* The last line of defence. The gate will not submit without consent, but
     this module is what actually reaches the network, so it refuses too:
     no ticked box, no request, whatever any caller believes. */
  if (!S.consent) {
    if (import.meta.env.DEV) {
      console.warn('[leads] refused: no consent was given, so nothing was sent.');
    }
    return { ok: false, delivered: false };
  }

  /* The second refusal. The doctor route is an exit: she is told to see
     somebody, she is shown no offer and no price, and she does not enter a
     flow that will go on to sell her a supplement. Nothing is sent. */
  if (outcome === 'D') {
    if (import.meta.env.DEV) {
      console.warn('[leads] refused: the doctor route does not reach Klaviyo.');
    }
    return { ok: true, delivered: false };
  }

  const ad = readAttribution();
  const utm: Record<string, string> = {};
  /* Omitted rather than sent empty: an absent utm_source and a blank one mean
     different things in a report, and only one of them is true. */
  for (const key of UTM_KEYS) {
    if (ad[key]) utm[key] = ad[key];
  }

  const consentAt = new Date().toISOString();

  const body = {
    data: {
      type: 'event',
      attributes: {
        properties: {
          outcome: OUTCOME_NAME[outcome],
          outcome_code: outcome,
          quiz: 'hf-v2',
          angle,
          ...utm,
          signs: score(S).raw,
          consent_at: consentAt,
        },
        metric: {
          data: { type: 'metric', attributes: { name: KLAVIYO_METRIC } },
        },
        profile: {
          data: {
            type: 'profile',
            attributes: {
              email: S.email.trim(),
              first_name: S.name.trim(),
            },
          },
        },
      },
    },
  };

  try {
    const res = await fetch(`${KLAVIYO_EVENTS}?company_id=${KLAVIYO_PUBLIC_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify(body),
      keepalive: true,       // survives the navigation to the next screen
    });
    /* Klaviyo answers 202 with an empty body. Any 2xx is delivered; anything
       else is not, and either way she carries on to her result. */
    return { ok: true, delivered: res.ok };
  } catch {
    // Never block her from her result because a marketing endpoint is down.
    return { ok: true, delivered: false };
  }
}

/** Deliberately permissive. Rejecting a real address costs more than accepting a typo. */
export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
