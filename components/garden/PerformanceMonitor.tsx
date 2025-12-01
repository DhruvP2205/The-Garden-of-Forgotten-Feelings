import React, { useState, useEffect } from "react";
import { Activity } from "lucide-react";

export default function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    measureFPS();
  }, []);

  const getPerformanceColor = () => {
    if (fps >= 50) return "text-green-400";
    if (fps >= 30) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="fixed top-20 right-6 z-50">
      <button
        onClick={() => setShow(!show)}
        className="bg-black/40 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-2 text-white/80 hover:bg-black/50 transition-all flex items-center gap-2"
      >
        <Activity className="w-4 h-4" />
        {show && (
          <span className={`font-mono text-sm ${getPerformanceColor()}`}>
            {fps} FPS
          </span>
        )}
      </button>
    </div>
  );
}
