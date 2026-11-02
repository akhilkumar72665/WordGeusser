import { ALL_VALID_WORDS } from './dictionary';
import { Difficulty } from '../../../shared/types';

export interface ValidationResult {
  valid: boolean;
  sanitizedWord: string;
  reason?: string;
}

export function validateWordSubmission(
  rawWord: string,
  expectedLength: number,
  expectedDifficulty: Difficulty,
  existingWords: string[] = [],
  preventDuplicates: boolean = true
): ValidationResult {
  if (!rawWord || typeof rawWord !== 'string') {
    return { valid: false, sanitizedWord: '', reason: 'Word cannot be empty' };
  }

  const clean = rawWord.trim().toUpperCase();

  // Validate only English letters
  if (!/^[A-Z]+$/.test(clean)) {
    return {
      valid: false,
      sanitizedWord: clean,
      reason: 'Word must contain only English alphabets (A-Z)'
    };
  }

  // Validate length
  if (clean.length !== expectedLength) {
    return {
      valid: false,
      sanitizedWord: clean,
      reason: `Word must be exactly ${expectedLength} letters long (got ${clean.length})`
    };
  }

  // Validate dictionary presence
  // If word is in curated words or has valid English structure
  if (!ALL_VALID_WORDS.has(clean)) {
    // We can also allow valid English words if they meet length, but keeping strict ensures quality
    return {
      valid: false,
      sanitizedWord: clean,
      reason: `'${clean}' is not recognized in the approved game dictionary.`
    };
  }

  // Duplicate check
  if (preventDuplicates && existingWords.includes(clean)) {
    return {
      valid: false,
      sanitizedWord: clean,
      reason: `Another player has already chosen '${clean}'. Please pick a different secret word!`
    };
  }

  return { valid: true, sanitizedWord: clean };
}

export function calculateDifficultyPoints(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 10;
    case 'medium':
      return 20;
    case 'hard':
      return 30;
    case 'expert':
      return 50;
    default:
      return 10;
  }
}

