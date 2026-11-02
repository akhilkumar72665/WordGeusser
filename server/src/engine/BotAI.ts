import { CURATED_WORDS, getRandomWordByConfig } from '../data/dictionary';
import { Difficulty, PlayerPublicState } from '../../../shared/types';

export interface BotDecision {
  type: 'ASK_LETTER' | 'GUESS_WORD';
  targetId: string;
  payload: string; // letter or word
}

const LETTER_FREQUENCY_ORDER = [
  'E', 'A', 'R', 'I', 'O', 'T', 'N', 'S', 'L', 'C',
  'U', 'D', 'P', 'M', 'H', 'G', 'B', 'F', 'Y', 'W',
  'K', 'V', 'X', 'Z', 'J', 'Q'
];

export class BotAI {
  public static selectSecretWord(length: number, difficulty: Difficulty, existingWords: string[]): string {
    let word = getRandomWordByConfig(length, difficulty);
    // If duplicate, attempt a few times
    let attempts = 0;
    while (existingWords.includes(word) && attempts < 10) {
      word = getRandomWordByConfig(length, difficulty);
      attempts++;
    }
    return word;
  }

  public static decideAction(
    botPlayerId: string,
    target: PlayerPublicState,
    difficulty: Difficulty,
    wordLength: number
  ): BotDecision {
    const pattern = target.knownPattern;
    const testedLetters = target.testedLetters || {};

    // 1. Find all candidate words in dictionary matching known pattern and not containing absent letters
    const candidates = CURATED_WORDS.filter((entry) => {
      if (entry.length !== wordLength) return false;
      const w = entry.word.toUpperCase();

      // Check known positions
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] !== '_' && pattern[i] !== w[i]) {
          return false;
        }
      }

      // Check tested letters
      for (const [letter, isPresent] of Object.entries(testedLetters)) {
        if (isPresent && !w.includes(letter)) return false;
        if (!isPresent && w.includes(letter)) return false;
      }

      return true;
    });

    // Count how many letters in pattern are known
    const knownCount = pattern.filter((c) => c !== '_').length;
    const isMostlyKnown = knownCount >= Math.ceil(wordLength * 0.6);

    // If only 1 candidate left, or if > 60% known and candidate count is <= 2
    if (candidates.length === 1 || (isMostlyKnown && candidates.length <= 2 && candidates.length > 0)) {
      const chosenWord = candidates[0].word;
      return {
        type: 'GUESS_WORD',
        targetId: target.id,
        payload: chosenWord
      };
    }

    // 2. Otherwise, find the best unasked letter to ask
    // Calculate frequency of unasked letters among surviving candidates
    const freqMap: Record<string, number> = {};
    candidates.forEach((c) => {
      const uniqueLetters = new Set(c.word.split(''));
      uniqueLetters.forEach((char) => {
        if (testedLetters[char] === undefined) {
          freqMap[char] = (freqMap[char] || 0) + 1;
        }
      });
    });

    // Find best letter
    let bestLetter = '';
    let maxFreq = -1;

    for (const [char, count] of Object.entries(freqMap)) {
      if (count > maxFreq) {
        maxFreq = count;
        bestLetter = char;
      }
    }

    // Fallback to standard frequency if candidates were empty or all tested
    if (!bestLetter) {
      for (const char of LETTER_FREQUENCY_ORDER) {
        if (testedLetters[char] === undefined) {
          bestLetter = char;
          break;
        }
      }
    }

    return {
      type: 'ASK_LETTER',
      targetId: target.id,
      payload: bestLetter || 'E'
    };
  }
}

