/* Where the email goes.
 *
 * Set VITE_LEAD_ENDPOINT to a URL that accepts a JSON POST — a Klaviyo
 * server-side proxy, a Shopify app endpoint, a serverless function. Until it
 * is set the submission resolves locally and warns in development, so the
 * funnel is testable without an inbox behind it.
 *
 * NOTHING in the UI promises delivery that is not wired. If you ship with
 * this unset, the address is collected and dropped. See README.
 */
import { readAttribution } from './analytics';
import type { QuizState, Outcome } from './logic';

const ENDPOINT = import.meta.env.VITE_LEAD_ENDPOINT as string | undefined;

export interface Lead {
  name: string;
  email: string;
  outcome: Outcome;
  angle: string;
  answers: QuizState;
  attribution: Record<string, string>;
  /** Recorded with the lead: what she actually agreed to, and when. */
  consent: boolean;
  submittedAt: string;
}

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

  const lead: Lead = {
    name: S.name.trim(),
    email: S.email.trim(),
    outcome,
    angle,
    answers: S,
    attribution: readAttribution(),
    consent: S.consent,
    submittedAt: new Date().toISOString(),
  };

  if (!ENDPOINT) {
    if (import.meta.env.DEV) {
      console.warn(
        '[leads] VITE_LEAD_ENDPOINT is not set — this address was not sent anywhere.',
        lead,
      );
    }
    return { ok: true, delivered: false };
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      keepalive: true,       // survives the navigation to the next screen
    });
    return { ok: true, delivered: res.ok };
  } catch {
    // Never block her from her result because a webhook is down.
    return { ok: true, delivered: false };
  }
}

/** Deliberately permissive. Rejecting a real address costs more than accepting a typo. */
export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
