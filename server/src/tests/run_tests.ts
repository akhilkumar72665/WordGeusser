import { Room } from '../engine/Room';
import { validateWordSubmission } from '../data/validator';
import { CURATED_WORDS, getRandomWordByConfig } from '../data/dictionary';
import { BotAI } from '../engine/BotAI';

console.log('Starting automated test suite for Wordguesser...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

// 1. Dictionary & Word Selection Test
console.log('--- 1. Dictionary & Validator Tests ---');
const sampleWord = getRandomWordByConfig(5, 'medium');
assert(sampleWord.length === 5, `Random 5-letter medium word has length 5 (got '${sampleWord}')`);

const validCheck = validateWordSubmission('APPLE', 5, 'easy', [], true);
assert(validCheck.valid === true, "validateWordSubmission approves valid word 'APPLE'");

const invalidLen = validateWordSubmission('APPLES', 5, 'easy', [], true);
assert(invalidLen.valid === false, 'validateWordSubmission rejects incorrect length');

const invalidChars = validateWordSubmission('CAT12', 5, 'easy', [], true);
assert(invalidChars.valid === false, 'validateWordSubmission rejects non-alphabetic chars');

const duplicateCheck = validateWordSubmission('APPLE', 5, 'easy', ['APPLE'], true);
assert(duplicateCheck.valid === false, 'validateWordSubmission enforces duplicate word prevention');

// 2. Room & Ring Topology Test
console.log('\n--- 2. Room & Ring Topology Tests ---');
let roomStateUpdateCount = 0;
const room = new Room('TEST01', 'p1', 'Alice', (state) => {
  roomStateUpdateCount++;
});

assert(room.players.size === 1, 'Room initializes with Host (Alice)');

room.addPlayer('p2', 'Bob');
room.addPlayer('p3', 'Charlie');
room.addPlayer('p4', 'Diana');

assert(room.players.size === 4, '4 players successfully added to room');

// Start Game
const startRes = room.startGame();
assert(startRes.success, 'Host starts game successfully');
assert(room.phase === 'WORD_SELECTION', 'Game enters WORD_SELECTION phase');

// Submit secret words
room.submitSecretWord('p1', 'APPLE');
room.submitSecretWord('p2', 'BEACH');
room.submitSecretWord('p3', 'CHAIR');
room.submitSecretWord('p4', 'DOG'); // Should fail length check (3 letters vs 5)
assert(room.players.get('p4')?.hasSubmittedWord === false, 'P4 invalid word length rejected');

room.submitSecretWord('p4', 'DREAM'); // Valid 5 letter word
// Now all submitted
assert(room.phase === 'IN_GAME', 'Phase transitioned to IN_GAME after all valid submissions');

// Verify Ring Topology: 1-to-1 target assignment
const p1 = room.players.get('p1')!;
const p2 = room.players.get('p2')!;
const p3 = room.players.get('p3')!;
const p4 = room.players.get('p4')!;

const targets = [p1.assignedTargetId, p2.assignedTargetId, p3.assignedTargetId, p4.assignedTargetId];
const uniqueTargets = new Set(targets);

assert(uniqueTargets.size === 4, 'Every player has a distinct target (no two share same target)');
assert(!targets.includes(''), 'No player has an unassigned target');
for (const p of [p1, p2, p3, p4]) {
  assert(p.assignedTargetId !== p.id, `${p.name} is not targeting themselves`);
}

// 3. Gameplay Mechanics: Letter Asking & Position Reveal
console.log('\n--- 3. Gameplay Mechanics: Letter Asking & Elimination ---');
// Let p1 ask their target
const p1Target = room.players.get(p1.assignedTargetId)!;
const targetSecret = p1Target.secretWord;
const letterInSecret = targetSecret[0]; // First letter is guaranteed present

const askRes = room.askLetter('p1', p1Target.id, letterInSecret);
assert(askRes.success, `p1 asks letter '${letterInSecret}' from target ${p1Target.name}`);
assert(p1Target.knownPattern[0] === letterInSecret, `Pattern revealed letter at position 0`);
assert(p1Target.testedLetters[letterInSecret] === true, `testedLetters recorded '${letterInSecret}' as true`);

// Elimination & Ring Auto-Reassignment
console.log('\n--- 4. Elimination & Ring Auto-Reassignment Tests ---');
const prevTargetOfTarget = p1Target.assignedTargetId;

// Next turns till someone guesses target's full word
// Force p1's turn for testing guessWord
room.activePlayerIndex = room.turnPlayerOrder.indexOf('p1');
const guessRes = room.guessWord('p1', p1Target.id, targetSecret);
assert(guessRes.success, `p1 guesses exact word '${targetSecret}' for ${p1Target.name}`);
assert(p1Target.isAlive === false, `${p1Target.name} is eliminated`);
assert(p1.score >= 20, `p1 awarded points for elimination (score: ${p1.score})`);

// Verify Auto-Reassignment
assert(p1.assignedTargetId === prevTargetOfTarget, `p1 automatically reassigned to ${p1Target.name}'s former target`);

// 5. Bot AI Test
console.log('\n--- 5. Bot AI Heuristic Tests ---');
const dummyTarget = {
  id: 'test_human',
  name: 'Human',
  isHost: false,
  isBot: false,
  isAlive: true,
  score: 0,
  remainingGuesses: 5,
  assignedTargetId: 'bot_1',
  hasSubmittedWord: true,
  wordLength: 5,
  knownPattern: ['C', 'A', '_', '_', 'E'],
  testedLetters: { 'C': true, 'A': true, 'E': true, 'Z': false }
};

const botAction = BotAI.decideAction('bot_1', dummyTarget, 'medium', 5);
assert(botAction.type === 'ASK_LETTER' || botAction.type === 'GUESS_WORD', 'Bot AI returned a valid decision');
console.log(`  🤖 Bot decided: ${botAction.type} -> ${botAction.payload}`);

// 6. Departure & Rematch Cleanup Tests
console.log('\n--- 6. Departure & Rematch Cleanup Tests ---');
room.restartGame();
assert(room.phase === 'LOBBY', 'Rematch returns the room to the lobby');
assert(p1Target.isAlive === true, 'Rematch restores eliminated players');
assert(p1Target.eliminatedBy === undefined, 'Rematch clears elimination attribution');

const leaveRoom = new Room('LEAVE1', 'a1', 'Ada', () => {});
leaveRoom.addPlayer('a2', 'Blaise');
leaveRoom.addPlayer('a3', 'Cora');
leaveRoom.startGame();
leaveRoom.submitSecretWord('a1', 'APPLE');
leaveRoom.submitSecretWord('a2', 'BEACH');
leaveRoom.submitSecretWord('a3', 'CHAIR');
assert(leaveRoom.phase === 'IN_GAME', 'Leave test room reaches IN_GAME');
assert(leaveRoom.turnPlayerOrder[leaveRoom.activePlayerIndex] === 'a1', 'Ada starts with the turn');

leaveRoom.removePlayer('a1');
const nextActiveId = leaveRoom.turnPlayerOrder[leaveRoom.activePlayerIndex];
assert(leaveRoom.phase === 'IN_GAME', 'Game continues after the active player leaves');
assert(nextActiveId !== 'a1' && nextActiveId !== '', 'Turn advances past the departed active player');
assert(leaveRoom.players.get(nextActiveId)?.isAlive === true, 'The advanced turn belongs to a living player');
assert(leaveRoom.hostId === 'a2', 'Host duty passes to the next seated player');
leaveRoom.restartGame();

console.log(`\n========================================`);
console.log(`Summary: ${passedTests}/${totalTests} tests passed.`);
console.log(`========================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}

