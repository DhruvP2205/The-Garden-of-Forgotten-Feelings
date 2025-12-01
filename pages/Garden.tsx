import React, { useState, useEffect, useRef } from "react";
import GardenScene from "../components/garden/GardenScene";
import WeatherSystem from "../components/garden/WeatherSystem";
import WhisperPortal from "../components/garden/WhisperPortal";
import MemoryGarden from "../components/garden/MemoryGarden";
import MachineVoice from "../components/garden/MachineVoice";
import ControlPanel from "../components/garden/ControlPanel";
import ScenarioEffects from "../components/garden/ScenarioEffects";
import GardenTools from "../components/garden/GardenTools";
import PerformanceMonitor from "../components/garden/PerformanceMonitor";
import {
  getMemories,
  addMemory,
  isFirstVisit,
  getTimeSinceLastVisit,
  updateGardenState,
  getGardenState,
} from "../components/garden/memoryStorage";
import { analyzeEmotion } from "../components/garden/emotionDetector";
import { MessageSquare, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Garden() {
  const [currentEmotion, setCurrentEmotion] = useState("calm");
  const [memories, setMemories] = useState([]);
  const [machineMessage, setMachineMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [intensity, setIntensity] = useState(0.5);
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [weather, setWeather] = useState("clear");
  const [windIntensity, setWindIntensity] = useState(0.5);
  const [triggerLightning, setTriggerLightning] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [specialEvent, setSpecialEvent] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [lastEmotion, setLastEmotion] = useState("calm");
  const [inactivityTimer, setInactivityTimer] = useState(0);
  const [toolCooldowns, setToolCooldowns] = useState({
    water: 0,
    prune: 0,
    chase: 0,
  });
  const sceneRef = useRef(null);
  const inactivityRef = useRef(null);

  useEffect(() => {
    // Load existing memories
    const loadedMemories = getMemories();
    setMemories(loadedMemories);

    // Check for scenarios
    const firstVisit = isFirstVisit();
    const timeSinceLastVisit = getTimeSinceLastVisit();
    const hoursAway = timeSinceLastVisit / (1000 * 60 * 60);
    const lastState = getGardenState();

    // Scenario 1: First Visit
    if (firstVisit) {
      setCurrentScenario("first_visit");
      setIsInputOpen(true);
      setMachineMessage("");
      setIsLoaded(true);
      return;
    }

    // Scenario 4: Long Absence (48+ hours)
    if (hoursAway >= 48) {
      setCurrentScenario("overgrown");
      setWeather("cloudy");
      setWindIntensity(0.8);
      setMachineMessage("I grew wild without you.");
      setIsLoaded(true);
      setTimeout(() => {
        setMachineMessage("");
        setCurrentScenario(null);
      }, 6000);
      updateGardenState({ lastVisit: Date.now(), lastEmotion: currentEmotion });
      return;
    }

    // Scenario 2: Returning After Hours (5+ hours)
    if (hoursAway >= 5 && hoursAway < 48) {
      setMachineMessage("I remained quiet while you were away.");
      setWeather("clear");
      setIsLoaded(true);
      setTimeout(() => setMachineMessage(""), 6000);
      updateGardenState({ lastVisit: Date.now(), lastEmotion: currentEmotion });
      return;
    }

    // Normal greeting
    setTimeout(() => {
      const greetings = [
        "welcome back to your garden...",
        "the flowers remember you...",
        "your feelings await...",
      ];
      setMachineMessage(
        greetings[Math.floor(Math.random() * greetings.length)]
      );
      setIsLoaded(true);
    }, 1000);

    const timer = setTimeout(() => setMachineMessage(""), 8000);

    // Update last visit
    updateGardenState({ lastVisit: Date.now(), lastEmotion: currentEmotion });

    // Scenario 6: Inactivity detection
    inactivityRef.current = setInterval(() => {
      setInactivityTimer((prev) => prev + 1);
    }, 1000);

    // Scenario 7: Random dream distortions
    const dreamInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        // 10% chance every 10 seconds
        setCurrentScenario("dream_distortion");
        setMachineMessage("Time is not real here.");
        setTimeout(() => {
          setMachineMessage("");
          setCurrentScenario(null);
        }, 3000);
      }
    }, 10000);

    // Random special weather events
    const eventInterval = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.08) {
        // 8% chance every 15 seconds
        const hour = new Date().getHours();
        const isNight = hour >= 20 || hour < 6;

        if (isNight && weather === "clear") {
          // Meteor shower at night
          setSpecialEvent("meteor_shower");
          setMachineMessage("Stars fall like forgotten wishes.");
          setTimeout(() => {
            setSpecialEvent(null);
            setMachineMessage("");
          }, 8000);
        } else if (currentEmotion === "calm" && weather === "clear") {
          // Snowfall during calm
          setSpecialEvent("snowfall");
          setMachineMessage("Silence crystallizes into snow.");
          setTimeout(() => {
            setSpecialEvent(null);
            setMachineMessage("");
          }, 10000);
        } else if (weather === "cloudy" || weather === "rainy") {
          // Blooming fog after rain
          setSpecialEvent("blooming_fog");
          setMachineMessage("Mist blooms with colors you cannot name.");
          setTimeout(() => {
            setSpecialEvent(null);
            setMachineMessage("");
          }, 10000);
        }
      }
    }, 15000);

    // Cooldown timer
    const cooldownInterval = setInterval(() => {
      setToolCooldowns((prev) => ({
        water: Math.max(0, prev.water - 0.1),
        prune: Math.max(0, prev.prune - 0.1),
        chase: Math.max(0, prev.chase - 0.1),
      }));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(inactivityRef.current);
      clearInterval(dreamInterval);
      clearInterval(cooldownInterval);
      clearInterval(eventInterval);
    };
  }, []);

  // Scenario 6: Handle inactivity (silence)
  useEffect(() => {
    if (inactivityTimer > 60 && currentScenario !== "silence") {
      setCurrentScenario("silence");
      setMachineMessage("Silence grows its own flowers.");
      setWindIntensity(0.2);
      setTimeout(() => setMachineMessage(""), 5000);
    } else if (inactivityTimer <= 60 && currentScenario === "silence") {
      setCurrentScenario(null);
    }
  }, [inactivityTimer, currentScenario]);

  const handleEmotionInput = (text) => {
    // Check if text is valid
    if (!text || !text.trim()) return;

    // Reset inactivity
    setInactivityTimer(0);
    setCurrentScenario(null);

    const emotion = analyzeEmotion(text);

    // Check for extreme emotional scenarios
    if (emotion.isExtreme) {
      if (emotion.primary === "anger" || emotion.primary === "loneliness") {
        // Emotional Storm
        setSpecialEvent("emotional_storm");
        setWeather("storm");
        setWindIntensity(1.0);
        setCurrentScenario("emotional_storm");
        setMachineMessage(
          "Your emotions tear through the fabric of stillness."
        );

        // Rapid flower removal
        const numToRemove = Math.floor(Math.random() * 6) + 5;
        for (let i = 0; i < numToRemove; i++) {
          setTimeout(() => {
            if (sceneRef.current?.removeFlower) {
              sceneRef.current.removeFlower();
            }
          }, i * 100);
        }

        setTimeout(() => {
          setSpecialEvent(null);
          setCurrentScenario(null);
          setMachineMessage("");
          setWeather("rainy");
          setWindIntensity(0.7);
        }, 8000);
      } else if (emotion.primary === "joy" || emotion.primary === "calm") {
        // Serene Bloom
        setSpecialEvent("serene_bloom");
        setWeather("clear");
        setWindIntensity(0.2);
        setCurrentScenario("serene_bloom");
        setMachineMessage("Pure joy blooms like wildflowers in spring.");

        // Rapid beautiful flower growth
        const numNewFlowers = Math.floor(Math.random() * 8) + 10;
        for (let i = 0; i < numNewFlowers; i++) {
          setTimeout(() => {
            const x = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            const colors = [
              0xffff00, 0xffa500, 0xff69b4, 0xff1493, 0xffd700, 0xffc0cb,
              0xda70d6,
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            if (
              sceneRef.current?.addFlower &&
              sceneRef.current?.getCreateFlowerFunc
            ) {
              const createFunc = sceneRef.current.getCreateFlowerFunc();
              sceneRef.current.addFlower(x, z, color, "joy", createFunc);
            }
          }, i * 150);
        }

        setTimeout(() => {
          setSpecialEvent(null);
          setCurrentScenario(null);
          setMachineMessage("");
        }, 8000);
      }
    } else {
      // Normal flower behavior
      // Add flowers when happy
      if (emotion.primary === "joy" || emotion.primary === "calm") {
        const numNewFlowers = Math.floor(Math.random() * 4) + 3;
        for (let i = 0; i < numNewFlowers; i++) {
          setTimeout(() => {
            const x = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            const colors = [
              0xffff00, 0xffa500, 0xff69b4, 0xff1493, 0xff6b9d, 0x9d6bff,
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            if (
              sceneRef.current?.addFlower &&
              sceneRef.current?.getCreateFlowerFunc
            ) {
              const createFunc = sceneRef.current.getCreateFlowerFunc();
              sceneRef.current.addFlower(x, z, color, "joy", createFunc);
            }
          }, i * 200);
        }
      }

      // Remove flowers when sad/angry
      if (
        emotion.primary === "anger" ||
        emotion.primary === "loneliness" ||
        emotion.primary === "confusion"
      ) {
        const numToRemove = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numToRemove; i++) {
          setTimeout(() => {
            if (sceneRef.current?.removeFlower) {
              sceneRef.current.removeFlower();
            }
          }, i * 300);
        }
      }
    }
    const memory = addMemory(text, emotion);

    // Scenario 1: First visit completion
    if (currentScenario === "first_visit") {
      setMachineMessage("Stillness is your first seed.");
      setCurrentScenario(null);
      setTimeout(() => setMachineMessage(""), 5000);
    }
    // Skip scenario messages if in extreme emotional event
    else if (
      currentScenario === "emotional_storm" ||
      currentScenario === "serene_bloom"
    ) {
      // Already handled above
    }
    // Scenario 5: Emotional ambiguity
    else if (emotion.isAmbiguous) {
      setMachineMessage("Uncertainty is a feeling, too.");
      setWeather("cloudy");
      setWindIntensity(0.6);
      setTimeout(() => setMachineMessage(""), 5000);
    }
    // Scenario 8: Overloaded emotion
    else if (emotion.isOverloaded) {
      setCurrentScenario("overloaded");
      setMachineMessage("You feel many worlds at once.");
      setWeather("storm");
      setWindIntensity(0.9);
      setTimeout(() => {
        setMachineMessage("");
        setCurrentScenario(null);
      }, 6000);
    }
    // Scenario 3: Sudden emotional shift
    else if (lastEmotion !== emotion.primary && lastEmotion !== "calm") {
      setCurrentScenario("emotional_shift");
      setMachineMessage("Your storm breaks my stillness.");
      setTimeout(() => setCurrentScenario(null), 3000);
      setTimeout(() => setMachineMessage(""), 5000);
    }
    // Normal response
    else {
      const responses = generateMachineResponse(emotion, text);
      setTimeout(() => setMachineMessage(responses), 500);
      setTimeout(() => setMachineMessage(""), 7000);
    }

    setCurrentEmotion(emotion.primary);
    setLastEmotion(emotion.primary);
    setIntensity(emotion.intensity);
    setMemories([...getMemories()]);

    // Auto-set weather based on emotion (if not overridden by scenario)
    if (!emotion.isOverloaded) {
      const weatherMap = {
        calm: "clear",
        anger: "storm",
        nostalgia: "cloudy",
        joy: "clear",
        confusion: "cloudy",
        loneliness: "rainy",
      };
      setWeather(weatherMap[emotion.primary] || "clear");
    }

    // Update state
    updateGardenState({ lastVisit: Date.now(), lastEmotion: emotion.primary });

    // Close input after submission
    setIsInputOpen(false);
  };

  const generateMachineResponse = (emotion, text) => {
    const responses = {
      calm: [
        "a peaceful flower blooms under gentle blue sky...",
        "your calm thoughts settle into the soil like morning dew...",
        "the garden breathes softly, wind whispers through leaves...",
        "tranquility takes root as clouds drift by...",
      ],
      anger: [
        "fierce red blooms emerge as storm clouds gather...",
        "lightning illuminates your rage, rain falls heavy...",
        "hot petals unfold as thunder rolls across the sky...",
        "the garden trembles in the tempest of feeling...",
      ],
      nostalgia: [
        "amber flowers grow as clouds veil the sun...",
        "the past blooms in warm, faded colors at dusk...",
        "golden petals drift like memories in gentle breeze...",
        "the garden holds what time forgot in soft twilight...",
      ],
      joy: [
        "bright flowers dance as sun blazes overhead...",
        "your happiness becomes wild blooms under clear sky...",
        "petals scatter in joyful wind, clouds part for light...",
        "the garden celebrates under the radiant sun...",
      ],
      confusion: [
        "strange purple flowers twist as fog rolls in...",
        "uncertainty blooms while mist obscures the path...",
        "the garden grows curious shapes in dim, foggy light...",
        "mystery takes root as clouds drift low and thick...",
      ],
      loneliness: [
        "a single flower stands as rain begins to fall...",
        "your solitude becomes deep petals under grey sky...",
        "lightning flashes on lone blooms in the drizzle...",
        "the garden sits with you as storm clouds gather...",
      ],
    };

    const emotionResponses = responses[emotion.primary] || responses.calm;
    return emotionResponses[
      Math.floor(Math.random() * emotionResponses.length)
    ];
  };

  const handleMemoryClick = (memory) => {
    setCurrentEmotion(memory.emotion.primary);
    setIntensity(memory.emotion.intensity * 0.7);
    setMachineMessage(`you planted: "${memory.text}" — ${memory.reflection}`);
    setTimeout(() => setMachineMessage(""), 6000);
  };

  const handleLightningTrigger = () => {
    setTriggerLightning(true);
    setTimeout(() => setTriggerLightning(false), 200);
  };

  const handleWater = () => {
    setToolCooldowns((prev) => ({ ...prev, water: 10 }));
    setInactivityTimer(0);

    // Water creates calm flowers
    const numFlowers = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numFlowers; i++) {
      setTimeout(() => {
        const x = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        const colors = [0x6b9dff, 0x9d6bff, 0xa78bfa];
        const color = colors[Math.floor(Math.random() * colors.length)];
        if (
          sceneRef.current?.addFlower &&
          sceneRef.current?.getCreateFlowerFunc
        ) {
          const createFunc = sceneRef.current.getCreateFlowerFunc();
          sceneRef.current.addFlower(x, z, color, "calm", createFunc);
        }
      }, i * 150);
    }

    setWeather("rainy");
    setWindIntensity(0.3);
    setMachineMessage("The thirst is quenched. New life stirs.");

    setTimeout(() => {
      setWeather("clear");
      setMachineMessage("");
    }, 4000);

    // Add memory
    const fakeEmotion = {
      primary: "calm",
      intensity: 0.6,
      scores: {},
      raw: "watered the garden",
      isAmbiguous: false,
      isOverloaded: false,
    };
    addMemory("watered the garden", fakeEmotion);
    setMemories([...getMemories()]);
  };

  const handlePrune = () => {
    setToolCooldowns((prev) => ({ ...prev, prune: 10 }));
    setInactivityTimer(0);

    // Pruning removes some flowers and increases wind
    const numToRemove = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numToRemove; i++) {
      setTimeout(() => {
        if (sceneRef.current?.removeFlower) {
          sceneRef.current.removeFlower();
        }
      }, i * 200);
    }

    setWindIntensity(0.7);
    setMachineMessage("Order restored. What overgrows must fall.");

    setTimeout(() => {
      setWindIntensity(0.5);
      setMachineMessage("");
    }, 4000);

    const fakeEmotion = {
      primary: "calm",
      intensity: 0.5,
      scores: {},
      raw: "pruned overgrowth",
      isAmbiguous: false,
      isOverloaded: false,
    };
    addMemory("pruned the overgrowth", fakeEmotion);
    setMemories([...getMemories()]);
  };

  const handleChase = () => {
    setToolCooldowns((prev) => ({ ...prev, chase: 10 }));
    setInactivityTimer(0);

    // Chasing creates wind and removes flowers, then grows new ones
    const numToRemove = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numToRemove; i++) {
      setTimeout(() => {
        if (sceneRef.current?.removeFlower) {
          sceneRef.current.removeFlower();
        }
      }, i * 100);
    }

    setTimeout(() => {
      const numFlowers = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < numFlowers; i++) {
        setTimeout(() => {
          const x = (Math.random() - 0.5) * 20;
          const z = (Math.random() - 0.5) * 20;
          const colors = [0xff69b4, 0xffa500, 0xc084fc];
          const color = colors[Math.floor(Math.random() * colors.length)];
          if (
            sceneRef.current?.addFlower &&
            sceneRef.current?.getCreateFlowerFunc
          ) {
            const createFunc = sceneRef.current.getCreateFlowerFunc();
            sceneRef.current.addFlower(x, z, color, "joy", createFunc);
          }
        }, i * 150);
      }
    }, 800);

    setWindIntensity(0.9);
    setMachineMessage("The wilted scatter like ash. New blooms rise.");

    setTimeout(() => {
      setWindIntensity(0.5);
      setMachineMessage("");
    }, 5000);

    const fakeEmotion = {
      primary: "nostalgia",
      intensity: 0.5,
      scores: {},
      raw: "chased away wilted flowers",
      isAmbiguous: false,
      isOverloaded: false,
    };
    addMemory("chased away wilted flowers", fakeEmotion);
    setMemories([...getMemories()]);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-sky-200 to-green-100">
      {/* Main Garden Scene with 3D */}
      <GardenScene
        emotion={currentEmotion}
        intensity={intensity}
        memories={memories}
        timeOfDay={timeOfDay}
        weather={weather}
        windIntensity={windIntensity}
        triggerLightning={triggerLightning}
        ref={sceneRef}
      />

      {/* Weather Effects Canvas */}
      <WeatherSystem
        weather={weather}
        intensity={intensity}
        windIntensity={windIntensity}
        specialEvent={specialEvent}
      />

      {/* Scenario Effects Overlay */}
      <ScenarioEffects scenario={currentScenario} intensity={intensity} />

      {/* Loading fade in */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-sky-300 to-green-200 transition-opacity duration-3000 pointer-events-none ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Performance Monitor */}
      <PerformanceMonitor />

      {/* Control Panel */}
      {/* Info about auto cycle */}
      <div className="absolute top-6 right-6 z-40 bg-white/20 backdrop-blur-lg border border-white/40 rounded-xl p-3 text-white/90 text-xs max-w-xs shadow-lg">
        <p className="font-semibold mb-1">🌅 Auto Day/Night Cycle Active</p>
        <p className="text-white/70">
          Complete cycle: 1:30 minutes • Lightning on sadness
        </p>
        <p className="text-white/70 mt-1">
          😊 Happy adds glowing flowers • 😢 Sad removes flowers
        </p>
      </div>

      <ControlPanel
        onTimeChange={setTimeOfDay}
        onWeatherChange={setWeather}
        onWindChange={setWindIntensity}
        onLightningTrigger={handleLightningTrigger}
        currentTime={timeOfDay}
        currentWeather={weather}
        windIntensity={windIntensity}
      />

      {/* Memory Garden Overlay - Flower Markers */}
      <MemoryGarden
        memories={memories}
        onMemoryClick={handleMemoryClick}
        currentEmotion={currentEmotion}
        sceneRef={sceneRef}
      />

      {/* Input Toggle Button */}
      {currentScenario !== "first_visit" && (
        <Button
          onClick={() => {
            setIsInputOpen(!isInputOpen);
            setInactivityTimer(0); // Reset inactivity on interaction
          }}
          className="fixed bottom-6 right-6 z-50 bg-white/20 hover:bg-white/30 border border-white/40 text-white shadow-lg px-6 py-6 rounded-full"
          size="lg"
        >
          {isInputOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </Button>
      )}

      {/* First visit seed indicator */}
      {currentScenario === "first_visit" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <Sparkles className="w-16 h-16 text-white/60 animate-pulse" />
        </div>
      )}

      {/* Whisper Portal (Input) - Toggleable */}
      {isInputOpen && (
        <WhisperPortal onSubmit={handleEmotionInput} emotion={currentEmotion} />
      )}

      {/* Garden Tools */}
      {!isInputOpen && currentScenario !== "first_visit" && (
        <GardenTools
          onWater={handleWater}
          onPrune={handlePrune}
          onChase={handleChase}
          cooldowns={toolCooldowns}
        />
      )}

      {/* Machine Voice */}
      <MachineVoice message={machineMessage} />

      {/* Title (fades out) */}
      <div
        className={`absolute top-8 left-1/2 -translate-x-1/2 text-center transition-all duration-2000 pointer-events-none ${
          isLoaded ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <h1
          className="text-4xl font-light text-green-900/80 tracking-widest mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          The Garden of Forgotten Feelings
        </h1>
        <p className="text-sm text-green-800/60 tracking-wide">
          control the elements and watch your emotions bloom
        </p>
      </div>

      {/* Camera Controls Info */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl px-4 py-2 text-white/90 text-xs shadow-lg">
        <p>
          🔍 Scroll to zoom • 🖱️ Drag to rotate 360° • ✨ New flowers glow for 5
          seconds
        </p>
      </div>

      {/* Quick Info */}
      {!isInputOpen && currentScenario !== "first_visit" && (
        <div className="absolute bottom-6 left-6 z-20 max-w-xs">
          <p className="text-xs text-white/70 tracking-wide leading-relaxed">
            {currentScenario === "silence" &&
              "The garden grows quiet in your absence..."}
            {currentScenario === "overgrown" &&
              "Your garden evolved wildly while you were gone..."}
            {!currentScenario &&
              "Share feelings to grow or remove flowers. Control weather on the left."}
          </p>
        </div>
      )}
    </div>
  );
}
