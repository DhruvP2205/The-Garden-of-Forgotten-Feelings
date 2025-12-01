import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

export default function WhisperPortal({ onSubmit, emotion }) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text && text.trim()) {
      setIsSubmitting(true);
      onSubmit(text);
      setText("");
      setTimeout(() => {
        setIsSubmitting(false);
        inputRef.current?.blur();
        setIsFocused(false);
      }, 500);
    }
  };

  const glowColors = {
    calm: "from-blue-400/20 to-purple-500/20",
    anger: "from-red-500/20 to-orange-600/20",
    nostalgia: "from-amber-400/20 to-pink-500/20",
    joy: "from-yellow-400/20 to-green-400/20",
    confusion: "from-purple-500/20 to-indigo-600/20",
    loneliness: "from-blue-600/20 to-gray-500/20",
  };

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
      <form onSubmit={handleSubmit} className="relative">
        {/* Ambient glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            glowColors[emotion] || glowColors.calm
          } 
                      blur-3xl transition-all duration-1000 ${
                        isFocused
                          ? "scale-110 opacity-100"
                          : "scale-90 opacity-50"
                      }`}
        />

        {/* Portal container */}
        <div
          className={`relative backdrop-blur-xl bg-white/5 border transition-all duration-700
                      ${
                        isFocused
                          ? "border-white/30 shadow-2xl"
                          : "border-white/10 shadow-lg"
                      }
                      rounded-3xl overflow-hidden`}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                          -translate-x-full animate-shimmer"
            style={{
              animation: isFocused ? "shimmer 3s infinite" : "none",
              backgroundSize: "200% 100%",
            }}
          />

          <div className="relative flex items-center gap-4 p-6">
            {/* Icon */}
            <div
              className={`transition-all duration-500 ${
                isFocused ? "scale-110 rotate-12" : "scale-100"
              }`}
            >
              <Sparkles className="w-6 h-6 text-white/60" />
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="whisper a feeling into the garden..."
              className="flex-1 bg-transparent text-white/90 placeholder-white/40 
                         text-lg font-light outline-none tracking-wide"
              style={{ fontFamily: "Georgia, serif" }}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={!text || !text.trim() || isSubmitting}
              className={`p-3 rounded-full transition-all duration-500 
                         ${
                           text && text.trim() && !isSubmitting
                             ? "bg-white/10 hover:bg-white/20 text-white/80 hover:scale-110"
                             : "bg-white/5 text-white/30 cursor-not-allowed"
                         }`}
            >
              <Send
                className={`w-5 h-5 transition-transform duration-500 ${
                  isSubmitting ? "animate-pulse" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Helper text */}
        <p className="mt-4 text-center text-white/30 text-sm tracking-widest">
          {isFocused
            ? "the garden listens..."
            : "speak your forgotten feelings"}
        </p>
      </form>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
