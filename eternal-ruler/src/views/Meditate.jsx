import React, { useState } from "react";
import { useStore } from "../lib/store.jsx";
import { MEDITATIONS, openMeditations, runtimeSeconds } from "../data/meditations.js";
import { STAGES, TOTAL_DAYS, currentDay } from "../data/path.js";
import { Empty, Panel } from "../components/ui.jsx";
import { MeditationPlayer } from "../components/Meditation.jsx";

const TONE = { researched: "moss", mixed: "", traditional: "violet" };
const EVIDENCE = { researched: "Research-backed", mixed: "Mixed evidence", traditional: "Traditional" };

// THE MEDITATION JOURNEY.
//
// Six sits, one per theme, opening as the path reaches each one — so it is a
// journey of its own running alongside the 42 days rather than a library you
// have to pick through on day one.

export function Meditate() {
  const store = useStore();
  const { state } = store;
  const day = currentDay(state.path.completed);
  const open = openMeditations(day, state.path.freeRoam, STAGES);
  const [running, setRunning] = useState(null);
  const log = state.meditationLog || {};

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">The journey</div>
        <h1>Meditations</h1>
        <p className="lede">
          Six sits, one for each theme. Each opens when its theme does. Every one ends on the ground —
          that part isn&apos;t decoration.
        </p>
      </div>

      {MEDITATIONS.map((m) => {
        const stage = STAGES.find((s) => s.id === m.theme);
        const unlocked = open.includes(m);
        const times = log[m.id]?.count || 0;
        return (
          <div key={m.id} className={`med-card ${unlocked ? "" : "locked"}`}>
            <div className="spread">
              <div>
                <div className="med-card-head">
                  <span className="med-glyph">{stage.glyph}</span>
                  <strong>{m.name}</strong>
                  <span className="chip static tiny">{m.kind === "channelled" ? "Channelled" : "Guided"}</span>
                </div>
                <p className="soft small med-purpose">{m.purpose}</p>
                <div className="med-facts small">
                  <span>{Math.round(runtimeSeconds(m) / 60)} min</span>
                  <span>
                    {stage.n} · {stage.name}
                  </span>
                  <span className={`chip static tiny ${TONE[m.evidence]}`}>{EVIDENCE[m.evidence]}</span>
                  {times > 0 && <span className="med-count">sat {times}×</span>}
                </div>
              </div>
            </div>
            {unlocked ? (
              <button className="btn" onClick={() => setRunning(m)}>
                ▶ Sit
              </button>
            ) : (
              <span className="tiny muted">Opens on day {stage.days[0]}</span>
            )}
          </div>
        );
      })}

      {open.length === 0 && (
        <Empty glyph="❋">The first sit opens on day one. You&apos;re on day {Math.min(day, TOTAL_DAYS)}.</Empty>
      )}

      <Panel title="About the carrier tone">
        <p className="soft small">
          Every sit can play a real tone underneath the voice, drifting from 10Hz down to 6Hz over three
          minutes — out of the relaxed waking band and into the drowsy, image-rich one that receptive
          states sit in.
        </p>
        <p className="soft small">
          <b>Binaural</b> puts a slightly different pitch in each ear and lets your own brainstem produce
          the pulse from the difference. That is a genuine effect and it genuinely needs headphones —
          over a speaker the two tones mix in the air and it disappears. <b>Isochronic</b> pulses the
          tone itself, which is cruder but survives a phone speaker.
        </p>
        <p className="soft small" style={{ marginBottom: 0 }}>
          <b>Being straight about it:</b> the tone is real and you will hear the beat. That listening to
          it nudges brainwaves toward that rate has some published support, with modest and inconsistent
          results. That it opens intuition is <em>not</em> established — it is a nudge into a state, not
          a mechanism. You will find no solfeggio or &quot;528Hz&quot; tones here; those were invented in
          the 1970s and have nothing behind them.
        </p>
      </Panel>

      {running && (
        <MeditationPlayer
          meditation={running}
          onClose={(completed) => {
            if (completed) store.logMeditation(running.id);
            setRunning(null);
          }}
        />
      )}
    </>
  );
}
