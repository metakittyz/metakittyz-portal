# Eternal Ruler

> A guided path for opening and strengthening the connection with your higher self.
> One step a day, forty-two days. 18+. A self-experiment, not therapy.

Most apps in this space hand you twelve tools and a blank screen and wish you luck. This one gives
you exactly one thing to do, every single day, and it never leaves you wondering what comes next.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:5174
```

```bash
npm run build        # static bundle in dist/
npm run preview
```

No API keys, no accounts, no server. `dist/` drops onto Vercel, Netlify, GitHub Pages, or any
static host.

**Deployment note:** microphone capture needs a secure context — it works on `localhost` and on any
`https://` host. Over plain `http://` the Voice Room correctly reports that recording is unavailable.

---

## The design principle: one thing at a time

**Day one shows a single nav item: `Path`.** That's not a limitation, it's the product. The rooms
open as the path reaches them:

| Step | Opens |
| --- | --- |
| Day 2 | The Journal |
| Day 4 | The Reading |
| Day 7 | The Voice Room |
| Day 10 | Intake |
| Day 12 | The Forge |
| Day 18 | The Council |

By day 18 you have everything, and you know what each room is *for*, because you were taught it on
the day you needed it. Anyone who'd rather have it all immediately can flip one switch — in the map
or in Settings — and the path itself is unchanged.

**The path moves when you do, not when the calendar does.** Position is held by steps completed,
never by dates. Miss a month and you resume on exactly the step you stopped on. There is no such
thing as falling behind, no broken streak, no guilt mechanic.

---

## The path

Forty-two steps in five stages, then a self-directed weekly rhythm forever after.

| Stage | Days | What it does |
| --- | --- | --- |
| **I · The Opening** | 1–6 | Make contact. Build the habit. Prove something is on the other end. |
| **II · The Listening** | 7–15 | Learn to tell guidance from noise — the skill everything else depends on. |
| **III · The Reckoning** | 16–25 | Look at what you've been avoiding. The hardest stage, and the one that changes people. |
| **IV · The Forging** | 26–35 | Turn what you want into something with a date on it. |
| **V · Sovereignty** | 36–42 | Make it yours. You stop following the path and start setting it. |

Each step is a single card: why it matters, three to four numbered instructions, a guided timer if
one applies, a journal prompt if one applies, and one button — **I did this**. Finishing a step
shows what it unlocked and what's next, then gets out of your way.

After day 42 the path becomes **The Practice** — an eight-step rotating rhythm (Reach, Read, Move,
Feed, Look, Build, Speak, Rest) that repeats indefinitely. The unglamorous maintenance version is the one
that lasts.

---

## "I need something now"

A button in the header on every screen. Tap it, say what's wrong in plain language — *I'm
spiralling · I'm afraid of the next thing · I can't focus · I'm flat · I feel disconnected · Is this
real guidance? · I'm too open · I can't come down* — and you're inside the guided timer in one more
tap. No browsing, no filtering, no reading first.

Fourteen protocols back it, each with before/after state ratings so that over weeks you learn which
ones actually work **for you** rather than which ones sound good.

---

## The Hot & Cold reading

The signature mechanic. Two numbers per domain:

- **self** (0–100) — how you feel about it right now
- **higher** (0–100) — how you believe your higher self feels about it

The gap is the instrument:

| Gap | Verdict | Meaning |
| --- | --- | --- |
| ≥ +25 | **A Calling** | Your higher self runs hotter here. An invitation, not a reprimand. |
| ≤ −25 | **Overreach** | You run hotter than your higher self. Often want rather than purpose. |
| Both ≥ 60, close | **Strength** | A pillar. Anchor to it when other domains go cold. |
| Both ≤ 40, close | **The Numb Zone** | Either it isn't yours, or it's frozen deep. |
| Otherwise | **Steady** | Not everything has to be a threshold. |

The quick reading is four domains and takes ninety seconds — a reading you'll actually take daily
beats a thorough one you take twice. Twelve domains are there when you want the deep version.

Implemented in [`src/lib/temperature.js`](src/lib/temperature.js).

---

## The rooms

| Room | What it's for |
| --- | --- |
| **Path** | Today's one step, the remark to carry, and the map. |
| **Journal** | 70+ prompts graded surface → deep → abyss, with attached voice notes. |
| **Reading** | Hot & Cold, with history and per-domain trends. |
| **Intake** | What you feed the machine — content, food, movement, substances, people, sleep — each charged from drained to lit up, with a Patterns view that lines it up against your Readings. |
| **Voice** | Record your own voice saying what you need to hear. Six starter scripts, litany playback. |
| **Forge** | Manifestation as engineering, plus your life goals. |
| **Council** | Mentor directory, session requests, mentor profiles, field notes. |
| **Library** | Every practice and all 29 long-form entries, if you want to go looking. |

---

## Evidence honesty

Every protocol and Library entry declares one of three classes, and the app explains all three:

- **Research-backed** — the core mechanism has reasonable published support
- **Mixed evidence** — plausible, partially supported, routinely over-claimed elsewhere
- **Traditional practice** — a contemplative practice, not a lab result, judged by its fruit

Cold exposure says the alertness effect is real and the fat-loss claims aren't. Power posing says
the feelings replicate and the hormones don't. The spirituality entries say plainly that Jung,
Vedanta, and the Western esoteric tradition fundamentally disagree about what a higher self *is*.
Where an entry carries a caution, the caution is the most important part of the entry.

---

## Safety design

The subject matter demanded this be built in, not bolted on:

- **The Threshold** — six explicit consent gates before the app opens: 18+, not therapy, may alter
  your perception of reality, some prompts go deep, the community is unvetted peers, your life and
  your responsibility. Re-readable any time from Settings.
- **Graded prompts** — anything intense is flagged before you open it, sits behind a confirmation,
  carries a line showing the way back out, and can be switched off entirely.
- **Skippable depth** — every intense step on the path says so on the card, and says outright that
  nothing later depends on it.
- **Day 9 is the Discernment Test**, before the Reckoning ever starts.
- **Day 14 is a maintenance audit** — if your sleep went down, you reduce the practice, not increase it.
- **Day 25 is grounding**, treated as the second half of the Reckoning rather than optional aftercare.
- **Day 38 appoints a witness** — someone with standing to tell you if you start seeming different.
- **Crisis resources** on the Threshold, in the "I need something now" drawer, in the footer of every
  page, in Settings, and in the Council terms.

---

## Where your data lives

Everything is in the browser. There is no server, so there is nowhere for it to go.

- App state (path position, journal, readings, goals, plans, settings) → `localStorage`, one JSON
  blob under `eternal_ruler:state:v1`
- Voice recordings → IndexedDB (`eternal_ruler_voice`), because audio blobs are far too large for
  localStorage

That makes it private by construction and **fragile**. Clearing site data erases it permanently.
Settings has JSON export (everything), Markdown export (the journal), and JSON restore. Voice clips
aren't included in exports and stay in the browser that recorded them.

---

## What still needs a server

The Council is a complete interface over a local data layer. Everything in it works; nothing in it
reaches another person. Making the marketplace real needs:

1. **Accounts and identity** — auth, plus real verification for anyone taking money
2. **A database** — profiles, requests, threads, reviews
3. **Payments** — Stripe Connect or equivalent, platform fee, refunds, disputes
4. **Trust and safety** — reporting, blocking, moderation, and a written policy on what gets a
   mentor removed. Given the subject matter this is the hard part, not the payments.
5. **Sync** — the same seam would let your journal follow you across devices, trading today's
   privacy-by-construction for convenience. A real trade-off, not an obvious upgrade.

The seam is `src/lib/store.jsx` — every mutation goes through one place.

---

## Layout

```
src/
  App.jsx                 shell, progressive nav, "I need something now"
  main.jsx                entry point
  styles.css              design tokens + all styling
  lib/
    store.jsx             all app state, localStorage persistence, every mutation
    temperature.js        the Hot & Cold model
    audio.js              IndexedDB clip store + recorder hook
    util.js               dates, ids, streaks, export
  data/
    path.js               the 42 steps, 5 stages, unlocks, the Practice rotation
    protocols.js          14 guided State Stacks
    codex.js              29 library entries
    prompts.js            70+ graded journal prompts
    remarks.js            70 daily remarks
    domains.js            the twelve rated domains
    intake.js             the five intake channels + the charge scale
    mentors.js            sample Council profiles + terms
  components/
    Runner.jsx            the guided protocol timer (launchable from anywhere)
    NeedNow.jsx           the plain-language emergency drawer
    Dial.jsx              hot/cold sliders + gap readout
    ui.jsx                Panel, Modal, Stat, Bar, Spark, DangerButton, Field, Check
  views/                  Threshold, Path, Journal, Attunement, Intake,
                          VoiceRoom, Manifest, Goals, Library, Council, Settings
```

---

## A note on the content

The 42 path steps, the 70 daily remarks, the journal prompts, and the Library entries were written
for this app rather than quoted, so nothing is misattributed to a teacher who never said it. Where
the Library describes a tradition's position — Jung's Self, Vedanta's atman, the Holy Guardian
Angel, Internal Family Systems — it names the tradition and says plainly that the maps disagree
with each other.

The stance throughout: hold the map loosely, take the practice seriously, and judge it by whether
it makes you more honest, kinder, clearer, and more capable. That's a question you can actually
answer.
