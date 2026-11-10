export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="#0b1638" stroke="#ffffff22" />
      <path d="M8 10h16M16 10v13" stroke="url(#logo-g)" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
