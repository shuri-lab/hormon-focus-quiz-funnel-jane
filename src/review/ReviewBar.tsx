import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JUMPS, setPreset, type Jump } from './review';
import './review.css';

/**
 * The bar across the top of the review build.
 *
 * It says what this copy is, jumps to each screen worth a look, and holds the
 * short list of things still to decide. It is never rendered in the real
 * build: App only mounts it when REVIEW is on.
 */
export default function ReviewBar({ onJump }: { onJump: () => void }) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(false);

  const go = (j: Jump) => {
    setPreset(j.state);
    /* A new key on the routes makes the quiz start again from these answers. */
    onJump();
    navigate(j.route, { state: j.screen ? { screen: j.screen } : null });
    window.scrollTo(0, 0);
  };

  return (
    <aside className="rvBar" aria-label="Review tools">
      <p className="rvLead">
        <b>Review copy, 2 October 2026.</b> Nothing you type is sent anywhere.
        The buy buttons open the real cart.
      </p>

      <div className="rvJumps">
        {JUMPS.map((j) => (
          <button key={j.label} type="button" data-inline onClick={() => go(j)}>{j.label}</button>
        ))}
        <button
          type="button" data-inline className="rvNotesBtn" aria-expanded={notes}
          onClick={() => setNotes((v) => !v)}
        >
          {notes ? 'Hide notes' : 'Notes and open decisions'}
        </button>
      </div>

      {notes && (
        <div className="rvNotes">
          <p className="rvH">What changed</p>
          <ul>
            <li>The cover is one screen: headline, one line, one button.</li>
            <li>Seven questions, down from eleven, with no explainer screens.</li>
            <li>One result page, then one kit page that scrolls. The price is one tap after the email screen.</li>
            <li>The five results are the same as before, and Klaviyo gets the same outcome names.</li>
            <li>Every result except the doctor route sees the kit.</li>
            <li>The offer block is the one from the live offer page.</li>
            <li>The doctor route is two cases: periods stopped under 40, and periods still coming and going at 60 or over.</li>
          </ul>

          <p className="rvH">To decide</p>
          <ul>
            <li>
              <b>The promise on the cover.</b> “Hormone Check” as it is; or the check plus
              “your personal plan for what to do next”; or rename it the “Hormone Plan”. The last
              two need a personal first step added to the result page.
            </li>
            <li><b>The consent tick box</b> on the email screen: keep it, or replace it with one line under the button.</li>
            <li><b>Symptom images.</b> Sleep, energy and mood show the same woman.</li>
            <li><b>Final copy</b> for three of the four result explanations, “Why 60 days”, the Hormone Focus paragraph and the five questions.</li>
          </ul>

          <p className="rvH">For David</p>
          <ul>
            <li>The branch is quiz-rebuild-v5, local only. It is pushed on Jane’s yes.</li>
            <li>How the public quiz is published. The Lovable build is still the old $84.99 version.</li>
            <li>The Meta pixel as a tag in the GTM container, and a check that the Klaviyo flow sends to a new completer.</li>
            <li>One tagged test order from the kit button, read in Shopify.</li>
          </ul>
        </div>
      )}
    </aside>
  );
}
