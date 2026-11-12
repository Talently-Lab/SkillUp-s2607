/* Hand-drawn arrows that go with the Caveat notes (design doc §5, used sparingly) */

type ArrowProps = { className?: string };

export function ArrowDownRight({ className }: ArrowProps) {
  return (
    <svg className={className} viewBox="0 0 64 44" fill="none" aria-hidden="true">
      <path d="M4 6c18 2 36 10 46 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 32l10 6 3-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowCurveDown({ className }: ArrowProps) {
  return (
    <svg className={className} viewBox="0 0 70 52" fill="none" aria-hidden="true">
      <path d="M4 8c22-6 44 4 52 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M45 32l11 9 5-13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUpLeft({ className }: ArrowProps) {
  return (
    <svg className={className} viewBox="0 0 52 44" fill="none" aria-hidden="true">
      <path d="M44 40C30 38 14 30 10 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M3 15l7-10 8 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowSide({ className, flip = false, down = false }: ArrowProps & { flip?: boolean; down?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 90 36"
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {down ? (
        <>
          <path d="M4 8c26 0 52 4 76 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M68 28l13-1-6-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M4 26c26 0 50-4 76-16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M68 6l13 3-7 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export function PlayGlyph({ className }: ArrowProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

export function Sparkle({ className }: ArrowProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
    </svg>
  );
}

export function Burst({ className }: ArrowProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2v6M12 16v6M2 12h6M16 12h6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M19.1 4.9l-4.2 4.2M9.1 14.9l-4.2 4.2" />
      </g>
    </svg>
  );
}
