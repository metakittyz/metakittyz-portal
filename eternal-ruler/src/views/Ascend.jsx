import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { EVIDENCE_LABEL, NEEDS, PROTOCOLS, protocolById } from "../data/protocols.js";
import { Panel, Stat } from "../components/ui.jsx";
import { Dial } from "../components/Dial.jsx";
import { dayKey, formatDuration } from "../lib/util.js";

const EVIDENCE_TONE = { researched: "moss", mixed: "", traditional: "violet" };

export function Ascend({ params, go }) {
  const store = useStore();
  const { state } = store;
  const [need, setNeed] = useState("all");
  const [running, setRunning] = useState(params?.protocolId ? protocolById[params.protocolId] : null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (params?.protocolId) setRunning(protocolById[params.protocolId] || null);
  }, [params]);

  const list = need === "all" ? PROTOCOLS : PROTOCOLS.filter((p) => p.need === need);
  const todays = state.practiceLog[dayKey()] || [];

  if (running) {
    return <Runner protocol={running} onExit={() => setRunning(null)} store={store} go={go} />;
  }

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">State Stacks</div>
        <h1>The Ascent</h1>
        <p className="lede">
          Your maximum working state is not your loudest state — it&apos;s your least obstructed one. Each stack
          below is a short, ordered sequence that works from the body upward: physiology, then nervous system,
          then attention, then identity, then the one next action. Nothing here requires belief. It requires
          about four minutes.
        </p>
      </div>

      {todays.length > 0 && (
        <Panel tone="gold">
          <div className="spread">
            <div>
              <div className="label">Today</div>
              <div className="small soft">{todays.map((id) => protocolById[id]?.name).filter(Boolean).join(" · ")}</div>
            </div>
            <Stat n={todays.length} k="Run today" />
          </div>
        </Panel>
      )}

      <div className="row tight" style={{ marginBottom: "1.2rem" }}>
        <button className={`chip ${need === "all" ? "on" : ""}`} onClick={() => setNeed("all")}>
          Everything
        </button>
        {NEEDS.map((n) => (
          <button key={n.id} className={`chip ${need === n.id ? "on" : ""}`} onClick={() => setNeed(n.id)}>
            {n.label}
          </button>
        ))}
      </div>

      {list.map((p) => {
        const isOpen = detail === p.id;
        const ev = EVIDENCE_LABEL[p.evidence];
        return (
          <Panel
            key={p.id}
            title={
              <>
                <span style={{ color: "var(--violet)", marginRight: ".5rem" }}>{p.glyph}</span>
                {p.name}
              </>
            }
            right={<span className="label">{p.minutes} min</span>}
          >
            <p className="soft" style={{ marginBottom: ".7rem" }}>
              {p.tagline}
            </p>
            <div className="row tight" style={{ marginBottom: ".8rem" }}>
              <span className={`chip static ${EVIDENCE_TONE[p.evidence]}`}>{ev.short}</span>
              {todays.includes(p.id) && <span className="chip static moss">Done today</span>}
              {p.caution && <span className="chip static ember">Read the caution</span>}
            </div>

            {isOpen && (
              <>
                <p className="small soft">{p.why}</p>
                <p className="tiny muted">{ev.note}</p>
                {p.caution && (
                  <div className="note warn">
                    <strong>Caution.</strong> {p.caution}
                  </div>
                )}
                <ol className="small soft" style={{ paddingLeft: "1.1rem" }}>
                  {p.steps.map((s, i) => (
                    <li key={i} style={{ marginBottom: ".5rem" }}>
                      <strong style={{ color: "var(--text)", fontWeight: 500 }}>{s.label}</strong>
                      {s.seconds ? <span className="muted"> · {formatDuration(s.seconds)}</span> : null}
                      <div>{s.detail}</div>
                    </li>
                  ))}
                </ol>
              </>
            )}

            <div className="row">
              <button className="btn solid sm" onClick={() => setRunning(p)}>
                Begin
              </button>
              <button className="btn ghost sm" onClick={() => setDetail(isOpen ? null : p.id)}>
                {isOpen ? "Hide the detail" : "Read it first"}
              </button>
            </div>
          </Panel>
        );
      })}
    </>
  );
}

function Runner({ protocol, onExit, store, go }) {
  const timed = protocol.steps.some((s) => s.seconds);
  const [phase, setPhase] = useState("before"); // before | run | after
  const [before, setBefore] = useState(50);
  const [after, setAfter] = useState(50);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(protocol.steps[0]?.seconds || 0);
  const [paused, setPaused] = useState(false);
  const [checked, setChecked] = useState({});
  const startedAt = useRef(Date.now());

  const step = protocol.steps[i];
  const total = protocol.steps.length;

  useEffect(() => {
    if (phase !== "run" || !timed || paused || !step?.seconds) return undefined;
    if (left <= 0) {
      if (i + 1 < total) {
        setI(i + 1);
        setLeft(protocol.steps[i + 1].seconds || 0);
      } else {
        setPhase("after");
      }
      return undefined;
    }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timed, paused, left, i, total, step, protocol.steps]);

  const pct = step?.seconds ? ((step.seconds - left) / step.seconds) * 100 : 0;
  const circumference = 2 * Math.PI * 86;

  const doneCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  function finish() {
    store.logPractice(protocol.id);
    store.logAscent({
      protocolId: protocol.id,
      stateBefore: before,
      stateAfter: after,
      secondsHeld: Math.round((Date.now() - startedAt.current) / 1000),
    });
    onExit();
  }

  // ---- pre-flight -----------------------------------------------------------
  if (phase === "before") {
    return (
      <>
        <div className="page-head">
          <div className="eyebrow">{protocol.minutes} minutes · {EVIDENCE_LABEL[protocol.evidence].short}</div>
          <h1>
            <span style={{ color: "var(--violet)", marginRight: ".5rem" }}>{protocol.glyph}</span>
            {protocol.name}
          </h1>
          <p className="lede">{protocol.tagline}</p>
        </div>

        {protocol.caution && (
          <div className="note warn">
            <strong>Before you start.</strong> {protocol.caution}
          </div>
        )}

        <Panel title="Where are you right now?">
          <p className="small muted">
            One number before, one after. Over weeks this tells you which stacks actually work for you rather
            than which ones sound good.
          </p>
          <Dial question="State right now — 0 is flat or frozen, 100 is fully on." value={before} onChange={setBefore} />
          <button
            className="btn solid block"
            onClick={() => {
              startedAt.current = Date.now();
              setPhase("run");
            }}
          >
            Begin
          </button>
          <button className="btn ghost block" style={{ marginTop: ".5rem" }} onClick={onExit}>
            Not now
          </button>
        </Panel>
      </>
    );
  }

  // ---- afterword ------------------------------------------------------------
  if (phase === "after") {
    const delta = after - before;
    return (
      <>
        <div className="page-head">
          <div className="eyebrow">Complete</div>
          <h1>{protocol.name}</h1>
        </div>
        <Panel tone="gold">
          <Dial question="And now?" value={after} onChange={setAfter} />
          <div className="grid three" style={{ margin: "1rem 0" }}>
            <Stat n={before} k="Before" />
            <Stat n={after} k="After" />
            <Stat n={`${delta > 0 ? "+" : ""}${delta}`} k="Shift" />
          </div>
          {delta <= 0 && (
            <div className="note">
              No shift, or a drop. That is real data, not a failed attempt. Some stacks don&apos;t fit some
              people, and some days nothing moves the needle — which is itself worth knowing. Try a different
              stack, or take it as a sign that what you need right now is food, sleep, or another person.
            </div>
          )}
          <div className="row">
            <button className="btn solid" onClick={finish}>
              Log it
            </button>
            <button className="btn ghost" onClick={() => go("journal", { title: `After ${protocol.name}` })}>
              Log it and write
            </button>
          </div>
        </Panel>
      </>
    );
  }

  // ---- checklist protocols (no timers) --------------------------------------
  if (!timed) {
    return (
      <>
        <div className="page-head">
          <div className="eyebrow">Checklist · {protocol.minutes} min</div>
          <h1>{protocol.name}</h1>
          <p className="lede">{protocol.why}</p>
        </div>
        <Panel>
          {protocol.steps.map((s, idx) => (
            <label
              key={idx}
              className={`check ${checked[idx] ? "on" : ""}`}
              style={{ alignItems: "flex-start" }}
            >
              <input
                type="checkbox"
                checked={!!checked[idx]}
                onChange={(e) => setChecked((p) => ({ ...p, [idx]: e.target.checked }))}
              />
              <span>
                <strong style={{ display: "block", fontWeight: 600, fontSize: ".92rem" }}>{s.label}</strong>
                <span className="small soft">{s.detail}</span>
              </span>
            </label>
          ))}
          <div className="row" style={{ marginTop: "1rem" }}>
            <button className="btn solid" onClick={() => setPhase("after")}>
              Done ({doneCount}/{total})
            </button>
            <button className="btn ghost" onClick={onExit}>
              Leave
            </button>
          </div>
        </Panel>
      </>
    );
  }

  // ---- the timed run --------------------------------------------------------
  return (
    <>
      <div className="page-head">
        <div className="eyebrow">
          {protocol.name} · step {i + 1} of {total}
        </div>
        <h1>{step.label}</h1>
      </div>

      <div className="ascend-stage">
        <div className="ring">
          <svg viewBox="0 0 190 190" width="190" height="190">
            <circle cx="95" cy="95" r="86" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" />
            <circle
              cx="95"
              cy="95"
              r="86"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              style={{ transition: "stroke-dashoffset .95s linear" }}
            />
          </svg>
          <span className="count">{formatDuration(left)}</span>
        </div>

        <div className="step-pips">
          {protocol.steps.map((_, idx) => (
            <span key={idx} className={`pip ${idx === i ? "on" : idx < i ? "done" : ""}`} />
          ))}
        </div>

        <p className="step-detail">{step.detail}</p>

        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={() => setPaused((v) => !v)}>
            {paused ? "▶ Resume" : "❚❚ Pause"}
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              if (i + 1 < total) {
                setI(i + 1);
                setLeft(protocol.steps[i + 1].seconds || 0);
              } else setPhase("after");
            }}
          >
            Skip ahead
          </button>
          <button className="btn ghost" onClick={() => setPhase("after")}>
            End early
          </button>
        </div>
        <p className="tiny muted" style={{ marginTop: "1.4rem" }}>
          Ending early is allowed and always has been. Two rungs of the ladder is better than none.
        </p>
      </div>
    </>
  );
}
