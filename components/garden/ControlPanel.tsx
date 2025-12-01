import React, { useState } from "react";
import {
  Settings,
  X,
  Sun,
  Moon,
  CloudRain,
  Cloud,
  Wind,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function ControlPanel({
  onTimeChange,
  onWeatherChange,
  onWindChange,
  onLightningTrigger,
  currentTime,
  currentWeather,
  windIntensity,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState({
    time: false,
    weather: false,
    effects: false,
  });

  const timeOptions = [
    { value: "dawn", label: "Dawn", icon: Sun, color: "orange" },
    { value: "day", label: "Day", icon: Sun, color: "yellow" },
    { value: "dusk", label: "Dusk", icon: Sun, color: "red" },
    { value: "night", label: "Night", icon: Moon, color: "blue" },
  ];

  const weatherOptions = [
    { value: "clear", label: "Clear", icon: Sun },
    { value: "cloudy", label: "Cloudy", icon: Cloud },
    { value: "rainy", label: "Rainy", icon: CloudRain },
    { value: "storm", label: "Storm", icon: CloudRain },
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 bg-white/20 hover:bg-white/30 border border-white/40 text-white shadow-lg"
        size="icon"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </Button>

      {/* Control Panel */}
      {isOpen && (
        <div className="fixed top-20 left-6 z-50 w-80 max-h-[calc(100vh-120px)] overflow-y-auto bg-white/95 rounded-2xl border border-white/40 shadow-2xl">
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Garden Controls
            </h3>

            {/* Time of Day */}
            <div className="space-y-2">
              <button
                onClick={() =>
                  setExpanded({ ...expanded, time: !expanded.time })
                }
                className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Time of Day
                </span>
                {expanded.time ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {expanded.time && (
                <div className="grid grid-cols-2 gap-2 p-2">
                  {timeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => onTimeChange(option.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          currentTime === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mx-auto mb-1 text-${option.color}-500`}
                        />
                        <p className="text-xs font-medium text-gray-700">
                          {option.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Weather */}
            <div className="space-y-2">
              <button
                onClick={() =>
                  setExpanded({ ...expanded, weather: !expanded.weather })
                }
                className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Weather
                </span>
                {expanded.weather ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {expanded.weather && (
                <div className="grid grid-cols-2 gap-2 p-2">
                  {weatherOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => onWeatherChange(option.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          currentWeather === option.value
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                        <p className="text-xs font-medium text-gray-700">
                          {option.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Effects */}
            <div className="space-y-2">
              <button
                onClick={() =>
                  setExpanded({ ...expanded, effects: !expanded.effects })
                }
                className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Effects
                </span>
                {expanded.effects ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {expanded.effects && (
                <div className="space-y-4 p-2">
                  {/* Wind Control */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Wind className="w-4 h-4" />
                        Wind Intensity
                      </label>
                      <span className="text-xs text-gray-500">
                        {Math.round(windIntensity * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[windIntensity]}
                      onValueChange={(value) => onWindChange(value[0])}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Lightning Trigger */}
                  <button
                    onClick={onLightningTrigger}
                    className="w-full p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Trigger Lightning
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 leading-relaxed">
                Manually control the garden's environment. Time, weather, wind,
                and effects are now in your hands.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
