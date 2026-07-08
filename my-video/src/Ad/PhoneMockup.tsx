import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

// A vertical phone frame containing a mini Huiswerk-Helper UI demo.
// Shows: subject grid → photo upload → AI explanation.

const ACCENT = "#a78bfa";
const ACCENT_2 = "#f472b6";
const BG = "#0d0d1a";
const CARD = "#1c1c33";
const TEXT = "#ffffff";
const MUTED = "#8b8db5";

export const PhoneMockup: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;

  // Three UI phases inside the phone
  // 0-25 frames: subject grid
  // 25-50 frames: photo of homework
  // 50-75 frames: AI explanation

  const showGrid = local < 28;
  const showPhoto = local >= 22 && local < 52;
  const showExplain = local >= 46;

  return (
    <div
      style={{
        width: 460,
        height: 940,
        background: "#000",
        borderRadius: 60,
        padding: 14,
        boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 4px #1a1a2e, 0 0 60px ${ACCENT}44`,
        position: "relative",
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: "50%",
          transform: "translateX(-50%)",
          width: 130,
          height: 32,
          background: "#000",
          borderRadius: 20,
          zIndex: 10,
        }}
      />

      {/* Screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
          borderRadius: 48,
          overflow: "hidden",
          padding: "70px 22px 22px 22px",
          position: "relative",
        }}
      >
        {/* App header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
            }}
          />
          <span style={{ color: TEXT, fontSize: 20, fontWeight: 800 }}>
            Huiswerk-Helper
          </span>
        </div>

        {showGrid && <UIGrid local={local} fps={fps} />}
        {showPhoto && <UIPhoto local={local - 22} fps={fps} />}
        {showExplain && <UIExplain local={local - 46} fps={fps} />}
      </div>
    </div>
  );
};

// --- Subject grid (initial state) ---
const SUBJECTS = [
  { name: "Math", color: ACCENT },
  { name: "Physics", color: "#60a5fa" },
  { name: "Chemistry", color: "#34d399" },
  { name: "Biology", color: "#fbbf24" },
  { name: "English", color: ACCENT_2 },
  { name: "Dutch", color: "#f87171" },
];

const UIGrid: React.FC<{ local: number; fps: number }> = ({ local, fps }) => {
  return (
    <>
      <div style={{ color: MUTED, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
        Which subject?
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {SUBJECTS.map((s, i) => {
          const pop = spring({
            frame: local - i * 2,
            fps,
            config: { damping: 12, stiffness: 160 },
          });
          return (
            <div
              key={s.name}
              style={{
                background: CARD,
                border: `2px solid ${s.color}66`,
                borderRadius: 14,
                padding: "16px 14px",
                color: TEXT,
                fontSize: 18,
                fontWeight: 700,
                transform: `scale(${pop}) translateY(${(1 - pop) * 20}px)`,
                opacity: pop,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: s.color,
                }}
              />
              {s.name}
            </div>
          );
        })}
      </div>
    </>
  );
};

// --- Photo upload state ---
const UIPhoto: React.FC<{ local: number; fps: number }> = ({ local, fps }) => {
  const photoIn = spring({ frame: local, fps, config: { damping: 14 } });
  const scanT = interpolate(local, [8, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <div style={{ color: MUTED, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
        📸 Snap your homework
      </div>
      <div
        style={{
          width: "100%",
          height: 360,
          borderRadius: 18,
          background: "#f5f5f0",
          position: "relative",
          overflow: "hidden",
          transform: `scale(${photoIn})`,
          opacity: photoIn,
          boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.1)",
        }}
      >
        {/* Fake handwritten math */}
        <div
          style={{
            padding: 24,
            fontFamily: "'Courier New', monospace",
            color: "#222",
            fontSize: 22,
            lineHeight: 1.7,
          }}
        >
          <div>2x + 5 = 17</div>
          <div style={{ marginLeft: 16, color: "#555" }}>2x = 12</div>
          <div style={{ marginLeft: 32, color: "#555" }}>x = ?</div>
          <div style={{ marginTop: 14, color: "#888", fontSize: 16 }}>
            ∫ 3x² dx = ?
          </div>
        </div>
        {/* Scan beam */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${scanT * 100}%`,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${ACCENT_2}, transparent)`,
            boxShadow: `0 0 20px ${ACCENT_2}`,
          }}
        />
        {/* Scan overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, ${ACCENT}11 0%, transparent ${scanT * 100}%)`,
          }}
        />
      </div>
      <div
        style={{
          marginTop: 16,
          color: TEXT,
          fontSize: 18,
          fontWeight: 600,
          textAlign: "center",
          opacity: scanT,
        }}
      >
        Analyzing...
      </div>
    </>
  );
};

// --- AI explanation state ---
const UIExplain: React.FC<{ local: number; fps: number }> = ({ local, fps }) => {
  const headerIn = spring({ frame: local, fps, config: { damping: 14 } });
  const steps = [
    "2x = 17 − 5",
    "2x = 12",
    "x = 6 ✓",
  ];
  return (
    <>
      <div
        style={{
          background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT_2}22)`,
          border: `2px solid ${ACCENT}55`,
          borderRadius: 18,
          padding: 16,
          opacity: headerIn,
          transform: `translateY(${(1 - headerIn) * 20}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
            color: ACCENT_2,
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          ✨ Max explains
        </div>
        {steps.map((line, i) => {
          const stepIn = spring({
            frame: local - 6 - i * 6,
            fps,
            config: { damping: 14 },
          });
          return (
            <div
              key={i}
              style={{
                color: TEXT,
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "'Courier New', monospace",
                padding: "8px 0",
                opacity: stepIn,
                transform: `translateX(${(1 - stepIn) * 20}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 18,
          color: MUTED,
          fontSize: 15,
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        Tap for the next step →
      </div>
    </>
  );
};
