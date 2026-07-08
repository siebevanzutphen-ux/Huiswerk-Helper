import { useCurrentFrame, random } from "remotion";

// Deterministic-random particles (Remotion `random()` is seeded → always identical render)

export const SparkleField: React.FC<{ count?: number; color?: string }> = ({
  count = 40,
  color = "#a78bfa",
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`spx-${i}`) * 1080;
        const y0 = random(`spy-${i}`) * 1920;
        const drift = Math.sin((frame + i * 7) / 30) * 30;
        const driftX = Math.cos((frame + i * 11) / 40) * 15;
        const size = 4 + random(`spsz-${i}`) * 10;
        const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin((frame + i * 9) / 12));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + driftX,
              top: y0 + drift,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: pulse * 0.6,
              boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};

// Confetti — burst that explodes outward, gravity pulls them down
export const Confetti: React.FC<{
  burstFrame: number;
  originX?: number;
  originY?: number;
  count?: number;
}> = ({ burstFrame, originX = 540, originY = 960, count = 50 }) => {
  const frame = useCurrentFrame();
  const t = (frame - burstFrame) / 30; // seconds since burst
  if (t < 0) return null;
  const colors = ["#a78bfa", "#f472b6", "#ffffff", "#fbbf24", "#34d399"];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = random(`cf-a-${i}`) * Math.PI * 2;
        const speed = 600 + random(`cf-s-${i}`) * 800;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 200;
        const g = 1200;
        const x = originX + vx * t;
        const y = originY + vy * t + 0.5 * g * t * t;
        const rot = random(`cf-r-${i}`) * 360 + t * 720;
        const color = colors[Math.floor(random(`cf-c-${i}`) * colors.length)];
        const w = 8 + random(`cf-w-${i}`) * 12;
        const h = 14 + random(`cf-h-${i}`) * 14;
        const opacity = Math.max(0, 1 - t * 0.5);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              background: color,
              transform: `rotate(${rot}deg)`,
              opacity,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
};

// Soft glowing orb backdrop — drifts slowly behind everything
export const GlowOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 200, y: 400, color: "#a78bfa", size: 600 },
    { x: 900, y: 1200, color: "#f472b6", size: 700 },
    { x: 500, y: 1700, color: "#a78bfa", size: 500 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {orbs.map((o, i) => {
        const dx = Math.sin((frame + i * 50) / 70) * 60;
        const dy = Math.cos((frame + i * 30) / 90) * 40;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: o.x + dx - o.size / 2,
              top: o.y + dy - o.size / 2,
              width: o.size,
              height: o.size,
              background: `radial-gradient(circle, ${o.color}33 0%, transparent 60%)`,
              filter: "blur(40px)",
            }}
          />
        );
      })}
    </div>
  );
};

// Floating question marks (used in scene 1)
export const QuestionFloat: React.FC<{
  exitFrame?: number;
}> = ({ exitFrame = 60 }) => {
  const frame = useCurrentFrame();
  const exitT = Math.max(0, (frame - exitFrame) / 20);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const x = random(`q-${i}`) * 1080;
        const y0 = random(`qy-${i}`) * 1920;
        const drift = Math.sin((frame + i * 14) / 22) * 20;
        const angle = random(`qa-${i}`) * 360;
        const size = 60 + random(`qsz-${i}`) * 70;
        // Scatter on exit — fly outward
        const cx = 540, cy = 960;
        const dirX = (x - cx) || 1;
        const dirY = (y0 - cy) || 1;
        const mag = Math.sqrt(dirX * dirX + dirY * dirY);
        const scatterX = (dirX / mag) * 800 * exitT;
        const scatterY = (dirY / mag) * 800 * exitT;
        const opacity = 0.08 * Math.max(0, 1 - exitT * 1.5);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + scatterX,
              top: y0 + drift + scatterY,
              fontSize: size,
              fontWeight: 900,
              color: "#ffffff",
              opacity,
              transform: `rotate(${angle + exitT * 360}deg)`,
              fontFamily: "Inter, sans-serif",
            }}
          >
            ?
          </div>
        );
      })}
    </div>
  );
};
