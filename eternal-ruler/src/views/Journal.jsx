import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { PROMPTS, PROMPT_CATEGORIES, promptById } from "../data/prompts.js";
import { DangerButton, Empty, Field, Modal, Panel } from "../components/ui.jsx";
import { clips, recordingSupported, useClipUrl, useRecorder } from "../lib/audio.js";
import { formatDuration, prettyDate, timeOf, uid } from "../lib/util.js";

const DEPTH_LABEL = { surface: "Surface", deep: "Deep", abyss: "Abyss" };
const DEPTH_TONE = { surface: "", deep: "violet", abyss: "ember" };

export function Journal({ params, go }) {
  const store = useStore();
  const { state } = store;

  const [title, setTitle] = useState(params?.title || "");
  const [body, setBody] = useState("");
  const [prompt, setPrompt] = useState(null);
  const [freeText, setFreeText] = useState(params?.promptText || "");
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [attached, setAttached] = useState(null); // { id, duration }
  const [savedFlash, setSavedFlash] = useState(false);

  const rec = useRecorder();

  useEffect(() => {
    if (params?.title) setTitle(params.title);
    if (params?.promptText) setFreeText(params.promptText);
    if (params?.promptId) setPrompt(promptById[params.promptId] || null);
  }, [params]);

  const header = prompt?.text || freeText;

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.journal;
    return state.journal.filter((e) =>
      [e.title, e.body, promptById[e.promptId]?.text, e.promptText].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [state.journal, query]);

  async function toggleRecord() {
    if (rec.status === "recording") {
      const out = await rec.stop();
      if (out?.blob) {
        const id = uid("voc");
        await clips.put(id, out.blob);
        setAttached({ id, duration: out.duration });
      }
    } else {
      rec.start();
    }
  }

  function save() {
    if (!body.trim() && !title.trim() && !attached) return;
    if (attached) {
      store.addRecording({
        id: attached.id,
        title: title.trim() || "Journal voice note",
        kind: "journal",
        duration: attached.duration,
        text: header || "",
      });
    }
    store.addEntry({
      title: title.trim(),
      body: body.trim(),
      promptId: prompt?.id || null,
      promptText: prompt ? null : freeText || null,
      flagged: !!prompt?.intense,
      recordingId: attached?.id || null,
    });
    setTitle("");
    setBody("");
    setPrompt(null);
    setFreeText("");
    setAttached(null);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2400);
  }

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">The Log</div>
        <h1>Journal</h1>
        <p className="lede">
          This is the beta test. Everything you notice, everything that shifts, everything that felt like
          nothing at the time. Record it plainly and date it — the pattern is only visible in hindsight, and
          hindsight needs raw material.
        </p>
      </div>

      <Panel tone="gold">
        {header && (
          <div className="note" style={{ marginBottom: "1rem" }}>
            <div className="label" style={{ marginBottom: ".3rem" }}>
              {prompt ? `${PROMPT_CATEGORIES[prompt.cat]} · ${DEPTH_LABEL[prompt.depth]}` : "Writing on"}
            </div>
            <div className="serif" style={{ fontSize: "1.05rem", color: "var(--text)" }}>
              {header}
            </div>
            {prompt?.care && (
              <div className="small" style={{ color: "var(--ember)", marginTop: ".5rem" }}>
                ◆ {prompt.care}
              </div>
            )}
            <button
              className="btn ghost sm"
              style={{ marginTop: ".6rem" }}
              onClick={() => {
                setPrompt(null);
                setFreeText("");
              }}
            >
              Clear prompt
            </button>
          </div>
        )}

        <div className="row" style={{ marginBottom: ".9rem" }}>
          <button className="btn sm" onClick={() => setPicking(true)}>
            ◇ Choose a prompt
          </button>
          <button
            className="btn ghost sm"
            onClick={() => {
              const pool = state.settings.showDeepPrompts ? PROMPTS : PROMPTS.filter((p) => !p.intense);
              setPrompt(pool[Math.floor(Math.random() * pool.length)]);
              setFreeText("");
            }}
          >
            ✦ Surprise me
          </button>
        </div>

        <Field label="Title">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Entry">
          <textarea
            className="tall"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write without editing. You can be incoherent here — it's the only place you don't have to make sense."
          />
        </Field>

        {recordingSupported() && (
          <div className="row" style={{ marginBottom: ".9rem" }}>
            <button className={`btn sm ${rec.status === "recording" ? "danger" : "ghost"}`} onClick={toggleRecord}>
              {rec.status === "recording" ? `◼ Stop (${formatDuration(rec.elapsed)})` : "● Add a voice note"}
            </button>
            {attached && (
              <>
                <span className="small" style={{ color: "var(--moss)" }}>
                  Voice note attached · {formatDuration(attached.duration)}
                </span>
                <button
                  className="btn ghost sm"
                  onClick={() => {
                    clips.delete(attached.id).catch(() => {});
                    setAttached(null);
                  }}
                >
                  Remove
                </button>
              </>
            )}
            {rec.error && <span className="small" style={{ color: "var(--blood)" }}>{rec.error}</span>}
          </div>
        )}

        <div className="row">
          <button className="btn solid" onClick={save} disabled={!body.trim() && !title.trim() && !attached}>
            Seal the entry
          </button>
          {savedFlash && <span className="small" style={{ color: "var(--moss)" }}>Written down.</span>}
        </div>
      </Panel>

      <div className="spread" style={{ margin: "1.8rem 0 1rem" }}>
        <h2>{state.journal.length} entries</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the log…"
          style={{ maxWidth: 240 }}
        />
      </div>

      {entries.length === 0 ? (
        <Empty glyph="◇">
          {state.journal.length ? "Nothing matches that search." : "The log is empty. Start anywhere — even 'nothing happened today' is a data point."}
        </Empty>
      ) : (
        entries.map((e) => <Entry key={e.id} entry={e} store={store} />)
      )}

      {picking && (
        <PromptPicker
          onClose={() => setPicking(false)}
          showDeep={state.settings.showDeepPrompts}
          onPick={(p) => {
            setPrompt(p);
            setFreeText("");
            setPicking(false);
          }}
        />
      )}
    </>
  );
}

function Entry({ entry, store }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.body);
  const p = entry.promptId ? promptById[entry.promptId] : null;
  const clipUrl = useClipUrl(entry.recordingId);

  return (
    <div className="entry">
      <div className="entry-meta">
        <span>
          {prettyDate(entry.dayKey)} · {timeOf(entry.at)}
        </span>
        {p && (
          <span className={`chip static ${DEPTH_TONE[p.depth]}`}>
            {PROMPT_CATEGORIES[p.cat]} · {DEPTH_LABEL[p.depth]}
          </span>
        )}
        {entry.flagged && <span className="chip static ember">Deep</span>}
        {entry.recordingId && <span className="chip static frost">Voice</span>}
        <div className="topbar-spacer" />
        <button className="btn ghost sm" onClick={() => setEditing((v) => !v)}>
          {editing ? "Cancel" : "Edit"}
        </button>
        <DangerButton
          onConfirm={() => {
            if (entry.recordingId) {
              clips.delete(entry.recordingId).catch(() => {});
              store.removeRecording(entry.recordingId);
            }
            store.deleteEntry(entry.id);
          }}
        >
          Delete
        </DangerButton>
      </div>

      {entry.title && <h3 style={{ marginBottom: ".4rem" }}>{entry.title}</h3>}
      {(p || entry.promptText) && (
        <div className="small" style={{ color: "var(--gold-dim)", marginBottom: ".5rem", fontStyle: "italic" }}>
          {p?.text || entry.promptText}
        </div>
      )}

      {editing ? (
        <>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="tall" />
          <div className="row" style={{ marginTop: ".6rem" }}>
            <button
              className="btn sm"
              onClick={() => {
                store.updateEntry(entry.id, { body: draft });
                setEditing(false);
              }}
            >
              Save
            </button>
          </div>
        </>
      ) : (
        entry.body && <div className="entry-body">{entry.body}</div>
      )}

      {clipUrl && <audio controls src={clipUrl} preload="none" />}
    </div>
  );
}

function PromptPicker({ onClose, onPick, showDeep }) {
  const [cat, setCat] = useState("all");
  const [confirming, setConfirming] = useState(null);

  const pool = showDeep ? PROMPTS : PROMPTS.filter((p) => !p.intense);
  const list = cat === "all" ? pool : pool.filter((p) => p.cat === cat);

  return (
    <Modal title="Choose a prompt" onClose={onClose} wide>
      {!showDeep && (
        <div className="note calm">
          Deep prompts are currently switched off in Settings. Only the gentler ones are shown.
        </div>
      )}

      <div className="row tight" style={{ marginBottom: "1rem" }}>
        <button className={`chip ${cat === "all" ? "on" : ""}`} onClick={() => setCat("all")}>
          All
        </button>
        {Object.entries(PROMPT_CATEGORIES).map(([k, v]) => (
          <button key={k} className={`chip ${cat === k ? "on" : ""}`} onClick={() => setCat(k)}>
            {v}
          </button>
        ))}
      </div>

      {confirming ? (
        <div className="note warn">
          <div className="label" style={{ marginBottom: ".4rem" }}>
            This one goes deep
          </div>
          <p className="serif" style={{ fontSize: "1.05rem", color: "var(--text)" }}>
            {confirming.text}
          </p>
          <p className="small">{confirming.care}</p>
          <p className="small muted">
            You can stop halfway. You can write two words. You can close this and come back in a month. None of
            those is a failure — knowing when not to open something is a skill this work depends on.
          </p>
          <div className="row">
            <button className="btn solid sm" onClick={() => onPick(confirming)}>
              I&apos;m ready
            </button>
            <button className="btn ghost sm" onClick={() => setConfirming(null)}>
              Not today
            </button>
          </div>
        </div>
      ) : (
        <div className="stack">
          {list.map((p) => (
            <button
              key={p.id}
              className="entry"
              style={{ textAlign: "left", cursor: "pointer", width: "100%", background: "transparent" }}
              onClick={() => (p.intense ? setConfirming(p) : onPick(p))}
            >
              <div className="entry-meta">
                <span className={`chip static ${DEPTH_TONE[p.depth]}`}>{DEPTH_LABEL[p.depth]}</span>
                <span>{PROMPT_CATEGORIES[p.cat]}</span>
                {p.intense && <span className="chip static ember">Goes deep</span>}
              </div>
              <div style={{ color: "var(--text)" }}>{p.text}</div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
