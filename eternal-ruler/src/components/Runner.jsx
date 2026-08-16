import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { EVIDENCE_LABEL } from "../data/protocols.js";
import { Dial } from "./Dial.jsx";
import { Stat } from "./ui.jsx";
import { useNarrate } from "./Speak.jsx";
import { formatDuration } from "../lib/util.js";

/**
 * The guided protocol runner, as a full-screen overlay so it can be launched
 * from anywhere — a Path step, the "I need something now" drawer, or the Library.
 */
export function Runner({ protocol, onClose }) {
  const store = useStore();
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

  // The guide reads each step aloud as it arrives — this is the room where a
  // spoken voice earns its place.
  useNarrate(phase === "run" && step ? `${step.label}. ${step.detail}` : "", phase === "run");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (phase !== "run" || !timed || paused || !step?.seconds) return undefined;
    if (left <= 0) {
      if (i + 1 < total) {
        setI(i + 1);
        setLeft(protocol.steps[i + 1].seconds || 0);
      } else setPhase("after");
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
    onClose(true);
  }

  return (
    <div className="runner">
      <div className="runner-inner">
        {phase === "before" && (
          <>
            <div className="eyebrow center">
              {protocol.minutes} min · {EVIDENCE_LABEL[protocol.evidence].short}
            </div>
            <h1 className="center" style={{ marginBottom: ".5rem" }}>
              <span style={{ color: "var(--violet)", marginRight: ".5rem" }}>{protocol.glyph}</span>
              {protocol.name}
            </h1>
            <p className="center soft">{protocol.tagline}</p>

            {protocol.caution && (
              <div className="note warn">
                <strong>Before you start.</strong> {protocol.caution}
              </div>
            )}

            <Dial question="Where are you right now? 0 is flat or frozen, 100 is fully on." value={before} onChange={setBefore} />

            <button
              className="btn solid block"
              onClick={() => {
                startedAt.current = Date.now();
                setPhase("run");
              }}
            >
              Begin
            </button>
            <button className="btn ghost block" style={{ marginTop: ".5rem" }} onClick={() => onClose(false)}>
              Not now
            </button>
          </>
        )}

        {phase === "run" && timed && (
          <div className="ascend-stage">
            <div className="eyebrow">
              Step {i + 1} of {total}
            </div>
            <h1 style={{ marginBottom: "1.4rem" }}>{step.label}</h1>

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
            <p className="tiny muted" style={{ marginTop: "1.2rem" }}>
              Ending early is allowed and always has been. Two rungs of the ladder beats none.
            </p>
          </div>
        )}

        {phase === "run" && !timed && (
          <>
            <div className="eyebrow center">Checklist · {protocol.minutes} min</div>
            <h1 className="center" style={{ marginBottom: "1rem" }}>
              {protocol.name}
            </h1>
            {protocol.steps.map((s, idx) => (
              <label key={idx} className={`check ${checked[idx] ? "on" : ""}`}>
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
            <button className="btn solid block" style={{ marginTop: "1rem" }} onClick={() => setPhase("after")}>
              Done ({doneCount}/{total})
            </button>
          </>
        )}

        {phase === "after" && (
          <>
            <div className="eyebrow center">Complete</div>
            <h1 className="center" style={{ marginBottom: "1.2rem" }}>
              {protocol.name}
            </h1>
            <Dial question="And now?" value={after} onChange={setAfter} />
            <div className="grid three" style={{ margin: "1rem 0" }}>
              <Stat n={before} k="Before" />
              <Stat n={after} k="After" />
              <Stat n={`${after - before > 0 ? "+" : ""}${after - before}`} k="Shift" />
            </div>
            {after - before <= 0 && (
              <div className="note">
                No shift, or a drop. That&apos;s real data, not a failed attempt. Some stacks don&apos;t fit
                some people, and some days nothing moves the needle — which is itself worth knowing.
              </div>
            )}
            <button className="btn solid block" onClick={finish}>
              Log it
            </button>
          </>
        )}
      </div>
    </div>
  );
}
