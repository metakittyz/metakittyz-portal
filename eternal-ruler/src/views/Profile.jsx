import React from "react";
import { useStore } from "../lib/store.jsx";
import { DangerButton, Field, Panel, Stat } from "../components/ui.jsx";
import { PATH, STAGES, TOTAL_DAYS, currentDay, stageOf } from "../data/path.js";
import { dayKey, prettyDate, streakFrom } from "../lib/util.js";

const METHOD = {
  google: "Google",
  apple: "Apple",
  email: "Email",
};

export function Profile({ go }) {
  const store = useStore();
  const { state } = store;
  const { account, profile, path } = state;

  const day = currentDay(path.completed);
  const graduated = day > TOTAL_DAYS;
  const stage = graduated ? null : stageOf(day);
  const pct = (path.completed.length / TOTAL_DAYS) * 100;
  const initial = (profile.name || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <div className="profile-head">
        <div className="avatar lg" aria-hidden="true">
          {initial}
        </div>
        <div>
          <h1>{profile.name || "Unnamed"}</h1>
          <p className="creed" style={{ textAlign: "left", margin: 0 }}>
            Becoming the eternal ruler of your own reality.
          </p>
          {account && (
            <p className="tiny muted" style={{ marginTop: ".4rem", marginBottom: 0 }}>
              {METHOD[account.method]} account{account.email ? ` · ${account.email}` : ""} · joined{" "}
              {prettyDate(account.createdAt.slice(0, 10))}
            </p>
          )}
        </div>
      </div>

      {/* ---- where you are on the journey ---- */}
      <Panel tone="gold">
        <div className="spread" style={{ marginBottom: ".7rem" }}>
          <div>
            <div className="label">{graduated ? "The Practice" : `Stage ${stage.n} · ${stage.name}`}</div>
            <div className="serif" style={{ fontSize: "1.15rem" }}>
              {graduated ? "Path complete. Your own rhythm now." : `Day ${day} of ${TOTAL_DAYS}`}
            </div>
          </div>
          <button className="btn sm" onClick={() => go("path")}>
            Continue
          </button>
        </div>
        <div className="progress-track">
          <i style={{ width: `${pct}%` }} />
        </div>

        <div className="arc" style={{ marginTop: "1.1rem" }}>
          {STAGES.map((s) => {
            const days = PATH.filter((p) => p.day >= s.days[0] && p.day <= s.days[1]);
            const done = days.filter((p) => path.completed.includes(p.day)).length;
            const active = !graduated && day >= s.days[0] && day <= s.days[1];
            return (
              <div key={s.id} className={`arc-step ${active ? "active" : ""} ${done === days.length ? "done" : ""}`}>
                <span className="arc-n">{s.n}</span>
                <span>
                  {s.name}
                  <span className="tiny muted" style={{ display: "block" }}>
                    {done}/{days.length} · {s.promise}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ---- what you've built ---- */}
      <div className="grid three">
        <Stat n={path.completed.length} k="Steps taken" />
        <Stat n={streakFrom(state.journal.map((e) => e.dayKey))} k="Day streak" />
        <Stat n={state.journal.length} k="Journal entries" />
        <Stat n={Object.keys(state.checkins).length} k="Readings" />
        <Stat n={state.recordings.length} k="Recordings" />
        <Stat n={state.intake.length} k="Intake logged" />
      </div>

      {/* ---- who you are here ---- */}
      <Panel title="You">
        <Field label="Your name">
          <input type="text" value={profile.name} onChange={(e) => store.setProfile({ name: e.target.value })} />
        </Field>
        <Field label="What you call the one you're reaching for">
          <input
            type="text"
            value={profile.higherSelfName}
            onChange={(e) => store.setProfile({ higherSelfName: e.target.value })}
            placeholder="Higher self"
          />
        </Field>
        <Field label="Why you're here">
          <textarea
            value={profile.intention}
            onChange={(e) => store.setProfile({ intention: e.target.value })}
            placeholder="The true reason, not the impressive one."
          />
        </Field>
      </Panel>

      {/* ---- account ---- */}
      <Panel title="Account">
        {account ? (
          <>
            <div className="reading-row">
              <span className="small">Sign-in method</span>
              <span className="chip static">{METHOD[account.method]}</span>
            </div>
            {account.email && (
              <div className="reading-row">
                <span className="small">Email</span>
                <span className="small soft">{account.email}</span>
              </div>
            )}
            <div className="reading-row">
              <span className="small">Status</span>
              <span className="chip static ember">On this device only</span>
            </div>
            <div className="note calm" style={{ marginTop: "1rem" }}>
              Sign-in isn&apos;t connected to a provider yet, so this account exists only in this browser.
              Nothing was sent to {METHOD[account.method]}, and there&apos;s no password to lose. Export from
              Settings is your backup.
            </div>
            <DangerButton
              className="btn ghost sm"
              confirmLabel="Sign out — data stays on this device"
              onConfirm={() => store.signOut()}
            >
              Sign out
            </DangerButton>
          </>
        ) : (
          <p className="small muted">No account.</p>
        )}
      </Panel>

      <div className="row">
        <button className="btn ghost" onClick={() => go("settings")}>
          Settings &amp; data
        </button>
        <button className="btn ghost" onClick={() => go("library")}>
          Library
        </button>
      </div>
    </>
  );
}
