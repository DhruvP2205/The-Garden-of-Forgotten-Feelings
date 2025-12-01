import React from "react";
import { getEmotionPalette, formatTimestamp } from "./memoryStorage";

export default function MemorySeed({ memory, isHovered, isRecent, age }) {
  const palette = getEmotionPalette(memory.emotion.primary);
  const ageInMinutes = age / 60000;

  // Size grows with age, but caps at a maximum
  const baseSize = isRecent ? 8 : Math.min(20, 8 + ageInMinutes * 0.5);
  const size = isHovered ? baseSize * 1.4 : baseSize;

  // Opacity fades slightly with age
  const opacity = Math.max(0.4, 1 - ageInMinutes / 1000);

  // Different shapes based on emotion
  const shapes = {
    calm: "rounded-full",
    anger: "rounded-sm rotate-45",
    nostalgia: "rounded-3xl",
    joy: "rounded-full",
    confusion: "rounded-lg rotate-12",
    loneliness: "rounded-full",
  };

  return (
    <div className="relative group cursor-pointer">
      {/* Glow effect */}
      <div
        className={`absolute inset-0 ${
          shapes[memory.emotion.primary] || "rounded-full"
        } 
                    blur-xl transition-all duration-700`}
        style={{
          width: `${size * 2}px`,
          height: `${size * 2}px`,
          backgroundColor: palette.primary,
          opacity: isHovered ? 0.6 : 0.3,
          transform: "translate(-50%, -50%)",
          animation: isRecent
            ? "pulse 2s infinite"
            : "float 6s infinite ease-in-out",
        }}
      />

      {/* Core seed */}
      <div
        className={`relative ${
          shapes[memory.emotion.primary] || "rounded-full"
        } 
                    transition-all duration-500 border-2`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: palette.primary,
          borderColor: palette.accent,
          opacity: opacity,
          boxShadow: isHovered
            ? `0 0 30px ${palette.primary}`
            : `0 0 10px ${palette.primary}`,
          animation: isRecent ? "grow 1s ease-out" : "none",
        }}
      />

      {/* Inner sparkle */}
      {isRecent && (
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            backgroundColor: palette.accent,
            opacity: 0.4,
          }}
        />
      )}

      {/* Tooltip on hover */}
      {isHovered && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-4 
                     px-4 py-3 bg-black/80 backdrop-blur-xl border border-white/20 
                     rounded-2xl whitespace-nowrap pointer-events-none z-50
                     animate-fadeIn"
          style={{ minWidth: "200px" }}
        >
          <p className="text-white/90 text-xs mb-1 font-light tracking-wide">
            {memory.emotion.primary} • {formatTimestamp(memory.timestamp)}
          </p>
          <p className="text-white/60 text-xs italic leading-relaxed">
            "{memory.reflection}"
          </p>
          <p className="text-white/40 text-xs mt-2 truncate max-w-xs">
            {memory.text}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.5;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-10px);
          }
        }

        @keyframes grow {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: ${opacity};
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
