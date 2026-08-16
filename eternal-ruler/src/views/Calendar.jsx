import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { ACTIVITY, consistency, sealStats } from "../lib/consistency.js";
import { SEALS, TIERS, earnedSeals } from "../data/seals.js";
import { Panel, Stat } from "../components/ui.jsx";
import { dayKey, parseDayKey, prettyDate } from "../lib/util.js";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function Calendar({ go }) {
  const { state } = useStore();
  const today = dayKey();
  const c = useMemo(() => consistency(state), [state]);
  const stats = useMemo(() => sealStats(state), [state]);
  const earned = useMemo(() => earnedSeals(stats), [stats]);
  const earnedIds = new Set(earned.map((s) => s.id));

  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [picked, setPicked] = useState(null);

  const grid = useMemo(() => buildMonth(cursor.y, cursor.m), [cursor]);
  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function shift(n) {
    const d = new Date(cursor.y, cursor.m + n, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setPicked(null);
  }

  const pickedKinds = picked ? [...(c.byDay[picked] || [])] : [];

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Consistency</div>
        <h1>The Calendar</h1>
        <p className="lede">
          Every day you showed up, and what it earned. Nothing here is taken away by a bad week — a seal,
          once earned, is yours.
        </p>
      </div>

      <div className="grid three" style={{ marginBottom: "1.2rem" }}>
        <Stat n={c.currentStreak} k="Current run" />
        <Stat n={c.longestStreak} k="Longest run" />
        <Stat n={c.activeDays} k="Days shown up" />
      </div>

      <Panel>
        <div className="cal-head">
          <button className="btn ghost sm" onClick={() => shift(-1)} aria-label="Previous month">
            ‹
          </button>
          <strong className="serif" style={{ fontSize: "1.1rem" }}>
            {monthName}
          </strong>
          <button className="btn ghost sm" onClick={() => shift(1)} aria-label="Next month">
            ›
          </button>
        </div>

        <div className="cal-grid">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="cal-wd">
              {d}
            </span>
          ))}
          {grid.map((cell, i) =>
            cell ? (
              <button
                key={cell}
                className={`cal-day ${c.byDay[cell] ? "on" : ""} ${cell === today ? "today" : ""} ${
                  picked === cell ? "picked" : ""
                } ${cell > today ? "future" : ""}`}
                onClick={() => setPicked(picked === cell ? null : cell)}
                aria-label={prettyDate(cell)}
              >
                <span className="cal-n">{parseDayKey(cell).getDate()}</span>
                <span className="cal-dots">
                  {[...(c.byDay[cell] || [])].slice(0, 4).map((k) => (
                    <i key={k} style={{ background: ACTIVITY[k]?.color || "var(--text-3)" }} />
                  ))}
                </span>
              </button>
            ) : (
              <span key={`x${i}`} />
            )
          )}
        </div>

        <div className="row tight cal-legend">
          {Object.entries(ACTIVITY).map(([k, v]) => (
            <span key={k} className="tiny muted">
              <i className="dot" style={{ background: v.color, marginRight: ".25rem" }} />
              {v.name}
            </span>
          ))}
        </div>

        {picked && (
          <div className="note" style={{ marginTop: "1rem", marginBottom: 0 }}>
            <strong>{prettyDate(picked)}</strong>
            {pickedKinds.length ? (
              <span> — {pickedKinds.map((k) => ACTIVITY[k]?.name).join(", ")}.</span>
            ) : picked > today ? (
              <span className="muted"> — not yet.</span>
            ) : (
              <span className="muted"> — nothing logged. That&apos;s allowed.</span>
            )}
          </div>
        )}
      </Panel>

      {c.returns > 0 && (
        <Panel tone="gold">
          <div className="spread">
            <div>
              <div className="label">Returns</div>
              <p className="small soft" style={{ marginBottom: 0 }}>
                You came back after time away {c.returns === 1 ? "once" : `${c.returns} times`}. That&apos;s
                the hard one. Most people never come back at all.
              </p>
            </div>
            <Stat n={c.returns} k="Returns" />
          </div>
        </Panel>
      )}

      <Panel
        title={`Seals — ${earned.length} of ${SEALS.length}`}
        right={
          <button className="btn ghost sm" onClick={() => go("path")}>
            Earn another
          </button>
        }
      >
        <div className="seal-grid">
          {SEALS.map((s) => {
            const has = earnedIds.has(s.id);
            const [done, target] = s.progress ? s.progress(stats) : [0, 1];
            return (
              <div key={s.id} className={`seal ${has ? "earned" : ""}`} title={s.earn}>
                <span className="seal-glyph" style={has ? { color: TIERS[s.tier].color } : undefined}>
                  {s.glyph}
                </span>
                <strong>{s.name}</strong>
                <span className="tiny muted">{s.earn}</span>
                {!has && target > 1 && (
                  <span className="seal-bar" aria-hidden="true">
                    <i style={{ width: `${(done / target) * 100}%` }} />
                  </span>
                )}
                {!has && target > 1 && (
                  <span className="tiny muted">
                    {done}/{target}
                  </span>
                )}
                {has && s.note && <span className="tiny" style={{ color: TIERS[s.tier].color }}>{s.note}</span>}
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="note calm">
        <strong>No streak to protect.</strong> The run counter is information, not a debt. Your position on
        the path never moves backwards, seals are permanent, and the only thing a gap costs you is the days
        you missed. Come back and the app picks up exactly where you left it.
      </div>
    </>
  );
}

/** Monday-first month grid, padded with nulls. */
function buildMonth(y, m) {
  const first = new Date(y, m, 1);
  const days = new Date(y, m + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // shift Sunday=0 to Monday=0
  const cells = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) {
    cells.push(`${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}
