import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { CHANNELS, CHARGES, channelById, chargeByValue, chargeColor } from "../data/intake.js";
import { DangerButton, Empty, Panel, Stat } from "../components/ui.jsx";
import { summarize } from "../lib/temperature.js";
import { dayKey, prettyDate, shortDate, timeOf } from "../lib/util.js";

export function Intake({ go }) {
  const store = useStore();
  const { state } = store;
  const today = dayKey();
  const [tab, setTab] = useState("today");

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">What goes in</div>
        <h1>Intake</h1>
        <p className="lede">
          Everything you feed the machine — content, food, movement, substances, people. Log what it{" "}
          <em>did</em> to you, not just that it happened.
        </p>
      </div>

      <div className="row tight" style={{ marginBottom: "1.3rem" }}>
        <button className={`chip ${tab === "today" ? "on" : ""}`} onClick={() => setTab("today")}>
          Today
        </button>
        <button className={`chip ${tab === "patterns" ? "on" : ""}`} onClick={() => setTab("patterns")}>
          Patterns
        </button>
      </div>

      {tab === "today" ? <Today store={store} today={today} /> : <Patterns state={state} go={go} />}
    </>
  );
}

// ------------------------------------------------------------------ today --
function Today({ store, today }) {
  const { state } = store;
  const [channel, setChannel] = useState("content");
  const [what, setWhat] = useState("");
  const [charge, setCharge] = useState(0);

  const entries = state.intake.filter((i) => i.dayKey === today);
  const net = entries.reduce((a, i) => a + i.charge, 0);
  const day = state.intakeDays[today] || {};
  const ch = channelById[channel];

  function add() {
    if (!what.trim()) return;
    store.addIntake({ channel, what: what.trim(), charge });
    setWhat("");
    setCharge(0);
  }

  return (
    <>
      <Panel tone="gold">
        <div className="row tight" style={{ marginBottom: ".9rem" }}>
          {CHANNELS.map((c) => (
            <button key={c.id} className={`chip ${channel === c.id ? "on" : ""}`} onClick={() => setChannel(c.id)}>
              {c.glyph} {c.name}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={ch.placeholder}
        />
        <div className="field-hint">{ch.hint}</div>

        <div className="charge-row" role="group" aria-label="What did it do to you?">
          {CHARGES.map((c) => (
            <button
              key={c.v}
              className={`charge ${charge === c.v ? "on" : ""}`}
              style={charge === c.v ? { borderColor: c.color, color: c.color } : undefined}
              onClick={() => setCharge(c.v)}
            >
              <span className="charge-mark">{c.short}</span>
              {c.label}
            </button>
          ))}
        </div>

        <button className="btn solid block" onClick={add} disabled={!what.trim()}>
          Log it
        </button>
      </Panel>

      <div className="grid three" style={{ marginBottom: "1.1rem" }}>
        <Stat n={entries.length} k="Logged today" />
        <Stat n={`${net > 0 ? "+" : ""}${net}`} k="Net charge" />
        <Stat n={day.sleep ? `${day.sleep}h` : "—"} k="Slept" />
      </div>

      <Panel title="Sleep">
        <div className="row tight">
          {[5, 6, 7, 8, 9].map((h) => (
            <button
              key={h}
              className={`chip ${day.sleep === h ? "on" : ""}`}
              onClick={() => store.setIntakeDay({ sleep: day.sleep === h ? null : h })}
            >
              {h}h
            </button>
          ))}
          <span className="tiny muted">Under 5 or over 9? Round to the nearest.</span>
        </div>
      </Panel>

      {entries.length === 0 ? (
        <Empty glyph="◈">Nothing logged today.</Empty>
      ) : (
        <Panel title={prettyDate(today)}>
          {CHANNELS.filter((c) => entries.some((e) => e.channel === c.id)).map((c) => (
            <div key={c.id} className="intake-group">
              <div className="label">
                <span style={{ color: "var(--violet)", marginRight: ".35rem" }}>{c.glyph}</span>
                {c.name}
              </div>
              {entries
                .filter((e) => e.channel === c.id)
                .map((e) => (
                  <div key={e.id} className="reading-row">
                    <div>
                      <div className="small">{e.what}</div>
                      <span className="tiny muted">{timeOf(e.at)}</span>
                    </div>
                    <div className="row tight">
                      <span
                        className="charge-pill"
                        style={{ color: chargeColor(e.charge), borderColor: chargeColor(e.charge) }}
                      >
                        {chargeByValue[e.charge].label}
                      </span>
                      <DangerButton onConfirm={() => store.deleteIntake(e.id)}>×</DangerButton>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </Panel>
      )}
    </>
  );
}

// --------------------------------------------------------------- patterns --
function Patterns({ state, go }) {
  const data = useMemo(() => {
    const byDay = {};
    for (const i of state.intake) {
      byDay[i.dayKey] = (byDay[i.dayKey] || 0) + i.charge;
    }

    // average charge per channel
    const perChannel = CHANNELS.map((c) => {
      const rows = state.intake.filter((i) => i.channel === c.id);
      return { ...c, count: rows.length, avg: rows.length ? rows.reduce((a, r) => a + r.charge, 0) / rows.length : 0 };
    }).filter((c) => c.count);

    // repeated items, ranked — needs at least two sightings to mean anything
    const items = {};
    for (const i of state.intake) {
      const key = `${i.channel}|${i.what.trim().toLowerCase()}`;
      if (!items[key]) items[key] = { what: i.what.trim(), channel: i.channel, n: 0, total: 0 };
      items[key].n++;
      items[key].total += i.charge;
    }
    const ranked = Object.values(items)
      .filter((x) => x.n >= 2)
      .map((x) => ({ ...x, avg: x.total / x.n }))
      .sort((a, b) => b.avg - a.avg);

    // intake vs how you actually felt that day
    const paired = Object.keys(byDay)
      .filter((d) => state.checkins[d])
      .map((d) => ({ day: d, net: byDay[d], self: summarize(state.checkins[d].readings).avgSelf }));
    const fed = paired.filter((p) => p.net > 0);
    const drained = paired.filter((p) => p.net < 0);
    const avg = (rows) => (rows.length ? rows.reduce((a, r) => a + r.self, 0) / rows.length : 0);

    // sleep vs how you felt
    const sleepPaired = Object.entries(state.intakeDays)
      .filter(([d, v]) => v.sleep && state.checkins[d])
      .map(([d, v]) => ({ sleep: v.sleep, self: summarize(state.checkins[d].readings).avgSelf }));
    const rested = sleepPaired.filter((s) => s.sleep >= 7);
    const short = sleepPaired.filter((s) => s.sleep < 7);

    return {
      days: Object.keys(byDay).length,
      byDay,
      perChannel,
      feeders: ranked.filter((x) => x.avg > 0).slice(0, 5),
      drains: ranked.filter((x) => x.avg < 0).reverse().slice(0, 5),
      fed,
      drained,
      fedSelf: avg(fed),
      drainedSelf: avg(drained),
      restedSelf: avg(rested),
      shortSelf: avg(short),
      rested,
      short,
    };
  }, [state.intake, state.intakeDays, state.checkins]);

  if (!data.days) {
    return <Empty glyph="◇">Nothing logged yet. Patterns need about a week.</Empty>;
  }

  const recent = Object.entries(data.byDay).sort(([a], [b]) => a.localeCompare(b)).slice(-21);

  return (
    <>
      {/* One bar isn't a trend. Wait until there's a shape to look at. */}
      {recent.length >= 3 && (
        <Panel title="Net charge by day">
          <div className="spark" aria-hidden="true">
            {recent.map(([d, v]) => (
              <i
                key={d}
                style={{
                  height: `${Math.min(100, 20 + Math.abs(v) * 12)}%`,
                  background: v >= 0 ? "var(--ember)" : "var(--frost)",
                  alignSelf: v >= 0 ? "flex-end" : "flex-start",
                }}
                title={`${shortDate(d)}: ${v > 0 ? "+" : ""}${v}`}
              />
            ))}
          </div>
          <div className="row spread tiny muted" style={{ marginTop: ".4rem" }}>
            <span>{shortDate(recent[0][0])}</span>
            <span>Warm above, cold below</span>
            <span>{shortDate(recent[recent.length - 1][0])}</span>
          </div>
        </Panel>
      )}

      <Panel title="By channel">
        {data.perChannel.map((c) => (
          <div key={c.id} className="reading-row">
            <div className="small">
              <span style={{ color: "var(--violet)", marginRight: ".4rem" }}>{c.glyph}</span>
              {c.name}
              <span className="tiny muted"> · {c.count} logged</span>
            </div>
            <div className="row tight">
              <div className="charge-bar" aria-hidden="true">
                <i
                  style={{
                    width: `${(Math.abs(c.avg) / 2) * 50}%`,
                    background: chargeColor(c.avg),
                    left: c.avg >= 0 ? "50%" : `${50 - (Math.abs(c.avg) / 2) * 50}%`,
                  }}
                />
              </div>
              <span className="thermo" style={{ color: chargeColor(c.avg), minWidth: "2.6rem", justifyContent: "flex-end" }}>
                {c.avg > 0 ? "+" : ""}
                {c.avg.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </Panel>

      {(data.feeders.length > 0 || data.drains.length > 0) && (
        <div className="grid two">
          <Panel title="Feeds you">
            {data.feeders.length ? (
              data.feeders.map((x) => (
                <div key={x.what} className="reading-row">
                  <span className="small">{x.what}</span>
                  <span className="thermo" style={{ color: chargeColor(x.avg) }}>
                    +{x.avg.toFixed(1)} · ×{x.n}
                  </span>
                </div>
              ))
            ) : (
              <p className="small muted">Nothing repeated yet.</p>
            )}
          </Panel>
          <Panel title="Costs you">
            {data.drains.length ? (
              data.drains.map((x) => (
                <div key={x.what} className="reading-row">
                  <span className="small">{x.what}</span>
                  <span className="thermo" style={{ color: chargeColor(x.avg) }}>
                    {x.avg.toFixed(1)} · ×{x.n}
                  </span>
                </div>
              ))
            ) : (
              <p className="small muted">Nothing repeated yet.</p>
            )}
          </Panel>
        </div>
      )}

      <Panel title="Against your Readings" tone="violet">
        {data.fed.length >= 2 && data.drained.length >= 2 ? (
          <>
            <div className="grid two">
              <Stat n={Math.round(data.fedSelf)} k={`Your heat on fed days (${data.fed.length})`} />
              <Stat n={Math.round(data.drainedSelf)} k={`On drained days (${data.drained.length})`} />
            </div>
            <p className="small soft" style={{ marginTop: ".9rem", marginBottom: 0 }}>
              {Math.abs(data.fedSelf - data.drainedSelf) < 5
                ? "No clear difference yet."
                : data.fedSelf > data.drainedSelf
                  ? `You run ${Math.round(data.fedSelf - data.drainedSelf)} points hotter on days you feed yourself well.`
                  : `You run hotter on drained days. Worth a journal entry — that's an unusual pattern.`}{" "}
              Association, not proof. It&apos;s your own data, so you already know what else was going on.
            </p>
          </>
        ) : (
          <p className="small soft" style={{ marginBottom: 0 }}>
            Needs a few more days with both an Intake log and a{" "}
            <button className="linklike" onClick={() => go("reading")}>
              Reading
            </button>
            . {data.fed.length + data.drained.length} so far.
          </p>
        )}
      </Panel>

      {data.rested.length >= 2 && data.short.length >= 2 && (
        <Panel title="Sleep">
          <div className="grid two">
            <Stat n={Math.round(data.restedSelf)} k={`Heat on 7h+ (${data.rested.length} days)`} />
            <Stat n={Math.round(data.shortSelf)} k={`Under 7h (${data.short.length} days)`} />
          </div>
        </Panel>
      )}

      <div className="note">
        The point isn&apos;t the numbers. It&apos;s noticing what you already suspected, in writing, with dates
        on it.
      </div>
    </>
  );
}
