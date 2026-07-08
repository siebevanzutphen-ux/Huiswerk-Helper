import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type MaxPose = "idle" | "wave" | "point-right" | "point-left" | "confused" | "celebrate";

// Max — ported EXACTLY from index.html's #i-robot-teacher symbol.
// Silver/grey robot teacher with pink bow tie, yellow antenna,
// purple eye pupils, holding a brown wooden pointer with a yellow tip.
//
// `size` = height in px. Width auto-derives from the 140:220 viewBox ratio.

export const MaxFullBody: React.FC<{
  size?: number;
  pose?: MaxPose;
  waveStartFrame?: number;
}> = ({ size = 500, pose = "idle", waveStartFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Blink every ~90 frames
  const blinkCycle = frame % 90;
  const blinking = blinkCycle > 0 && blinkCycle < 6;
  const eyeScale = blinking ? 0.12 : 1;

  // Gentle teacherSway-style body rotation
  const bodySway = Math.sin(frame / 16) * 1.6;

  // Idle pointer-arm sway (matches the .teaching teacherPoint animation)
  const idleArmSway = Math.sin(frame / 19) * 5;

  // ---- Right arm (with pointer — main animated arm) ----
  let armRotation = idleArmSway;
  // ---- Left arm (resting, screen-right) ----
  let leftArmRotation = 0;

  if (pose === "wave") {
    // Wave the pointer enthusiastically — wide swing around rest
    const waveT = Math.max(0, frame - waveStartFrame);
    const raise = spring({ frame: waveT, fps, config: { damping: 14, stiffness: 110 } });
    const swing = Math.sin(waveT / 4.5) * 32;
    armRotation = interpolate(raise, [0, 1], [idleArmSway, -20 + swing]);
  } else if (pose === "point-right") {
    // Pointer naturally angles up-left — swing further to emphasise pointing
    armRotation = -8 + Math.sin(frame / 16) * 5;
  } else if (pose === "point-left") {
    armRotation = -8 + Math.sin(frame / 16) * 5;
  } else if (pose === "celebrate") {
    // Both arms thrown up. Big rotations flip them above shoulders.
    const wiggle = Math.sin(frame / 8) * 8;
    armRotation = 165 + wiggle;
    leftArmRotation = -165 - wiggle;
  } else if (pose === "confused") {
    // Both arms in shrug pose
    const shrug = Math.sin(frame / 22) * 4;
    armRotation = -45 + shrug;
    leftArmRotation = 45 - shrug;
  }

  // ---- Head tilt for confused ----
  const headTilt = pose === "confused" ? Math.sin(frame / 25) * 5 : 0;

  // ---- Antenna ball pulse ----
  const antennaPulse = 4 + Math.sin(frame / 8) * 0.8;

  const width = size * (140 / 220);
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 140 220"
      style={{
        overflow: "visible",
        transform: `rotate(${bodySway}deg)`,
        transformOrigin: "70px 200px",
        filter: "drop-shadow(0 16px 24px rgba(0,0,0,0.4))",
      }}
    >
      {/* Soft ground shadow */}
      <ellipse cx="62" cy="210" rx="44" ry="7" fill="rgba(0,0,0,0.28)" />

      {/* Legs */}
      <rect x="45" y="158" width="13" height="38" rx="6" fill="#94a3b8" />
      <rect x="66" y="158" width="13" height="38" rx="6" fill="#94a3b8" />
      {/* Feet */}
      <rect x="40" y="192" width="22" height="11" rx="5" fill="#cbd5e1" />
      <rect x="62" y="192" width="22" height="11" rx="5" fill="#cbd5e1" />

      {/* Body / torso */}
      <rect x="34" y="96" width="56" height="68" rx="18" fill="#e2e8f0" />

      {/* Pink bow tie */}
      <path d="M62 100 l-7 9 7 6 7-6 z" fill="#f472b6" />
      <circle cx="62" cy="100" r="3" fill="#a78bfa" />

      {/* Chest button lights */}
      <circle cx="62" cy="128" r="3.4" fill="#a78bfa" />
      <circle cx="62" cy="140" r="2.6" fill="#cbd5e1" />

      {/* LEFT arm (Max's left, on the viewer's RIGHT) — resting */}
      <g transform={`rotate(${leftArmRotation} 90 110)`}>
        <rect x="84" y="104" width="12" height="40" rx="6" fill="#cbd5e1" />
        <circle cx="90" cy="146" r="6.5" fill="#e2e8f0" />
      </g>

      {/* RIGHT arm (Max's right, viewer's LEFT) — holds the wooden pointer */}
      <g transform={`rotate(${armRotation} 34 110)`}>
        <rect x="28" y="104" width="12" height="38" rx="6" fill="#cbd5e1" />
        <circle cx="34" cy="142" r="6.5" fill="#e2e8f0" />
        {/* Pointer stick */}
        <line
          x1="34"
          y1="142"
          x2="4"
          y2="86"
          stroke="#b45309"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* Yellow tip */}
        <circle cx="4" cy="86" r="4" fill="#facc15" stroke="#b45309" strokeWidth="1.4" />
      </g>

      {/* Head group (with optional tilt) */}
      <g transform={`rotate(${headTilt} 62 50)`}>
        {/* Antenna line */}
        <line x1="62" y1="16" x2="62" y2="26" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        {/* Antenna glow */}
        <circle cx="62" cy="13" r={antennaPulse * 1.8} fill="#facc15" opacity="0.3" />
        {/* Antenna ball */}
        <circle cx="62" cy="13" r={antennaPulse} fill="#facc15" />

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
        {/* Friendly eyes (white outer + purple pupils, blinking) */}
        <ellipse cx="52" cy="48" rx="4.5" ry={4.5 * eyeScale} fill="#fff" />
        <ellipse cx="72" cy="48" rx="4.5" ry={4.5 * eyeScale} fill="#fff" />
        <ellipse cx="52" cy="48" rx="2" ry={2 * eyeScale} fill="#a78bfa" />
        <ellipse cx="72" cy="48" rx="2" ry={2 * eyeScale} fill="#a78bfa" />
        {/* Smiling mouth */}
        <path
          d="M54 66 q8 6 16 0"
          stroke="#94a3b8"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
