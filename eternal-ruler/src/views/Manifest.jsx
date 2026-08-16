import React, { useState } from "react";
import { useStore } from "../lib/store.jsx";
import { Bar, DangerButton, Empty, Field, Panel } from "../components/ui.jsx";
import { Goals } from "./Goals.jsx";
import { prettyDate, uid } from "../lib/util.js";

const STEPS = [
  {
    key: "desire",
    label: "What do you actually want?",
    hint: "Specific enough that you'd know the day you had it. Not 'more abundance' — the number, the room, the job title, the person, the body, the life.",
    placeholder: "Say the real thing, not the acceptable version of it.",
  },
  {
    key: "whyItMatters",
    label: "Why does this matter to you?",
    hint: "If the honest answer is 'to prove something to someone', write that. That's useful information, not a disqualification.",
    placeholder: "The true why.",
  },
  {
    key: "currentPosition",
    label: "Where are you right now, honestly?",
    hint: "The plan can only start from your actual position. Inflating it here is the single most common reason these fail.",
    placeholder: "Numbers, facts, current state. No spin in either direction.",
  },
  {
    key: "identityShift",
    label: "Who do you have to become?",
    hint: "Not what you have to do — who has to be doing it. Goals get abandoned; identities get defended.",
    placeholder: "The person who has this is someone who…",
  },
  {
    key: "dailyMinimum",
    label: "What's the daily minimum?",
    hint: "The version so small you can do it on your worst day. This is what carries the whole thing.",
    placeholder: "Every day, no matter what, I…",
  },
  {
    key: "alreadyTrue",
    label: "Say it in the present tense",
    hint: "One sentence, as if it's already the case. You'll be able to record this in your own voice afterwards.",
    placeholder: "I am…",
  },
];

export function Manifest({ go }) {
  const store = useStore();
  const { state } = store;
  const [building, setBuilding] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [tab, setTab] = useState("plans");

  const active = state.manifestations.filter((m) => !m.archived);
  const archived = state.manifestations.filter((m) => m.archived);
  const openGoals = state.goals.filter((g) => !g.done).length;

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Manifestation</div>
        <h1>The Forge</h1>
        <p className="lede">
          Wanting is not a plan. Put what you want next to where you honestly are, then build the bridge.
        </p>
      </div>

      <div className="row tight" style={{ marginBottom: "1.3rem" }}>
        <button className={`chip ${tab === "plans" ? "on" : ""}`} onClick={() => setTab("plans")}>
          Plans ({active.length})
        </button>
        <button className={`chip ${tab === "goals" ? "on" : ""}`} onClick={() => setTab("goals")}>
          Goals ({openGoals})
        </button>
      </div>

      {tab === "goals" && <Goals go={go} />}

      {tab === "plans" && (
      <>
      <div className="note">
        <strong>The stance here:</strong> naming what you want, deciding who you must become, and acting daily
        is one of the most reliable things a person can do. Whether more than that is at work is yours to
        decide from your own evidence. The Forge just won&apos;t let you substitute a feeling for a Tuesday.
      </div>

      {!building && (
        <button className="btn solid block" onClick={() => setBuilding(true)} style={{ marginBottom: "1.4rem" }}>
          ✦ Forge something new
        </button>
      )}

      {building && (
        <Builder
          onCancel={() => setBuilding(false)}
          onCreate={(data) => {
            const m = store.addManifestation(data);
            setBuilding(false);
            setOpenId(m.id);
          }}
        />
      )}

      {active.length === 0 && !building && (
        <Empty glyph="✦">Nothing in the forge. Start with the thing you keep not saying out loud.</Empty>
      )}

      {active.map((m) => (
        <Card key={m.id} m={m} store={store} open={openId === m.id} onToggle={() => setOpenId(openId === m.id ? null : m.id)} go={go} />
      ))}

      {archived.length > 0 && (
        <Panel title={`Archived (${archived.length})`}>
          {archived.map((m) => (
            <div key={m.id} className="spread" style={{ padding: ".5rem 0", borderBottom: "1px solid var(--line-soft)" }}>
              <span className="soft">{m.title || m.desire?.slice(0, 60)}</span>
              <div className="row tight">
                <button className="btn ghost sm" onClick={() => store.updateManifestation(m.id, { archived: false })}>
                  Restore
                </button>
                <DangerButton onConfirm={() => store.deleteManifestation(m.id)}>Delete</DangerButton>
              </div>
            </div>
          ))}
        </Panel>
      )}
      </>
      )}
    </>
  );
}

function Builder({ onCancel, onCreate }) {
  const [i, setI] = useState(0);
  const [data, setData] = useState({ title: "" });
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <Panel tone="gold" title={`Step ${i + 1} of ${STEPS.length}`} right={<button className="btn ghost sm" onClick={onCancel}>Cancel</button>}>
      <div style={{ marginBottom: "1.1rem" }}>
        <Bar pct={((i + 1) / STEPS.length) * 100} />
      </div>

      {i === 0 && (
        <Field label="Give it a short name">
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. The studio"
          />
        </Field>
      )}

      <Field label={step.label} hint={step.hint}>
        <textarea
          value={data[step.key] || ""}
          onChange={(e) => setData((p) => ({ ...p, [step.key]: e.target.value }))}
          placeholder={step.placeholder}
          autoFocus
        />
      </Field>

      <div className="row">
        {i > 0 && (
          <button className="btn ghost" onClick={() => setI(i - 1)}>
            Back
          </button>
        )}
        <div className="topbar-spacer" />
        {last ? (
          <button className="btn solid" onClick={() => onCreate({ ...data, title: data.title || data.desire?.slice(0, 40) || "Untitled" })}>
            Forge it
          </button>
        ) : (
          <button className="btn" onClick={() => setI(i + 1)}>
            Next
          </button>
        )}
      </div>
    </Panel>
  );
}

function Card({ m, store, open, onToggle, go }) {
  const done = m.milestones.filter((x) => x.done).length;
  const pct = m.milestones.length ? (done / m.milestones.length) * 100 : 0;

  const [ms, setMs] = useState({ title: "", by: "" });
  const [ob, setOb] = useState({ obstacle: "", response: "" });
  const [ev, setEv] = useState("");

  const patch = (key, value) => store.updateManifestation(m.id, { [key]: value });

  return (
    <Panel
      tone="violet"
      title={m.title || "Untitled"}
      right={
        <button className="btn ghost sm" onClick={onToggle}>
          {open ? "Collapse" : "Open"}
        </button>
      }
    >
      {m.alreadyTrue && (
        <p className="serif" style={{ fontSize: "1.15rem", color: "var(--gold)" }}>
          &ldquo;{m.alreadyTrue}&rdquo;
        </p>
      )}
      <div className="spread tiny muted" style={{ marginBottom: ".4rem" }}>
        <span>
          {done}/{m.milestones.length} milestones · {m.evidence.length} pieces of evidence
        </span>
        <span>Started {prettyDate(m.createdAt.slice(0, 10))}</span>
      </div>
      <Bar pct={pct} />

      {m.dailyMinimum && (
        <div className="note" style={{ marginTop: "1rem", marginBottom: 0 }}>
          <strong>Daily minimum:</strong> {m.dailyMinimum}
        </div>
      )}

      {open && (
        <>
          <hr className="rule" />

          <div className="grid two">
            <div>
              <span className="field-label">Where you are</span>
              <p className="small soft">{m.currentPosition || "—"}</p>
            </div>
            <div>
              <span className="field-label">What you want</span>
              <p className="small soft">{m.desire || "—"}</p>
            </div>
          </div>

          <Field label="Who you have to become">
            <textarea value={m.identityShift || ""} onChange={(e) => patch("identityShift", e.target.value)} />
          </Field>
          <Field label="Why it matters">
            <textarea value={m.whyItMatters || ""} onChange={(e) => patch("whyItMatters", e.target.value)} />
          </Field>
          <Field label="Daily minimum" hint="Small enough for your worst day.">
            <input type="text" value={m.dailyMinimum || ""} onChange={(e) => patch("dailyMinimum", e.target.value)} />
          </Field>
          <Field label="Present-tense statement" hint="Record this in your own voice in the Voice Room.">
            <input type="text" value={m.alreadyTrue || ""} onChange={(e) => patch("alreadyTrue", e.target.value)} />
          </Field>

          <hr className="rule" />

          {/* ---- milestones ---- */}
          <h3 style={{ marginBottom: ".7rem" }}>The bridge</h3>
          <p className="small muted">
            Undated isn&apos;t a milestone. It&apos;s a wish with better grammar.
          </p>
          {m.milestones.map((x) => (
            <div key={x.id} className="spread" style={{ padding: ".45rem 0", borderBottom: "1px solid var(--line-soft)" }}>
              <label className="row tight" style={{ cursor: "pointer", flex: 1 }}>
                <input
                  type="checkbox"
                  checked={x.done}
                  style={{ width: "auto", accentColor: "var(--gold)" }}
                  onChange={() =>
                    patch(
                      "milestones",
                      m.milestones.map((y) => (y.id === x.id ? { ...y, done: !y.done } : y))
                    )
                  }
                />
                <span style={{ textDecoration: x.done ? "line-through" : "none", opacity: x.done ? 0.55 : 1 }}>
                  {x.title}
                </span>
              </label>
              <div className="row tight">
                {x.by && <span className="tiny muted">{x.by}</span>}
                <button
                  className="btn ghost sm"
                  onClick={() => patch("milestones", m.milestones.filter((y) => y.id !== x.id))}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <div className="row" style={{ marginTop: ".7rem" }}>
            <input
              type="text"
              value={ms.title}
              onChange={(e) => setMs((p) => ({ ...p, title: e.target.value }))}
              placeholder="Next milestone"
              style={{ flex: 2, minWidth: 160 }}
            />
            <input
              type="date"
              value={ms.by}
              onChange={(e) => setMs((p) => ({ ...p, by: e.target.value }))}
              style={{ flex: 1, minWidth: 140 }}
            />
            <button
              className="btn sm"
              disabled={!ms.title.trim()}
              onClick={() => {
                patch("milestones", [...m.milestones, { id: uid("ms"), title: ms.title.trim(), by: ms.by, done: false }]);
                setMs({ title: "", by: "" });
              }}
            >
              Add
            </button>
          </div>

          <hr className="rule" />

          {/* ---- obstacles ---- */}
          <h3 style={{ marginBottom: ".7rem" }}>What will go wrong, and what you&apos;ll do</h3>
          <p className="small muted">Decide the response now, while it&apos;s cheap. &quot;If X, then I will Y.&quot;</p>
          {m.obstacles.map((o) => (
            <div key={o.id} className="entry" style={{ marginBottom: ".5rem" }}>
              <div className="spread">
                <div>
                  <div className="small" style={{ color: "var(--ember)" }}>
                    If: {o.obstacle}
                  </div>
                  <div className="small soft">Then: {o.response}</div>
                </div>
                <button
                  className="btn ghost sm"
                  onClick={() => patch("obstacles", m.obstacles.filter((y) => y.id !== o.id))}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <div className="row" style={{ marginTop: ".6rem" }}>
            <input
              type="text"
              value={ob.obstacle}
              onChange={(e) => setOb((p) => ({ ...p, obstacle: e.target.value }))}
              placeholder="If… (the obstacle)"
              style={{ flex: 1, minWidth: 150 }}
            />
            <input
              type="text"
              value={ob.response}
              onChange={(e) => setOb((p) => ({ ...p, response: e.target.value }))}
              placeholder="Then I will… (the response)"
              style={{ flex: 1, minWidth: 150 }}
            />
            <button
              className="btn sm"
              disabled={!ob.obstacle.trim() || !ob.response.trim()}
              onClick={() => {
                patch("obstacles", [...m.obstacles, { id: uid("ob"), ...ob }]);
                setOb({ obstacle: "", response: "" });
              }}
            >
              Add
            </button>
          </div>

          <hr className="rule" />

          {/* ---- evidence ---- */}
          <h3 style={{ marginBottom: ".7rem" }}>Evidence log</h3>
          <p className="small muted">
            Every sign it&apos;s moving. Read this on the days you&apos;re certain nothing is.
          </p>
          <div className="row" style={{ marginBottom: ".8rem" }}>
            <input
              type="text"
              value={ev}
              onChange={(e) => setEv(e.target.value)}
              placeholder="What happened?"
              style={{ flex: 1 }}
            />
            <button
              className="btn sm"
              disabled={!ev.trim()}
              onClick={() => {
                patch("evidence", [{ id: uid("ev"), at: new Date().toISOString(), text: ev.trim() }, ...m.evidence]);
                setEv("");
              }}
            >
              Log
            </button>
          </div>
          {m.evidence.length > 0 && (
            <div className="timeline">
              {m.evidence.map((e) => (
                <div key={e.id} style={{ marginBottom: ".6rem" }}>
                  <div className="tiny muted">{prettyDate(e.at.slice(0, 10))}</div>
                  <div className="small soft">{e.text}</div>
                </div>
              ))}
            </div>
          )}

          <hr className="rule" />
          <div className="row">
            <button className="btn ghost sm" onClick={() => go("voice")}>
              Record the statement
            </button>
            <button className="btn ghost sm" onClick={() => go("journal", { title: m.title })}>
              Journal about it
            </button>
            <div className="topbar-spacer" />
            <button className="btn ghost sm" onClick={() => patch("archived", true)}>
              Archive
            </button>
            <DangerButton onConfirm={() => store.deleteManifestation(m.id)}>Delete</DangerButton>
          </div>
        </>
      )}
    </Panel>
  );
}
