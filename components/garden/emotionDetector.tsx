// Lightweight rule-based emotion detection system

const emotionKeywords = {
  calm: [
    "peace",
    "calm",
    "quiet",
    "serene",
    "tranquil",
    "still",
    "gentle",
    "soft",
    "relaxed",
    "breathe",
    "ease",
    "rest",
    "centered",
    "balanced",
    "clear",
    "meditation",
    "zen",
    "harmony",
    "soothing",
    "peaceful",
    "silence",
  ],
  anger: [
    "angry",
    "mad",
    "furious",
    "rage",
    "hate",
    "frustrated",
    "annoyed",
    "irritated",
    "upset",
    "bitter",
    "resentful",
    "hostile",
    "aggressive",
    "violent",
    "cruel",
    "destroy",
    "hurt",
    "pain",
    "fight",
    "scream",
    "explode",
    "fire",
    "burn",
  ],
  nostalgia: [
    "remember",
    "memory",
    "past",
    "used to",
    "once",
    "before",
    "miss",
    "gone",
    "lost",
    "yesterday",
    "childhood",
    "old",
    "former",
    "previous",
    "ancient",
    "forgotten",
    "faded",
    "echo",
    "ghost",
    "remnant",
    "trace",
    "amber",
    "sepia",
  ],
  joy: [
    "happy",
    "joy",
    "excited",
    "glad",
    "delighted",
    "wonderful",
    "amazing",
    "love",
    "smile",
    "laugh",
    "bright",
    "cheerful",
    "pleased",
    "content",
    "grateful",
    "blessed",
    "celebration",
    "sunshine",
    "radiant",
    "gleeful",
    "euphoric",
  ],
  confusion: [
    "confused",
    "uncertain",
    "unsure",
    "lost",
    "don't know",
    "maybe",
    "perhaps",
    "unclear",
    "puzzled",
    "bewildered",
    "perplexed",
    "wondering",
    "question",
    "doubt",
    "chaos",
    "messy",
    "tangled",
    "foggy",
    "blurry",
    "strange",
    "weird",
  ],
  loneliness: [
    "lonely",
    "alone",
    "isolated",
    "empty",
    "abandoned",
    "solitary",
    "separate",
    "distant",
    "far",
    "apart",
    "nobody",
    "nothing",
    "void",
    "hollow",
    "cold",
    "silent",
    "dark",
    "invisible",
    "forgotten",
    "ignored",
    "excluded",
  ],
};

const emotionPhrases = {
  calm: [
    "feel at peace",
    "feeling calm",
    "everything is okay",
    "taking it slow",
    "breathing deeply",
    "finding balance",
  ],
  anger: [
    "so mad",
    "really angry",
    "hate it",
    "makes me furious",
    "can't stand",
    "driving me crazy",
  ],
  nostalgia: [
    "remember when",
    "those days",
    "used to be",
    "wish i could go back",
    "things were different",
    "the old days",
  ],
  joy: [
    "so happy",
    "feel amazing",
    "love this",
    "couldn't be better",
    "best day",
    "feeling great",
  ],
  confusion: [
    "don't understand",
    "not sure",
    "what is",
    "how do i",
    "confused about",
    "makes no sense",
  ],
  loneliness: [
    "feel alone",
    "nobody cares",
    "all by myself",
    "miss someone",
    "feeling empty",
    "no one understands",
  ],
};

export function analyzeEmotion(text) {
  const lowerText = text.toLowerCase();

  // Check for ambiguity
  const ambiguityMarkers = [
    "don't know",
    "not sure",
    "maybe",
    "uncertain",
    "confused about how",
    "can't tell",
    "mixed",
    "unclear",
    "don't understand how i feel",
  ];
  const isAmbiguous = ambiguityMarkers.some((marker) =>
    lowerText.includes(marker)
  );

  // Check for long complex text (overloaded emotion)
  const wordCount = text.split(/\s+/).length;
  const isOverloaded = wordCount > 30;

  const scores = {
    calm: 0,
    anger: 0,
    nostalgia: 0,
    joy: 0,
    confusion: 0,
    loneliness: 0,
  };

  // Score by keywords
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    keywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        scores[emotion] += 1;
      }
    });
  });

  // Score by phrases (weighted higher)
  Object.entries(emotionPhrases).forEach(([emotion, phrases]) => {
    phrases.forEach((phrase) => {
      if (lowerText.includes(phrase)) {
        scores[emotion] += 3;
      }
    });
  });

  // Analyze sentence structure
  if (lowerText.includes("?")) scores.confusion += 1;
  if (lowerText.includes("!")) {
    scores.joy += 0.5;
    scores.anger += 0.5;
  }
  if (lowerText.split(" ").length < 3) scores.loneliness += 0.5;

  // Punctuation intensity
  const exclamationCount = (lowerText.match(/!/g) || []).length;
  if (exclamationCount > 1) {
    scores.anger += exclamationCount * 0.5;
    scores.joy += exclamationCount * 0.3;
  }

  // Find dominant emotion
  const sortedEmotions = Object.entries(scores).sort(([, a], [, b]) => b - a);

  let primaryEmotion = sortedEmotions[0][1] > 0 ? sortedEmotions[0][0] : "calm";

  // Override with ambiguity if detected
  if (isAmbiguous) {
    primaryEmotion = "confusion";
    scores.confusion += 5;
  }

  // Calculate intensity (0-1)
  const maxScore = sortedEmotions[0][1];
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const intensity =
    totalScore > 0 ? Math.min(1, maxScore / Math.max(totalScore, 5)) : 0.3;

  // Get secondary emotions for overloaded state
  const secondaryEmotions = sortedEmotions
    .slice(1, 4)
    .filter(([, score]) => score > 0)
    .map(([emotion]) => emotion);

  // Check for extreme intensity
  const isExtreme =
    Math.max(0.3, Math.min(1, intensity)) > 0.8 ||
    exclamationCount > 2 ||
    /!!+/.test(text);

  return {
    primary: primaryEmotion,
    intensity: Math.max(0.3, Math.min(1, intensity)),
    scores: scores,
    raw: text,
    isAmbiguous,
    isOverloaded,
    secondaryEmotions,
    isExtreme,
  };
}

export function getEmotionDescription(emotion) {
  const descriptions = {
    calm: "a soft, tranquil feeling",
    anger: "a burning, intense feeling",
    nostalgia: "a bittersweet memory",
    joy: "a bright, radiant feeling",
    confusion: "an uncertain, wandering thought",
    loneliness: "a quiet, solitary ache",
  };

  return descriptions[emotion] || "a complex feeling";
}
