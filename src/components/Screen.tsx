import { useEffect, useRef, type ReactNode } from 'react';

/**
 * The wrapper every quiz screen sits in.
 *
 * It does the three things that are easy to forget per screen and obvious
 * when they are missing: reset the scroll, move focus to the new heading so
 * a screen reader and a keyboard both land in the right place, and announce
 * the change.
 */
export function Screen({ id, children }: { id: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const heading = ref.current?.querySelector<HTMLElement>('[data-screen-heading]');
    // Focus without scrolling again — preventScroll keeps the reset above intact.
    heading?.focus({ preventScroll: true });
  }, [id]);

  return (
    <div className="rise" ref={ref} key={id}>
      {children}
    </div>
  );
}

/** The heading focus lands on. One per screen. */
export function ScreenTitle({
  children, className = 'q', as: Tag = 'h1',
}: {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <Tag className={className} tabIndex={-1} data-screen-heading style={{ outline: 'none' }}>
      {children}
    </Tag>
  );
}

/**
 * The sticky commit bar.
 *
 * Questions that take more than one tap need somewhere reliable to press
 * Continue. Sticking it to the bottom of the viewport means she never has to
 * scroll past six options to find it, and the bar sits above the home
 * indicator rather than under it.
 */
export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="actionBar">{children}</div>;
}
