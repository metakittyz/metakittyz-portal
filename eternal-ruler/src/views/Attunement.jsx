import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { DOMAINS, PILLARS, domainById } from "../data/domains.js";
import { DomainDials } from "../components/Dial.jsx";
import { Empty, Panel, Spark, Stat, DangerButton } from "../components/ui.jsx";
import { summarize, tempColor, readGap } from "../lib/temperature.js";
import { dayKey, prettyDate, shortDate } from "../lib/util.js";

const CORE_IDS = ["body", "mind", "emotion", "confidence", "connection", "purpose"];

function blankReadings(ids, seed) {
  return Object.fromEntries(ids.map((id) => [id, seed?.[id] ? { ...seed[id] } : { self: 50, higher: 50 }]));
}

export function Attunement({ go }) {
  const store = useStore();
  const { state } = store;
  const today = dayKey();

  const [tab, setTab] = useState("read");
  const [scope, setScope] = useState(state.checkins[today] ? "full" : "core");

  const lastKey = useMemo(() => Object.keys(state.checkins).sort().pop(), [state.checkins]);
  const seed = state.checkins[today]?.readings || state.checkins[lastKey]?.readings;

  const ids = scope === "core" ? CORE_IDS : DOMAINS.map((d) => d.id);
  const [readings, setReadings] = useState(() => blankReadings(ids, seed));
  const [note, setNote] = useState(state.checkins[today]?.note || "");
  const [saved, setSaved] = useState(false);

  // Widening the scope keeps whatever you've already moved and fills in the rest.
  function changeScope(next) {
    setScope(next);
    const nextIds = next === "core" ? CORE_IDS : DOMAINS.map((d) => d.id);
    setReadings((prev) => blankReadings(nextIds, { ...seed, ...prev }));
  }

  const summary = useMemo(() => summarize(readings), [readings]);
  const hsName = state.profile.higherSelfName || "your higher self";

  const history = useMemo(
    () =>
      Object.entries(state.checkins)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, c]) => ({ key, ...c, summary: summarize(c.readings) })),
    [state.checkins]
  );

  function save() {
    store.saveCheckin(readings, note.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  }

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Hot &amp; Cold</div>
        <h1>The Reading</h1>
        <p className="lede">
          Two numbers for every part of your life: how <em>you</em> feel, and how you believe {hsName} feels.
          The gap between them is the whole instrument. A wide gap is not a failing grade — it&apos;s a
          direction. Answer fast and honestly; considered answers are usually the ones you&apos;d prefer to be
          true.
        </p>
      </div>

      <div className="row tight" style={{ marginBottom: "1.2rem" }}>
        <button className={`chip ${tab === "read" ? "on" : ""}`} onClick={() => setTab("read")}>
          Take a reading
        </button>
        <button className={`chip ${tab === "history" ? "on" : ""}`} onClick={() => setTab("history")}>
          History ({history.length})
        </button>
      </div>

      {tab === "read" && (
        <>
          <Panel>
            <div className="spread">
              <div>
                <div className="label">Scope</div>
                <div className="small muted">
                  {scope === "core" ? "Six core domains — about two minutes." : "All twelve — about five minutes."}
                </div>
              </div>
              <div className="row tight">
                <button className={`chip ${scope === "core" ? "on" : ""}`} onClick={() => changeScope("core")}>
                  Core six
                </button>
                <button className={`chip ${scope === "full" ? "on" : ""}`} onClick={() => changeScope("full")}>
                  Full twelve
                </button>
              </div>
            </div>
          </Panel>

          <Panel tone="violet">
            <div className="grid three">
              <Stat n={`${Math.round(summary.alignment)}%`} k="Alignment" />
              <Stat n={Math.round(summary.avgSelf)} k="Your heat" />
              <Stat n={Math.round(summary.avgHigher)} k="Higher self's heat" />
            </div>
          </Panel>

          {ids.map((id) => (
            <DomainDials
              key={id}
              domain={domainById[id]}
              reading={readings[id] || { self: 50, higher: 50 }}
              onChange={(r) => setReadings((prev) => ({ ...prev, [id]: r }))}
            />
          ))}

          <Panel title="Anything else about this reading?">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What made today what it was. Optional, but this is the part you'll want in three months."
            />
            <div className="row" style={{ marginTop: ".8rem" }}>
              <button className="btn solid" onClick={save}>
                {state.checkins[today] ? "Update today's reading" : "Seal the reading"}
              </button>
              {saved && <span className="small" style={{ color: "var(--moss)" }}>Recorded.</span>}
              <div className="topbar-spacer" />
              <button className="btn ghost sm" onClick={() => go("journal", { title: "After the reading" })}>
                Write about it
              </button>
            </div>
          </Panel>

          {summary.widest && (
            <Panel tone="gold" title="Where to put your attention">
              <p>
                <strong>{domainById[summary.widest.id]?.name}</strong> is your widest gap at{" "}
                {summary.widest.gap > 0 ? "+" : ""}
                {summary.widest.gap}.{" "}
                <span className={`verdict ${summary.widest.verdict.tone}`}>{summary.widest.verdict.label}</span>
              </p>
              <p className="soft small">{summary.widest.verdict.blurb}</p>
              <div className="row">
                <button className="btn sm" onClick={() => go("ascend")}>
                  Run a protocol
                </button>
                <button className="btn ghost sm" onClick={() => go("manifest")}>
                  Build a plan for it
                </button>
              </div>
            </Panel>
          )}
        </>
      )}

      {tab === "history" && (
        <>
          {history.length === 0 ? (
            <Empty glyph="◉">Nothing recorded yet. Take a reading and it will start building a picture.</Empty>
          ) : (
            <>
              <Panel title="Alignment over time">
                <Spark
                  values={history
                    .slice(0, 40)
                    .reverse()
                    .map((h) => h.summary.alignment)}
                  colorFor={(v) => (v > 78 ? "var(--moss)" : v > 55 ? "var(--gold)" : "var(--ember)")}
                />
                <div className="row spread tiny muted" style={{ marginTop: ".4rem" }}>
                  <span>{shortDate(history[Math.min(history.length - 1, 39)].key)}</span>
                  <span>{shortDate(history[0].key)}</span>
                </div>
              </Panel>

              <Panel title="Domain by domain">
                {DOMAINS.map((d) => {
                  const points = history
                    .filter((h) => h.readings[d.id])
                    .slice(0, 30)
                    .reverse();
                  if (!points.length) return null;
                  const latest = points[points.length - 1].readings[d.id];
                  const { gap, verdict } = readGap(latest.self, latest.higher);
                  return (
                    <div key={d.id} className="reading-row">
                      <div>
                        <div className="small">
                          <span style={{ color: "var(--violet)", marginRight: ".4rem" }}>{d.glyph}</span>
                          {d.name}
                        </div>
                        <span className={`verdict ${verdict.tone}`} style={{ fontSize: ".64rem" }}>
                          {verdict.label}
                        </span>
                      </div>
                      <div className="thermo">
                        <span className="dot" style={{ background: tempColor(latest.self) }} />
                        {latest.self}
                        <span className="muted" style={{ margin: "0 .2rem" }}>
                          →
                        </span>
                        <span className="dot" style={{ background: tempColor(latest.higher) }} />
                        {latest.higher}
                        <span style={{ marginLeft: ".5rem", color: gap === 0 ? "var(--text-3)" : gap > 0 ? "var(--ember)" : "var(--frost)" }}>
                          {gap > 0 ? "+" : ""}
                          {gap}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </Panel>

              {history.map((h) => (
                <div key={h.key} className="entry">
                  <div className="entry-meta">
                    <span>{prettyDate(h.key)}</span>
                    <span className="chip static">{Math.round(h.summary.alignment)}% aligned</span>
                    {h.summary.widest && (
                      <span className={`verdict ${h.summary.widest.verdict.tone}`}>
                        {domainById[h.summary.widest.id]?.name}: {h.summary.widest.verdict.label}
                      </span>
                    )}
                    <div className="topbar-spacer" />
                    <DangerButton onConfirm={() => store.deleteCheckin(h.key)} className="btn ghost sm">
                      Delete
                    </DangerButton>
                  </div>
                  {h.note && <div className="entry-body">{h.note}</div>}
                  <div className="row tight" style={{ marginTop: ".6rem" }}>
                    {Object.entries(h.readings).map(([id, r]) => (
                      <span key={id} className="chip static tiny" title={domainById[id]?.name}>
                        <span className="dot" style={{ background: tempColor(r.self) }} />
                        {domainById[id]?.glyph}
                        <span style={{ opacity: 0.7 }}>
                          {r.self}/{r.higher}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      <Panel title="How to read the gaps" tone="gold">
        <div className="stack small soft">
          <div>
            <strong style={{ color: "var(--ember)" }}>A Calling (+25 or more)</strong> — your higher self is
            warmer here than you are. Something is waiting. Not a reprimand; an invitation.
          </div>
          <div>
            <strong style={{ color: "#ffa07a" }}>Overreach (−25 or more)</strong> — you&apos;re burning hotter
            than your higher self. Often means want rather than purpose. Worth asking whose fire it is.
          </div>
          <div>
            <strong style={{ color: "var(--gold)" }}>Strength</strong> — both hot, closely matched. A pillar.
            Anchor to it when other domains go cold.
          </div>
          <div>
            <strong style={{ color: "var(--frost)" }}>The Numb Zone</strong> — both cold. Either it isn&apos;t
            yours to carry, or it&apos;s frozen deep. Both answers are worth sitting with.
          </div>
        </div>
        <div className="note" style={{ marginTop: "1rem", marginBottom: 0 }}>
          Remember what you&apos;re actually measuring: your <em>belief</em> about how your higher self feels.
          That belief is itself data — about your relationship to yourself, your inner critic, and what you
          think you&apos;re allowed. If every &quot;higher self&quot; number comes out harsh, that is worth a
          journal entry of its own. Guidance builds. Shame shrinks.
        </div>
      </Panel>
    </>
  );
}
