import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JUMPS, type Jump } from './review';
import { setPreset } from './flag';
import './review.css';

/**
 * The bar across the top of the review build.
 *
 * It says what this copy is and jumps to each screen worth a look. It exists
 * only in the review build: the real build never imports this file.
 *
 * THE NOTES ARE NOT IN THIS REPOSITORY, which is public. If a file called
 * review-notes.html sits beside the page, the bar offers it; if not, there is
 * no notes button. Whoever shares the review copy supplies that file.
 */
export default function ReviewBar({ onJump }: { onJump: () => void }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch('review-notes.html')
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => { if (live && t.trim()) setNotes(t); })
      .catch(() => { /* no notes beside this page */ });
    return () => { live = false; };
  }, []);

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
        <b>Review copy.</b> Nothing you type is sent anywhere. The buy buttons
        open the real cart.
      </p>

      <div className="rvJumps">
        {JUMPS.map((j) => (
          <button key={j.label} type="button" data-inline onClick={() => go(j)}>{j.label}</button>
        ))}
        {notes && (
          <button
            type="button" data-inline className="rvNotesBtn" aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Hide notes' : 'Notes and open decisions'}
          </button>
        )}
      </div>

      {/* Our own file, published beside the page by whoever shares it. */}
      {open && notes && <div className="rvNotes" dangerouslySetInnerHTML={{ __html: notes }} />}
    </aside>
  );
}
