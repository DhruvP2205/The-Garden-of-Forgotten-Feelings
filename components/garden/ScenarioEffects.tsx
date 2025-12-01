import React, { useEffect, useState } from "react";

export default function ScenarioEffects({ scenario, intensity }) {
  const [glitchActive, setGlitchActive] = useState(false);
  const [stormFlash, setStormFlash] = useState(0);
  const [bloomGlow, setBloomGlow] = useState(0);

  useEffect(() => {
    // Dream distortion random trigger
    if (scenario === "dream_distortion") {
      const interval = setInterval(() => {
        if (Math.random() < 0.3) {
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), 2000);
        }
      }, 8000);
      return () => clearInterval(interval);
    }

    // Emotional storm flashing
    if (scenario === "emotional_storm") {
      const flashInterval = setInterval(() => {
        setStormFlash(Math.random());
      }, 150);
      return () => clearInterval(flashInterval);
    }

    // Serene bloom pulsing
    if (scenario === "serene_bloom") {
      const glowInterval = setInterval(() => {
        setBloomGlow(Math.sin(Date.now() * 0.003) * 0.5 + 0.5);
      }, 50);
      return () => clearInterval(glowInterval);
    }
  }, [scenario]);

  // First visit overlay
  if (scenario === "first_visit") {
    return (
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 animate-fadeIn">
            <p
              className="text-white/90 text-2xl font-light tracking-wide mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Tell me something you feel.
            </p>
            <div className="w-16 h-1 bg-white/30 mx-auto mt-4 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Overgrown state
  if (scenario === "overgrown") {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 via-transparent to-transparent" />
        {/* Vines overlay effect */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <path
              key={i}
              d={`M ${Math.random() * 100} 0 Q ${Math.random() * 100} ${
                50 + Math.random() * 50
              } ${Math.random() * 100} 100`}
              stroke="green"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </svg>
      </div>
    );
  }

  // Silence/inactive state
  if (scenario === "silence") {
    return (
      <div className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-2000">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>
    );
  }

  // Emotional shift (sudden change)
  if (scenario === "emotional_shift") {
    return (
      <div className="absolute inset-0 pointer-events-none z-15">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-yellow-500/20 animate-pulse" />
      </div>
    );
  }

  // Overloaded emotion (chaos)
  if (scenario === "overloaded") {
    return (
      <div className="absolute inset-0 pointer-events-none z-15">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-red-500/10 to-transparent animate-pulse" />
          <div
            className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-b from-blue-500/10 to-transparent animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          <div
            className="absolute top-2/3 left-0 w-full h-1/3 bg-gradient-to-b from-purple-500/10 to-transparent animate-pulse"
            style={{ animationDelay: "0.6s" }}
          />
        </div>
      </div>
    );
  }

  // Dream distortion
  if (scenario === "dream_distortion" && glitchActive) {
    return (
      <div className="absolute inset-0 pointer-events-none z-25">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 animate-glitch" />
        <div className="absolute inset-0 backdrop-blur-sm opacity-50" />
        {/* Ghost plants effect */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-white/50 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Emotional Storm
  if (scenario === "emotional_storm") {
    return (
      <div className="absolute inset-0 pointer-events-none z-15">
        <div
          className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-orange-900/30 to-yellow-900/40"
          style={{ opacity: 0.3 + stormFlash * 0.4 }}
        />
        <div
          className="absolute inset-0 bg-black/20"
          style={{ opacity: stormFlash * 0.5 }}
        />
        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-gradient-to-b from-red-500 via-orange-500 to-transparent"
              style={{
                left: `${i * 8.33 + Math.random() * 5}%`,
                top: "0",
                height: "100%",
                opacity: Math.random() * stormFlash * 0.6,
                transform: `translateY(-${100 - i * 8}%)`,
                animation: `slideDown ${1 + i * 0.1}s ease-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 to-transparent animate-pulse" />
      </div>
    );
  }

  // Serene Bloom
  if (scenario === "serene_bloom") {
    return (
      <div className="absolute inset-0 pointer-events-none z-15">
        <div
          className="absolute inset-0 bg-gradient-to-t from-pink-200/30 via-purple-200/20 to-yellow-200/30"
          style={{ opacity: 0.4 + bloomGlow * 0.3 }}
        />
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${i * 5 + Math.random() * 3}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 40 + 20}px`,
                background: `radial-gradient(circle, hsla(${
                  Math.random() * 60 + 300
                }, 80%, 70%, ${bloomGlow * 0.4}), transparent)`,
                animation: `float ${
                  Math.random() * 4 + 3
                }s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 via-transparent to-pink-300/20 animate-pulse"
          style={{ opacity: bloomGlow * 0.6 }}
        />
      </div>
    );
  }

  return null;
}
