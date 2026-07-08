import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const ACCENT = "#a78bfa";
const ACCENT_2 = "#f472b6";

// Caption bar that appears with the voice-over. Words reveal in sequence,
// matching natural speech pacing. Highlighted words get the brand gradient.
export const Subtitle: React.FC<{
  text: string;
  durationFrames: number;
  highlight?: string[];
}> = ({ text, durationFrames, highlight = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const wordReveal = Math.max(2, Math.floor((durationFrames - 8) / words.length));
  const wrapIn = spring({ frame, fps, config: { damping: 18 } });
  const wrapOut = interpolate(frame, [durationFrames - 6, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wrapOpacity = wrapIn * wrapOut;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 180,
        display: "flex",
        justifyContent: "center",
        padding: "0 60px",
        opacity: wrapOpacity,
        transform: `translateY(${(1 - wrapIn) * 20}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(13,13,26,0.7)",
          backdropFilter: "blur(14px)",
          borderRadius: 28,
          padding: "22px 38px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          maxWidth: 940,
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: -0.5,
            lineHeight: 1.15,
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {words.map((w, i) => {
            const wordFrame = frame - i * wordReveal;
            const wIn = spring({
              frame: wordFrame,
              fps,
              config: { damping: 14 },
            });
            // Strip trailing punctuation for highlight check
            const clean = w.replace(/[.,!?]$/, "").toLowerCase();
            const isHighlight = highlight.some((h) => h.toLowerCase() === clean);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: 14,
                  opacity: wIn,
                  transform: `translateY(${(1 - wIn) * 10}px)`,
                  background: isHighlight
                    ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`
                    : "none",
                  WebkitBackgroundClip: isHighlight ? "text" : "unset",
                  WebkitTextFillColor: isHighlight ? "transparent" : "#ffffff",
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
