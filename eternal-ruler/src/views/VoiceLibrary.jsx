import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { VOICE_PRESETS, guideAreas } from "../data/voices.js";
import { OVERTURE_LINES } from "../lib/overture-scenes.js";
import { meditationLines } from "../data/meditations.js";
import { PROTOCOLS } from "../data/protocols.js";
import { Bar, Check, DangerButton, Field, Panel, Stat } from "../components/ui.jsx";
import { useDeviceVoices } from "../components/Speak.jsx";
import { clips, recordingSupported, useClipUrl, useRecorder } from "../lib/audio.js";
import { getLastEngine, isLikelyFemale, onEngineChange, resolvePreset, settingsFor, speak, speakLine, speechSupported, stopAll } from "../lib/voice.js";
import { cacheReport, clearCache, ensureAvailable, generate, knownAvailability, probe, pruneStaleDeliveries, resetAvailability } from "../lib/tts.js";
import { formatDuration } from "../lib/util.js";

export function VoiceLibrary() {
  const store = useStore();
  const { state } = store;
  const v = state.voice;
  const [tab, setTab] = useState(v.presetId === "own" ? "record" : "library");

  const areas = useMemo(() => guideAreas(PROTOCOLS, OVERTURE_LINES, meditationLines()), []);
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
    // Preview through the real pipeline so you hear exactly what you'll get.
    speakLine(
      null,
      preset.sample,
      { ...v, enabled: true, presetId: preset.id, voiceURI: v.presetId === preset.id ? v.voiceURI : "" },
      { onEnd: () => setPlaying(null) }
    ).catch(() => setPlaying(null));
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

      <NaturalVoice store={store} />

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

      <Panel title="Fine tuning" right={<span className="label">Device voice only</span>}>
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

// ------------------------------------------------------- the natural voice --
function NaturalVoice({ store }) {
  const v = store.state.voice;
  // Anything but an explicit "device" means natural-when-available.
  const on = v.engine !== "device";
  const areas = useMemo(() => guideAreas(PROTOCOLS, OVERTURE_LINES, meditationLines()), []);
  const texts = useMemo(() => areas.flatMap((a) => a.lines.map((l) => l.text)), [areas]);

  const [status, setStatus] = useState(knownAvailability());
  const [keyDraft, setKeyDraft] = useState(v.apiKey);
  const [report, setReport] = useState(null);
  const [warm, setWarm] = useState(null); // { done, total, failed }
  const [engine, setEngine] = useState(getLastEngine());
  const abort = useRef(null);

  // Takes an explicit key so "Save" can probe with the key you just typed —
  // reading it from state here would use the previous value.
  const check = useCallback(
    async (keyOverride) => {
      setStatus("checking");
      resetAvailability();
      const r = await probe((keyOverride ?? v.apiKey) || undefined);
      setStatus(r);
      await ensureAvailable((keyOverride ?? v.apiKey) || undefined);
    },
    [v.apiKey]
  );

  // Ask once on arrival so the panel is honest before you touch anything.
  useEffect(() => {
    let dead = false;
    ensureAvailable(v.apiKey || undefined).then((r) => !dead && setStatus(r));
    return () => {
      dead = true;
    };
  }, [v.apiKey]);

  useEffect(() => onEngineChange(setEngine), []);

  useEffect(() => {
    let dead = false;
    // Clear out audio from retuned presets first, so the count below reflects
    // what will actually be heard rather than what is merely stored.
    pruneStaleDeliveries()
      .then(() => cacheReport(v.presetId, v.model, texts))
      .then((r) => !dead && setReport(r));
    return () => {
      dead = true;
    };
  }, [v.presetId, v.model, texts, warm]);

  async function prewarm() {
    const preset = VOICE_PRESETS.find((p) => p.id === v.presetId) || VOICE_PRESETS[0];
    const controller = new AbortController();
    abort.current = controller;
    let done = 0;
    let failed = 0;
    setWarm({ done: 0, total: texts.length, failed: 0 });
    for (const text of texts) {
      if (controller.signal.aborted) break;
      try {
        await generate({
          presetId: preset.id,
          model: v.model,
          text,
          voice: preset.openai.voice,
          instructions: preset.openai.instructions,
          speed: preset.openai.speed,
          apiKey: v.apiKey || undefined,
          signal: controller.signal,
        });
      } catch (err) {
        if (err.code === "aborted") break;
        failed++;
        // A missing key means every remaining line fails too — stop early.
        if (err.code === "no_key") {
          setStatus({ ok: false, code: "no_key", message: err.message });
          break;
        }
      }
      done++;
      setWarm({ done, total: texts.length, failed });
    }
    abort.current = null;
    setWarm((w) => (w ? { ...w, finished: true } : null));
  }

  return (
    <Panel tone={on ? "gold" : ""} title="A natural voice">
      <p className="small soft">
        The device voices below are free, instant and offline — and they sound synthetic. Turning this on
        uses OpenAI&apos;s text-to-speech instead: soft, human, genuinely comforting. Each line is
        generated once, cached on this device forever, and then plays instantly and offline.
      </p>

      {/* The plain answer to "why does this still sound robotic?" */}
      <div className={`engine-state ${status?.ok ? "live" : status === "checking" ? "" : "down"}`}>
        <span className="engine-dot" />
        <div>
          <strong>
            {status === "checking"
              ? "Checking the voice service…"
              : status?.ok
                ? on
                  ? "Natural voice active"
                  : "Natural voice available — currently switched off"
                : "Natural voice unavailable — you are hearing the device voice"}
          </strong>
          {engine && (
            <span className="tiny muted" style={{ display: "block" }}>
              Last line played by: {engine === "natural" ? "OpenAI" : engine === "own" ? "your recording" : "the browser"}
            </span>
          )}
        </div>
        <button className="btn ghost sm" onClick={() => check()}>
          Re-check
        </button>
      </div>

      {status && status !== "checking" && !status.ok && (
        <div className="note warn">
          {status.code === "no_route" ? (
            <>
              <strong>Nothing is serving <code>/api/tts</code> at this address.</strong> This is what a
              plain static build looks like — and it is also what the hosted preview link looks like,
              because that sandbox blocks all outbound network requests and always will.
              <br />
              <br />
              To actually hear it: run <code>npm run dev</code> with your key in <code>.env</code>, or
              deploy to Vercel with <code>api/tts.js</code> and <code>OpenAI_EternalRuler</code> set. Until
              then the device voices are all that can play.
            </>
          ) : status.code === "no_key" ? (
            <>
              <strong>The voice service is running, but has no OpenAI key.</strong> Set{" "}
              <code>OpenAI_EternalRuler</code> in its environment — the right way, since the key never
              touches a browser — or paste a key below to use it from this device only.
            </>
          ) : (
            <>
              <strong>Couldn&apos;t reach the voice service.</strong> {status.message}
            </>
          )}
        </div>
      )}

      <Check
        checked={on}
        onChange={(next) => {
          stopAll();
          store.setVoice({ engine: next ? "auto" : "device" });
          if (next) check();
        }}
        title="Use the natural voice when it's available"
      >
        On by default. Falls back to the device voice wherever the service can&apos;t be reached, so the
        guide is never silent.
      </Check>

      {on && (
        <>

          <Field
            label="Your own OpenAI key (optional)"
            hint="Stored in this browser only and sent to this app's own /api/tts, never to a third party. A server-side key is safer; use this only for your own device."
          >
            <div className="row">
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                placeholder="sk-…"
                style={{ flex: 1, minWidth: 180 }}
                autoComplete="off"
              />
              <button
                className="btn sm"
                onClick={() => {
                  const next = keyDraft.trim();
                  store.setVoice({ apiKey: next });
                  check(next);
                }}
              >
                Save
              </button>
              {v.apiKey && (
                <DangerButton
                  onConfirm={() => {
                    store.setVoice({ apiKey: "" });
                    setKeyDraft("");
                    setStatus(null);
                  }}
                >
                  Forget
                </DangerButton>
              )}
            </div>
          </Field>

          <hr className="rule" />

          <div className="spread" style={{ marginBottom: ".8rem" }}>
            <div>
              <div className="label">Cached for this voice</div>
              <p className="small soft" style={{ marginBottom: 0 }}>
                {report
                  ? `${report.have} of ${report.total} lines ready${
                      report.bytes ? ` · ${(report.bytes / 1048576).toFixed(1)} MB` : ""
                    }`
                  : "Counting…"}
              </p>
            </div>
            {report && <Stat n={`${report.have}/${report.total}`} k="Ready" />}
          </div>

          {warm && !warm.finished ? (
            <>
              <Bar pct={(warm.done / warm.total) * 100} />
              <div className="row" style={{ marginTop: ".7rem" }}>
                <span className="small muted">
                  Generating {warm.done}/{warm.total}
                  {warm.failed ? ` · ${warm.failed} failed` : ""}
                </span>
                <button className="btn ghost sm" onClick={() => abort.current?.abort()}>
                  Stop
                </button>
              </div>
            </>
          ) : (
            <div className="row">
              <button className="btn" onClick={prewarm}>
                Generate every line
              </button>
              <DangerButton
                className="btn ghost sm"
                confirmLabel="Clear cached audio"
                onConfirm={async () => {
                  await clearCache();
                  setReport(await cacheReport(v.presetId, v.model, texts));
                }}
              >
                Clear cache
              </DangerButton>
              {warm?.finished && (
                <span className="small" style={{ color: warm.failed ? "var(--ember)" : "var(--moss)" }}>
                  {warm.failed ? `${warm.failed} failed` : "All generated."}
                </span>
              )}
            </div>
          )}

          <div className="field-hint">
            Pre-generating means a guided protocol never pauses mid-practice waiting on the network. It
            costs one API call per line, once. Changing voice or model regenerates.
          </div>

          <div className="note calm" style={{ marginTop: "1rem", marginBottom: 0 }}>
            <strong>What gets sent.</strong> Only the guide&apos;s own fixed lines — protocol steps and four
            app moments. Your journal, readings, intake, goals and recordings are never sent anywhere, by
            this feature or any other.
          </div>
        </>
      )}
    </Panel>
  );
}
