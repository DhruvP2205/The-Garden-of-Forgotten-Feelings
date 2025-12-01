import React, { useEffect, useState } from "react";

export default function MachineVoice({ message }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setIsVisible(false);
      setDisplayedText("");
      return;
    }

    setIsVisible(true);
    setDisplayedText("");

    // Typewriter effect
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.length) {
        setDisplayedText(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [message]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-6 z-30">
      <div
        className="relative backdrop-blur-2xl bg-white/5 border border-white/10 
                   rounded-3xl p-8 shadow-2xl animate-fadeIn"
      >
        {/* Ethereal glow */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 
                        rounded-3xl blur-2xl animate-pulse"
        />

        {/* Text content */}
        <div className="relative">
          <div className="flex items-start gap-4 mb-3">
            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse mt-2" />
            <p className="text-white/40 text-xs tracking-widest uppercase">
              the garden whispers
            </p>
          </div>

          <p
            className="text-white/90 text-lg md:text-xl font-light leading-relaxed tracking-wide italic"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {displayedText}
            <span className="inline-block w-1 h-5 bg-white/60 ml-1 animate-blink" />
          </p>
        </div>

        {/* Decorative particles */}
        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-purple-400/30 animate-float" />
        <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-blue-400/30 animate-float-delayed" />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 20px));
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @keyframes blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}
