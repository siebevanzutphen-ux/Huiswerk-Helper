import { random, useCurrentFrame } from "remotion";

// A field of drifting formulas/symbols from every subject in the app.
// Math, physics, chemistry, languages, history — all represented.
// Deterministic (uses seeded random) so render is reproducible.

const ITEMS = [
  // Math
  { text: "x² + 2x − 8 = 0", size: 56, color: "#a78bfa" },
  { text: "∫ x² dx", size: 62, color: "#a78bfa" },
  { text: "a² + b² = c²", size: 58, color: "#a78bfa" },
  { text: "sin²θ + cos²θ = 1", size: 50, color: "#a78bfa" },
  { text: "π", size: 110, color: "#a78bfa" },
  { text: "√2", size: 88, color: "#a78bfa" },
  { text: "Σ", size: 100, color: "#a78bfa" },
  { text: "lim x→∞", size: 56, color: "#a78bfa" },
  // Physics
  { text: "E = mc²", size: 70, color: "#60a5fa" },
  { text: "F = ma", size: 64, color: "#60a5fa" },
  { text: "PV = nRT", size: 56, color: "#60a5fa" },
  { text: "λ = h/p", size: 56, color: "#60a5fa" },
  // Chemistry
  { text: "H₂O", size: 80, color: "#34d399" },
  { text: "CO₂", size: 80, color: "#34d399" },
  { text: "NaCl", size: 70, color: "#34d399" },
  { text: "C₆H₁₂O₆", size: 60, color: "#34d399" },
  { text: "2H₂ + O₂ → 2H₂O", size: 48, color: "#34d399" },
  // Biology
  { text: "DNA", size: 84, color: "#fbbf24" },
  { text: "ATP", size: 78, color: "#fbbf24" },
  { text: "🧬", size: 80, color: "#fbbf24" },
  // Languages
  { text: "Hallo", size: 64, color: "#f472b6" },
  { text: "Hola", size: 64, color: "#f472b6" },
  { text: "Bonjour", size: 56, color: "#f472b6" },
  { text: "Salve", size: 60, color: "#f472b6" },
  { text: "Γεια", size: 64, color: "#f472b6" },
  { text: "Aa", size: 80, color: "#f472b6" },
  { text: "der/die/das", size: 50, color: "#f472b6" },
  // History/Geography
  { text: "1789", size: 64, color: "#f87171" },
  { text: "1945", size: 64, color: "#f87171" },
  { text: "🌍", size: 78, color: "#f87171" },
  { text: "Ω", size: 88, color: "#f87171" },
  // Economics
  { text: "€", size: 90, color: "#fbbf24" },
];

export const FloatingFormulas: React.FC<{
  count?: number;
  baseOpacity?: number;
}> = ({ count = 24, baseOpacity = 0.14 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => {
        const item = ITEMS[Math.floor(random(`fitem-${i}`) * ITEMS.length)];
        const x0 = random(`fx-${i}`) * 1080;
        const y0 = random(`fy-${i}`) * 1920;
        // Each item drifts on its own slow loop
        const driftX = Math.sin((frame + i * 31) / 60) * 40;
        const driftY = Math.cos((frame + i * 17) / 70) * 30;
        // Each item pulses opacity independently
        const pulse = 0.6 + 0.4 * Math.sin((frame + i * 23) / 40);
        const rot = (random(`fr-${i}`) - 0.5) * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + driftX,
              top: y0 + driftY,
              fontSize: item.size,
              color: item.color,
              opacity: baseOpacity * pulse,
              fontWeight: 800,
              fontFamily: "Inter, sans-serif",
              transform: `rotate(${rot}deg)`,
              whiteSpace: "nowrap",
              filter: `drop-shadow(0 0 12px ${item.color}88)`,
            }}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
};
