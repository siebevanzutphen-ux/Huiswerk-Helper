import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const ACCENT = "#a78bfa";
const ACCENT_2 = "#f472b6";
const TEXT = "#ffffff";

// 2×2 grid of animated subject vignettes. Each card showcases what the
// app does for that subject — math solving, atom physics, chemistry
// molecule, language morphing.

export const SubjectShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 28,
        width: 920,
        height: 920,
      }}
    >
      <ShowcaseCard delay={0} accent="#a78bfa" title="Math">
        <MathSolving local={frame - 4} fps={fps} />
      </ShowcaseCard>
      <ShowcaseCard delay={6} accent="#60a5fa" title="Physics">
        <AtomAnim local={frame - 10} />
      </ShowcaseCard>
      <ShowcaseCard delay={12} accent="#34d399" title="Chemistry">
        <Molecule local={frame - 16} />
      </ShowcaseCard>
      <ShowcaseCard delay={18} accent="#f472b6" title="Languages">
        <LanguageMorph local={frame - 22} />
      </ShowcaseCard>
    </div>
  );
};

// ---------------- Card frame ----------------
const ShowcaseCard: React.FC<{
  delay: number;
  accent: string;
  title: string;
  children: React.ReactNode;
}> = ({ delay, accent, title, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 150 },
  });
  return (
    <div
      style={{
        background: `linear-gradient(160deg, ${accent}1f, rgba(13,13,26,0.6))`,
        border: `2px solid ${accent}55`,
        borderRadius: 28,
        padding: 22,
        overflow: "hidden",
        position: "relative",
        transform: `scale(${pop}) translateY(${(1 - pop) * 60}px)`,
        opacity: pop,
        boxShadow: `0 16px 50px ${accent}33`,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: accent,
          marginBottom: 6,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ---------------- Math solving ----------------
const MathSolving: React.FC<{ local: number; fps: number }> = ({ local, fps }) => {
  const steps = ["2x + 5 = 17", "2x = 12", "x = 6"];
  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      {steps.map((s, i) => {
        const stepIn = spring({
          frame: local - i * 12,
          fps,
          config: { damping: 14 },
        });
        const isLast = i === steps.length - 1;
        return (
          <div
            key={i}
            style={{
              color: isLast ? "#34d399" : TEXT,
              fontSize: 40,
              fontWeight: 800,
              fontFamily: "'Courier New', monospace",
              padding: "6px 0",
              opacity: stepIn,
              transform: `translateY(${(1 - stepIn) * 14}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {s}
            {isLast && local > 36 && (
              <span
                style={{
                  fontSize: 36,
                  opacity: spring({
                    frame: local - 36,
                    fps,
                    config: { damping: 14 },
                  }),
                }}
              >
                ✓
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---------------- Atom (Physics) ----------------
const AtomAnim: React.FC<{ local: number }> = ({ local }) => {
  return (
    <svg width={260} height={260} viewBox="-130 -130 260 260" style={{ overflow: "visible" }}>
      {/* Three orbital ellipses, rotated at different angles */}
      {[0, 60, 120].map((rot, i) => (
        <g key={i} transform={`rotate(${rot})`}>
          <ellipse
            cx="0"
            cy="0"
            rx="100"
            ry="36"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
            opacity="0.4"
          />
          {/* Electron */}
          <circle
            cx={Math.cos((local + i * 30) / 8) * 100}
            cy={Math.sin((local + i * 30) / 8) * 36}
            r="6"
            fill="#60a5fa"
            style={{ filter: "drop-shadow(0 0 8px #60a5fa)" }}
          />
        </g>
      ))}
      {/* Nucleus */}
      <circle cx="0" cy="0" r="18" fill="url(#nucleus)" />
      <defs>
        <radialGradient id="nucleus">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
    </svg>
  );
};

// ---------------- Molecule (Chemistry, H₂O) ----------------
const Molecule: React.FC<{ local: number }> = ({ local }) => {
  const wobble = Math.sin(local / 6) * 8;
  return (
    <svg width={260} height={220} viewBox="-130 -110 260 220" style={{ overflow: "visible" }}>
      {/* Bonds */}
      <line
        x1="0"
        y1="0"
        x2={-78 + wobble}
        y2="55"
        stroke="#34d399"
        strokeWidth="6"
        opacity="0.6"
      />
      <line
        x1="0"
        y1="0"
        x2={78 - wobble}
        y2="55"
        stroke="#34d399"
        strokeWidth="6"
        opacity="0.6"
      />
      {/* Hydrogens */}
      <g transform={`translate(${-78 + wobble}, 55)`}>
        <circle r="26" fill="#a78bfa" style={{ filter: "drop-shadow(0 0 10px #a78bfa88)" }} />
        <text textAnchor="middle" y="8" fontSize="24" fontWeight="900" fill="#fff">
          H
        </text>
      </g>
      <g transform={`translate(${78 - wobble}, 55)`}>
        <circle r="26" fill="#a78bfa" style={{ filter: "drop-shadow(0 0 10px #a78bfa88)" }} />
        <text textAnchor="middle" y="8" fontSize="24" fontWeight="900" fill="#fff">
          H
        </text>
      </g>
      {/* Oxygen */}
      <circle r="42" fill="#f87171" style={{ filter: "drop-shadow(0 0 14px #f8717188)" }} />
      <text textAnchor="middle" y="12" fontSize="36" fontWeight="900" fill="#fff">
        O
      </text>
    </svg>
  );
};

// ---------------- Language morph ----------------
const WORDS = ["Hello", "Hallo", "Hola", "Bonjour", "Γεια"];
const LANGS = ["EN", "NL", "ES", "FR", "GR"];
const LanguageMorph: React.FC<{ local: number; fps?: number }> = ({ local }) => {
  const cycleFrames = 16;
  const idx = Math.max(0, Math.floor(local / cycleFrames)) % WORDS.length;
  const t = (local % cycleFrames) / cycleFrames; // 0..1 within current word
  // Fade out near end, fade in at start
  const wordOpacity = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;
  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: ACCENT_2,
          letterSpacing: 3,
          marginBottom: 12,
        }}
      >
        {LANGS[idx]}
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 900,
          background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: wordOpacity,
          transform: `translateY(${(1 - wordOpacity) * 10}px)`,
        }}
      >
        {WORDS[idx]}
      </div>
    </div>
  );
};
