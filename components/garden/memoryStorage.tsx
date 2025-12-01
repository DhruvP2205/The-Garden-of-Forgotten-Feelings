// Memory storage and management system

const STORAGE_KEY = "garden_memories";
const STATE_KEY = "garden_state";

export function getMemories() {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error loading memories:", e);
    return [];
  }
}

export function getGardenState() {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Error loading garden state:", e);
    return null;
  }
}

export function updateGardenState(state) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STATE_KEY,
      JSON.stringify({
        ...state,
        lastVisit: Date.now(),
      })
    );
  } catch (e) {
    console.error("Error saving garden state:", e);
  }
}

export function isFirstVisit() {
  return getMemories().length === 0 && !getGardenState();
}

export function getTimeSinceLastVisit() {
  const state = getGardenState();
  if (!state || !state.lastVisit) return 0;
  return Date.now() - state.lastVisit;
}

export function addMemory(text, emotion) {
  const memories = getMemories();

  const reflection = generateReflection(emotion);

  const memory = {
    id: Date.now() + Math.random(),
    text: text,
    emotion: emotion,
    timestamp: Date.now(),
    reflection: reflection,
    age: 0,
  };

  memories.push(memory);

  // Keep only last 50 memories
  const recentMemories = memories.slice(-50);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentMemories));
  } catch (e) {
    console.error("Error saving memory:", e);
  }

  return memory;
}

export function getMemoryAge(memory) {
  return Date.now() - memory.timestamp;
}

export function clearMemories() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function generateReflection(emotion) {
  const reflections = {
    calm: [
      "this felt like a quiet apology drifting in lavender fog",
      "a soft exhale that turned into morning mist",
      "the space between thoughts where stillness grows",
      "peace settling like dust in abandoned rooms",
    ],
    anger: [
      "fire that refuses to become smoke",
      "a scream caught in amber, still burning",
      "thorns that grew from buried rage",
      "heat that crystallized into crimson glass",
    ],
    nostalgia: [
      "a photograph slowly fading in sunlight",
      "the echo of a song you can't quite remember",
      "autumn leaves pressed between forgotten pages",
      "a dream of a place that may never have existed",
    ],
    joy: [
      "light spilling through cracks in reality",
      "laughter that became wildflowers",
      "a moment so bright it left afterimages",
      "happiness that couldn't be contained",
    ],
    confusion: [
      "questions spiraling into fractal patterns",
      "thought-threads tangled in impossible knots",
      "a maze where all paths lead to themselves",
      "uncertainty blooming in purple fractals",
    ],
    loneliness: [
      "silence that has its own gravity",
      "an echo in an empty cathedral",
      "the cold side of the bed, forever",
      "a single star in an infinite void",
    ],
  };

  const options = reflections[emotion.primary] || reflections.calm;
  return options[Math.floor(Math.random() * options.length)];
}

export function getTimeOfDay() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function getEmotionPalette(emotion) {
  const palettes = {
    calm: {
      primary: "#7c3aed",
      secondary: "#6366f1",
      accent: "#a78bfa",
      fog: "#1e1b4b",
      particles: [
        { r: 0.6, g: 0.5, b: 0.9 },
        { r: 0.5, g: 0.6, b: 1.0 },
        { r: 0.7, g: 0.6, b: 0.95 },
      ],
    },
    anger: {
      primary: "#dc2626",
      secondary: "#ea580c",
      accent: "#fb923c",
      fog: "#450a0a",
      particles: [
        { r: 1.0, g: 0.3, b: 0.2 },
        { r: 0.9, g: 0.4, b: 0.1 },
        { r: 1.0, g: 0.5, b: 0.3 },
      ],
    },
    nostalgia: {
      primary: "#f59e0b",
      secondary: "#ec4899",
      accent: "#fbbf24",
      fog: "#451a03",
      particles: [
        { r: 0.95, g: 0.7, b: 0.4 },
        { r: 1.0, g: 0.8, b: 0.6 },
        { r: 0.9, g: 0.5, b: 0.6 },
      ],
    },
    joy: {
      primary: "#eab308",
      secondary: "#22c55e",
      accent: "#facc15",
      fog: "#14532d",
      particles: [
        { r: 1.0, g: 0.9, b: 0.3 },
        { r: 0.8, g: 1.0, b: 0.4 },
        { r: 1.0, g: 1.0, b: 0.6 },
      ],
    },
    confusion: {
      primary: "#9333ea",
      secondary: "#4f46e5",
      accent: "#c084fc",
      fog: "#312e81",
      particles: [
        { r: 0.7, g: 0.4, b: 0.9 },
        { r: 0.5, g: 0.5, b: 1.0 },
        { r: 0.8, g: 0.6, b: 0.95 },
      ],
    },
    loneliness: {
      primary: "#1e40af",
      secondary: "#6b7280",
      accent: "#60a5fa",
      fog: "#111827",
      particles: [
        { r: 0.3, g: 0.4, b: 0.7 },
        { r: 0.4, g: 0.5, b: 0.6 },
        { r: 0.5, g: 0.6, b: 0.8 },
      ],
    },
  };

  return palettes[emotion] || palettes.calm;
}

export function formatTimestamp(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
