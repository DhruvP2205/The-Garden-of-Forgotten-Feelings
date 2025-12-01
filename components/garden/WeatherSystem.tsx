import React, { useEffect, useRef } from "react";

export default function WeatherSystem({
  weather,
  intensity,
  windIntensity,
  specialEvent,
}) {
  const canvasRef = useRef(null);
  const dropsRef = useRef([]);
  const particlesRef = useRef([]);
  const windLinesRef = useRef([]);
  const meteorsRef = useRef([]);
  const snowflakesRef = useRef([]);
  const bloomingFogRef = useRef([]);
  const emotionalStormRef = useRef([]);
  const sereneBloomRef = useRef([]);
  const frameCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize raindrops (optimized counts)
    dropsRef.current = [];
    if (weather === "storm" || weather === "rainy") {
      const dropCount = weather === "storm" ? 150 : 50;
      for (let i = 0; i < dropCount; i++) {
        dropsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed:
            weather === "storm"
              ? Math.random() * 12 + 8
              : Math.random() * 5 + 3,
          length:
            weather === "storm"
              ? Math.random() * 30 + 20
              : Math.random() * 15 + 10,
          opacity: Math.random() * 0.5 + 0.5,
          windOffset: 0,
        });
      }
    }

    // Wind lines (optimized)
    windLinesRef.current = [];
    if (weather === "storm") {
      for (let i = 0; i < 30; i++) {
        windLinesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          length: Math.random() * 60 + 30,
          speed: Math.random() * 8 + 4,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
    }

    // Floating particles (petals, leaves) - optimized
    particlesRef.current = [];
    const particleCount = weather === "clear" || weather === "cloudy" ? 25 : 15;
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 6 + 3,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: Math.random() * 1 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        color: `hsl(${Math.random() * 360}, 70%, 70%)`,
        opacity: Math.random() * 0.6 + 0.4,
      });
    }

    // Meteors (optimized)
    meteorsRef.current = [];
    if (specialEvent === "meteor_shower") {
      for (let i = 0; i < 8; i++) {
        meteorsRef.current.push({
          x: Math.random() * canvas.width,
          y: -Math.random() * 300,
          speed: Math.random() * 15 + 10,
          length: Math.random() * 100 + 50,
          angle: (Math.random() * Math.PI) / 6 + Math.PI / 6,
          opacity: Math.random() * 0.8 + 0.2,
          delay: Math.random() * 3000,
        });
      }
    }

    // Snowflakes (optimized)
    snowflakesRef.current = [];
    if (specialEvent === "snowfall") {
      for (let i = 0; i < 60; i++) {
        snowflakesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 1 + 0.5,
          drift: Math.random() * 2 - 1,
          opacity: Math.random() * 0.8 + 0.2,
          rotation: Math.random() * Math.PI * 2,
        });
      }
    }

    // Blooming fog particles (optimized)
    bloomingFogRef.current = [];
    if (specialEvent === "blooming_fog") {
      for (let i = 0; i < 35; i++) {
        bloomingFogRef.current.push({
          x: Math.random() * canvas.width,
          y: canvas.height - Math.random() * 200,
          size: Math.random() * 80 + 40,
          speedY: -(Math.random() * 0.5 + 0.3),
          speedX: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          hue: Math.random() * 40 + 280,
        });
      }
    }

    // Emotional Storm - chaotic energy bolts
    emotionalStormRef.current = [];
    if (specialEvent === "emotional_storm") {
      for (let i = 0; i < 20; i++) {
        emotionalStormRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
          progress: 0,
          speed: Math.random() * 0.03 + 0.02,
          color: `hsl(${Math.random() * 60}, 100%, 60%)`,
          thickness: Math.random() * 4 + 2,
          segments: [],
        });
      }
    }

    // Serene Bloom - glowing petals rising
    sereneBloomRef.current = [];
    if (specialEvent === "serene_bloom") {
      for (let i = 0; i < 80; i++) {
        sereneBloomRef.current.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 200,
          targetY: Math.random() * canvas.height * 0.3,
          size: Math.random() * 8 + 4,
          speedY: -(Math.random() * 2 + 1.5),
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          hue: Math.random() * 60 + 300,
          opacity: Math.random() * 0.6 + 0.4,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    const animate = () => {
      frameCountRef.current++;

      // Adaptive throttle based on intensity
      const skipFrames = intensity > 0.7 ? 1 : 2;
      if (frameCountRef.current % skipFrames !== 0) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw fog
      if (weather === "cloudy") {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.3, `rgba(230, 230, 240, ${0.4 * intensity})`);
        gradient.addColorStop(0.7, `rgba(240, 240, 250, ${0.3 * intensity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${0.15 * intensity})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw wind lines (visible when wind intensity is high)
      if (windIntensity > 0.5) {
        windLinesRef.current.forEach((line) => {
          ctx.strokeStyle = `rgba(200, 220, 255, ${
            line.opacity * windIntensity
          })`;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";

          ctx.beginPath();
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x + line.length, line.y - line.length * 0.2);
          ctx.stroke();

          line.x += line.speed * windIntensity;
          line.y += line.speed * 0.5 * windIntensity;

          if (line.x > canvas.width || line.y > canvas.height) {
            line.x = -line.length;
            line.y = Math.random() * canvas.height;
          }
        });
      }

      // Draw rain
      if (weather === "storm" || weather === "rainy") {
        dropsRef.current.forEach((drop) => {
          ctx.strokeStyle = `rgba(150, 180, 255, ${drop.opacity})`;
          ctx.lineWidth = weather === "storm" ? 2 : 1;
          ctx.lineCap = "round";

          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2 - drop.windOffset, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= (weather === "storm" ? 1.5 : 0.5) + windIntensity;
          drop.windOffset = windIntensity * 3;

          if (drop.y > canvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
          }
        });
      }

      // Draw floating particles
      if (weather === "clear" || weather === "cloudy") {
        particlesRef.current.forEach((particle) => {
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);

          ctx.fillStyle = particle.color;
          ctx.globalAlpha = particle.opacity;

          // Draw petal/leaf shape
          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            particle.size,
            particle.size * 1.8,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Add detail line
          ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -particle.size * 1.8);
          ctx.lineTo(0, particle.size * 1.8);
          ctx.stroke();

          ctx.restore();

          particle.x +=
            particle.speedX +
            Math.sin(Date.now() * 0.001 + particle.y) * 0.5 +
            windIntensity;
          particle.y += particle.speedY;
          particle.rotation += particle.rotationSpeed;

          if (particle.y > canvas.height + 20) {
            particle.y = -20;
            particle.x = Math.random() * canvas.width;
          }
          if (particle.x < -20) particle.x = canvas.width + 20;
          if (particle.x > canvas.width + 20) particle.x = -20;
        });
      }

      // Draw meteors
      if (specialEvent === "meteor_shower") {
        const currentTime = Date.now();
        meteorsRef.current.forEach((meteor) => {
          if (currentTime < meteor.delay) return;

          const gradient = ctx.createLinearGradient(
            meteor.x,
            meteor.y,
            meteor.x - Math.cos(meteor.angle) * meteor.length,
            meteor.y + Math.sin(meteor.angle) * meteor.length
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`);
          gradient.addColorStop(
            0.3,
            `rgba(200, 220, 255, ${meteor.opacity * 0.6})`
          );
          gradient.addColorStop(1, "rgba(100, 150, 255, 0)");

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";

          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(
            meteor.x - Math.cos(meteor.angle) * meteor.length,
            meteor.y + Math.sin(meteor.angle) * meteor.length
          );
          ctx.stroke();

          // Glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
          ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
          ctx.beginPath();
          ctx.arc(meteor.x, meteor.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          meteor.x += Math.cos(meteor.angle) * meteor.speed;
          meteor.y += Math.sin(meteor.angle) * meteor.speed;

          if (meteor.y > canvas.height + 200) {
            meteor.x = Math.random() * canvas.width;
            meteor.y = -Math.random() * 300;
          }
        });
      }

      // Draw snowflakes
      if (specialEvent === "snowfall") {
        snowflakesRef.current.forEach((flake) => {
          ctx.save();
          ctx.translate(flake.x, flake.y);
          ctx.rotate(flake.rotation);

          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(255, 255, 255, 0.6)";

          // Draw snowflake shape
          for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 * i) / 6);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, flake.size);
            ctx.lineTo(-flake.size * 0.3, flake.size * 0.7);
            ctx.moveTo(0, flake.size);
            ctx.lineTo(flake.size * 0.3, flake.size * 0.7);
            ctx.stroke();
            ctx.restore();
          }

          ctx.restore();

          flake.x += flake.drift + Math.sin(Date.now() * 0.001 + flake.y) * 0.5;
          flake.y += flake.speed;
          flake.rotation += 0.01;

          if (flake.y > canvas.height) {
            flake.y = -10;
            flake.x = Math.random() * canvas.width;
          }
          if (flake.x < -20) flake.x = canvas.width + 20;
          if (flake.x > canvas.width + 20) flake.x = -20;
        });
        ctx.shadowBlur = 0;
      }

      // Draw blooming fog
      if (specialEvent === "blooming_fog") {
        bloomingFogRef.current.forEach((fog) => {
          const gradient = ctx.createRadialGradient(
            fog.x,
            fog.y,
            0,
            fog.x,
            fog.y,
            fog.size
          );
          gradient.addColorStop(
            0,
            `hsla(${fog.hue}, 70%, 70%, ${fog.opacity})`
          );
          gradient.addColorStop(
            0.5,
            `hsla(${fog.hue}, 60%, 65%, ${fog.opacity * 0.5})`
          );
          gradient.addColorStop(1, `hsla(${fog.hue}, 50%, 60%, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(fog.x, fog.y, fog.size, 0, Math.PI * 2);
          ctx.fill();

          fog.x += fog.speedX;
          fog.y += fog.speedY;

          if (fog.y < -fog.size) {
            fog.y = canvas.height + fog.size;
            fog.x = Math.random() * canvas.width;
          }
        });
      }

      // Draw emotional storm
      if (specialEvent === "emotional_storm") {
        emotionalStormRef.current.forEach((bolt) => {
          bolt.progress += bolt.speed;

          if (bolt.progress >= 1) {
            // Reset bolt
            bolt.x = Math.random() * canvas.width;
            bolt.y = Math.random() * canvas.height;
            bolt.targetX = Math.random() * canvas.width;
            bolt.targetY = Math.random() * canvas.height;
            bolt.progress = 0;
            bolt.segments = [];
          }

          // Generate jagged lightning path
          if (bolt.segments.length === 0 || bolt.progress < 0.1) {
            bolt.segments = [];
            const steps = 8;
            for (let i = 0; i <= steps; i++) {
              const t = i / steps;
              const x =
                bolt.x +
                (bolt.targetX - bolt.x) * t +
                (Math.random() - 0.5) * 40;
              const y =
                bolt.y +
                (bolt.targetY - bolt.y) * t +
                (Math.random() - 0.5) * 40;
              bolt.segments.push({ x, y });
            }
          }

          // Draw bolt
          ctx.strokeStyle = bolt.color;
          ctx.lineWidth = bolt.thickness;
          ctx.lineCap = "round";
          ctx.shadowBlur = 15;
          ctx.shadowColor = bolt.color;

          ctx.beginPath();
          bolt.segments.forEach((seg, i) => {
            if (i === 0) ctx.moveTo(seg.x, seg.y);
            else ctx.lineTo(seg.x, seg.y);
          });
          ctx.stroke();

          // Add glow at endpoints
          ctx.shadowBlur = 25;
          ctx.fillStyle = bolt.color;
          ctx.beginPath();
          ctx.arc(
            bolt.segments[bolt.segments.length - 1].x,
            bolt.segments[bolt.segments.length - 1].y,
            6,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.shadowBlur = 0;
        });
      }

      // Draw serene bloom
      if (specialEvent === "serene_bloom") {
        sereneBloomRef.current.forEach((petal) => {
          ctx.save();
          ctx.translate(petal.x, petal.y);
          ctx.rotate(petal.rotation);

          // Pulsing glow
          const pulse =
            Math.sin(Date.now() * 0.003 + petal.pulseOffset) * 0.3 + 0.7;
          const glowSize = petal.size * 1.5 * pulse;

          // Outer glow
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
          gradient.addColorStop(
            0,
            `hsla(${petal.hue}, 90%, 70%, ${petal.opacity * pulse})`
          );
          gradient.addColorStop(
            0.5,
            `hsla(${petal.hue}, 80%, 60%, ${petal.opacity * 0.5 * pulse})`
          );
          gradient.addColorStop(1, `hsla(${petal.hue}, 70%, 50%, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Petal shape
          ctx.fillStyle = `hsla(${petal.hue}, 85%, 65%, ${petal.opacity})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, petal.size * 0.6, petal.size, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          petal.y += petal.speedY;
          petal.rotation += petal.rotationSpeed;

          // Float up and fade
          if (petal.y < petal.targetY) {
            petal.speedY *= 0.98;
            petal.opacity = Math.max(0, petal.opacity - 0.005);
          }

          if (petal.opacity <= 0 || petal.y < -50) {
            petal.y = canvas.height + Math.random() * 100;
            petal.x = Math.random() * canvas.width;
            petal.opacity = Math.random() * 0.6 + 0.4;
            petal.speedY = -(Math.random() * 2 + 1.5);
          }
        });
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [weather, intensity, windIntensity, specialEvent]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-5"
      style={{ mixBlendMode: "normal" }}
    />
  );
}
