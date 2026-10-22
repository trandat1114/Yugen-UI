/** Japanese text uses a Mincho font (index.html loads only the characters in the source); the system font otherwise. */
export const JP = "font-['Shippori_Mincho','Yu_Mincho','Hiragino_Mincho_ProN','Noto_Serif_JP',serif]";

/** Five-petal cherry blossom with the notch at each petal tip. Decorative: hidden from screen readers. */
export function SakuraBloom({ className = "" }: { className?: string }) {
  const petal = "M50 50C38 40 33 22 42 9C45 13 48 13 50 8C52 13 55 13 58 9C67 22 62 40 50 50Z";
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className}>
      <defs>
        <radialGradient id="yg-bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#e2508e" />
          <stop offset="0.35" stopColor="#f6a6c7" />
          <stop offset="1" stopColor="#fde4ee" />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((deg) => (
        <path key={deg} d={petal} fill="url(#yg-bloom)" transform={`rotate(${deg} 50 50)`} />
      ))}
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 50 50)`}>
          <line x1="50" y1="50" x2="50" y2="37" stroke="#c2347a" strokeWidth="0.8" />
          <circle cx="50" cy="36" r="1.4" fill="#f7d35c" />
        </g>
      ))}
      <circle cx="50" cy="50" r="3.2" fill="#c2347a" />
    </svg>
  );
}
