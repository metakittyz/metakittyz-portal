import React, { useRef, useState } from "react";
import { EMPTY_STATE, useStore } from "../lib/store.jsx";
import { Check, DangerButton, Field, Panel } from "../components/ui.jsx";
import { MusicPanel } from "../components/Music.jsx";
import { remarkById } from "../data/remarks.js";
import { codexById } from "../data/codex.js";
import { TOTAL_DAYS } from "../data/path.js";
import { resolvePreset, speechSupported, stopAll } from "../lib/voice.js";
import { dayKey, download, prettyDate } from "../lib/util.js";

export function Settings({ go }) {
  const store = useStore();
  const { state } = store;
  const fileRef = useRef(null);
  const [importMsg, setImportMsg] = useState("");

  function exportJson() {
    download(`eternal-ruler-${dayKey()}.json`, JSON.stringify(state, null, 2));
  }

  function exportJournal() {
    const lines = state.journal
      .slice()
      .reverse()
      .map((e) => {
        const head = `## ${prettyDate(e.dayKey)}${e.title ? ` — ${e.title}` : ""}`;
        const prompt = e.promptText ? `\n> ${e.promptText}\n` : "";
        return `${head}\n${prompt}\n${e.body}\n`;
      });
    download(
      `eternal-ruler-journal-${dayKey()}.md`,
      `# Eternal Ruler — journal\n\nExported ${prettyDate(dayKey())}\n\n${lines.join("\n---\n\n")}`,
      "text/markdown"
    );
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== "object" || !("journal" in parsed)) {
          setImportMsg("That doesn't look like an Eternal Ruler export.");
          return;
        }
        store.replaceAll(parsed);
        setImportMsg("Restored. Voice clips are not part of an export — those stay in the browser that recorded them.");
      } catch {
        setImportMsg("Could not read that file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Your terms</div>
        <h1>Settings</h1>
      </div>

      <Panel title="Who you are here">
        <Field label="Your name" hint="Used when you address yourself by name, which is the point of half the practices.">
          <input
            type="text"
            value={state.profile.name}
            onChange={(e) => store.setProfile({ name: e.target.value })}
          />
        </Field>
        <Field label="What you call the one you're reaching for">
          <input
            type="text"
            value={state.profile.higherSelfName}
            onChange={(e) => store.setProfile({ higherSelfName: e.target.value })}
            placeholder="Higher self"
          />
        </Field>
        <Field label="Why you're here" hint="Shown back to you on the mornings you've forgotten.">
          <textarea
            value={state.profile.intention}
            onChange={(e) => store.setProfile({ intention: e.target.value })}
          />
        </Field>
      </Panel>

      <Panel title="The Path">
        <p className="small soft">
          <strong style={{ color: "var(--gold)" }}>{state.path.completed.length}</strong> of {TOTAL_DAYS} steps.
          Held by steps completed, never by dates. You cannot fall behind.
        </p>
        <Check checked={state.path.freeRoam} onChange={(v) => store.setFreeRoam(v)} title="Open every room now">
          Rooms open one at a time as the path reaches them. Turn this on for all of them immediately. The
          path is unchanged either way.
        </Check>
        {state.path.completed.length > 0 && (
          <DangerButton
            className="btn ghost sm"
            confirmLabel="Yes — start the path over"
            onConfirm={() => store.replaceAll({ ...state, path: { ...EMPTY_STATE.path } })}
          >
            Restart the path from day one
          </DangerButton>
        )}
        <div className="field-hint">Restarting clears your position only. Your journal and data are untouched.</div>
      </Panel>

      <VoiceSummary store={store} go={go} />

      <Panel title="Intensity">
        <Check
          checked={state.settings.showDeepPrompts}
          onChange={(v) => store.setSettings({ showDeepPrompts: v })}
          title="Show the prompts that go deep"
        >
          Off removes every intense prompt from the picker. Nothing virtuous about running at full depth all
          the time.
        </Check>
        <Check
          checked={state.settings.reduceMotion}
          onChange={(v) => store.setSettings({ reduceMotion: v })}
          title="Still background"
        >
          Stops the slow drift behind the app.
        </Check>
      </Panel>

      <MusicPanel />

      <Panel title="The opening">
        <p className="soft small">
          The story about frequency you saw before the welcome screen — matter, light, ocean, heartbeat,
          resonance.
        </p>
        <button className="btn ghost" onClick={() => store.markOverture(false)}>
          Play the opening again
        </button>
      </Panel>

      <Panel title="Your data" tone="gold">
        <p className="soft small">
          Everything is in this browser. Private by construction, and fragile — clearing site data erases it
          permanently, with no recovery. Export regularly.
        </p>
        <div className="row">
          <button className="btn" onClick={exportJson}>
            Export everything (JSON)
          </button>
          <button className="btn ghost" onClick={exportJournal}>
            Export journal (Markdown)
          </button>
          <button className="btn ghost" onClick={() => fileRef.current?.click()}>
            Restore from a JSON export
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
          />
        </div>
        {importMsg && <div className="note calm" style={{ marginTop: ".9rem", marginBottom: 0 }}>{importMsg}</div>}
        <div className="field-hint">
          Voice recordings are stored separately (IndexedDB) and are not included in an export. They stay in the
          browser that recorded them.
        </div>
      </Panel>

      <Panel title={`Kept remarks (${state.savedRemarks.length})`}>
        {state.savedRemarks.length === 0 ? (
          <p className="small muted">Nothing kept yet.</p>
        ) : (
          state.savedRemarks.map((id) => {
            const r = remarkById[id];
            if (!r) return null;
            return (
              <div key={id} className="spread" style={{ padding: ".5rem 0", borderBottom: "1px solid var(--line-soft)" }}>
                <span className="serif soft">{r.text}</span>
                <button className="btn ghost sm" onClick={() => store.toggleSavedRemark(id)}>
                  ×
                </button>
              </div>
            );
          })
        )}
      </Panel>

      <Panel title={`Kept codex entries (${state.codexSaved.length})`}>
        {state.codexSaved.length === 0 ? (
          <p className="small muted">Nothing kept yet.</p>
        ) : (
          state.codexSaved.map((id) => {
            const c = codexById[id];
            if (!c) return null;
            return (
              <div key={id} className="spread" style={{ padding: ".5rem 0", borderBottom: "1px solid var(--line-soft)" }}>
                <span className="soft small">{c.title}</span>
                <button className="btn ghost sm" onClick={() => store.toggleCodexSaved(id)}>
                  ×
                </button>
              </div>
            );
          })
        )}
      </Panel>

      <Panel title="The terms you accepted">
        {state.consent ? (
          <>
            <p className="small muted">Accepted {prettyDate(state.consent.acceptedAt.slice(0, 10))}.</p>
            <ul className="small soft" style={{ paddingLeft: "1.1rem" }}>
              <li>You confirmed you are 18 or older.</li>
              <li>You understood this is not therapy, medical care, or crisis support.</li>
              <li>You accepted that this practice may change how you perceive reality and yourself.</li>
              <li>You understood that some prompts deliberately go deep, and can be switched off.</li>
              <li>You understood the community is unvetted peers, not professionals.</li>
              <li>You accepted that how you run this experiment, and its consequences, are yours.</li>
            </ul>
            <DangerButton
              className="btn ghost sm"
              confirmLabel="Yes — show the threshold again"
              onConfirm={() => store.revokeThreshold()}
            >
              Read the threshold again
            </DangerButton>
            <div className="field-hint">This only re-shows the gate. Your data is untouched.</div>
          </>
        ) : (
          <p className="small muted">No record.</p>
        )}
      </Panel>

      <Panel title="Erase everything" tone="">
        <p className="small soft">
          Deletes your journal, readings, goals, plans, and settings from this browser. Voice clips are removed
          from local storage as well. There is no backup and no recovery. Export first if there is any chance
          you&apos;ll want it.
        </p>
        <DangerButton
          className="btn danger"
          confirmLabel="Erase it all — this cannot be undone"
          onConfirm={() => {
            try {
              indexedDB.deleteDatabase("eternal_ruler_voice");
            } catch {
              /* nothing else to do */
            }
            store.wipe();
          }}
        >
          Erase all data
        </DangerButton>
      </Panel>

      <Panel title="If things get difficult" tone="violet">
        <p className="small soft">
          Reduce intensity and talk to a professional if you notice: sleep going, a persistent sense that
          things are unreal, fear that won&apos;t settle, isolating from people who know you, certainty that
          can&apos;t be questioned, or big irreversible decisions made on guidance.
        </p>
        <div className="note grave" style={{ marginBottom: 0 }}>
          <strong>In danger right now? Reach a person tonight.</strong> US &amp; Canada 988 · UK &amp; Ireland
          116 123 · elsewhere your local emergency number or findahelpline.com.
        </div>
      </Panel>
    </>
  );
}

// ---------------------------------------------------------------- voice ----
function VoiceSummary({ store, go }) {
  const v = store.state.voice;
  const recorded = Object.keys(store.state.ownVoice).length;
  const { preset, voice } = resolvePreset(v.presetId, v.voiceURI);

  return (
    <Panel title="The guide voice">
      {speechSupported() ? (
        <>
          <div className="reading-row">
            <span className="small">Voice</span>
            <span className="chip static">
              {preset.glyph} {preset.name} · {preset.tone}
            </span>
          </div>
          <div className="reading-row">
            <span className="small">Speaking as</span>
            <span className="small soft">
              {v.presetId === "own"
                ? `${recorded} line${recorded === 1 ? "" : "s"} in your voice`
                : voice?.name || "no device voice found"}
            </span>
          </div>
          <Check
            checked={v.enabled}
            onChange={(on) => {
              if (!on) stopAll();
              store.setVoice({ enabled: on });
            }}
            title="Speak to me"
          >
            Mute any time from the ◉ in the header.
          </Check>
          <button className="btn" onClick={() => go("voicelib")}>
            Open the Voice Library
          </button>
        </>
      ) : (
        <p className="small soft" style={{ marginBottom: 0 }}>
          This browser has no speech synthesis, so the guide can&apos;t speak here.
        </p>
      )}
    </Panel>
  );
}
