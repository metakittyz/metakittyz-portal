import React, { useMemo } from "react";
import { useStore } from "../lib/store.jsx";
import { Bar, Empty, Panel, Stat } from "../components/ui.jsx";
import { REMARKS } from "../data/remarks.js";
import { PROTOCOLS, protocolById } from "../data/protocols.js";
import { domainById } from "../data/domains.js";
import { summarize, tempColor } from "../lib/temperature.js";
import { dayKey, pickForDay, prettyDate, streakFrom } from "../lib/util.js";

function greeting(hour) {
  if (hour < 5) return "It's late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "It's late";
}

export function Today({ go }) {
  const store = useStore();
  const { state } = store;
  const today = dayKey();
  const remark = useMemo(() => pickForDay(REMARKS, today), [today]);

  const checkin = state.checkins[today];
  const lastCheckinKey = useMemo(() => Object.keys(state.checkins).sort().pop(), [state.checkins]);
  const lastCheckin = lastCheckinKey ? state.checkins[lastCheckinKey] : null;
  const summary = useMemo(
    () => (lastCheckin ? summarize(lastCheckin.readings) : null),
    [lastCheckin]
  );

  const journaledToday = state.journal.some((e) => e.dayKey === today);
  const practicesToday = state.practiceLog[today] || [];
  const openGoals = state.goals.filter((g) => !g.done);
  const activeManifests = state.manifestations.filter((m) => !m.archived);

  const journalStreak = streakFrom(state.journal.map((e) => e.dayKey));
  const checkinStreak = streakFrom(Object.keys(state.checkins));

  const name = state.profile.name;
  const hsName = state.profile.higherSelfName || "your higher self";
  const hour = new Date().getHours();

  const suggested = useMemo(() => {
    if (!summary?.widest) return protocolById["the-ascent"];
    const w = summary.widest;
    if (w.verdict.key === "calling" && ["connection", "intuition"].includes(w.id)) return protocolById.reconnect;
    if (w.verdict.key === "overreach") return protocolById.discernment;
    if (["body", "energy"].includes(w.id)) return protocolById.ignite;
    if (["emotion"].includes(w.id)) return protocolById["spiral-break"];
    if (["confidence", "expression"].includes(w.id)) return protocolById["courage-gate"];
    if (["mind", "purpose"].includes(w.id)) return protocolById["focus-lock"];
    if (["shadow"].includes(w.id)) return protocolById["own-voice"];
    return protocolById["the-ascent"];
  }, [summary]);

  const saved = state.savedRemarks.includes(remark.id);

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">{prettyDate(today)}</div>
        <h1>
          {greeting(hour)}
          {name ? `, ${name}` : ""}.
        </h1>
        {state.profile.intention && (
          <p className="lede">
            <span className="muted small">You said you were here because: </span>
            {state.profile.intention}
          </p>
        )}
      </div>

      {/* ---- the remark of the day ---- */}
      <Panel tone="gold">
        <div className="label" style={{ marginBottom: ".7rem" }}>
          Today&apos;s remark
        </div>
        <p className="serif" style={{ fontSize: "1.3rem", lineHeight: 1.45, color: "var(--text)" }}>
          {remark.text}
        </p>
        <div className="note" style={{ marginBottom: ".8rem" }}>
          <strong>Today&apos;s turn:</strong> {remark.turn}
        </div>
        <div className="row">
          <button className="btn sm" onClick={() => store.toggleSavedRemark(remark.id)}>
            {saved ? "◆ Kept" : "◇ Keep this"}
          </button>
          <button
            className="btn ghost sm"
            onClick={() => go("journal", { promptText: remark.text, title: "On today's remark" })}
          >
            Write on it
          </button>
        </div>
      </Panel>

      {/* ---- the day's four movements ---- */}
      <Panel title="The day's four movements">
        <div className="stack">
          <Movement
            done={!!checkin}
            label="Read your temperature"
            detail={checkin ? "Logged today. You can amend it any time." : "Rate yourself against your higher self across twelve domains."}
            action={() => go("attunement")}
            cta={checkin ? "Amend" : "Take the reading"}
          />
          <Movement
            done={practicesToday.length > 0}
            label="Run a protocol"
            detail={
              practicesToday.length
                ? `${practicesToday.length} logged today: ${practicesToday
                    .map((p) => protocolById[p]?.name || p)
                    .join(", ")}`
                : `Suggested for you right now: ${suggested?.name}`
            }
            action={() => go("ascend", { protocolId: suggested?.id })}
            cta={practicesToday.length ? "Run another" : "Begin"}
          />
          <Movement
            done={journaledToday}
            label="Log the journey"
            detail={journaledToday ? "Today is recorded." : "What happened, what you noticed, what came through."}
            action={() => go("journal")}
            cta={journaledToday ? "Add another" : "Write"}
          />
          <Movement
            done={state.recordings.length > 0}
            label="Hear your own voice"
            detail={
              state.recordings.length
                ? `${state.recordings.length} recording${state.recordings.length === 1 ? "" : "s"} in the Voice Room.`
                : "Record the reassurance you've been waiting for someone else to say."
            }
            action={() => go("voice")}
            cta={state.recordings.length ? "Listen" : "Record"}
          />
        </div>
      </Panel>

      {/* ---- last reading ---- */}
      {summary ? (
        <Panel
          title="Your last reading"
          right={<span className="label">{lastCheckinKey === today ? "Today" : lastCheckinKey}</span>}
        >
          <div className="grid three" style={{ marginBottom: "1rem" }}>
            <Stat n={`${Math.round(summary.alignment)}%`} k="Alignment" />
            <Stat n={Math.round(summary.avgSelf)} k="Your heat" />
            <Stat n={Math.round(summary.avgHigher)} k={`${hsName}'s heat`} />
          </div>
          {summary.widest && (
            <div className="note">
              <strong>Widest gap: {domainById[summary.widest.id]?.name}.</strong>{" "}
              <span className={`verdict ${summary.widest.verdict.tone}`}>{summary.widest.verdict.label}</span>{" "}
              — {summary.widest.verdict.blurb}
            </div>
          )}
          <div className="row tight">
            {summary.strengths.length > 0 && (
              <span className="chip static moss">
                Strengths: {summary.strengths.map((s) => domainById[s.id]?.name).join(", ")}
              </span>
            )}
            {summary.callings.length > 0 && (
              <span className="chip static ember">
                Callings: {summary.callings.map((s) => domainById[s.id]?.name).join(", ")}
              </span>
            )}
          </div>
        </Panel>
      ) : (
        <Panel title="Your last reading">
          <Empty glyph="◉">
            No reading yet. The Hot &amp; Cold reading is the spine of this app — everything else gets more
            useful once it has one.
            <div style={{ marginTop: "1rem" }}>
              <button className="btn" onClick={() => go("attunement")}>
                Take your first reading
              </button>
            </div>
          </Empty>
        </Panel>
      )}

      {/* ---- goals ---- */}
      <Panel
        title="What you're building"
        right={
          <button className="btn ghost sm" onClick={() => go("goals")}>
            All goals
          </button>
        }
      >
        {openGoals.length ? (
          <div className="stack">
            {openGoals.slice(0, 4).map((g) => (
              <div key={g.id} className="spread" style={{ paddingBottom: ".5rem", borderBottom: "1px solid var(--line-soft)" }}>
                <div>
                  <div style={{ fontSize: ".95rem" }}>{g.title}</div>
                  {g.nextAction && <div className="tiny muted">Next: {g.nextAction}</div>}
                </div>
                <button className="btn ghost sm" onClick={() => store.toggleGoal(g.id)}>
                  Done
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty glyph="✦">
            Nothing logged yet.
            <div style={{ marginTop: "1rem" }}>
              <button className="btn" onClick={() => go("goals")}>
                Name a goal
              </button>
            </div>
          </Empty>
        )}
      </Panel>

      {/* ---- manifestation daily minimum ---- */}
      {activeManifests.length > 0 && (
        <Panel
          title="Today's minimum"
          right={
            <button className="btn ghost sm" onClick={() => go("manifest")}>
              The Forge
            </button>
          }
        >
          <div className="stack">
            {activeManifests.slice(0, 3).map((m) => {
              const total = m.milestones.length || 1;
              const done = m.milestones.filter((x) => x.done).length;
              return (
                <div key={m.id}>
                  <div className="spread">
                    <strong style={{ fontWeight: 500 }}>{m.title || "Untitled"}</strong>
                    <span className="tiny muted">
                      {done}/{m.milestones.length} milestones
                    </span>
                  </div>
                  {m.dailyMinimum && <div className="small soft">{m.dailyMinimum}</div>}
                  <div style={{ marginTop: ".4rem" }}>
                    <Bar pct={(done / total) * 100} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      <div className="grid three">
        <Stat n={checkinStreak} k="Day reading streak" />
        <Stat n={journalStreak} k="Day journal streak" />
        <Stat n={state.journal.length} k="Entries logged" />
      </div>

      <Panel title="Where to go from here" className="" tone="violet">
        <div className="row tight">
          {PROTOCOLS.slice(0, 6).map((p) => (
            <button key={p.id} className="chip" onClick={() => go("ascend", { protocolId: p.id })}>
              {p.glyph} {p.name}
            </button>
          ))}
          <button className="chip violet" onClick={() => go("codex")}>
            ❋ The Codex
          </button>
          <button className="chip violet" onClick={() => go("council")}>
            ◈ The Council
          </button>
        </div>
      </Panel>
    </>
  );
}

function Movement({ done, label, detail, action, cta }) {
  return (
    <div className="spread" style={{ paddingBottom: ".65rem", borderBottom: "1px solid var(--line-soft)" }}>
      <div style={{ display: "flex", gap: ".7rem", alignItems: "flex-start" }}>
        <span
          className="dot"
          style={{
            marginTop: ".45rem",
            background: done ? "var(--moss)" : "rgba(255,255,255,.15)",
            boxShadow: done ? "0 0 10px var(--moss)" : "none",
          }}
        />
        <div>
          <div style={{ fontSize: ".95rem", color: done ? "var(--text-2)" : "var(--text)" }}>{label}</div>
          <div className="tiny muted">{detail}</div>
        </div>
      </div>
      <button className="btn ghost sm" onClick={action}>
        {cta}
      </button>
    </div>
  );
}
