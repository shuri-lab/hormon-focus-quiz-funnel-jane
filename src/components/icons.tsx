
export function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="var(--star)" className={className} aria-hidden="true">
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
    </svg>
  );
}

export function Tick() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function Stars({ n = 5 }: { n?: number }) {
  return <>{Array.from({ length: n }, (_, i) => <Star key={i} />)}</>;
}

