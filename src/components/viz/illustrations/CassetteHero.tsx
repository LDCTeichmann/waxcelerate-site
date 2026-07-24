// ─── CassetteHero — large-scale cog rendering for the science-page hero ──────
// One tooth silhouette, repeated by rotation around a center hub — the same
// hook profile as SprocketTooth, just authored radially and multiplied. Static,
// no state: this is the "hero shot" of the part being studied, not a diagram.
// Pure SVG, theme-driven via CSS vars.

const TEETH = 18;
const TOOTH_LOCAL = 'M-13,-124 L-11,-139 Q-9,-157 -3,-165 Q2,-169 8,-163 Q13,-154 13,-139 L13,-124 Z';

export function CassetteHero({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={`w-full h-auto ${className}`}
      role="img"
      aria-label="Kassette"
    >
      <defs>
        <radialGradient id="cog-metal" cx="35%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#8a94a3" />
          <stop offset="45%" stopColor="#5b6472" />
          <stop offset="100%" stopColor="#333a44" />
        </radialGradient>
        <radialGradient id="cog-hub" cx="35%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#2a2e35" />
          <stop offset="100%" stopColor="#141619" />
        </radialGradient>
        <filter id="cog-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>

      <g filter="url(#cog-shadow)">
        {/* Root disc */}
        <circle cx="200" cy="200" r="126" fill="url(#cog-metal)" />

        {/* Teeth, multiplied by rotation around the hub */}
        {Array.from({ length: TEETH }, (_, i) => (
          <path
            key={i}
            d={TOOTH_LOCAL}
            fill="url(#cog-metal)"
            transform={`translate(200,200) rotate(${(360 / TEETH) * i})`}
          />
        ))}

        {/* Subtle rim highlight */}
        <circle cx="200" cy="200" r="126" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />

        {/* Hub */}
        <circle cx="200" cy="200" r="58" fill="url(#cog-hub)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="46" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />

        {/* Spline bore */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect
            key={i}
            x="196.5" y="176" width="7" height="10" rx="1.5"
            fill="#0a0b0d"
            transform={`rotate(${36 * i} 200 200)`}
          />
        ))}

        {/* Engraved lockring text, arced */}
        <defs>
          <path id="cog-arc" d="M 128,200 A 72,72 0 0 1 272,200" />
        </defs>
        <text fontSize="11" fontWeight={700} letterSpacing="0.28em" fill="rgba(255,255,255,0.55)">
          <textPath href="#cog-arc" startOffset="50%" textAnchor="middle">CASSETTE</textPath>
        </text>
      </g>
    </svg>
  );
}
