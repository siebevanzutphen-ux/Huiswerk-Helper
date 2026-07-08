import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Subject icons orbiting around a centre point (e.g. around Max).
// Each icon enters at a staggered moment, then orbits continuously.

const SUBJECTS = [
  { label: "∑", color: "#a78bfa" },     // Math
  { label: "⚛", color: "#60a5fa" },     // Physics
  { label: "H₂O", color: "#34d399" },   // Chemistry
  { label: "🧬", color: "#fbbf24" },    // Biology
  { label: "Aa", color: "#f472b6" },    // Languages
  { label: "€", color: "#fb923c" },     // Economics
  { label: "🌍", color: "#f87171" },    // Geography
  { label: "Ω", color: "#c084fc" },     // Greek/History
];

export const OrbitingSubjects: React.FC<{
  centerX?: number;
  centerY?: number;
  radius?: number;
  startFrame?: number;
}> = ({ centerX = 540, centerY = 760, radius = 380, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {SUBJECTS.map((s, i) => {
        const enter = spring({
          frame: frame - startFrame - i * 3,
          fps,
          config: { damping: 14, stiffness: 130 },
        });
        // Each icon orbits at its own phase, slightly different speed
        const baseAngle = (i / SUBJECTS.length) * Math.PI * 2;
        const orbitSpeed = 0.012 + (i % 3) * 0.002;
        const angle = baseAngle + (frame - startFrame) * orbitSpeed;
        const r = radius * enter;
        const x = centerX + Math.cos(angle) * r - 40;
        const y = centerY + Math.sin(angle) * r * 0.65 - 40; // squashed for depth

        // Front-back z-ordering by sin(angle) — items in back are smaller/dimmer
        const depth = (Math.sin(angle) + 1) / 2; // 0..1
        const scale = (0.7 + 0.4 * depth) * enter;
        const opacity = (0.5 + 0.5 * depth) * enter;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 80,
              height: 80,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${s.color}33, ${s.color}11)`,
              border: `2px solid ${s.color}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 900,
              color: "#ffffff",
              transform: `scale(${scale})`,
              opacity,
              backdropFilter: "blur(6px)",
              boxShadow: `0 8px 24px ${s.color}55`,
            }}
          >
            <span
              style={{
                background: `linear-gradient(135deg, ${s.color}, #ffffff)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
