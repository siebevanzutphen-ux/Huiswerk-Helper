import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AppIcon } from "./AppIcon";
import { FloatingFormulas } from "./FloatingFormulas";
import { MaxFullBody } from "./MaxFullBody";
import { OrbitingSubjects } from "./OrbitingSubjects";
import {
  Confetti,
  GlowOrbs,
  QuestionFloat,
  SparkleField,
} from "./Particles";
import { Subtitle } from "./Subtitle";
import { SubjectShowcase } from "./SubjectShowcase";

// === Brand palette ===
const BG = "#0d0d1a";
const BG2 = "#15152a";
const ACCENT = "#a78bfa";
const ACCENT_2 = "#f472b6";
const TEXT = "#ffffff";
const MUTED = "#8b8db5";
const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// === Scene timing (15s @ 30fps = 450 frames) ===
const S1_END = 75;
const S2_END = 150;
const S3_END = 258;
const S4_END = 330;
const S5_END = 450;

// Voice start frames
const VO1 = 6;
const VO2 = 80;
const VO3 = 156;
const VO4 = 264;
const VO5 = 336;

const VO_DUR = { vo1: 62, vo2: 55, vo3: 90, vo4: 60, vo5: 112 };

export const Ad: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${BG2} 0%, ${BG} 70%)`,
        fontFamily: FONT,
        overflow: "hidden",
      }}
    >
      {/* === Audio === */}
      <Audio src={staticFile("bgm.wav")} volume={0.3} />

      <Sequence from={VO1} durationInFrames={VO_DUR.vo1}>
        <Audio src={staticFile("vo1.mp3")} volume={1} />
      </Sequence>
      <Sequence from={VO2} durationInFrames={VO_DUR.vo2}>
        <Audio src={staticFile("vo2.mp3")} volume={1} />
      </Sequence>
      <Sequence from={VO3} durationInFrames={VO_DUR.vo3}>
        <Audio src={staticFile("vo3.mp3")} volume={1} />
      </Sequence>
      <Sequence from={VO4} durationInFrames={VO_DUR.vo4}>
        <Audio src={staticFile("vo4.mp3")} volume={1} />
      </Sequence>
      <Sequence from={VO5} durationInFrames={VO_DUR.vo5}>
        <Audio src={staticFile("vo5.mp3")} volume={1} />
      </Sequence>

      {/* Soft musical "bloom" transitions */}
      <Sequence from={S1_END - 8} durationInFrames={22}>
        <Audio src={staticFile("bloom.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={S2_END - 8} durationInFrames={22}>
        <Audio src={staticFile("bloom.wav")} volume={0.25} />
      </Sequence>
      <Sequence from={S3_END - 8} durationInFrames={22}>
        <Audio src={staticFile("bloom.wav")} volume={0.25} />
      </Sequence>
      <Sequence from={S4_END - 8} durationInFrames={22}>
        <Audio src={staticFile("bloom.wav")} volume={0.3} />
      </Sequence>

      {/* Chime when Max lands */}
      <Sequence from={S1_END + 22} durationInFrames={45}>
        <Audio src={staticFile("ding.wav")} volume={0.3} />
      </Sequence>
      {/* Chime on level-up */}
      <Sequence from={S3_END + 50} durationInFrames={45}>
        <Audio src={staticFile("ding.wav")} volume={0.35} />
      </Sequence>
      {/* Shimmer on CTA */}
      <Sequence from={S4_END + 8} durationInFrames={36}>
        <Audio src={staticFile("shimmer.wav")} volume={0.4} />
      </Sequence>

      <GlowOrbs />

      <Sequence from={0} durationInFrames={S1_END + 6}>
        <SceneHook />
      </Sequence>
      <Sequence from={S1_END} durationInFrames={S2_END - S1_END + 6}>
        <SceneMascot />
      </Sequence>
      <Sequence from={S2_END} durationInFrames={S3_END - S2_END + 6}>
        <SceneShowcase />
      </Sequence>
      <Sequence from={S3_END} durationInFrames={S4_END - S3_END + 6}>
        <SceneGame />
      </Sequence>
      <Sequence from={S4_END} durationInFrames={S5_END - S4_END}>
        <SceneCTA />
      </Sequence>

      {/* === Subtitles === */}
      <Sequence from={VO1} durationInFrames={VO_DUR.vo1 + 4}>
        <Subtitle text="Stuck on homework?" durationFrames={VO_DUR.vo1 + 4} highlight={["homework?"]} />
      </Sequence>
      <Sequence from={VO2} durationInFrames={VO_DUR.vo2 + 6}>
        <Subtitle text="Meet Max." durationFrames={VO_DUR.vo2 + 6} highlight={["Max."]} />
      </Sequence>
      <Sequence from={VO3} durationInFrames={VO_DUR.vo3 + 6}>
        <Subtitle
          text="Snap a photo, get every step."
          durationFrames={VO_DUR.vo3 + 6}
          highlight={["every", "step."]}
        />
      </Sequence>
      <Sequence from={VO4} durationInFrames={VO_DUR.vo4 + 6}>
        <Subtitle
          text="Learn by playing."
          durationFrames={VO_DUR.vo4 + 6}
          highlight={["playing."]}
        />
      </Sequence>
      <Sequence from={VO5} durationInFrames={VO_DUR.vo5 + 6}>
        <Subtitle
          text="Huiswerk-Helper. Coming soon."
          durationFrames={VO_DUR.vo5 + 6}
          highlight={["Coming", "soon."]}
        />
      </Sequence>

      <Sequence from={S4_END} durationInFrames={10}>
        <FlashTransition />
      </Sequence>
    </AbsoluteFill>
  );
};

// =========================================================
// Scene 1 — HOOK (Max confused with question marks)
// =========================================================
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = S1_END;

  const stuckIn = spring({ frame: frame - 4, fps, config: { damping: 14 } });
  const hwIn = spring({ frame: frame - 16, fps, config: { damping: 12, stiffness: 140 } });
  const maxIn = spring({ frame: frame - 22, fps, config: { damping: 14, stiffness: 110 } });

  const exit = interpolate(frame, [dur - 8, dur + 4], [1, 0]);
  const camera = interpolate(frame, [dur - 15, dur + 6], [1, 0.7]);

  // Pulsing thought-bubble "?"
  const pulse = 1 + 0.08 * Math.sin(frame / 5);
  const pulseGlow = (Math.sin(frame / 8) + 1) / 2;

  return (
    <AbsoluteFill style={{ opacity: exit, transform: `scale(${camera})` }}>
      <FloatingFormulas count={22} baseOpacity={0.13} />
      <QuestionFloat exitFrame={dur - 8} />

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "100px 60px 0 60px",
          textAlign: "center",
        }}
      >
        {/* Title text */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: TEXT,
            letterSpacing: -3,
            lineHeight: 1.05,
            opacity: stuckIn,
            transform: `translateY(${(1 - stuckIn) * 50}px)`,
          }}
        >
          Stuck on
        </div>
        <div
          style={{
            fontSize: 122,
            fontWeight: 900,
            letterSpacing: -3,
            lineHeight: 1.05,
            opacity: hwIn,
            transform: `translateY(${(1 - hwIn) * 50}px) scale(${0.9 + hwIn * 0.1})`,
            background: `linear-gradient(135deg, #ffffff 0%, #c7c9e0 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 30,
          }}
        >
          homework?
        </div>

        {/* Big "?" thought bubble above Max */}
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_2} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transform: `scale(${pulse})`,
            lineHeight: 1,
            filter: `drop-shadow(0 0 ${20 + pulseGlow * 30}px ${ACCENT_2}aa)`,
            marginTop: 20,
          }}
        >
          ?
        </div>

        {/* Max — confused pose, full body, below text */}
        <div
          style={{
            transform: `scale(${maxIn}) translateY(${(1 - maxIn) * 60}px)`,
            marginTop: -40,
            opacity: maxIn,
          }}
        >
          <MaxFullBody size={300} pose="confused" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =========================================================
// Scene 2 — MASCOT REVEAL (Max drops in, waves)
// =========================================================
const SceneMascot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = S2_END - S1_END;

  const dropProgress = spring({
    frame: frame - 4,
    fps,
    config: { damping: 8, stiffness: 100 },
  });
  const robotY = interpolate(dropProgress, [0, 1], [-1300, 0]);
  const landed = frame > 22;

  const haloProgress = spring({
    frame: frame - 22,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const haloScale = interpolate(haloProgress, [0, 1], [0.3, 2.6]);
  const haloOpacity = interpolate(haloProgress, [0, 0.4, 1], [0.8, 0.4, 0]);

  const landBounce = spring({
    frame: frame - 22,
    fps,
    config: { damping: 7, stiffness: 200 },
  });
  const squash = landed ? interpolate(landBounce, [0, 0.3, 1], [1.15, 0.92, 1]) : 1;

  const meetIn = spring({ frame: frame - 30, fps, config: { damping: 16 } });
  const maxIn = spring({ frame: frame - 38, fps, config: { damping: 14, stiffness: 160 } });

  const exit = interpolate(frame, [dur - 8, dur], [1, 0]);
  const scaleOut = interpolate(frame, [dur - 8, dur], [1, 0.92]);

  // Max waves starting at frame 32 (after landing)
  const waveStartFrame = 32;
  const pose: "idle" | "wave" = frame >= waveStartFrame ? "wave" : "idle";

  return (
    <AbsoluteFill style={{ opacity: exit, transform: `scale(${scaleOut})` }}>
      <FloatingFormulas count={18} baseOpacity={0.09} />
      <SparkleField count={28} color={ACCENT_2} />

      {landed && <OrbitingSubjects centerX={540} centerY={760} radius={400} startFrame={26} />}

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 280,
        }}
      >
        {landed && (
          <div
            style={{
              position: "absolute",
              top: 760,
              left: "50%",
              width: 600,
              height: 600,
              marginLeft: -300,
              marginTop: -300,
              borderRadius: "50%",
              border: `6px solid ${ACCENT_2}`,
              transform: `scale(${haloScale})`,
              opacity: haloOpacity,
              boxShadow: `0 0 80px ${ACCENT_2}`,
            }}
          />
        )}

        {/* Max — full body, drops in then waves */}
        <div
          style={{
            transform: `translateY(${robotY}px) scaleY(${squash}) scaleX(${1 / Math.sqrt(squash)})`,
          }}
        >
          <MaxFullBody size={400} pose={pose} waveStartFrame={waveStartFrame} />
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: MUTED,
            letterSpacing: -1,
            opacity: meetIn,
            transform: `translateY(${(1 - meetIn) * 30}px)`,
            marginTop: 30,
          }}
        >
          Meet
        </div>
        <div
          style={{
            fontSize: 150,
            fontWeight: 900,
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_2} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -6,
            lineHeight: 1,
            opacity: maxIn,
            transform: `translateY(${(1 - maxIn) * 30}px) scale(${0.85 + maxIn * 0.15})`,
            filter: `drop-shadow(0 0 30px ${ACCENT}66)`,
          }}
        >
          Max.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =========================================================
// Scene 3 — SHOWCASE (Max as presenter pointing at the grid)
// =========================================================
const SceneShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = S3_END - S2_END;

  const titleIn = spring({ frame, fps, config: { damping: 16 } });
  const subtitleIn = spring({ frame: frame - 8, fps, config: { damping: 16 } });
  const maxIn = spring({ frame: frame - 14, fps, config: { damping: 14, stiffness: 120 } });
  const gridIn = spring({ frame: frame - 22, fps, config: { damping: 16 } });

  const exit = interpolate(frame, [dur - 8, dur], [1, 0]);
  const gridExitY = interpolate(frame, [dur - 14, dur], [0, -150]);

  return (
    <AbsoluteFill style={{ opacity: exit }}>
      <FloatingFormulas count={16} baseOpacity={0.08} />

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 80,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 82,
            fontWeight: 900,
            color: TEXT,
            letterSpacing: -3,
            textAlign: "center",
            lineHeight: 1.0,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 30}px)`,
          }}
        >
          Any subject.
        </div>
        <div
          style={{
            fontSize: 82,
            fontWeight: 900,
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_2} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -3,
            textAlign: "center",
            lineHeight: 1.0,
            marginBottom: 20,
            opacity: subtitleIn,
            transform: `translateY(${(1 - subtitleIn) * 30}px)`,
            filter: `drop-shadow(0 0 25px ${ACCENT}55)`,
          }}
        >
          Instant help.
        </div>

        {/* Max as presenter — small, on the left, pointing toward the grid */}
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 360,
            transform: `scale(${maxIn}) translateY(${(1 - maxIn) * 40}px)`,
            opacity: maxIn,
            zIndex: 2,
          }}
        >
          <MaxFullBody size={220} pose="point-right" />
        </div>

        {/* 2×2 showcase grid */}
        <div
          style={{
            transform: `translateY(${gridExitY}px) scale(${0.85 + gridIn * 0.15})`,
            opacity: gridIn,
            marginTop: 60,
          }}
        >
          <SubjectShowcase />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =========================================================
// Scene 4 — GAMIFIED (Max celebrating, XP + level up)
// =========================================================
const SceneGame: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = S4_END - S3_END;

  const titleIn = spring({ frame, fps, config: { damping: 16 } });
  const maxIn = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 130 } });

  const barProgress = interpolate(frame, [10, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const xpNum = Math.round(barProgress * 1250);

  const levelUpAt = 44;
  const levelUpScale = spring({
    frame: frame - levelUpAt,
    fps,
    config: { damping: 9, stiffness: 220 },
  });
  const showLevelUp = frame >= levelUpAt;

  // Camera shake on level-up
  const shakeIntensity = Math.max(0, 1 - (frame - levelUpAt) / 12);
  const shakeX = shakeIntensity > 0 ? Math.sin(frame * 2.3) * 6 * shakeIntensity : 0;
  const shakeY = shakeIntensity > 0 ? Math.cos(frame * 2.7) * 4 * shakeIntensity : 0;

  const streakIn = spring({ frame: frame - 14, fps, config: { damping: 16 } });
  const streakCount = Math.min(7, Math.max(1, Math.floor((frame - 14) / 3)));

  const exit = interpolate(frame, [dur - 8, dur], [1, 0]);

  // Max bounces a little on level-up
  const celebrateBounce = showLevelUp
    ? Math.sin((frame - levelUpAt) / 3) * 14 * Math.max(0, 1 - (frame - levelUpAt) / 20)
    : 0;

  return (
    <AbsoluteFill style={{ opacity: exit, transform: `translate(${shakeX}px, ${shakeY}px)` }}>
      <SparkleField count={20} color={ACCENT} />

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "100px 80px 0 80px",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            color: TEXT,
            letterSpacing: -3,
            textAlign: "center",
            lineHeight: 1.0,
            marginBottom: 6,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 30}px)`,
          }}
        >
          Learn by
        </div>
        <div
          style={{
            fontSize: 104,
            fontWeight: 900,
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_2} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -3,
            textAlign: "center",
            lineHeight: 1.0,
            marginBottom: 24,
            opacity: titleIn,
            filter: `drop-shadow(0 0 30px ${ACCENT}66)`,
          }}
        >
          playing.
        </div>

        {/* Max celebrating */}
        <div
          style={{
            transform: `scale(${maxIn}) translateY(${(1 - maxIn) * 40 + celebrateBounce}px)`,
            opacity: maxIn,
            marginBottom: -10,
          }}
        >
          <MaxFullBody size={280} pose="celebrate" />
        </div>

        {/* Streak chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "rgba(255,255,255,0.08)",
            border: "2px solid rgba(251,191,36,0.4)",
            borderRadius: 999,
            padding: "12px 26px",
            marginTop: 20,
            opacity: streakIn,
            transform: `translateY(${(1 - streakIn) * 30}px)`,
          }}
        >
          <span style={{ fontSize: 40 }}>🔥</span>
          <span style={{ color: TEXT, fontSize: 42, fontWeight: 900 }}>
            {streakCount}
          </span>
          <span style={{ color: MUTED, fontSize: 28, fontWeight: 600 }}>
            day streak
          </span>
        </div>

        {/* XP bar */}
        <div
          style={{
            width: 760,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 999,
            height: 52,
            padding: 7,
            marginTop: 24,
            position: "relative",
            border: "2px solid rgba(167,139,250,0.3)",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              width: `${barProgress * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
              borderRadius: 999,
              boxShadow: `0 0 40px ${ACCENT_2}cc`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 100,
                left: `${(frame * 4) % 900}px`,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              }}
            />
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            color: TEXT,
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          +{xpNum} XP
        </div>

        {showLevelUp && (
          <div
            style={{
              marginTop: 22,
              padding: "18px 50px",
              borderRadius: 999,
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
              color: TEXT,
              fontSize: 50,
              fontWeight: 900,
              letterSpacing: 2,
              transform: `scale(${levelUpScale})`,
              boxShadow: `0 30px 80px ${ACCENT_2}aa, 0 0 60px ${ACCENT}88`,
            }}
          >
            🎉 LEVEL UP!
          </div>
        )}
      </AbsoluteFill>

      <Confetti burstFrame={levelUpAt} count={70} originX={540} originY={1100} />
      <Confetti burstFrame={levelUpAt + 8} count={40} originX={540} originY={700} />
    </AbsoluteFill>
  );
};

// =========================================================
// Scene 5 — CTA (App icon, no Max)
// =========================================================
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconIn = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const logoIn = spring({ frame: frame - 14, fps, config: { damping: 16 } });
  const soonIn = spring({ frame: frame - 28, fps, config: { damping: 18 } });

  const shimmer = interpolate(frame, [14, 64], [-100, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const zoom = interpolate(frame, [0, 120], [0.92, 1.02]);

  const breathe = 1 + 0.02 * Math.sin(frame / 10);

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <FloatingFormulas count={14} baseOpacity={0.06} />
      <SparkleField count={50} color={ACCENT_2} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 80,
          paddingBottom: 320,
        }}
      >
        {/* App icon — rounded gradient square with Max's face inside */}
        <div
          style={{
            transform: `scale(${iconIn})`,
            marginBottom: 50,
            opacity: iconIn,
          }}
        >
          <AppIcon size={320} />
        </div>

        <div
          style={{
            position: "relative",
            display: "inline-block",
            opacity: logoIn,
            transform: `translateY(${(1 - logoIn) * 40}px)`,
          }}
        >
          <div
            style={{
              fontSize: 116,
              fontWeight: 900,
              letterSpacing: -4,
              lineHeight: 1.0,
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_2} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: `drop-shadow(0 0 40px ${ACCENT}77)`,
            }}
          >
            Huiswerk-
            <br />
            Helper
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)`,
              transform: `translateX(${shimmer}%)`,
              mixBlendMode: "overlay",
              pointerEvents: "none",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 32,
            padding: "18px 50px",
            borderRadius: 999,
            border: `3px solid ${ACCENT_2}`,
            background: "rgba(244,114,182,0.1)",
            backdropFilter: "blur(8px)",
            fontSize: 56,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: soonIn,
            transform: `translateY(${(1 - soonIn) * 30}px) scale(${(0.9 + soonIn * 0.1) * breathe})`,
            boxShadow: `0 0 60px ${ACCENT_2}66`,
          }}
        >
          Coming soon
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FlashTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 3, 10], [0, 0.55, 0]);
  return (
    <AbsoluteFill
      style={{
        background: "#ffffff",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};
