import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { DangerButton, Empty, Field, Panel } from "../components/ui.jsx";
import { clips, recordingSupported, useClipUrl, useRecorder } from "../lib/audio.js";
import { formatDuration, prettyDate, uid } from "../lib/util.js";

const KINDS = {
  affirmation: "Reassurance",
  command: "Command",
  vow: "Vow",
  letter: "Letter from your higher self",
  journal: "Journal note",
  other: "Other",
};

const SCRIPTS = [
  {
    id: "s1",
    kind: "affirmation",
    title: "The one you needed to hear",
    lines: [
      "[Name], listen to me.",
      "You are not behind, and you are not broken.",
      "You have carried harder things than this and you are still standing.",
      "You are allowed to want what you want.",
      "I am not going anywhere.",
    ],
  },
  {
    id: "s2",
    kind: "command",
    title: "For the morning you don't want to move",
    lines: [
      "[Name]. Feet on the floor.",
      "You don't have to feel like it. You just have to begin.",
      "Ten minutes. That's the whole deal.",
      "You've never once regretted starting.",
      "Go.",
    ],
  },
  {
    id: "s3",
    kind: "command",
    title: "Before the thing you're afraid of",
    lines: [
      "[Name], this is your body getting ready. That's all this is.",
      "You have walked into worse rooms than this one.",
      "You do not need them to like you. You need you to respect you.",
      "Say the true thing. Then stop talking.",
      "Walk in.",
    ],
  },
  {
    id: "s4",
    kind: "vow",
    title: "The vow",
    lines: [
      "I, [Name], am done abandoning myself.",
      "I will keep my word to me the way I keep it to everyone else.",
      "I will not shrink to make a room comfortable.",
      "I will feel the thing instead of managing around it.",
      "I will come back to this practice even after I break it.",
    ],
  },
  {
    id: "s5",
    kind: "letter",
    title: "From the one who's already there",
    lines: [
      "[Name], it's me. The one who made it.",
      "I remember this part. It's the part you don't think you'll survive.",
      "You do. Not gracefully — but you do.",
      "The thing you're agonizing over right now is not the thing that decides it.",
      "Keep going. Keep it simple. I'll meet you here.",
    ],
  },
  {
    id: "s6",
    kind: "affirmation",
    title: "For 3am",
    lines: [
      "[Name], nothing has to be solved tonight.",
      "The mind lies at this hour. It always has.",
      "Your only job right now is to breathe out longer than you breathe in.",
      "Everything looks different in daylight. It always does.",
      "Rest. I've got it from here.",
    ],
  },
];

export function VoiceRoom() {
  const store = useStore();
  const { state } = store;
  const rec = useRecorder();

  const name = state.profile.name || "you";
  const [script, setScript] = useState(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("affirmation");
  const [text, setText] = useState("");
  const [pending, setPending] = useState(null);
  const [litany, setLitany] = useState(false);

  const supported = recordingSupported();

  const scriptBody = useMemo(
    () => (script ? script.lines.map((l) => l.replace(/\[Name\]/g, name)).join("\n") : ""),
    [script, name]
  );

  async function toggle() {
    if (rec.status === "recording") {
      const out = await rec.stop();
      if (out?.blob) {
        const id = uid("voc");
        await clips.put(id, out.blob);
        setPending({ id, duration: out.duration });
      }
    } else {
      rec.start();
    }
  }

  function keep() {
    store.addRecording({
      id: pending.id,
      title: title.trim() || script?.title || "Untitled",
      kind,
      duration: pending.duration,
      text: text.trim() || scriptBody,
    });
    setPending(null);
    setTitle("");
    setText("");
    setScript(null);
  }

  function discard() {
    clips.delete(pending.id).catch(() => {});
    setPending(null);
  }

  const affirmations = state.recordings.filter((r) => r.kind !== "journal");

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Your Own Voice</div>
        <h1>The Voice Room</h1>
        <p className="lede">
          Say the thing you&apos;ve been waiting to hear from someone else. Record it on the days you can
          generate it. Play it on the days you can&apos;t.
        </p>
      </div>

      {!supported && (
        <div className="note warn">
          <strong>Recording isn&apos;t available here.</strong> Your browser either doesn&apos;t support
          microphone capture or the page isn&apos;t on HTTPS/localhost. You can still read the scripts aloud —
          most of the effect is in the speaking.
        </div>
      )}

      <Panel tone="gold">
        <div className="ascend-stage" style={{ padding: "1rem 0" }}>
          <button
            className={`mic ${rec.status === "recording" ? "live" : ""}`}
            onClick={toggle}
            disabled={!supported || !!pending}
            style={
              rec.status === "recording"
                ? {
                    transform: `scale(${1 + rec.level * 0.22})`,
                    boxShadow: `0 0 ${18 + rec.level * 70}px rgba(255,106,61,.5)`,
                  }
                : undefined
            }
            aria-label={rec.status === "recording" ? "Stop recording" : "Start recording"}
          >
            {rec.status === "recording" ? "◼" : "●"}
          </button>
          <div className="small muted" style={{ marginTop: ".9rem" }}>
            {rec.status === "recording"
              ? `Recording · ${formatDuration(rec.elapsed)}`
              : pending
                ? "Listen back, then keep it or throw it away."
                : "Tap to record"}
          </div>
          {rec.error && (
            <div className="small" style={{ color: "var(--blood)", marginTop: ".5rem" }}>
              {rec.error}
            </div>
          )}
        </div>

        {scriptBody && !pending && (
          <div className="note" style={{ whiteSpace: "pre-wrap" }}>
            <div className="label" style={{ marginBottom: ".4rem" }}>
              Read this, slowly, out loud
            </div>
            <span className="serif" style={{ fontSize: "1.06rem", color: "var(--text)", lineHeight: 1.7 }}>
              {scriptBody}
            </span>
          </div>
        )}

        {pending && <Preview pending={pending} />}

        {pending && (
          <>
            <hr className="rule" />
            <Field label="Name it">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={script?.title || "e.g. For the hard mornings"}
              />
            </Field>
            <Field label="What kind">
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                {Object.entries(KINDS)
                  .filter(([k]) => k !== "journal")
                  .map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="The words (optional)" hint="Keeping the text means you can re-record it better later.">
              <textarea value={text || scriptBody} onChange={(e) => setText(e.target.value)} />
            </Field>
            <div className="row">
              <button className="btn solid" onClick={keep}>
                Keep it
              </button>
              <button className="btn ghost" onClick={discard}>
                Throw it away
              </button>
            </div>
          </>
        )}
      </Panel>

      {!pending && (
        <Panel title="Scripts to start from" right={<span className="label">Or write your own</span>}>
          <p className="small soft">
            The first read feels absurd. Read it again at half speed — that pass is the one that works.
          </p>
          <div className="stack">
            {SCRIPTS.map((s) => (
              <button
                key={s.id}
                className="entry"
                style={{ textAlign: "left", cursor: "pointer", background: script?.id === s.id ? "var(--panel-2)" : "transparent" }}
                onClick={() => {
                  setScript(s);
                  setKind(s.kind);
                  setTitle(s.title);
                  setText("");
                }}
              >
                <div className="entry-meta">
                  <span className="chip static">{KINDS[s.kind]}</span>
                  {script?.id === s.id && <span className="chip static moss">Loaded</span>}
                </div>
                <strong style={{ fontWeight: 500 }}>{s.title}</strong>
                <div className="small muted" style={{ marginTop: ".3rem" }}>
                  {s.lines[0].replace(/\[Name\]/g, name)}…
                </div>
              </button>
            ))}
          </div>
        </Panel>
      )}

      <Panel
        title={`Your library (${state.recordings.length})`}
        right={
          affirmations.length > 1 && (
            <button className="btn sm" onClick={() => setLitany((v) => !v)}>
              {litany ? "◼ Stop the litany" : "▶ Play the litany"}
            </button>
          )
        }
      >
        <p className="small soft">Every reassurance, back to back. Mornings, or the bad nights.</p>
        {litany && <Litany recordings={affirmations} onEnd={() => setLitany(false)} />}
        {state.recordings.length === 0 ? (
          <Empty glyph="◉">
            Nothing recorded yet. Thirty seconds is enough for the first one.
          </Empty>
        ) : (
          state.recordings.map((r) => <Clip key={r.id} r={r} store={store} />)
        )}
      </Panel>

      <Panel title="Why this works" tone="violet">
        <p className="small soft" style={{ marginBottom: 0 }}>
          Addressing yourself as &quot;you&quot; creates distance that measurably improves regulation under
          stress. Speaking aloud enforces a long exhale — the most reliable brake on your own arousal.
          Whether the voice is your higher self, your future self, or you on a good day doesn&apos;t change
          the effect.
        </p>
      </Panel>
    </>
  );
}

function Preview({ pending }) {
  const url = useClipUrl(pending.id);
  if (!url) return <div className="small muted center">Preparing playback…</div>;
  return (
    <div>
      <div className="label">Listen back · {formatDuration(pending.duration)}</div>
      <audio controls src={url} autoPlay={false} />
    </div>
  );
}

function Clip({ r, store }) {
  const url = useClipUrl(r.id);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(r.title);

  return (
    <div className="entry">
      <div className="entry-meta">
        <span className="chip static">{KINDS[r.kind] || r.kind}</span>
        <span>{prettyDate(r.at.slice(0, 10))}</span>
        <span>{formatDuration(r.duration)}</span>
        <div className="topbar-spacer" />
        <button className="btn ghost sm" onClick={() => setRenaming((v) => !v)}>
          Rename
        </button>
        <DangerButton
          onConfirm={() => {
            clips.delete(r.id).catch(() => {});
            store.removeRecording(r.id);
          }}
        >
          Delete
        </DangerButton>
      </div>
      {renaming ? (
        <div className="row">
          <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} style={{ flex: 1 }} />
          <button
            className="btn sm"
            onClick={() => {
              store.updateRecording(r.id, { title: draft });
              setRenaming(false);
            }}
          >
            Save
          </button>
        </div>
      ) : (
        <h3 style={{ marginBottom: ".3rem" }}>{r.title}</h3>
      )}
      {r.text && <div className="entry-body tiny" style={{ opacity: 0.75 }}>{r.text}</div>}
      {url ? <audio controls src={url} preload="none" /> : <div className="tiny muted">Loading audio…</div>}
    </div>
  );
}

/** Plays the whole library back to back. */
function Litany({ recordings, onEnd }) {
  const [i, setI] = useState(0);
  const [loop, setLoop] = useState(false);
  const current = recordings[i];
  const url = useClipUrl(current?.id);
  const ref = useRef(null);

  useEffect(() => {
    if (url && ref.current) ref.current.play().catch(() => {});
  }, [url]);

  if (!current) return null;

  return (
    <div className="note" style={{ borderLeftColor: "var(--violet)" }}>
      <div className="spread">
        <div>
          <div className="label">
            Now playing {i + 1} of {recordings.length}
          </div>
          <strong style={{ fontWeight: 500 }}>{current.title}</strong>
        </div>
        <button className={`chip ${loop ? "on" : ""}`} onClick={() => setLoop((v) => !v)}>
          ↻ Loop
        </button>
      </div>
      <audio
        ref={ref}
        controls
        src={url || undefined}
        onEnded={() => {
          if (i + 1 < recordings.length) setI(i + 1);
          else if (loop) setI(0);
          else onEnd();
        }}
      />
    </div>
  );
}
