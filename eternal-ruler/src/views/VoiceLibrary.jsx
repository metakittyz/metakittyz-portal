import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { VOICE_PRESETS, guideAreas } from "../data/voices.js";
import { PROTOCOLS } from "../data/protocols.js";
import { Check, DangerButton, Field, Panel, Stat } from "../components/ui.jsx";
import { useDeviceVoices } from "../components/Speak.jsx";
import { clips, recordingSupported, useClipUrl, useRecorder } from "../lib/audio.js";
import { isLikelyFemale, resolvePreset, settingsFor, speak, speechSupported, stopAll } from "../lib/voice.js";
import { formatDuration } from "../lib/util.js";

export function VoiceLibrary() {
  const store = useStore();
  const { state } = store;
  const v = state.voice;
  const [tab, setTab] = useState(v.presetId === "own" ? "record" : "library");

  const areas = useMemo(() => guideAreas(PROTOCOLS), []);
  const totalLines = areas.reduce((a, g) => a + g.lines.length, 0);
  const recorded = Object.keys(state.ownVoice).length;

  if (!speechSupported() && !recordingSupported()) {
    return (
      <>
        <div className="page-head">
          <div className="eyebrow">The guide</div>
          <h1>Voice Library</h1>
        </div>
        <div className="note warn">
          This browser has neither speech synthesis nor microphone access, so the guide can&apos;t speak
          here. Everything else in the app works.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">The guide</div>
        <h1>Voice Library</h1>
        <p className="lede">
          Choose who reads the app to you. Five voices tuned for different states — or record every line
          yourself.
        </p>
      </div>

      <div className="row tight" style={{ marginBottom: "1.3rem" }}>
        <button className={`chip ${tab === "library" ? "on" : ""}`} onClick={() => setTab("library")}>
          The library
        </button>
        <button className={`chip ${tab === "record" ? "on" : ""}`} onClick={() => setTab("record")}>
          Your own voice ({recorded}/{totalLines})
        </button>
      </div>

      {tab === "library" ? (
        <Library store={store} />
      ) : (
        <Studio store={store} areas={areas} recorded={recorded} totalLines={totalLines} />
      )}
    </>
  );
}

// -------------------------------------------------------------- library ----
function Library({ store }) {
  const v = store.state.voice;
  const voices = useDeviceVoices();
  const [playing, setPlaying] = useState(null);

  function preview(preset) {
    stopAll();
    setPlaying(preset.id);
    speak(
      preset.sample,
      settingsFor({ ...v, presetId: preset.id, voiceURI: v.presetId === preset.id ? v.voiceURI : "" }),
      { onEnd: () => setPlaying(null) }
    );
  }

  const active = resolvePreset(v.presetId, v.voiceURI);

  return (
    <>
      <Check
        checked={v.enabled}
        onChange={(on) => {
          if (!on) stopAll();
          store.setVoice({ enabled: on });
        }}
        title="Speak to me"
      >
        The guide reads each protocol step aloud, marks completed steps, and reads anything with a ▶ Listen
        button. Mute any time from the ◉ in the header.
      </Check>

      <div className="voice-grid">
        {VOICE_PRESETS.map((p) => {
          const on = v.presetId === p.id;
          return (
            <div key={p.id} className={`voice-card ${on ? "on" : ""}`}>
              <div className="spread">
                <span className="voice-glyph">{p.glyph}</span>
                <span className="chip static tiny">{p.tone}</span>
              </div>
              <strong>{p.name}</strong>
              <span className="small soft">{p.blurb}</span>
              <div className="row tight" style={{ marginTop: ".7rem" }}>
                <button
                  className={`btn sm ${on ? "solid" : ""}`}
                  onClick={() => store.setVoice({ presetId: p.id, voiceURI: "" })}
                >
                  {on ? "◆ Selected" : "Choose"}
                </button>
                {!p.own && (
                  <button className="btn ghost sm" onClick={() => preview(p)}>
                    {playing === p.id ? "◼" : "▶"} Hear
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Panel title="Fine tuning">
        <Field
          label="Device voice"
          hint={
            active.voice
              ? `${active.preset.name} is using ${active.voice.name}${
                  isLikelyFemale(active.voice) ? "" : " — this device may have no female voice installed"
                }.`
              : "No voices found on this device yet."
          }
        >
          <select value={v.voiceURI} onChange={(e) => store.setVoice({ voiceURI: e.target.value })}>
            <option value="">Let {active.preset.name} choose</option>
            {voices.map((o) => (
              <option key={o.voiceURI} value={o.voiceURI}>
                {o.name} ({o.lang}){isLikelyFemale(o) ? " ♀" : ""}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid two">
          <Field label={`Pace ${v.rateOffset >= 0 ? "+" : ""}${v.rateOffset.toFixed(2)}`}>
            <input
              type="range"
              min="-0.2"
              max="0.2"
              step="0.02"
              value={v.rateOffset}
              onChange={(e) => store.setVoice({ rateOffset: Number(e.target.value) })}
            />
          </Field>
          <Field label={`Pitch ${v.pitchOffset >= 0 ? "+" : ""}${v.pitchOffset.toFixed(2)}`}>
            <input
              type="range"
              min="-0.25"
              max="0.25"
              step="0.02"
              value={v.pitchOffset}
              onChange={(e) => store.setVoice({ pitchOffset: Number(e.target.value) })}
            />
          </Field>
        </div>
        <button
          className="btn sm"
          onClick={() => speak("This is how I'll sound. Settle your body, and begin.", settingsFor(v))}
        >
          ▶ Hear the current setting
        </button>
        <div className="field-hint">
          Voices come from your device, not a server — nothing here is sent anywhere and it all works
          offline. Which voices exist depends entirely on your operating system, so a preset resolves to
          the closest match it can find. The pace and pitch are ours, and those travel.
        </div>
      </Panel>
    </>
  );
}

// --------------------------------------------------------------- studio ----
function Studio({ store, areas, recorded, totalLines }) {
  const { state } = store;
  const [open, setOpen] = useState("app");
  const supported = recordingSupported();
  const isOwn = state.voice.presetId === "own";

  return (
    <>
      {!supported && (
        <div className="note warn">
          <strong>Recording isn&apos;t available here.</strong> Your browser needs microphone access over
          HTTPS or localhost. The library voices still work.
        </div>
      )}

      <Panel tone={isOwn ? "gold" : ""}>
        <div className="spread">
          <div>
            <div className="label">Your own voice</div>
            <p className="small soft" style={{ marginBottom: 0 }}>
              {isOwn
                ? "Selected. Recorded lines play in your voice; anything unrecorded falls back to Solace."
                : "Record as many or as few as you like, then select it in the library."}
            </p>
          </div>
          <Stat n={`${recorded}/${totalLines}`} k="Lines recorded" />
        </div>
        {!isOwn && (
          <button
            className="btn solid"
            style={{ marginTop: ".9rem" }}
            onClick={() => store.setVoice({ presetId: "own" })}
          >
            Use my voice
          </button>
        )}
      </Panel>

      <div className="note">
        Read each line the way you&apos;d want to hear it at your worst. Slower than feels natural. You are
        recording for a version of yourself who can&apos;t generate this on their own.
      </div>

      {areas.map((area) => {
        const isOpen = open === area.id;
        const done = area.lines.filter((l) => state.ownVoice[l.id]).length;
        return (
          <Panel
            key={area.id}
            title={area.name}
            right={
              <span className="label">
                {done}/{area.lines.length}
              </span>
            }
          >
            <div className="row">
              <button className="btn ghost sm" onClick={() => setOpen(isOpen ? null : area.id)}>
                {isOpen ? "Close" : "Record these"}
              </button>
              {done > 0 && <span className="chip static moss">{done} recorded</span>}
            </div>
            {isOpen && (
              <div style={{ marginTop: "1rem" }}>
                {area.lines.map((line) => (
                  <LineRow key={line.id} line={line} store={store} supported={supported} />
                ))}
              </div>
            )}
          </Panel>
        );
      })}
    </>
  );
}

function LineRow({ line, store, supported }) {
  const meta = store.state.ownVoice[line.id];
  const rec = useRecorder();
  const url = useClipUrl(meta ? `guide:${line.id}` : null);
  const live = rec.status === "recording";

  async function toggle() {
    if (live) {
      const out = await rec.stop();
      if (out?.blob) {
        await clips.put(`guide:${line.id}`, out.blob);
        store.setOwnLine(line.id, { at: new Date().toISOString(), duration: out.duration });
      }
    } else {
      rec.start();
    }
  }

  return (
    <div className={`line-row ${meta ? "done" : ""}`}>
      <p className="line-text">{line.text}</p>
      <div className="row tight">
        <button className={`btn sm ${live ? "danger" : meta ? "ghost" : ""}`} onClick={toggle} disabled={!supported}>
          {live ? `◼ Stop ${formatDuration(rec.elapsed)}` : meta ? "● Re-record" : "● Record"}
        </button>
        {meta && (
          <>
            <span className="tiny muted">{formatDuration(meta.duration)}</span>
            <DangerButton
              onConfirm={() => {
                clips.delete(`guide:${line.id}`).catch(() => {});
                store.clearOwnLine(line.id);
              }}
            >
              ×
            </DangerButton>
          </>
        )}
      </div>
      {url && <audio controls src={url} preload="none" />}
      {rec.error && <div className="tiny" style={{ color: "var(--blood)" }}>{rec.error}</div>}
    </div>
  );
}
