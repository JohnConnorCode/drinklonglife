export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Organic infinity symbol with leaf-like curves */}
      <path
        d="M25 50 C25 35, 15 25, 25 25 C35 25, 40 35, 50 50 C60 65, 65 75, 75 75 C85 75, 75 65, 75 50 C75 35, 85 25, 75 25 C65 25, 60 35, 50 50 C40 65, 35 75, 25 75 C15 75, 25 65, 25 50 Z"
        fill="currentColor"
        opacity="0.15"
      />

      {/* Main infinity loop with organic curves */}
      <path
        d="M25 50 C25 38, 18 30, 25 30 C32 30, 38 38, 50 50 C62 62, 68 70, 75 70 C82 70, 75 62, 75 50 C75 38, 82 30, 75 30 C68 30, 62 38, 50 50 C38 62, 32 70, 25 70 C18 70, 25 62, 25 50 Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Organic accent dots/leaves at cardinal points */}
      <circle cx="25" cy="30" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="75" cy="30" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="25" cy="70" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="75" cy="70" r="3" fill="currentColor" opacity="0.7" />

      {/* Center connecting point - represents vitality */}
      <circle cx="50" cy="50" r="4" fill="currentColor" />

      {/* Subtle leaf veins radiating from center */}
      <path
        d="M50 50 L45 45 M50 50 L55 45 M50 50 L45 55 M50 50 L55 55"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
