# Eternal Ruler

> A gateway app for opening and strengthening the connection between you and your higher self.
> 18+. A self-experiment, not therapy. Your life, your choices, your responsibility.

A private, local-first React app covering mind, body, and spirit: a Hot & Cold rating system that
measures you against your higher self, a journal built for logging an awakening as it happens, a
voice room where you record reassurance in your own voice, a manifestation forge that turns wanting
into a dated plan, a library of protocols for reaching your maximum working state, and a mentor
marketplace for people further down the road.

---

## Run it

```bash
cd eternal-ruler
npm install
npm run dev          # http://localhost:5174
```

```bash
npm run build        # production bundle in dist/
npm run preview      # serve the built bundle
```

No API keys, no accounts, no backend. It's a static site — `dist/` can be dropped on Vercel,
Netlify, GitHub Pages, or any static host.

**One deployment note:** microphone capture requires a secure context. It works on `localhost`
during development and on any `https://` host in production. Over plain `http://` to a remote
machine the Voice Room will correctly report that recording isn't available.

---

## The ten rooms

| Room | What it's for |
| --- | --- |
| **Today** | The daily remark, the four movements of the day, your last reading, what you're building. |
| **Hot & Cold** | The signature mechanic. Rate how *you* feel and how you believe your *higher self* feels, across twelve domains. |
| **Ascend** | Fourteen State Stacks — guided, timed protocols for peak state, panic, courage, focus, energy, reconnection, grounding, sleep. |
| **Journal** | 70+ prompts graded surface → deep → abyss, plus attached voice notes. The beta-test log. |
| **Voice** | Record your own voice saying what you need to hear. Six starter scripts. Play the whole library back as a litany. |
| **Forge** | Manifestation as engineering: desire, honest current position, identity shift, daily minimum, dated milestones, if-then obstacle plans, evidence log. |
| **Goals** | Life goals with the real why and the single next physical action. |
| **Codex** | 29 long-form entries on neuroscience, health & fitness, and spiritual practice — each labelled with its evidence class. |
| **Council** | Mentor directory, session requests, become-a-mentor profile, and field notes on what actually worked. |
| **Settings** | Profile, intensity controls, export/import, and the erase button. |

---

## The Hot & Cold system

Every check-in logs two numbers per domain:

- **self** (0–100) — how you feel about it right now
- **higher** (0–100) — how you believe your higher self feels about it

The number that matters is the **gap**:

| Gap | Verdict | Meaning |
| --- | --- | --- |
| ≥ +25 | **A Calling** | Your higher self runs hotter here. An invitation, not a reprimand. |
| ≤ −25 | **Overreach** | You run hotter than your higher self. Often want rather than purpose. |
| Both ≥ 60, close | **Strength** | A pillar. Anchor to it when other domains go cold. |
| Both ≤ 40, close | **The Numb Zone** | Either it isn't yours, or it's frozen deep. |
| Otherwise | **Steady** | Not everything has to be a threshold. |

Implemented in [`src/lib/temperature.js`](src/lib/temperature.js). The app is explicit with users
that what's being measured is their *belief* about their higher self — and that a consistently
harsh "higher self" score is itself a finding worth journaling.

---

## Evidence honesty

Every protocol and Codex entry declares one of three classes, and the app explains all three:

- **Research-backed** — the core mechanism has reasonable published support
- **Mixed evidence** — plausible, partially supported, routinely over-claimed elsewhere
- **Traditional practice** — a contemplative practice, not a lab result, judged by its fruit

This is deliberate. The app is about spiritual practice *and* about not lying to the user about
which lever they're pulling. Where an entry carries a caution (breath-holding near water, cold
immersion with cardiac conditions, trauma work without a professional, meditation-related adverse
effects), the caution is treated as the most important part of the entry.

---

## Safety design

The subject matter demanded that this be built in, not bolted on:

- **The Threshold** — six explicit consent gates before the app opens at all: 18+, not therapy, may
  alter your perception of reality, some prompts go deep, the community is unvetted peers, your
  life and your responsibility. Re-readable any time from Settings.
- **Graded prompts** — anything marked `intense` is flagged before you open it, sits behind a
  confirmation screen, carries a `care` line showing the way back out, and can be switched off
  entirely in Settings.
- **The Discernment Test** — a first-class protocol for telling genuine guidance from fear, ego,
  wishful thinking, and inherited voices.
- **Grounding** — treated as the second half of practice, not optional aftercare.
- **Difficult territory** — a Codex entry on the dark night, ego inflation, and concrete triage for
  when to stop and get help.
- **Crisis resources** — on the Threshold, in the footer of every page, in Settings, and in the
  Council terms.

---

## Where your data lives

Everything is in the browser. There is no server, so there is nowhere for it to go.

- App state (journal, readings, goals, plans, settings) → `localStorage`, one JSON blob under
  `eternal_ruler:state:v1`
- Voice recordings → IndexedDB (`eternal_ruler_voice`), because audio blobs are far too large for
  localStorage

That makes it private by construction and **fragile**. Clearing site data erases it permanently.
Settings has JSON export (everything), Markdown export (the journal), and JSON restore. Voice clips
are not included in exports and stay in the browser that recorded them.

---

## What still needs a server

The Council is a complete interface over a local data layer. Everything in it works; nothing in it
reaches another person. Making the marketplace real needs:

1. **Accounts and identity** — auth, plus real identity verification for anyone taking money
2. **A database** — profiles, requests, threads, reviews (Postgres/Supabase or similar)
3. **Payments** — Stripe Connect or equivalent for mentor payouts, platform fee, refunds, disputes
4. **Trust and safety** — reporting, blocking, moderation, and a written policy on what gets a
   mentor removed. Given the subject matter this is the hard part, not the payments.
5. **Sync** — the same seam would let journal and readings follow a user across devices, which
   trades the current privacy-by-construction for convenience. That's a real trade-off, not an
   obvious upgrade.

The seam is `src/lib/store.jsx` — every mutation goes through one place.

---

## Layout

```
eternal-ruler/
  src/
    App.jsx                 shell, hash routing, footer
    main.jsx                entry point
    styles.css              design tokens + all styling
    lib/
      store.jsx             all app state, localStorage persistence, every mutation
      temperature.js        the Hot & Cold model
      audio.js              IndexedDB clip store + recorder hook
      util.js               dates, ids, streaks, export
    data/
      domains.js            the twelve rated domains
      protocols.js          14 State Stacks
      codex.js              29 library entries
      prompts.js            70+ graded journal prompts
      remarks.js            70 daily remarks
      mentors.js            sample Council profiles + terms
    components/
      ui.jsx                Panel, Modal, Stat, Bar, Spark, DangerButton, Field, Check
      Dial.jsx              hot/cold sliders + gap readout
    views/                  Threshold, Today, Attunement, Ascend, Journal,
                            VoiceRoom, Manifest, Goals, Codex, Council, Settings
```

---

## A note on the content

The 70 daily remarks, the journal prompts, and the Codex entries were written for this app rather
than quoted, so nothing here is misattributed to a teacher who never said it. Where the Codex
describes a tradition's position — Jung's Self, Vedanta's atman, the Holy Guardian Angel, Internal
Family Systems — it says which tradition, and it says plainly that the maps disagree with each
other about what the thing fundamentally is.

The stance throughout: hold the map loosely, take the practice seriously, and judge it by whether
it makes you more honest, kinder, clearer, and more capable. That's a question you can actually
answer.
