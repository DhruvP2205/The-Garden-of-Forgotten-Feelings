import React, { useState } from "react";
import { Droplets, Scissors, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GardenTools({ onWater, onPrune, onChase, cooldowns }) {
  const [selectedTool, setSelectedTool] = useState(null);

  const tools = [
    {
      id: "water",
      icon: Droplets,
      label: "Water",
      color: "from-blue-400 to-cyan-500",
      description: "Nurture dry plants",
      action: onWater,
      cooldown: cooldowns.water,
    },
    {
      id: "prune",
      icon: Scissors,
      label: "Prune",
      color: "from-green-400 to-emerald-500",
      description: "Trim overgrowth",
      action: onPrune,
      cooldown: cooldowns.prune,
    },
    {
      id: "chase",
      icon: Wind,
      label: "Chase",
      color: "from-purple-400 to-pink-500",
      description: "Clear wilted flowers",
      action: onChase,
      cooldown: cooldowns.chase,
    },
  ];

  const handleToolClick = (tool) => {
    if (tool.cooldown > 0) return;

    setSelectedTool(tool.id);
    tool.action();

    setTimeout(() => setSelectedTool(null), 300);
  };

  return (
    <div className="fixed left-1/2 bottom-32 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-3 shadow-2xl">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = selectedTool === tool.id;
        const isOnCooldown = tool.cooldown > 0;

        return (
          <div key={tool.id} className="relative group">
            <Button
              onClick={() => handleToolClick(tool)}
              disabled={isOnCooldown}
              className={`relative overflow-hidden p-4 rounded-xl transition-all duration-300 border-2 ${
                isOnCooldown
                  ? "bg-gray-400/20 border-gray-500/30 cursor-not-allowed opacity-50"
                  : `bg-gradient-to-br ${
                      tool.color
                    } border-white/40 hover:scale-110 hover:shadow-2xl ${
                      isActive ? "scale-95" : ""
                    }`
              }`}
            >
              <Icon
                className={`w-6 h-6 text-white ${
                  isActive ? "animate-pulse" : ""
                }`}
              />

              {/* Cooldown overlay */}
              {isOnCooldown && (
                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center"
                  style={{
                    clipPath: `inset(${
                      100 - (tool.cooldown / 10) * 100
                    }% 0 0 0)`,
                  }}
                >
                  <span className="text-white text-xs font-bold">
                    {Math.ceil(tool.cooldown)}
                  </span>
                </div>
              )}
            </Button>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-black/80 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                <p className="font-semibold">{tool.label}</p>
                <p className="text-white/70">{tool.description}</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Info text */}
      <div className="ml-2 text-white/80 text-xs max-w-[120px]">
        <p className="leading-tight">Interact with the garden</p>
      </div>
    </div>
  );
}
