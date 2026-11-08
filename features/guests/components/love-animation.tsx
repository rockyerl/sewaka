"use client";

import { useMemo } from "react";
import { Heart } from "lucide-react";

interface LoveAnimationProps {
  enabled: boolean;
}

// Seeded random for stable renders
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function LoveAnimation({ enabled }: LoveAnimationProps) {
  // Generate hearts with seeded random for stable renders
  const hearts = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${seededRandom(i * 7 + 1) * 100}%`,
        delay: `${seededRandom(i * 13 + 2) * 8}s`,
        duration: `${6 + seededRandom(i * 17 + 3) * 6}s`,
        size: 12 + seededRandom(i * 19 + 4) * 16,
        opacity: 0.15 + seededRandom(i * 23 + 5) * 0.25,
      })),
    [],
  );

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-40">
      <style>{`
        @keyframes float-heart {
          0% {
            transform: translateY(100vh) rotate(0deg) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: var(--heart-opacity, 0.3);
          }
          90% {
            opacity: var(--heart-opacity, 0.3);
          }
          100% {
            transform: translateY(-100px) rotate(360deg) scale(1);
            opacity: 0;
          }
        }
      `}</style>
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-float-heart"
          style={{
            left: heart.left,
            bottom: "-20px",
            animationDelay: heart.delay,
            animationDuration: heart.duration,
            animationIterationCount: "infinite",
            animationName: "float-heart",
            ['--heart-opacity' as string]: heart.opacity,
          }}
        >
          <Heart
            className="text-[#D4AF37] fill-[#D4AF37]"
            width={heart.size}
            height={heart.size}
            style={{ opacity: heart.opacity }}
          />
        </div>
      ))}
    </div>
  );
}
