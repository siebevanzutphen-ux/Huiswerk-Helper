import { useCurrentFrame, interpolate } from "remotion";

// Max the AI tutor mascot — friendly robot head
// Purple→pink gradient body, glowing white eyes that occasionally blink.
export const MaxRobot: React.FC<{ size?: number }> = ({ size = 320 }) => {
  const frame = useCurrentFrame();

  // Blink every ~90 frames (3s at 30fps), lasting ~6 frames
  const blinkCycle = frame % 90;
  const blinking = blinkCycle > 0 && blinkCycle < 6;
  const eyeScaleY = blinking ? 0.1 : 1;

  // Subtle floating motion
  const float = Math.sin(frame / 18) * 6;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ transform: `translateY(${float}px)`, overflow: "visible" }}
    >
      <defs>
        <linearGradient id="maxBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <radialGradient id="maxGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
        </radialGradient>
        <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Soft glow halo behind the head */}
      <circle cx="100" cy="100" r="95" fill="url(#maxGlow)" />

      {/* Antenna */}
      <line x1="100" y1="38" x2="100" y2="20" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="16" r="6" fill="#f472b6">
        <animate attributeName="r" values="5;7;5" dur="1.4s" repeatCount="indefinite" />
      </circle>

      {/* Head — rounded square */}
      <rect x="36" y="40" width="128" height="120" rx="32" ry="32" fill="url(#maxBody)" />

      {/* Inner darker face panel */}
      <rect x="50" y="58" width="100" height="74" rx="20" ry="20" fill="#0d0d1a" />

      {/* Eyes — glowing white */}
      <g filter="url(#eyeGlow)">
        <ellipse cx="78" cy="95" rx="10" ry={10 * eyeScaleY} fill="#ffffff" />
        <ellipse cx="122" cy="95" rx="10" ry={10 * eyeScaleY} fill="#ffffff" />
      </g>
      <ellipse cx="78" cy="95" rx="10" ry={10 * eyeScaleY} fill="#ffffff" />
      <ellipse cx="122" cy="95" rx="10" ry={10 * eyeScaleY} fill="#ffffff" />

      {/* Smile */}
      <path
        d="M 78 118 Q 100 132 122 118"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Ears / side dots */}
      <circle cx="30" cy="100" r="6" fill="#a78bfa" />
      <circle cx="170" cy="100" r="6" fill="#f472b6" />
    </svg>
  );
};
