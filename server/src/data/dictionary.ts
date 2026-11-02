import { Difficulty } from '../../../shared/types';
import { ALL_CATEGORY_WORDS } from './categoriesData';

// Curated words classified by length and difficulty
export interface WordEntry {
  word: string;
  length: number;
  difficulty: Difficulty;
  hint?: string;
}

export const CURATED_WORDS: WordEntry[] = [
  // 3 Letters - Easy
  { word: 'CAT', length: 3, difficulty: 'easy' },
  { word: 'DOG', length: 3, difficulty: 'easy' },
  { word: 'SUN', length: 3, difficulty: 'easy' },
  { word: 'HAT', length: 3, difficulty: 'easy' },
  { word: 'CUP', length: 3, difficulty: 'easy' },
  { word: 'PEN', length: 3, difficulty: 'easy' },
  { word: 'BOX', length: 3, difficulty: 'easy' },
  { word: 'BUS', length: 3, difficulty: 'easy' },
  { word: 'CAR', length: 3, difficulty: 'easy' },
  { word: 'SKY', length: 3, difficulty: 'easy' },
  // 3 Letters - Medium
  { word: 'FOX', length: 3, difficulty: 'medium' },
  { word: 'OWL', length: 3, difficulty: 'medium' },
  { word: 'GEM', length: 3, difficulty: 'medium' },
  { word: 'WEB', length: 3, difficulty: 'medium' },
  { word: 'OAK', length: 3, difficulty: 'medium' },
  { word: 'ICE', length: 3, difficulty: 'medium' },
  { word: 'NUT', length: 3, difficulty: 'medium' },
  // 3 Letters - Hard/Expert
  { word: 'SPY', length: 3, difficulty: 'hard' },
  { word: 'JOY', length: 3, difficulty: 'hard' },
  { word: 'ZOO', length: 3, difficulty: 'hard' },
  { word: 'RYE', length: 3, difficulty: 'expert' },
  { word: 'AXE', length: 3, difficulty: 'expert' },

  // 4 Letters - Easy
  { word: 'BOOK', length: 4, difficulty: 'easy' },
  { word: 'FISH', length: 4, difficulty: 'easy' },
  { word: 'TREE', length: 4, difficulty: 'easy' },
  { word: 'STAR', length: 4, difficulty: 'easy' },
  { word: 'MOON', length: 4, difficulty: 'easy' },
  { word: 'BIRD', length: 4, difficulty: 'easy' },
  { word: 'DOOR', length: 4, difficulty: 'easy' },
  { word: 'LION', length: 4, difficulty: 'easy' },
  { word: 'BEAR', length: 4, difficulty: 'easy' },
  { word: 'WIND', length: 4, difficulty: 'easy' },
  { word: 'RAIN', length: 4, difficulty: 'easy' },
  { word: 'FIRE', length: 4, difficulty: 'easy' },
  { word: 'BLUE', length: 4, difficulty: 'easy' },
  { word: 'GOLD', length: 4, difficulty: 'easy' },
  // 4 Letters - Medium
  { word: 'FROG', length: 4, difficulty: 'medium' },
  { word: 'SHIP', length: 4, difficulty: 'medium' },
  { word: 'RING', length: 4, difficulty: 'medium' },
  { word: 'KITE', length: 4, difficulty: 'medium' },
  { word: 'WOLF', length: 4, difficulty: 'medium' },
  { word: 'PEAK', length: 4, difficulty: 'medium' },
  { word: 'NEST', length: 4, difficulty: 'medium' },
  { word: 'COIN', length: 4, difficulty: 'medium' },
  { word: 'CAMP', length: 4, difficulty: 'medium' },
  { word: 'DESK', length: 4, difficulty: 'medium' },
  // 4 Letters - Hard
  { word: 'ECHO', length: 4, difficulty: 'hard' },
  { word: 'MAZE', length: 4, difficulty: 'hard' },
  { word: 'JAZZ', length: 4, difficulty: 'hard' },
  { word: 'LYNX', length: 4, difficulty: 'hard' },
  { word: 'QUIZ', length: 4, difficulty: 'hard' },
  { word: 'MYTH', length: 4, difficulty: 'hard' },
  { word: 'SWAN', length: 4, difficulty: 'hard' },
  // 4 Letters - Expert
  { word: 'ONYX', length: 4, difficulty: 'expert' },
  { word: 'GLYPH', length: 5, difficulty: 'expert' },
  { word: 'ZINC', length: 4, difficulty: 'expert' },
  { word: 'FLUX', length: 4, difficulty: 'expert' },

  // 5 Letters - Easy
  { word: 'APPLE', length: 5, difficulty: 'easy' },
  { word: 'CHAIR', length: 5, difficulty: 'easy' },
  { word: 'HOUSE', length: 5, difficulty: 'easy' },
  { word: 'WATER', length: 5, difficulty: 'easy' },
  { word: 'MUSIC', length: 5, difficulty: 'easy' },
  { word: 'PLANT', length: 5, difficulty: 'easy' },
  { word: 'TABLE', length: 5, difficulty: 'easy' },
  { word: 'CLOCK', length: 5, difficulty: 'easy' },
  { word: 'SMILE', length: 5, difficulty: 'easy' },
  { word: 'CLOUD', length: 5, difficulty: 'easy' },
  { word: 'OCEAN', length: 5, difficulty: 'easy' },
  { word: 'TIGER', length: 5, difficulty: 'easy' },
  { word: 'HORSE', length: 5, difficulty: 'easy' },
  { word: 'RIVER', length: 5, difficulty: 'easy' },
  { word: 'DREAM', length: 5, difficulty: 'easy' },
  { word: 'HEART', length: 5, difficulty: 'easy' },
  { word: 'LIGHT', length: 5, difficulty: 'easy' },
  { word: 'STONE', length: 5, difficulty: 'easy' },
  { word: 'SUGAR', length: 5, difficulty: 'easy' },
  { word: 'BREAD', length: 5, difficulty: 'easy' },
  // 5 Letters - Medium
  { word: 'FLAME', length: 5, difficulty: 'medium' },
  { word: 'SWORD', length: 5, difficulty: 'medium' },
  { word: 'GHOST', length: 5, difficulty: 'medium' },
  { word: 'CROWN', length: 5, difficulty: 'medium' },
  { word: 'TRAIN', length: 5, difficulty: 'medium' },
  { word: 'BRAIN', length: 5, difficulty: 'medium' },
  { word: 'SPACE', length: 5, difficulty: 'medium' },
  { word: 'STORM', length: 5, difficulty: 'medium' },
  { word: 'BEACH', length: 5, difficulty: 'medium' },
  { word: 'MAGIC', length: 5, difficulty: 'medium' },
  { word: 'PEACH', length: 5, difficulty: 'medium' },
  { word: 'PILOT', length: 5, difficulty: 'medium' },
  { word: 'RADAR', length: 5, difficulty: 'medium' },
  // 5 Letters - Hard
  { word: 'FROST', length: 5, difficulty: 'hard' },
  { word: 'PRISM', length: 5, difficulty: 'hard' },
  { word: 'CHESS', length: 5, difficulty: 'hard' },
  { word: 'SPIDER', length: 6, difficulty: 'easy' },
  { word: 'KNIGHT', length: 6, difficulty: 'medium' },
  { word: 'VORTEX', length: 6, difficulty: 'hard' },
  { word: 'ZEBRA', length: 5, difficulty: 'hard' },
  { word: 'CRYPTS', length: 6, difficulty: 'expert' },
  { word: 'QUARTZ', length: 6, difficulty: 'expert' },
  { word: 'PIXEL', length: 5, difficulty: 'hard' },
  { word: 'OXYGEN', length: 6, difficulty: 'hard' },
  { word: 'SPHINX', length: 6, difficulty: 'expert' },
  // 5 Letters - Expert
  { word: 'CRYPT', length: 5, difficulty: 'expert' },
  { word: 'FJORD', length: 5, difficulty: 'expert' },
  { word: 'NYMPH', length: 5, difficulty: 'expert' },
  { word: 'WALTZ', length: 5, difficulty: 'expert' },
  { word: 'KAYAK', length: 5, difficulty: 'expert' },
  { word: 'TOPAZ', length: 5, difficulty: 'expert' },

  // 6 Letters - Easy
  { word: 'MONKEY', length: 6, difficulty: 'easy' },
  { word: 'ORANGE', length: 6, difficulty: 'easy' },
  { word: 'BANANA', length: 6, difficulty: 'easy' },
  { word: 'CASTLE', length: 6, difficulty: 'easy' },
  { word: 'DOCTOR', length: 6, difficulty: 'easy' },
  { word: 'FOREST', length: 6, difficulty: 'easy' },
  { word: 'GARDEN', length: 6, difficulty: 'easy' },
  { word: 'PLANET', length: 6, difficulty: 'easy' },
  { word: 'SCHOOL', length: 6, difficulty: 'easy' },
  { word: 'SPRING', length: 6, difficulty: 'easy' },
  { word: 'SUMMER', length: 6, difficulty: 'easy' },
  { word: 'WINTER', length: 6, difficulty: 'easy' },
  { word: 'YELLOW', length: 6, difficulty: 'easy' },
  { word: 'WINDOW', length: 6, difficulty: 'easy' },
  // 6 Letters - Medium
  { word: 'BRIDGE', length: 6, difficulty: 'medium' },
  { word: 'DRAGON', length: 6, difficulty: 'medium' },
  { word: 'ENGINE', length: 6, difficulty: 'medium' },
  { word: 'FLIGHT', length: 6, difficulty: 'medium' },
  { word: 'ISLAND', length: 6, difficulty: 'medium' },
  { word: 'JUNGLE', length: 6, difficulty: 'medium' },
  { word: 'MARKET', length: 6, difficulty: 'medium' },
  { word: 'PALACE', length: 6, difficulty: 'medium' },
  { word: 'ROCKET', length: 6, difficulty: 'medium' },
  { word: 'SILVER', length: 6, difficulty: 'medium' },
  { word: 'TEMPLE', length: 6, difficulty: 'medium' },
  { word: 'VALLEY', length: 6, difficulty: 'medium' },
  { word: 'WIZARD', length: 6, difficulty: 'medium' },
  // 6 Letters - Hard/Expert
  { word: 'BREEZE', length: 6, difficulty: 'hard' },
  { word: 'CANYON', length: 6, difficulty: 'hard' },
  { word: 'FALCON', length: 6, difficulty: 'hard' },
  { word: 'GLIDER', length: 6, difficulty: 'hard' },
  { word: 'HARBOR', length: 6, difficulty: 'hard' },
  { word: 'MYSTIC', length: 6, difficulty: 'hard' },
  { word: 'QUENCH', length: 6, difficulty: 'hard' },
  { word: 'SHADOW', length: 6, difficulty: 'hard' },
  { word: 'RHYTHM', length: 6, difficulty: 'expert' },
  { word: 'ZEPHYR', length: 6, difficulty: 'expert' },
  { word: 'GIZMOS', length: 6, difficulty: 'expert' },
  { word: 'PSYCHE', length: 6, difficulty: 'expert' },

  // 7 Letters - Easy
  { word: 'AIRPORT', length: 7, difficulty: 'easy' },
  { word: 'BALLOON', length: 7, difficulty: 'easy' },
  { word: 'BLANKET', length: 7, difficulty: 'easy' },
  { word: 'DOLPHIN', length: 7, difficulty: 'easy' },
  { word: 'KITCHEN', length: 7, difficulty: 'easy' },
  { word: 'MORNING', length: 7, difficulty: 'easy' },
  { word: 'PICTURE', length: 7, difficulty: 'easy' },
  { word: 'RAINBOW', length: 7, difficulty: 'easy' },
  { word: 'SUNSHINE', length: 8, difficulty: 'easy' },
  { word: 'VILLAGE', length: 7, difficulty: 'easy' },
  // 7 Letters - Medium
  { word: 'COMPASS', length: 7, difficulty: 'medium' },
  { word: 'CRYSTAL', length: 7, difficulty: 'medium' },
  { word: 'DIAMOND', length: 7, difficulty: 'medium' },
  { word: 'FEATHER', length: 7, difficulty: 'medium' },
  { word: 'JOURNEY', length: 7, difficulty: 'medium' },
  { word: 'LANTERN', length: 7, difficulty: 'medium' },
  { word: 'MONSTER', length: 7, difficulty: 'medium' },
  { word: 'MYSTERY', length: 7, difficulty: 'medium' },
  { word: 'PENGUIN', length: 7, difficulty: 'medium' },
  { word: 'PYRAMID', length: 7, difficulty: 'medium' },
  { word: 'THUNDER', length: 7, difficulty: 'medium' },
  { word: 'VOLCANO', length: 7, difficulty: 'medium' },
  { word: 'WARRIOR', length: 7, difficulty: 'medium' },
  // 7 Letters - Hard / Expert
  { word: 'BLIZZARD', length: 8, difficulty: 'hard' },
  { word: 'ECLIPSE', length: 7, difficulty: 'hard' },
  { word: 'FANTASY', length: 7, difficulty: 'hard' },
  { word: 'GLACIER', length: 7, difficulty: 'hard' },
  { word: 'HORIZON', length: 7, difficulty: 'hard' },
  { word: 'ILLUSION', length: 8, difficulty: 'hard' },
  { word: 'MIRACLE', length: 7, difficulty: 'hard' },
  { word: 'PHANTOM', length: 7, difficulty: 'hard' },
  { word: 'TSUNAMI', length: 7, difficulty: 'hard' },
  { word: 'WHISPER', length: 7, difficulty: 'hard' },
  { word: 'CYCLONE', length: 7, difficulty: 'expert' },
  { word: 'PARADOX', length: 7, difficulty: 'expert' },
  { word: 'SYMPHONY', length: 8, difficulty: 'expert' },

  // 8 Letters - Easy / Medium
  { word: 'ELEPHANT', length: 8, difficulty: 'easy' },
  { word: 'FOOTBALL', length: 8, difficulty: 'easy' },
  { word: 'HOSPITAL', length: 8, difficulty: 'easy' },
  { word: 'MOUNTAIN', length: 8, difficulty: 'easy' },
  { word: 'SANDWICH', length: 8, difficulty: 'easy' },
  { word: 'VACATION', length: 8, difficulty: 'easy' },
  { word: 'CHAMPION', length: 8, difficulty: 'medium' },
  { word: 'COMPUTER', length: 8, difficulty: 'medium' },
  { word: 'DINOSAUR', length: 8, difficulty: 'medium' },
  { word: 'EXPLORER', length: 8, difficulty: 'medium' },
  { word: 'FIREWORK', length: 8, difficulty: 'medium' },
  { word: 'KANGAROO', length: 8, difficulty: 'medium' },
  { word: 'NOTEBOOK', length: 8, difficulty: 'medium' },
  { word: 'TREASURE', length: 8, difficulty: 'medium' },
  { word: 'UNIVERSE', length: 8, difficulty: 'medium' },
  // 8 Letters - Hard / Expert
  { word: 'AQUARIUM', length: 8, difficulty: 'hard' },
  { word: 'DOMINOES', length: 8, difficulty: 'hard' },
  { word: 'FORTRESS', length: 8, difficulty: 'hard' },
  { word: 'LABYRINTH', length: 9, difficulty: 'expert' },
  { word: 'PLATINUM', length: 8, difficulty: 'hard' },
  { word: 'SATELLITE', length: 9, difficulty: 'medium' },
  { word: 'WILDLIFE', length: 8, difficulty: 'hard' },
  { word: 'CATALYST', length: 8, difficulty: 'expert' },
  { word: 'OBSIDIAN', length: 8, difficulty: 'expert' },
  { word: 'SYNTHESIS', length: 9, difficulty: 'expert' },

  // 9 Letters - Easy / Medium
  { word: 'ASTRONAUT', length: 9, difficulty: 'easy' },
  { word: 'CHOCOLATE', length: 9, difficulty: 'easy' },
  { word: 'CROCODILE', length: 9, difficulty: 'easy' },
  { word: 'PINEAPPLE', length: 9, difficulty: 'easy' },
  { word: 'TELESCOPE', length: 9, difficulty: 'medium' },
  { word: 'ADVENTURE', length: 9, difficulty: 'medium' },
  { word: 'BUTTERFLY', length: 9, difficulty: 'medium' },
  { word: 'FIREFLIES', length: 9, difficulty: 'medium' },
  { word: 'LIGHTNING', length: 9, difficulty: 'medium' },
  { word: 'MILLENNIUM', length: 10, difficulty: 'expert' },
  { word: 'SPACESHIP', length: 9, difficulty: 'medium' },
  { word: 'WONDERLAND', length: 10, difficulty: 'medium' },
  // 9 Letters - Hard / Expert
  { word: 'ALCHEMIST', length: 9, difficulty: 'hard' },
  { word: 'BLIZZARDS', length: 9, difficulty: 'hard' },
  { word: 'CHAMELEON', length: 9, difficulty: 'hard' },
  { word: 'DRAGONFLY', length: 9, difficulty: 'hard' },
  { word: 'EVERGREEN', length: 9, difficulty: 'hard' },
  { word: 'HYPNOTISM', length: 9, difficulty: 'expert' },
  { word: 'LABYRINTH', length: 9, difficulty: 'expert' },
  { word: 'QUICKSAND', length: 9, difficulty: 'expert' },

  // 10 Letters - Easy / Medium
  { word: 'BASKETBALL', length: 10, difficulty: 'easy' },
  { word: 'BLACKBERRY', length: 10, difficulty: 'easy' },
  { word: 'HELICOPTER', length: 10, difficulty: 'easy' },
  { word: 'STRAWBERRY', length: 10, difficulty: 'easy' },
  { word: 'WATERMELON', length: 10, difficulty: 'easy' },
  { word: 'CALCULATOR', length: 10, difficulty: 'medium' },
  { word: 'PLAYGROUND', length: 10, difficulty: 'medium' },
  { word: 'RESTAURANT', length: 10, difficulty: 'medium' },
  { word: 'SKYSCRAPER', length: 10, difficulty: 'medium' },
  { word: 'SUPERHEROES', length: 11, difficulty: 'medium' },
  // 10 Letters - Hard / Expert
  { word: 'APOCALYPSE', length: 10, difficulty: 'hard' },
  { word: 'AVALANCHES', length: 10, difficulty: 'hard' },
  { word: 'CATASTROPHE', length: 11, difficulty: 'hard' },
  { word: 'EXODUS', length: 6, difficulty: 'hard' },
  { word: 'KALEIDOSCOPE', length: 12, difficulty: 'expert' },
  { word: 'METEORITES', length: 10, difficulty: 'hard' },
  { word: 'MYTHOLOGY', length: 9, difficulty: 'hard' },
  { word: 'WILDERNESS', length: 10, difficulty: 'hard' },
  { word: 'ATMOSPHERE', length: 10, difficulty: 'hard' },
  { word: 'HIEROGLYPH', length: 10, difficulty: 'expert' },
  { word: 'XENOPHOBIA', length: 10, difficulty: 'expert' }
];

// Build Fast Lookup Sets
export const ALL_VALID_WORDS = new Set<string>();

// 1. Add curated words
CURATED_WORDS.forEach((item) => {
  ALL_VALID_WORDS.add(item.word.toUpperCase());
});

// 2. Add all categories (Geography, Bollywood, Cricket, Food, Pop Culture, Tech, Mythology, Hinglish, etc.)
ALL_CATEGORY_WORDS.forEach((word) => {
  ALL_VALID_WORDS.add(word);
});

// 3. Add full 274,000+ English dictionary
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fullDictionary = require('an-array-of-english-words') as string[];
  if (Array.isArray(fullDictionary)) {
    for (let i = 0; i < fullDictionary.length; i++) {
      const w = fullDictionary[i];
      if (w.length >= 3 && w.length <= 10 && /^[a-zA-Z]+$/.test(w)) {
        ALL_VALID_WORDS.add(w.toUpperCase());
      }
    }
  }
} catch (err) {
  console.warn('[Dictionary] Full dictionary fallback:', err);
}

/**
 * Filter words by matching length and difficulty, or fallback to any matching length.
 */
export function getWordsByConfig(length: number, difficulty: Difficulty): WordEntry[] {
  let matches = CURATED_WORDS.filter(
    (w) => w.word.length === length && w.difficulty === difficulty
  );
  if (matches.length === 0) {
    // Fallback to same length any difficulty
    matches = CURATED_WORDS.filter((w) => w.word.length === length);
  }
  return matches;
}

export function getRandomWordByConfig(length: number, difficulty: Difficulty): string {
  const matches = getWordsByConfig(length, difficulty);
  if (matches.length > 0) {
    const randomIndex = Math.floor(Math.random() * matches.length);
    return matches[randomIndex].word;
  }

  // Every supported length has words in the curated list. If that ever
  // changes, fall back to any correctly-sized word rather than a fixed
  // five-letter word that would be invalid at another table length.
  const anyLength = CURATED_WORDS.filter((w) => w.word.length === length);
  if (anyLength.length > 0) {
    return anyLength[Math.floor(Math.random() * anyLength.length)].word;
  }
  return 'GAMES';
}
