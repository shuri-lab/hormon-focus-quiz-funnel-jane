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
 * TWO CALLS, when she ticks the box:
 *  1. The event, which starts the post-quiz flow and carries her answers.
 *  2. The subscription, which records her consent on a list. Klaviyo only
 *     sends marketing email to a profile that has agreed to it, so without
 *     this call the flow skips her as "not subscribed". It runs only when
 *     KLAVIYO_LIST_ID is set, and that id has to come from whoever owns
 *     JJ's Klaviyo lists.
 *
 * NOTHING HERE BLOCKS HER. Every failure path resolves, because a woman who
 * has answered seven questions is owed her result whether or not our
 * marketing stack is having a good afternoon.
 */
import { readAttribution } from './analytics';
import { mainConcern } from './logic';
import { REVIEW } from '../review/flag';
import type { QuizState, Outcome } from './logic';

/** Public, and public on purpose. See the note above. */
export const KLAVIYO_PUBLIC_KEY = 'TSTCui';

const KLAVIYO_EVENTS = 'https://a.klaviyo.com/client/events/';

/** Klaviyo pins its API by date. Moving this is a deliberate upgrade. */
const KLAVIYO_REVISION = '2024-10-15';

/** The exact metric the flow triggers on. Not a label; a contract. */
export const KLAVIYO_METRIC = 'HF Quiz Completed';

const KLAVIYO_SUBSCRIPTIONS = 'https://a.klaviyo.com/client/subscriptions/';

/**
 * The list she is subscribed to when she ticks the box.
 *
 * NULL UNTIL THE LIST ID IS SUPPLIED. Set it to the six-character id of the
 * list the quiz should feed (Klaviyo: Lists & Segments, the list, Settings),
 * and the subscription call below switches on. Nothing else changes.
 */
export const KLAVIYO_LIST_ID: string | null = null;

/** Where the consent came from, as Klaviyo shows it on her profile. */
export const KLAVIYO_SOURCE = 'Hormone Check quiz';

/** The subscription request, built on its own so a test can hold it to the API. */
export function subscriptionBody(email: string, listId: string) {
  return {
    data: {
      type: 'subscription',
      attributes: {
        custom_source: KLAVIYO_SOURCE,
        profile: {
          data: {
            type: 'profile',
            attributes: {
              email,
              subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
            },
          },
        },
      },
      relationships: { list: { data: { type: 'list', id: listId } } },
    },
  };
}

/** Records her consent on the list. Never throws: she gets her result regardless. */
async function subscribe(email: string, listId: string): Promise<boolean> {
  try {
    const res = await fetch(`${KLAVIYO_SUBSCRIPTIONS}?company_id=${KLAVIYO_PUBLIC_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', revision: KLAVIYO_REVISION },
      body: JSON.stringify(subscriptionBody(email, listId)),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

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

/**
 * What the event says about her, shared by both paths.
 *
 * Extracted so the woman from JJ's list and the woman who typed her address
 * are described identically in Klaviyo. A flow branching on `result_route`
 * cannot tell them apart, and should not have to.
 *
 * `consent_at` is the moment the event is built. On the typed path that is
 * the moment she ticked the box. On the list path it records when the quiz
 * was completed, since her consent predates this visit.
 */
function eventProperties(
  S: QuizState, outcome: Exclude<Outcome, 'D'>, angle: string,
) {
  const ad = readAttribution();
  const utm: Record<string, string> = {};
  /* Omitted rather than sent empty: an absent utm_source and a blank one mean
     different things in a report, and only one of them is true. */
  for (const key of UTM_KEYS) {
    if (ad[key]) utm[key] = ad[key];
  }

  return {
    outcome: OUTCOME_NAME[outcome],
    outcome_code: outcome,
    /* The same value under the name the rebuild brief asks for. `outcome`
       stays, because the live flow already branches on it. */
    result_route: OUTCOME_NAME[outcome],
    quiz: 'hf-v3',
    angle,
    ...utm,
    /* Her answers, so an email can say them back to her. They go to Klaviyo
       with her consent and nowhere else: never into a link, never to an ad
       pixel. */
    selected_symptoms: S.sym,
    primary_symptom: mainConcern(S),
    /* The v4 name for the same thing, kept for anything already reading it. */
    main_concern: mainConcern(S),
    age_band: S.age,
    cycle_status: S.cycle,
    ...(S.twelve ? { cycle_12_month_status: S.twelve } : {}),
    symptom_pattern: S.pattern,
    tried_actions: S.tried,
    desired_outcome: S.want,
    signs: S.sym.length,
    consent_at: new Date().toISOString(),
  };
}

/* ------------------------------------------- the woman already on the list -- */

/**
 * Sent once, so a reload cannot run JJ's flow twice.
 *
 * On the ordinary path the event is sent by a button: she presses it once
 * and that is that. A woman from the list presses nothing, so it is sent
 * when her result opens, and a result page can be reloaded, shared with
 * herself, or reached again with the back button. Without this, each of
 * those is another HF Quiz Completed and another run of the flow.
 */
const SENT_KEY = 'hf_list_event_sent';

const alreadySent = (): boolean => {
  try { return sessionStorage.getItem(SENT_KEY) === '1'; } catch { return false; }
};
const markSent = (): void => {
  try { sessionStorage.setItem(SENT_KEY, '1'); } catch { /* private browsing */ }
};

/**
 * The quiz-completed event for a woman who arrived from JJ's own list.
 *
 * SHE IS IDENTIFIED BY PROFILE ID, not by an address. Klaviyo takes
 * `profile.data.id` for a profile that already exists, so nothing here needs
 * her email, nothing asks her for one, and no second profile can be created
 * by a typo in an address she already gave JJ.
 *
 * NO CONSENT BOX, AND NO SUBSCRIPTION CALL. She agreed to hear from JJ when
 * she joined the list; this records what she did on an existing profile
 * rather than enrolling her in anything. submitLead's consent refusal is for
 * a stranger typing her address into our form, which is a different act.
 *
 * WITHOUT AN ID, NOTHING IS SENT AND NOTHING FAILS. skip_email=1 on its own
 * is the test mode: the quiz runs end to end with no recipient. Sending an
 * event with no one attached to it would create the junk profile this whole
 * path exists to avoid.
 */
export async function submitListLead(
  S: QuizState, outcome: Outcome, angle: string,
  profileId: string | null,
): Promise<{ ok: boolean; delivered: boolean }> {
  /* No recipient: the test mode. Not an error, and not a reason to stop. */
  if (!profileId) return { ok: true, delivered: false };

  /* The doctor route is an exit, here as everywhere: she is shown no offer
     and does not enter a flow that will go on to sell her a supplement. */
  if (outcome === 'D') return { ok: true, delivered: false };

  if (REVIEW) return { ok: true, delivered: false };
  if (alreadySent()) return { ok: true, delivered: false };

  markSent();

  const body = {
    data: {
      type: 'event',
      attributes: {
        /* D is refused above, so the narrowing is a fact rather than a cast. */
        properties: eventProperties(S, outcome as Exclude<Outcome, 'D'>, angle),
        metric: {
          data: { type: 'metric', attributes: { name: KLAVIYO_METRIC } },
        },
        profile: {
          data: { type: 'profile', id: profileId },
        },
      },
    },
  };

  try {
    const res = await fetch(`${KLAVIYO_EVENTS}?company_id=${KLAVIYO_PUBLIC_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', revision: KLAVIYO_REVISION },
      body: JSON.stringify(body),
    });
    return { ok: true, delivered: res.ok };
  } catch {
    /* Never block her from her result because a marketing endpoint is down. */
    return { ok: true, delivered: false };
  }
}

export async function submitLead(
  S: QuizState, outcome: Outcome, angle: string,
  /* The list to subscribe her to. Defaults to the one configured above; a
     test passes its own. */
  listId: string | null = KLAVIYO_LIST_ID,
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

  /* The review copy is for looking at, not for collecting. Nothing is sent. */
  if (REVIEW) return { ok: true, delivered: false };

  const body = {
    data: {
      type: 'event',
      attributes: {
        properties: eventProperties(S, outcome as Exclude<Outcome, 'D'>, angle),
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

  let delivered = false;
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
    delivered = res.ok;
  } catch {
    // Never block her from her result because a marketing endpoint is down.
  }

  /* Her consent, recorded on the list, so the flow is allowed to email her. */
  if (listId) await subscribe(S.email.trim(), listId);

  return { ok: true, delivered };
}

/** Deliberately permissive. Rejecting a real address costs more than accepting a typo. */
export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
