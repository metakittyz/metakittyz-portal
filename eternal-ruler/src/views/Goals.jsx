import React, { useState } from "react";
import { useStore } from "../lib/store.jsx";
import { DOMAINS, domainById } from "../data/domains.js";
import { DangerButton, Empty, Field, Panel, Stat } from "../components/ui.jsx";
import { prettyDate } from "../lib/util.js";

const HORIZONS = ["This week", "This month", "This quarter", "This year", "This decade"];

export function Goals({ go }) {
  const store = useStore();
  const { state } = store;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", why: "", domain: "purpose", nextAction: "", horizon: "This month" });

  const open = state.goals.filter((g) => !g.done);
  const closed = state.goals.filter((g) => g.done);

  function create() {
    store.addGoal({ ...draft, title: draft.title.trim() });
    setDraft({ title: "", why: "", domain: "purpose", nextAction: "", horizon: "This month" });
    setAdding(false);
  }

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">The Work</div>
        <h1>Goals</h1>
        <p className="lede">
          What you&apos;re actually building, with the honest reason underneath it and the single next physical
          action. A goal without a next action is a mood. A goal without a why gets abandoned the first week
          it costs something.
        </p>
      </div>

      <div className="grid three" style={{ marginBottom: "1.4rem" }}>
        <Stat n={open.length} k="In motion" />
        <Stat n={closed.length} k="Completed" />
        <Stat n={new Set(state.goals.map((g) => g.domain)).size} k="Domains touched" />
      </div>

      {!adding && (
        <button className="btn solid block" onClick={() => setAdding(true)} style={{ marginBottom: "1.3rem" }}>
          ✦ Name a goal
        </button>
      )}

      {adding && (
        <Panel tone="gold" title="A new goal" right={<button className="btn ghost sm" onClick={() => setAdding(false)}>Cancel</button>}>
          <Field label="What">
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Stated so plainly you'd know the day it was done"
              autoFocus
            />
          </Field>
          <Field label="Why — the real reason" hint="Including if it's to prove something. That's data, not a disqualification.">
            <textarea value={draft.why} onChange={(e) => setDraft({ ...draft, why: e.target.value })} />
          </Field>
          <div className="grid two">
            <Field label="Which domain">
              <select value={draft.domain} onChange={(e) => setDraft({ ...draft, domain: e.target.value })}>
                {DOMAINS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Horizon">
              <select value={draft.horizon} onChange={(e) => setDraft({ ...draft, horizon: e.target.value })}>
                {HORIZONS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="The next physical action" hint="Not the plan — the very next thing your hands do.">
            <input
              type="text"
              value={draft.nextAction}
              onChange={(e) => setDraft({ ...draft, nextAction: e.target.value })}
            />
          </Field>
          <button className="btn solid" disabled={!draft.title.trim()} onClick={create}>
            Add it
          </button>
        </Panel>
      )}

      {open.length === 0 && !adding && (
        <Empty glyph="✦">Nothing named yet. Start with the one you keep thinking about and not writing down.</Empty>
      )}

      {open.map((g) => (
        <GoalCard key={g.id} g={g} store={store} go={go} />
      ))}

      {closed.length > 0 && (
        <Panel title={`Completed (${closed.length})`}>
          <p className="small muted">
            Read this list on the days you&apos;re certain you never finish anything.
          </p>
          {closed.map((g) => (
            <div key={g.id} className="spread" style={{ padding: ".5rem 0", borderBottom: "1px solid var(--line-soft)" }}>
              <div>
                <span className="soft" style={{ textDecoration: "line-through", opacity: 0.7 }}>
                  {g.title}
                </span>
                {g.doneAt && <div className="tiny muted">{prettyDate(g.doneAt.slice(0, 10))}</div>}
              </div>
              <div className="row tight">
                <button className="btn ghost sm" onClick={() => store.toggleGoal(g.id)}>
                  Reopen
                </button>
                <DangerButton onConfirm={() => store.deleteGoal(g.id)}>Delete</DangerButton>
              </div>
            </div>
          ))}
        </Panel>
      )}
    </>
  );
}

function GoalCard({ g, store, go }) {
  const [editing, setEditing] = useState(false);
  const d = domainById[g.domain];

  return (
    <Panel
      title={g.title}
      right={
        <button className="btn sm" onClick={() => store.toggleGoal(g.id)}>
          Mark done
        </button>
      }
    >
      <div className="row tight" style={{ marginBottom: ".8rem" }}>
        {d && (
          <span className="chip static violet">
            {d.glyph} {d.name}
          </span>
        )}
        {g.horizon && <span className="chip static">{g.horizon}</span>}
        <span className="chip static">Started {prettyDate(g.createdAt.slice(0, 10))}</span>
      </div>

      {g.why && (
        <p className="small soft">
          <span className="field-label">Why</span>
          {g.why}
        </p>
      )}

      {editing ? (
        <>
          <Field label="Next physical action">
            <input
              type="text"
              value={g.nextAction || ""}
              onChange={(e) => store.updateGoal(g.id, { nextAction: e.target.value })}
              autoFocus
            />
          </Field>
          <Field label="Why">
            <textarea value={g.why || ""} onChange={(e) => store.updateGoal(g.id, { why: e.target.value })} />
          </Field>
        </>
      ) : (
        g.nextAction && (
          <div className="note">
            <strong>Next:</strong> {g.nextAction}
          </div>
        )
      )}

      <div className="row">
        <button className="btn ghost sm" onClick={() => setEditing((v) => !v)}>
          {editing ? "Done editing" : "Edit"}
        </button>
        <button className="btn ghost sm" onClick={() => go("journal", { title: g.title })}>
          Journal
        </button>
        <div className="topbar-spacer" />
        <DangerButton onConfirm={() => store.deleteGoal(g.id)}>Delete</DangerButton>
      </div>
    </Panel>
  );
}
