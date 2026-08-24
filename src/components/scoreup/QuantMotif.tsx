/** קווי-רקע דקורטיביים מופשטים (צירים + עקומה עולה) — לא לוגו, לא הדמיית מוצר, רק מוטיב "כמותי" עדין מאחורי הכרטיס הדגל. צובע דרך currentColor, כדי שההורה ישלוט בגוון/שקיפות. */
export function QuantMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M20 20 V180 H180" strokeWidth="1.5" opacity="0.5" />
        {[52, 84, 116, 148].map((v) => (
          <line key={`h${v}`} x1="20" y1={v} x2="180" y2={v} strokeWidth="1" opacity="0.15" />
        ))}
        {[60, 100, 140].map((v) => (
          <line key={`v${v}`} x1={v} y1="20" x2={v} y2="180" strokeWidth="1" opacity="0.15" />
        ))}
        <polyline
          points="20,150 60,122 100,132 140,72 180,38"
          strokeWidth="2.5"
          opacity="0.6"
        />
        <circle cx="180" cy="38" r="4" fill="currentColor" stroke="none" opacity="0.6" />
      </g>
    </svg>
  );
}
