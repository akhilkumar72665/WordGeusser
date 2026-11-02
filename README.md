# Wordguesser

**A game of secret words.**

Wordguesser is a real-time multiplayer parlour game for two to fifteen players. Everyone hides a word, then probes the ring for letters, reads the pattern, and tries to name a rival's word before their own is uncovered.

The interface is built as a printed game sheet: stone paper, dark green table cards, Carmine accents, Fraunces display type, and Archivo for the working details.

---

## How a round works

1. **Conceal a word.** Every player seals one dictionary word of the table's chosen length.
2. **Ask for a letter.** On your turn, name one letter. Every matching position in your assigned rival's word is revealed; a miss still ends your turn.
3. **Name the word.** Spend a word guess to name any living rival's word. A correct call removes them from the ring and earns points. A wrong call costs a guess and five points.
4. **Stay in your seat.** When a player leaves, the ring closes around them and their hunter is reassigned. The last player standing takes the table.

Secret words stay on the server until the match ends. An eliminated player's word is not exposed to the table.

## The table

| Setting | Options |
| --- | --- |
| Players | 2–15 humans and bots |
| Word length | 3–10 letters |
| Vocabulary | Easy, Medium, Hard, Expert |
| Turn clock | Off, 15, 30, 45, or 60 seconds |
| Word guesses | 3, 5, 7, or unlimited |
| Turn direction | Clockwise, reverse, or random |
| Repeated words | Refused by default |

Bots choose words from the server dictionary, track letter frequencies, narrow their candidate list, and guess when they are confident.

## Run it

Requires Node.js 18 or newer.

```bash
npm run install:all
npm run build:client
npm start --prefix server
```

Open [http://localhost:4000](http://localhost:4000). The server serves the built client, the word API, and the Socket.IO connection from one port.

### Development

```bash
# terminal 1 — API and sockets
npm run server

# terminal 2 — Vite with hot reload
npm run client
```

The development client runs at [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm test --prefix server
npx tsc --noEmit --project server
npm run build --prefix client
```
