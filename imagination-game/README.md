# Imagination Is The Last Currency -- vertical slice

A mobile-first playable prototype of the "Imagination Is The Last Currency" visual adventure/educational game:
Professor Physics goes on vacation, gets kidnapped, gets trained on how AI actually works, gets shrunk into Atom,
and is dropped inside a corrupted AI called Brainco -- represented as a world map of islands. Two of those islands
are fully playable boards; the rest are on the map but not yet built (see Roadmap below).

## Structure

`WORLD MAP -> ENTER REGION -> PLAY BOARD -> LAB BOSS -> WORLD MAP`

- **World Map** -- the islands from the hand-drawn reference map. Tap a playable island to enter it.
- **Region Board** -- each region is its own small node network, not one long path. Draw a Signal Card (`MOVE 1-4`
  or a special card like `👁️ AWARENESS` / `🔀 BRANCH`) to travel. Landing on a node triggers an encounter:
  - 💻 **Terminal** -- build a prompt from GOAL / CONTEXT / INSTRUCTIONS / CONSTRAINTS / OUTPUT chips; the world
    reacts to how complete it was.
  - 👁️ **Awareness** -- a confidently wrong AI claim. TRUST or VERIFY.
  - 🐍 **Snake Oil** / ⚠️ **Corruption** -- spot the manipulative claim among a few plausible ones.
  - 🧠 **Think** -- solved without AI, on purpose (including a "Madness Matters" node where the right move is to
    reject the four given options).
  - 🟡 **Signal** -- a five-to-twenty-second beat: a fact, a micro-choice, a bit of flavor.
  - 🔀 **Branch** -- Fast Path (skip ahead, less reward) vs Awareness Path (more reward) vs Imagination Path (`???`).
  - 🚪 **Lab Room** -- the region's boss. Completing it unlocks that region's stat bonus and returns you to the map.
- Four persistent stats double as the "currency": 🧠 Thinking, 🎯 Prompting, 🛡️ Awareness, ✨ Imagination.

## What's playable in this slice

- **Etherville** -- "AI isn't magic." Full board: Terminal Go-Kart, a prompt-space micro-challenge, a no-AI
  context puzzle, a hallucinating tour-guide robot, a branch, a computer factory, and an obstacle-course boss.
- **Eyelandia** -- "The AI is examining you too." Full board following the supplied map: an AI-terminal door
  puzzle, yellow signal spaces, eyeball/awareness spaces (including Brainco predicting your choice before you make
  it), a branch, a Madness Matters node, and a Lab Room boss where you have to do something Brainco didn't predict.

## Roadmap (not built in this slice)

- Trippy Island Away / Crystal Cove are currently the pre-board story opening, not their own playable boards.
- Wild Child Island (21+) is shown locked/restricted on the map, per the design doc.
- Family of Neural Networks, Eternity Portal, Memory Lane, Dopamine Machine, and Lava Shake Hills are visible on
  the world map as "not yet charted" -- their boards, story beats, and the final Eternity Portal ending choice
  (Destroy / Obey / Merge / Liberate / Question / Create Something Else) aren't implemented yet.
- Also not implemented: daily replayability signals, the secret classified-file collectibles, the Thinker Profile
  archetypes, board corruption/glitch effects over time, and cinematic camera states -- these belong to the full
  design, not this slice.

## Running it

```bash
npm install
npm run dev
```

Portrait/mobile-first; also runs fine in a desktop browser window. No API keys, no backend -- everything (the
prompt "battles," the hallucination checks, the manipulative-claim spotting) is resolved locally with authored
content and simple heuristics, not a live AI call.
