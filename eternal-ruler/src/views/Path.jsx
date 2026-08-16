import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import {
  PATH,
  ROOM_NAMES,
  STAGES,
  TOTAL_DAYS,
  currentDay,
  nextUnlock,
  practiceStep,
  stageOf,
  stepFor,
} from "../data/path.js";
import { protocolById } from "../data/protocols.js";
import { codexById } from "../data/codex.js";
import { promptById } from "../data/prompts.js";
import { REMARKS } from "../data/remarks.js";
import { Runner } from "../components/Runner.jsx";
import { Modal, Panel } from "../components/ui.jsx";
import { dayKey, pickForDay, streakFrom } from "../lib/util.js";

export function Path({ go }) {
  const store = useStore();
  const { state } = store;
  const completed = state.path.completed;
  const day = currentDay(completed);
  const graduated = day > TOTAL_DAYS;

  const [running, setRunning] = useState(null);
  const [justDid, setJustDid] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const step = graduated ? practiceStep(state.path.practiceCount || 0) : stepFor(day);
  const stage = graduated ? null : stageOf(day);
  const remark = useMemo(() => pickForDay(REMARKS, dayKey()), []);
  const streak = streakFrom(state.journal.map((e) => e.dayKey));
  const name = state.profile.name;

  function markDone() {
    if (graduated) {
      store.completePractice();
      setJustDid({ practice: true, title: step.title });
    } else {
      store.completeDay(day);
      setJustDid({ day, unlocks: step.unlocks, next: stepFor(day + 1), milestone: step.milestone });
    }
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------- done ----
  if (justDid) {
    return (
      <Done
        justDid={justDid}
        onContinue={() => setJustDid(null)}
        go={go}
        graduated={graduated}
        completedCount={completed.length}
      />
    );
  }

  return (
    <>
      {/* ---- where you are ---- */}
      <div className="path-head">
        <button className="stage-ribbon" onClick={() => setShowMap(true)}>
          {graduated ? (
            <>
              <span className="stage-glyph">✧</span>
              <span>
                <strong>The Practice</strong>
                <small>You finished the path. This is your own rhythm now.</small>
              </span>
            </>
          ) : (
            <>
              <span className="stage-glyph">{stage.glyph}</span>
              <span>
                <strong>
                  Stage {stage.n} · {stage.name}
                </strong>
                <small>
                  Day {day} of {TOTAL_DAYS} · {stage.promise}
                </small>
              </span>
            </>
          )}
          <span className="tiny muted">Map ›</span>
        </button>

        <div className="progress-track" aria-hidden="true">
          <i style={{ width: `${(completed.length / TOTAL_DAYS) * 100}%` }} />
        </div>
      </div>

      {/* ---- THE ONE THING ---- */}
      <div className="step-card">
        <div className="step-kicker">
          {graduated ? "Today's practice" : step.milestone ? `Day ${day} · Milestone` : `Day ${day} · Your step`}
          <span>{step.minutes} min</span>
        </div>
        <h1>{step.title}</h1>
        <p className="step-why">{step.why}</p>

        <ol className="step-list">
          {step.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>

        <div className="row" style={{ marginTop: "1.2rem" }}>
          {step.protocol && protocolById[step.protocol] && (
            <button className="btn" onClick={() => setRunning(protocolById[step.protocol])}>
              ▶ Guide me through it
            </button>
          )}
          {step.prompt && promptById[step.prompt] && (
            <button
              className="btn ghost"
              onClick={() => go("journal", { promptId: step.prompt, title: step.title })}
            >
              ✎ Open the prompt
            </button>
          )}
          {step.unlocks && (
            <button className="btn ghost" onClick={() => go(step.unlocks)}>
              Go to {ROOM_NAMES[step.unlocks]}
            </button>
          )}
        </div>

        {step.intense && (
          <div className="note warn" style={{ marginTop: "1.1rem" }}>
            <strong>This one goes deep.</strong> You can skip it. Mark it done and move on — nothing later in
            the path depends on it. Knowing when not to open something is a skill this work needs.
          </div>
        )}

        {step.codex && codexById[step.codex] && (
          <button className="codex-link" onClick={() => go("library", { openId: step.codex })}>
            <span className="tiny label">Read alongside it</span>
            <strong>{codexById[step.codex].title}</strong>
            <span className="tiny muted">{codexById[step.codex].subtitle}</span>
          </button>
        )}

        <button className="btn solid block big" onClick={markDone} style={{ marginTop: "1.4rem" }}>
          I did this
        </button>
        <p className="tiny muted center" style={{ marginTop: ".7rem", marginBottom: 0 }}>
          The path moves when you do, not when the calendar does. Miss a month and you resume right here.
        </p>
      </div>

      {/* ---- the remark ---- */}
      <Panel tone="gold">
        <div className="label" style={{ marginBottom: ".6rem" }}>
          Carry this today
        </div>
        <p className="serif" style={{ fontSize: "1.16rem", lineHeight: 1.45, color: "var(--text)", marginBottom: ".7rem" }}>
          {remark.text}
        </p>
        <p className="small soft" style={{ marginBottom: ".8rem" }}>
          <strong>The turn:</strong> {remark.turn}
        </p>
        <button className="btn ghost sm" onClick={() => store.toggleSavedRemark(remark.id)}>
          {state.savedRemarks.includes(remark.id) ? "◆ Kept" : "◇ Keep this"}
        </button>
      </Panel>

      {/* ---- quiet stats ---- */}
      <div className="mini-stats">
        <span>
          <strong>{completed.length}</strong> steps taken
        </span>
        <span>
          <strong>{streak}</strong> day journal streak
        </span>
        <span>
          <strong>{state.journal.length}</strong> entries
        </span>
      </div>

      {name && (
        <p className="center tiny muted" style={{ marginTop: "1.6rem" }}>
          Keep going, {name}.
        </p>
      )}

      {showMap && <MapModal completed={completed} onClose={() => setShowMap(false)} store={store} />}
      {running && <Runner protocol={running} onClose={() => setRunning(null)} />}
    </>
  );
}

// ---------------------------------------------------------------- done ------
function Done({ justDid, onContinue, go, graduated, completedCount }) {
  const unlocked = justDid.unlocks;
  return (
    <div className="done-stage">
      <div className="done-mark">{justDid.milestone ? "✦" : "◉"}</div>
      <h1 className="center">
        {justDid.milestone
          ? "Milestone."
          : graduated
            ? `${justDid.title} — done.`
            : `Step ${justDid.day} complete.`}
      </h1>

      {graduated ? (
        <p className="center soft">
          That&apos;s {completedCount ? "another" : "one"} turn of your own rhythm. Come back tomorrow and the
          next one will be waiting.
        </p>
      ) : justDid.milestone ? (
        <p className="center soft">
          That was one of the five markers on this road. Most people never get to one of them. You just did.
        </p>
      ) : (
        <p className="center soft">Logged. The path moved.</p>
      )}

      {unlocked && (
        <div className="unlock-card">
          <div className="label">A room just opened</div>
          <h2>{ROOM_NAMES[unlocked]}</h2>
          <button className="btn solid" onClick={() => go(unlocked)}>
            Go there now
          </button>
        </div>
      )}

      {justDid.next && (
        <div className="next-card">
          <div className="label">Next, when you&apos;re ready</div>
          <strong>
            Day {justDid.next.day} · {justDid.next.title}
          </strong>
          <p className="small muted" style={{ marginBottom: 0 }}>
            {justDid.next.minutes} min
          </p>
        </div>
      )}

      <div className="row" style={{ justifyContent: "center", marginTop: "1.6rem" }}>
        <button className="btn" onClick={onContinue}>
          {justDid.next || graduated ? "Show me the next step" : "Back to the path"}
        </button>
      </div>
      <p className="center tiny muted" style={{ marginTop: "1rem" }}>
        Coming back tomorrow beats doing three today. That&apos;s not a rule, it&apos;s just what works.
      </p>
    </div>
  );
}

// ----------------------------------------------------------------- map ------
function MapModal({ completed, onClose, store }) {
  const done = new Set(completed);
  const day = currentDay(completed);

  return (
    <Modal title="The map" onClose={onClose} wide>
      <p className="small soft">
        Forty-two steps in five stages. You&apos;re on day {Math.min(day, TOTAL_DAYS)}. Nothing here expires
        and nothing is timed — the path advances when you do.
      </p>

      {STAGES.map((s) => {
        const days = PATH.filter((p) => p.day >= s.days[0] && p.day <= s.days[1]);
        const doneHere = days.filter((p) => done.has(p.day)).length;
        const active = day >= s.days[0] && day <= s.days[1];
        return (
          <div key={s.id} className={`map-stage ${active ? "active" : ""} ${doneHere === days.length ? "complete" : ""}`}>
            <div className="spread">
              <h3>
                <span style={{ color: "var(--violet)", marginRight: ".5rem" }}>{s.glyph}</span>
                {s.n} · {s.name}
              </h3>
              <span className="tiny muted">
                {doneHere}/{days.length}
              </span>
            </div>
            <p className="small muted">{s.promise}</p>
            <div className="map-dots">
              {days.map((p) => (
                <span
                  key={p.day}
                  className={`map-dot ${done.has(p.day) ? "done" : ""} ${p.day === day ? "here" : ""} ${p.milestone ? "milestone" : ""}`}
                  title={`Day ${p.day} · ${p.title}`}
                />
              ))}
            </div>
          </div>
        );
      })}

      <hr className="rule" />
      <div className="note calm" style={{ marginBottom: ".8rem" }}>
        <strong>Rooms open as you go.</strong> That isn&apos;t a gimmick — showing you ten tools on day one is
        how people bounce off this kind of work. If you&apos;d rather have everything at once, that&apos;s
        your call to make.
      </div>
      <label className={`check ${store.state.path.freeRoam ? "on" : ""}`}>
        <input
          type="checkbox"
          checked={store.state.path.freeRoam}
          onChange={(e) => store.setFreeRoam(e.target.checked)}
        />
        <span>
          <strong style={{ display: "block", fontWeight: 600, fontSize: ".9rem" }}>Open every room now</strong>
          <span className="small soft">
            The path stays exactly as it is. This only unlocks the navigation.
          </span>
        </span>
      </label>

      {completed.length > 0 && (
        <>
          <hr className="rule" />
          <div className="spread">
            <span className="small muted">Marked a step by mistake?</span>
            <button className="btn ghost sm" onClick={() => store.undoDay(Math.max(...completed))}>
              Undo day {Math.max(...completed)}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export { nextUnlock };
