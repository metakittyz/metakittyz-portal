// Generates VOICEOVER.md from the Overture itself.
//
// The script has to be generated rather than written by hand. A voice-over
// sheet that has drifted from the lines actually in the app is worse than none
// — you record twenty minutes against it and every take is wrong. Change a
// line in overture-scenes.js, run `npm run vo`, and the sheet follows.
//
//   node scripts/vo-script.mjs

import { writeFileSync } from "node:fs";
import { SCENES, overtureLineId } from "../src/lib/overture-scenes.js";

// A calm, unhurried read — slower than conversation, which sits near 150.
const WPM = 130;
// Silence after each line before the next beat begins. Matches TAIL in
// Overture.jsx; if you change one, change the other.
const TAIL = 1.8;

function syllables(word) {
  const s = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!s) return 0;
  const groups = s.match(/[aeiouy]+/g);
  let n = groups ? groups.length : 1;
  if (/e$/.test(s) && n > 1) n--; // silent terminal e
  return Math.max(1, n);
}

/** Syllables predict read time better than words do. Full stops add a beat. */
function readSeconds(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const syl = words.reduce((a, w) => a + syllables(w), 0);
  const stops = (text.match(/[.!?]/g) || []).length;
  return syl / ((WPM * 1.45) / 60) + stops * 0.55;
}

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export function cues() {
  let t = 0;
  return SCENES.map((s, i) => {
    const text = s.note ? `${s.line} ${s.note}` : s.line;
    const read = readSeconds(text);
    const beat = Math.max(s.hold, read + TAIL);
    const row = {
      n: i + 1,
      id: overtureLineId(s.id),
      scene: s.id,
      start: t,
      read,
      beat,
      pause: beat - read,
      line: s.line,
      note: s.note || "",
      source: s.source || "",
      footnote: s.footnote || "",
      text,
      words: text.split(/\s+/).length,
    };
    t += beat;
    return row;
  });
}

// Direction per beat. Not in the scene data because it is guidance for a
// person in a room, not something the app ever renders.
const DIRECTION = {
  matter: "Open quiet. This is the first thing anyone hears — underplay it. Statement of fact, not a reveal.",
  light: "A little warmer. You are pointing at something, not explaining it. Let 'red' and 'blue' land separately.",
  ocean: "Plain. The second sentence is the payoff, so leave a real gap before it.",
  heart: "Softest beat in the piece. Slow down. This one is about them, and they will feel it if you rush.",
  everything: "Weight. The list of four is four separate items — comma pauses, not a run. Then stop hard before the last two words.",
  resonance: "The turn. First sentence flat and a bit cold, second one opens up. The last sentence is the thesis of the app — say it like you mean it, not like you are quoting it.",
  senses: "This is someone else's line, so let it sound borrowed — a shade lighter, almost like you are passing it on. Small pause before 'and we have guides.'",
  recognition: "Intimate. Nearly a whisper but not breathy. 'Nothing arrives' can be almost thrown away; 'you come into range' is the one to land.",
  flow: "The close. Build across the sentences and then release completely on the last five words. Do not push the ending — let the music carry it out.",
};

export function markdown() {
  const rows = cues();
  const total = rows.reduce((a, r) => a + r.beat, 0);
  const spoken = rows.reduce((a, r) => a + r.read, 0);
  const words = rows.reduce((a, r) => a + r.words, 0);

  const out = [];
  out.push("# The Overture — voice-over script");
  out.push("");
  out.push("> Generated from `src/lib/overture-scenes.js`. Do not edit by hand — edit the scene");
  out.push("> lines and run `npm run vo`, or this sheet and the app will disagree.");
  out.push("");
  out.push(`**${clock(total)} total · ${Math.round(spoken)}s of speech · ${words} words · 9 cues**`);
  out.push("");
  out.push("Bed: **The Awakening** (3:24). The script uses the first two minutes and leaves the");
  out.push("track running underneath — it fades out with the last card rather than resolving.");
  out.push("");
  out.push("---");
  out.push("");
  out.push("## Read this before you record");
  out.push("");
  out.push("**Record cue by cue, not in one take.** The app stores each line separately and plays");
  out.push("it at the right moment on its own, so it does the syncing for you. A single continuous");
  out.push("take would have to be cut up anyway, and any line you dislike could not be redone");
  out.push("without re-recording the ones around it.");
  out.push("");
  out.push("**Where it goes:** in the app, **Guide Voice → Your own voice → The opening**. Each cue");
  out.push("below has an id matching a row on that screen. Anything you do not record falls back to");
  out.push("the chosen voice, so you can do one line, or all nine, in any order.");
  out.push("");
  out.push("**Timings are targets, not limits.** The app waits for you to finish before moving on,");
  out.push("so running long changes nothing except the total length. They are here so the whole");
  out.push("thing lands near two minutes and sits with the music rather than fighting it.");
  out.push("");
  out.push("**How to sound like a person:** speak to one person in a room, not to an audience. Use");
  out.push("contractions. Do not over-enunciate. Leave the small breaths in — they are the single");
  out.push("biggest difference between a recording and a read. Record somewhere soft, a couple of");
  out.push("hand-widths from the mic, slightly off-axis so the plosives miss it.");
  out.push("");
  out.push("---");
  out.push("");
  out.push("## Cue sheet");
  out.push("");
  out.push("| # | In | Read | On screen | Line id |");
  out.push("| --- | --- | --- | --- | --- |");
  for (const r of rows) {
    out.push(`| ${r.n} | ${clock(r.start)} | ${r.read.toFixed(1)}s | ${r.scene} | \`${r.id}\` |`);
  }
  out.push("");
  out.push("---");
  out.push("");

  for (const r of rows) {
    out.push(`## Cue ${r.n} — ${clock(r.start)}`);
    out.push("");
    out.push(`\`${r.id}\` · target ${r.read.toFixed(1)}s · ${r.pause.toFixed(1)}s silence after · ${r.words} words`);
    out.push("");
    out.push(`> **${r.line}**`);
    if (r.note) {
      out.push(">");
      out.push(`> ${r.note}`);
    }
    out.push("");
    out.push(`*Direction:* ${DIRECTION[r.scene] || ""}`);
    if (r.source) out.push(`\n*Attribution shown on screen:* ${r.source}`);
    if (r.footnote) out.push(`\n*Not spoken — printed under the line:* ${r.footnote}`);
    out.push("");
    out.push("---");
    out.push("");
  }

  out.push("## The closing card");
  out.push("");
  out.push("Not narrated. It appears after cue 9 and is read, not heard — the honesty note");
  out.push("separating the measured physics from the teaching, and the **Begin** button.");
  out.push("Let the track run under it and fade as they tap through.");
  out.push("");
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// SUNO.md — the same nine cues, shaped for a music generator.
// ---------------------------------------------------------------------------

const STYLE =
  "spoken word narration, female voice, soft and intimate, close-mic, warm low register, " +
  "unhurried, conversational, no singing, no melody, no rhythm, dry vocal, " +
  "barely-there ambient drone underneath, cinematic, contemplative";

const EXCLUDE =
  "singing, sung vocals, melody, autotune, harmony, choir, drums, percussion, beat, " +
  "rap, rhyme, chorus, instrumental break, reverb wash, music swell, upbeat, bright";

export function suno() {
  const rows = cues();
  const out = [];

  out.push("# The Overture — Suno voice-over prompts");
  out.push("");
  out.push("> Generated by `npm run vo` from `src/lib/overture-scenes.js`. Regenerate rather than edit.");
  out.push("");
  out.push("## Be warned about one thing first");
  out.push("");
  out.push("Suno is a **music** generator. Asking it for dry spoken word is working against what it");
  out.push("does, and it will often sing anyway, add a backing bed you did not ask for, or fall into a");
  out.push("rhythmic cadence. Expect to regenerate several times per cue and to keep maybe one take in");
  out.push("three. If that gets tiring, the two reliable routes are still your own voice through the");
  out.push("Import button, or the OpenAI voice the app already has wired.");
  out.push("");
  out.push("Also: the app plays **one file per line**, not one long take. So generate the nine short");
  out.push("cues below rather than the continuous version, unless you intend to cut it up yourself.");
  out.push("");
  out.push("---");
  out.push("");
  out.push("## Settings");
  out.push("");
  out.push("| Field | Value |");
  out.push("| --- | --- |");
  out.push("| Instrumental | **off** |");
  out.push("| Style influence | high — you want it obeying \"no singing\" |");
  out.push("| Weirdness | low |");
  out.push("");
  out.push("**Style prompt** — paste as-is:");
  out.push("");
  out.push("```");
  out.push(STYLE);
  out.push("```");
  out.push("");
  out.push("**Exclude styles** — the half that does the real work:");
  out.push("");
  out.push("```");
  out.push(EXCLUDE);
  out.push("```");
  out.push("");
  out.push("The `[Spoken Word]` tag at the top of every lyric block matters. Without it Suno reads the");
  out.push("box as song lyrics and sings them. Line breaks are phrasing — leave them where they are.");
  out.push("");
  out.push("---");
  out.push("");
  out.push("## The nine cues");
  out.push("");
  out.push("One generation each. Download the take you like, then in the app:");
  out.push("**Guide Voice → Your own voice → The opening → ↑ Import** on the matching row.");
  out.push("");

  for (const r of rows) {
    out.push(`### Cue ${r.n} · \`${r.id}\``);
    out.push("");
    out.push(`Target ${r.read.toFixed(1)}s. ${DIRECTION[r.scene]}`);
    out.push("");
    out.push("```");
    out.push("[Spoken Word]");
    out.push("[female narrator, soft, close, unhurried]");
    out.push("");
    out.push(r.line);
    if (r.note) {
      out.push("");
      out.push(r.note);
    }
    out.push("```");
    out.push("");
  }

  out.push("---");
  out.push("");
  out.push("## Or one continuous take");
  out.push("");
  out.push("Only if you plan to cut it into nine files afterwards. The `[pause]` tags are where the");
  out.push("app's own gaps fall, so cut on those.");
  out.push("");
  out.push("```");
  out.push("[Spoken Word]");
  out.push("[female narrator, soft, close, unhurried, no singing]");
  for (const r of rows) {
    out.push("");
    out.push(r.line);
    if (r.note) out.push(r.note);
    if (r.n < rows.length) out.push("[pause]");
  }
  out.push("```");
  out.push("");
  out.push("---");
  out.push("");
  out.push("## Getting a take into the app");
  out.push("");
  out.push("1. **Guide Voice → Your own voice → The opening**, then **Record these**.");
  out.push("2. **↑ Import** on the row whose id matches the cue. mp3, m4a, wav, ogg — under 12MB.");
  out.push("3. It is checked before it is stored: a file the browser cannot decode is refused with a");
  out.push("   message rather than saved and then silent when the line comes round.");
  out.push("4. Select **Your Own Voice** in the library. Any line you have not imported falls back to");
  out.push("   Solace, so a partial set is fine.");
  out.push("");
  return out.join("\n");
}

const md = markdown();
writeFileSync(new URL("../VOICEOVER.md", import.meta.url), md);
const sn = suno();
writeFileSync(new URL("../SUNO.md", import.meta.url), sn);
console.log(`VOICEOVER.md — ${md.split("\n").length} lines`);
console.log(`SUNO.md      — ${sn.split("\n").length} lines, 9 cue prompts + 1 continuous`);
