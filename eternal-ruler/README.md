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

No API keys, no accounts, no server required. `dist/` drops onto Vercel, Netlify, GitHub Pages, or
any static host.

**Optional — the natural voice.** For a soft, human guide voice instead of the browser's synthetic
one, add an OpenAI key. Locally:

```bash
cp .env.example .env      # then paste your key into OpenAI_EternalRuler
npm run dev               # the dev server serves /api/tts for you
```

Deploying with the voice working is covered in **Hosting** below. Without a key the app works
exactly as it does now, on device voices.

**Deployment note:** microphone capture needs a secure context — it works on `localhost` and on any
`https://` host. Over plain `http://` the Voice Room correctly reports that recording is unavailable.

---

## Hosting

The app is a static bundle plus **one serverless function** (`/api/tts`, the OpenAI proxy). That
function is what makes the natural voice work — a plain static host serves the app fine, but the
guide falls back to the browser's synthetic voice, and the Voice Library says so.

The logic lives once in [`server/tts-core.js`](server/tts-core.js); each platform gets a thin adapter.

### Netlify

Everything needed is committed: `netlify.toml`, and a v2 function at
[`netlify/functions/tts.mjs`](netlify/functions/tts.mjs) that mounts itself at `/api/tts`.

**Option A — connect the repo (recommended).** In Netlify: *Add new site → Import an existing
project*, pick this repo. `netlify.toml` supplies the build command (`npm run build`), publish
directory (`dist`) and functions directory, so accept the defaults. Then set the key under
*Site configuration → Environment variables*:

```
OpenAI_EternalRuler = sk-...
```

Redeploy after adding it — Netlify reads environment variables at build time.

**Option B — from your machine:**

```bash
npm install -g netlify-cli
netlify login
netlify init                                   # create or link a site
netlify env:set OpenAI_EternalRuler sk-...     # never commit the key
netlify deploy --build --prod
```

**Verify it worked.** Open `https://your-site.netlify.app/api/tts`. You should see:

```json
{"service":"eternal-ruler-tts","keyPresent":true}
```

- `keyPresent: false` → the function is live but the environment variable is missing, or the site
  wasn't redeployed after adding it.
- HTML instead of JSON → the function isn't deployed; check the build log's functions step.

Then in the app: **More → Guide Voice**. The banner turns green and reads *Natural voice active*.

### Vercel

`api/tts.js` deploys automatically as a serverless function. Set `OpenAI_EternalRuler` in
*Project → Settings → Environment Variables* and redeploy.

### Anywhere else

Any static host works for the app itself. For the natural voice, port the eight-line adapter —
`handleTts()` in `server/tts-core.js` takes `{method, body, headerKey, env}` and returns
`{status, headers, json | audio}`.

---

## Getting in

Welcome → **Start** → *Continue with Google / Apple / email* → **what is your name?** → who you're
reaching for → the consent Threshold → day one. One question per screen.

> **Sign-in is not connected.** There is no server and no OAuth credentials, so those buttons create
> a **local account on this device**. Nothing is sent to Google or Apple, there is no password, and
> the app says so on the account screen and again on your Profile. Wiring up real providers is in
> "What still needs a server" below — and note that Google and Apple both require their own official
> branded buttons, which is why the current ones are deliberately unbranded.

---

## The orientation

Between the Overture and making an account there is one screen that is allowed to be long. It answers
the four questions somebody actually has before handing over a name:

- **What this is for** — one purpose: open the line to your higher self, then make it strong enough to
  run a life on.
- **What to expect** — one step a day; nothing will happen for a while and that's normal; the middle
  goes somewhere uncomfortable; your position never expires; it all stays on this device.
- **How it's laid out** — the six themes, with what each one teaches, read straight from `STAGES` so
  there is no second copy to forget to update.
- **Before you start** — not therapy, 18+, and the plain warning that this can shift how reality looks
  to you. That paragraph sits *above* the button, not buried under it. Somebody deciding whether to
  begin deserves the awkward part at the same moment as the invitation.

## Always know where you are

A strip sits under the nav on **every screen**:

```
❋ THE INSTRUMENT · DAY 11/42  ─────────────────  Becoming your own eternal ruler
```

Theme, day, a progress line, and the point of the whole thing. Tap it to jump back to the Path. Your
initial sits in the top-right — tap for **Profile**, which shows your standing across all six
themes, everything you've built, and your account.

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

Forty-two steps in six themes, then a self-directed weekly rhythm forever after.

It is built as a course rather than a checklist — closer in shape to a music appreciation class. You
learn the **notes** of the realm of spirit, then the **melodies** of spirit guidance, and finally the
**composition and orchestration** of six-sensory, divinely guided, creative living.

| Theme | Days | What it does |
| --- | --- | --- |
| **I · The Notes** | 1–7 | The basic tools for becoming sensitive. Make contact, build the habit, learn what a signal even feels like. |
| **II · The Instrument** | 8–14 | Prepare the body to tune in to subtle energy — sleep, food, movement — and learn to tell your yes from your no. |
| **III · The Ear** | 15–21 | Clear what distorts the signal. The material you avoid is the material that drowns it. The hardest stretch, and the one that changes people. |
| **IV · The Melody** | 22–28 | Guidance stops arriving as single notes and starts arriving as lines you can follow. |
| **V · The Composition** | 29–35 | Structure, dates and evidence. What you heard becomes something written down. |
| **VI · The Orchestration** | 36–42 | All of it moving together, and you holding the baton. You stop following the path and start setting it. |

The order carries weight: you cannot tune an instrument you haven't picked up, and you cannot hear a
melody through a receiver full of static. Each theme is built on the one under it, and the rooms
unlock at the point where they'd actually help.

**Themes are a regrouping of the same forty-two steps, not a rewrite.** The boundaries moved to seven
days each; the content and its order are unchanged. Body work is threaded throughout rather than
confined to Theme II — day 3 is already "The body is the receiver" — because you don't finish
perception and then separately start on the body.

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

## The Voice Library

Six choices for who reads the app to you.

| | Tone | For |
| --- | --- | --- |
| **Solace** | Soothing | Low and unhurried. For the nights. |
| **Stillness** | Peaceful | Very slow, plenty of air. For sitting. |
| **Dawn** | Calm | Even and clear. For the morning. |
| **Aurora** | Warm | Bright and close. For the hard days. |
| **Deep Water** | Grounded | Low, slow, weighted. For coming back down. |
| **Your Own Voice** | Yours | You record the lines. |

Solace is the default. Every preset has a ▶ Hear button so you pick by ear, not by name.

### Two engines behind the same six voices

**The natural voice (OpenAI).** Soft, human, genuinely comforting. Each preset maps to an OpenAI
voice plus a delivery brief written for this app, in an *affect / voice / delivery / pacing /
avoid* shape. Solace is `sage`, told it is *"a close friend talking to you late at night, keeping
their voice down"* — *"don't over-enunciate; let words soften and run together the way they do in
ordinary speech"* — and told to avoid *"audiobook narration, meditation-app hush, announcer
polish."* Uses `gpt-4o-mini-tts`, the model that honours those instructions.

Two things that turned out to matter more than the adjectives:

- **`speed` is not calm.** It time-stretches audio *after* generation, so dialling it to 0.8 to
  sound peaceful just smears the words and adds a sedated, underwater quality. Every preset now
  sits near 1.0 and gets its slowness from instructed pauses instead.
- **Negative direction works.** Naming what to avoid moves the delivery toward ordinary human
  speech further than any amount of warm adjectives piled on the positive side.

Retuning a preset changes its **delivery fingerprint**, which is part of the cache key — so lines
already generated under the old delivery regenerate on their own, and the stale audio is swept out
of IndexedDB next time you open the Voice Library. Without that, retuning appears to do nothing.

**The device voice.** The browser's own speech synthesis: free, offline, instant, and noticeably
synthetic. A tuned pace and pitch plus an ordered list of OS voices to reach for. Always the
fallback, never the goal.

**The natural voice is on by default** (`engine: "auto"`). On load the app asks `/api/tts` once
whether it's really there and whether it has a key; if the answer is no it stops trying for the
session, so a static host never pays a doomed round-trip per line.

### Where you will and won't hear it

| Where | Natural voice? |
| --- | --- |
| `npm run dev` with a key in `.env` | **Yes** |
| Deployed to Vercel with `OpenAI_EternalRuler` set | **Yes** |
| `npm run preview`, or any plain static host | No — nothing serves `/api/tts` |
| The published Artifact preview link | **No, and it never can** — that sandbox blocks all outbound network requests |

The Voice Library says which of these you're in, in plain language, and shows which engine played
the last line. If it's robotic, the app now tells you exactly why.

### How playback resolves

Three tiers, each falling through to the next on failure, so **the guide is never silent**:

1. Your own recording of that exact line, if you made one
2. The preset's OpenAI voice — from cache, or generated once and cached
3. The device's speech synthesis

### Caching is the whole design

Every generated line is stored in IndexedDB keyed by (preset, delivery fingerprint, model, text). So:

- each line is paid for **exactly once, ever**
- the second play is instant, with no network round-trip
- once prewarmed, a guided protocol runs **fully offline**

**Generate every line** in the Voice Library pre-renders all 77 with a progress bar, so a protocol
never pauses mid-practice waiting on the network. Changing voice or model regenerates.

### Keys, and what gets sent

The client only ever talks to this app's own `/api/tts`. That function reads `OpenAI_EternalRuler`
from the server environment (falling back to `OPENAI_API_KEY`) — the right way, since the key never touches a browser. Failing that, it
accepts a key you paste into the Voice Library, stored in that browser only.

**Only the guide's own fixed lines are sent** — protocol steps and four app moments. Your journal,
readings, intake, goals and recordings are never sent anywhere, by this feature or any other.

Costs are per character of speech, billed by OpenAI. With caching you pay once per line, so the
whole 77-line library is a one-off. Check current pricing at
[openai.com/api/pricing](https://openai.com/api/pricing).

### Your own voice

Every line the guide speaks is addressable, and you can record any of them yourself — **77 lines** in
15 areas: four app moments (step complete, milestone, practice complete, greeting) and every step of
all fourteen protocols.

Record as many or as few as you like. Recorded lines play in your voice; anything unrecorded falls
back to Solace, so the guide is never silent and you're never forced to finish all 77 before it's
useful. Audio lives in IndexedDB alongside your Voice Room recordings.

The guide speaks in three places, chosen so she guides rather than nags: every protocol step
automatically, anything with a ▶ Listen button, and a short line when you complete a step. Everywhere
else she stays quiet. The `◉))` in the header mutes her instantly.

---

## The Overture

Nine beats before the welcome screen, **read aloud by the guide**, making one argument: everything is
vibration, and a receiver finds what it is tuned to.

The narration runs through the same three tiers as everything else the guide says — your own
recording, then the natural voice, then the device voice — so all nine lines appear in the Voice
Studio under **The opening** and can be recorded in your own voice. `◉))` beside Skip mutes it. A
beat never advances out from under its own narration, however short its hold.

The text is deliberately short: one line and one clause per beat, about 64 seconds of speech across
the whole sequence.

| | Beat | What it draws |
| --- | --- | --- |
| 1 | Matter | A lattice, every site oscillating at its own rate |
| 2 | Light | Five wavelengths, each stroked **in the colour that wavelength actually is** |
| 3 | Ocean | Three component waves above, their sum below |
| 4 | Heartbeat | A lead-II trace at 60bpm — P wave, QRS spike, T wave |
| 5 | Everything | All four at once, then summed |
| 6 | Resonance | Two waves closing from opposition to agreement |
| 7 | Senses | Bat sonar, bird magnetoreception, and us |
| 8 | Recognition | Neighbours coming up out of the dark as you tune |
| 9 | Flow | Twelve coupled oscillators falling into step |

**Every number on screen is real.** That is the whole reason this exists rather than being seven
pretty gradients:

- Colours come from `wavelengthToRGB` (the Bruton approximation of the CIE curves). 660nm renders
  red because 660nm *is* red — the colour is computed from the frequency, not picked to look nice.
- The swell is `seaSurface()`, its components literally summed; the test asserts the sum equals the
  parts to floating-point exactness.
- Interference gives amplitude **2.000** in phase, **1.414** a quarter-cycle apart, **0.000**
  opposed.
- The bat's echo takes **29.2ms**, from `echoDelayMs(5)` at 343 m/s. Its call is at 80 kHz; you hear
  to 20 kHz. It is shouting and you have never heard it.
- The bird's needle follows `dipoleInclination(lat)` — at 45° latitude the field dips 63.4° into the
  ground, and that angle *is* the bird's latitude.
- Beat 9 integrates the **Kuramoto model** forward from zero on every frame. Coherence runs 0.254 at
  K=0 to 0.998 at K=3.2, and the summed output rises from 45% to 100% of full height.

Integrating from zero each frame instead of keeping running state is what makes every scene a pure
function of `(t, p)`. That buys two things: the sequence can hold completely still for anyone who has
asked for less motion (`prefers-reduced-motion` or the in-app setting), and the maths is testable
without a browser.

### Where the evidence line falls

Beats 7 and 9 carry lines from **Sonia Choquette's *Ask Your Guides***, credited on the beat itself.
The app labels its claims everywhere else and doesn't stop here:

- **Bats really do use sonar.** Echolocation, ultrasonic, measurable.
- **Birds don't use radar.** They read Earth's magnetic field, and the dip angle gives them latitude
  — stranger than radar, and real. That correction appears on the beat, next to the quote.
- **That spirit has a frequency you can tune to** is teaching, not measurement. The closing card says
  so plainly before the Begin button.

Skippable from the first frame, and replayable from **Settings → The opening**.

## The score

A cinematic piece plays under the app — a church-organ stack, a relentless eighth-note ostinato
turning underneath, sub-bass for weight, and a swell that takes over a minute to arrive and recede.
The emotion is carried by dynamics rather than melody: intensity runs 0.30 to 1.00 across a 72-second
arc, and the layers enter as it climbs — pad, then ostinato at 12s, sub at 18s, the four-note theme
at 24s, peak at 36s.

It is **composed live in the browser** with Web Audio (`src/lib/ambient.js`) rather than shipped as
an audio file. Four reasons, in the order they mattered:

- **It's original.** Every note is generated from the eight-bar D-minor progression and the figures
  in `ambient.js`. No existing recording or composition is reproduced — what is borrowed is the
  grammar of the idiom, which is nobody's property. Nothing to license, nothing to take down.
- **It never loops audibly.** The 18-second harmonic cycle sits under the 72-second intensity arc, so
  the same bar returns at a different weight each time and there is no seam to start listening for.
- **It costs nothing to download.** Twenty minutes of audio would be several megabytes; this is
  ~5 kB of arithmetic, and it works offline.
- **It gets out of the way.** The moment the guide speaks, the whole bed ducks to 18% in 0.35s and
  comes back over 1.6s — down fast enough to be clear of the first syllable, back slowly enough
  that the return isn't the thing you notice.

Notes are placed against the audio clock with a lookahead scheduler, with a few milliseconds of
timing drift and some unevenness in weight on every note. Dead-on timing is the giveaway that
nobody is playing it.

**Level.** `MASTER_CEILING` in `ambient.js` caps the whole thing. The first pass peaked at 0.048 with
the slider at maximum — a whisper, fine for a bed under an app and wrong for something meant to carry
an intro. It now peaks at 0.217, with the mix rebalanced: the ostinato had been eight times quieter
than the pad and sub, which left nothing above 300Hz and made the score all weight and no music.

**Hearing it without a browser.** `renderOffline(seconds, sampleRate)` runs the same graph and the
same scheduler through an `OfflineAudioContext` and hands back an AudioBuffer. Point a two-line
module page at it to render a WAV — useful because a score nobody can play back cannot be judged.

**Controls.** A ♪ toggle in the topbar, and volume in Settings → Score. `MASTER_CEILING` in
`ambient.js` caps the whole thing well below conversational level: full volume is still soft. Off
is genuinely silent — the reverb tail runs back through the master gain rather than around it, so
the toggle, the slider and the duck all apply to everything you can hear.

Browsers won't start audio before the page is touched, so the setting is recorded and honoured on
the first gesture of any kind. The toggle says which state you're in rather than pretending.

## The Calendar

Every day you showed up, coloured by what you did — step, journal, reading, intake, practice, voice —
with current run, longest run, and days shown up.

**Nineteen seals** reward consistency, and two rules keep them from becoming a guilt mechanic:

1. **A seal is permanent.** Nothing here is taken away by a bad week.
2. **Nothing punishes a gap.** The run counter is information, not a debt.

The seal that matters most is **The Return** — earned by coming back after three or more days away.
That's the hardest thing to do and every other app treats it as failure.

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
| **Profile** | Who you are here, your position across the six themes, your totals, and your account. |
| **Journal** | 70+ prompts graded surface → deep → abyss, with attached voice notes. |
| **Reading** | Hot & Cold, with history and per-domain trends. |
| **Intake** | What you feed the machine — content, food, movement, substances, people, sleep — each charged from drained to lit up, with a Patterns view that lines it up against your Readings. |
| **Voice** | Record your own voice saying what you need to hear. Six starter scripts, litany playback. |
| **Forge** | Manifestation as engineering, plus your life goals. |
| **Council** | Mentor directory, session requests, mentor profiles, field notes. |
| **Calendar** | Every day you showed up, your runs, and nineteen seals earned by consistency. |
| **Guide Voice** | Pick from six voices, or record all 77 guide lines in your own. |
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

1. **Accounts and identity** — the onboarding flow is built and stores a local account; making
   it real means an OAuth client for Google, Sign in with Apple (which needs a paid Apple Developer
   account), a magic-link or password path for email, session tokens, and their official branded
   buttons. Plus identity verification for anyone taking money.
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
api/
  tts.js                  serverless proxy to OpenAI TTS (keeps the key server-side)
src/
  App.jsx                 shell, progressive nav, "I need something now"
  main.jsx                entry point
  styles.css              design tokens + all styling
  lib/
    store.jsx             all app state, localStorage persistence, every mutation
    temperature.js        the Hot & Cold model
    voice.js              the three-tier playback chain + female-voice scoring
    tts.js                OpenAI TTS client: cache-first, prewarm, probe
    consistency.js        activity by day, runs, returns
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
    seals.js              the eighteen consistency rewards
    voices.js             the six voice presets + every addressable guide line
    mentors.js            sample Council profiles + terms
  components/
    Speak.jsx             the guide voice: hook, Listen button, mute toggle
    Runner.jsx            the guided protocol timer (launchable from anywhere)
    NeedNow.jsx           the plain-language emergency drawer
    Dial.jsx              hot/cold sliders + gap readout
    ui.jsx                Panel, Modal, Stat, Bar, Spark, DangerButton, Field, Check
  views/                  Onboarding, Threshold, Path, Journal, Attunement,
                          Intake, VoiceRoom, Manifest, Goals, Library, Council,
                          Calendar, VoiceLibrary, Profile, Settings
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
