import { useCurrentFrame } from "remotion";

// Stylised iOS/Android-style app icon: rounded gradient square with
// Max's actual head from the app (silver robot face with purple eyes).
export const AppIcon: React.FC<{ size?: number }> = ({ size = 320 }) => {
  const frame = useCurrentFrame();
  const float = Math.sin(frame / 20) * 4;
  const highlightX = ((frame * 1.2) % 200) - 50;

  // Subtle eye blink inside the icon too
  const blinkCycle = frame % 90;
  const blinking = blinkCycle > 0 && blinkCycle < 6;
  const eyeScale = blinking ? 0.12 : 1;

  // Head SVG sizing — fills most of the icon
  const headSize = size * 0.7;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
        position: "relative",
        overflow: "hidden",
        boxShadow: `
          0 30px 60px rgba(167,139,250,0.5),
          0 12px 24px rgba(244,114,182,0.4),
          inset 0 2px 0 rgba(255,255,255,0.4),
          inset 0 -8px 20px rgba(0,0,0,0.15)
        `,
        transform: `translateY(${float}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Glass highlight sweep */}
      <div
        style={{
          position: "absolute",
          top: -size * 0.5,
          left: `${highlightX}%`,
          width: size * 0.4,
          height: size * 2,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          transform: "rotate(28deg)",
          pointerEvents: "none",
        }}
      />

      {/* Inline Max head — silver robot face matching the app */}
      <svg
        width={headSize}
        height={headSize * (66 / 84)}
        viewBox="20 8 84 66"
        style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.3))" }}
      >
        {/* Antenna */}
        <line x1="62" y1="16" x2="62" y2="26" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="62" cy="13" r="6" fill="#facc15" opacity="0.3" />
        <circle cx="62" cy="13" r="4" fill="#facc15" />

        {/* Head box */}
        <rect x="33" y="26" width="58" height="50" rx="13" fill="#e2e8f0" />
        {/* Side ears */}
        <rect x="27" y="44" width="6" height="14" rx="2.5" fill="#cbd5e1" />
        <rect x="91" y="44" width="6" height="14" rx="2.5" fill="#cbd5e1" />
        {/* Corner bolts */}
        <circle cx="39" cy="32" r="1.8" fill="#94a3b8" />
        <circle cx="85" cy="32" r="1.8" fill="#94a3b8" />
        <circle cx="39" cy="70" r="1.8" fill="#94a3b8" />
        <circle cx="85" cy="70" r="1.8" fill="#94a3b8" />
        {/* Dark visor */}
        <rect x="38" y="38" width="48" height="20" rx="5" fill="#1a1a2e" />
        {/* Eyes — white outer + purple pupils */}
        <ellipse cx="52" cy="48" rx="4.5" ry={4.5 * eyeScale} fill="#fff" />
        <ellipse cx="72" cy="48" rx="4.5" ry={4.5 * eyeScale} fill="#fff" />
        <ellipse cx="52" cy="48" rx="2" ry={2 * eyeScale} fill="#a78bfa" />
        <ellipse cx="72" cy="48" rx="2" ry={2 * eyeScale} fill="#a78bfa" />
        {/* Smile */}
        <path
          d="M54 66 q8 6 16 0"
          stroke="#94a3b8"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
