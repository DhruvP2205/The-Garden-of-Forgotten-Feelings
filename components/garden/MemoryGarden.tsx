import React, { useEffect, useState } from "react";
import { getMemoryAge, getEmotionPalette } from "./memoryStorage";
import { Flower } from "lucide-react";

export default function MemoryGarden({
  memories,
  onMemoryClick,
  currentEmotion,
  sceneRef,
}) {
  const [hoveredMemory, setHoveredMemory] = useState(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    // Generate organic positions for memory flowers
    const newPositions = memories.map((_, index) => {
      const angle = (index / Math.max(memories.length, 1)) * Math.PI * 2;
      const radius = 15 + Math.random() * 20;
      const x = 50 + Math.cos(angle) * radius + (Math.random() - 0.5) * 8;
      const y = 50 + Math.sin(angle) * radius + (Math.random() - 0.5) * 8;

      return { x, y };
    });
    setPositions(newPositions);

    // Create 3D flowers in the scene for memories
    if (sceneRef?.current?.createFlower) {
      memories.forEach((memory, index) => {
        const pos = newPositions[index];
        if (pos && memory.userData?.flower3DCreated !== true) {
          const worldX = (pos.x - 50) * 0.3;
          const worldZ = (pos.y - 50) * 0.3;
          const palette = getEmotionPalette(memory.emotion.primary);

          sceneRef.current.createFlower(
            worldX,
            worldZ,
            parseInt(palette.primary.replace("#", "0x")),
            memory.emotion.primary
          );
          memory.userData = { ...memory.userData, flower3DCreated: true };
        }
      });
    }
  }, [memories.length, sceneRef]);

  if (memories.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {memories.map((memory, index) => {
        if (!positions[index]) return null;

        const age = getMemoryAge(memory);
        const isRecent = age < 60000;
        const palette = getEmotionPalette(memory.emotion.primary);

        return (
          <div
            key={memory.id}
            className="absolute pointer-events-auto cursor-pointer group"
            style={{
              left: `${positions[index].x}%`,
              top: `${positions[index].y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => setHoveredMemory(memory.id)}
            onMouseLeave={() => setHoveredMemory(null)}
            onClick={() => onMemoryClick(memory)}
          >
            {/* Flower icon representing memory */}
            <div className="relative">
              <div
                className="absolute inset-0 blur-xl transition-all duration-500"
                style={{
                  backgroundColor: palette.primary,
                  opacity: hoveredMemory === memory.id ? 0.6 : 0.3,
                  transform: `scale(${hoveredMemory === memory.id ? 2.5 : 2})`,
                }}
              />
              <Flower
                className="relative transition-all duration-500"
                style={{
                  color: palette.primary,
                  width: hoveredMemory === memory.id ? "32px" : "24px",
                  height: hoveredMemory === memory.id ? "32px" : "24px",
                  filter: `drop-shadow(0 0 8px ${palette.primary})`,
                  animation: isRecent
                    ? "float 2s ease-in-out infinite"
                    : "none",
                }}
              />
            </div>

            {/* Tooltip */}
            {hoveredMemory === memory.id && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 px-4 py-3 
                           bg-white/95 backdrop-blur-sm border-2 rounded-2xl shadow-2xl
                           whitespace-nowrap pointer-events-none z-50 animate-fadeIn"
                style={{
                  borderColor: palette.primary,
                  minWidth: "220px",
                  maxWidth: "300px",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Flower
                    style={{ color: palette.primary }}
                    className="w-4 h-4"
                  />
                  <p className="text-gray-800 text-sm font-semibold capitalize">
                    {memory.emotion.primary} Memory
                  </p>
                </div>
                <p className="text-gray-600 text-xs italic leading-relaxed mb-2">
                  "{memory.reflection}"
                </p>
                <p className="text-gray-500 text-xs truncate">{memory.text}</p>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
