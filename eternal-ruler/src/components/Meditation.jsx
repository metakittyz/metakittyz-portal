import React, { useEffect, useRef, useState } from "react";
import { BREATH, meditationLineId, runtimeSeconds } from "../data/meditations.js";
import { speakLine, stopAll } from "../lib/voice.js";
import { duckEntrainment, startEntrainment, stopEntrainment, beatAt, bandName } from "../lib/entrainment.js";
import { useStore } from "../lib/store.jsx";

// THE MEDITATION PLAYER.
//
// Mostly a breathing ring. The text on screen is one line at a time and it
// fades — someone with their eyes closed is the target, so the guidance has to
// work as voice and shape rather than as reading.
//
// Three things run at once and all three have to stay out of each other's way:
// the guide's voice, the score, and the carrier tone. The voice wins. Both of
// the others duck under it.

const TAU = Math.PI * 2;

/** Where in the breath cycle we are: 0..1 in, 1..2 out. */
function breathPhase(t, pattern) {
  if (!pattern) return null;
  const total = pattern.in + pattern.out;
  const x = t % total;
  return x < pattern.in
    ? { rising: true, amount: x / pattern.in, label: "in" }
    : { rising: false, amount: 1 - (x - pattern.in) / pattern.out, label: "out" };
}

function drawRing(ctx, w, h, phase, glow) {
  const cx = w / 2;
  const cy = h / 2;
  const base = Math.min(w, h) * 0.17;
  const span = Math.min(w, h) * 0.16;
  const amount = phase ? phase.amount : 0.5;
  // Eased, so the turn at the top and bottom of the breath is soft rather
  // than a corner you find yourself bracing against.
  const eased = 0.5 - 0.5 * Math.cos(amount * Math.PI);
  const r = base + span * eased;

  ctx.clearRect(0, 0, w, h);

  // The guide ring — where the breath is going.
  ctx.beginPath();
  ctx.arc(cx, cy, base + span, 0, TAU);
  ctx.strokeStyle = "rgba(255,255,255,.05)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Filled body.
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, `rgba(232,195,122,${0.05 + eased * 0.07})`);
  grad.addColorStop(1, "rgba(232,195,122,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.strokeStyle = `rgba(232,195,122,${0.35 + eased * 0.4})`;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 18 + eased * 26 + glow * 20;
  ctx.shadowColor = "rgba(232,195,122,.8)";
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (phase) {
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = "rgba(255,255,255,.3)";
    ctx.textAlign = "center";
    ctx.fillText(phase.label, cx, cy + 4);
  }
}

export function MeditationPlayer({ meditation, onClose }) {
  const { state } = useStore();
  const [seg, setSeg] = useState(-1); // -1 = the door, before anything sounds
  const [paused, setPaused] = useState(false);
  const [carrier, setCarrier] = useState("binaural");
  const [band, setBand] = useState(10);
  const canvasRef = useRef(null);
  const t0 = useRef(0);
  const segStart = useRef(0);
  const speaking = useRef(false);
  const started = seg >= 0;

  const total = Math.round(runtimeSeconds(meditation));
  const pattern = BREATH[meditation.breath];

  // ---- the sequence -------------------------------------------------------
  useEffect(() => {
    if (!started || paused) return undefined;
    const s = meditation.segments[seg];
    if (!s) return undefined;

    speaking.current = true;
    duckEntrainment(true);
    speakLine(meditationLineId(meditation.id, seg), s.text, state.voice, {
      onEnd: () => {
        speaking.current = false;
        duckEntrainment(false);
      },
    })
      .then((ok) => {
        if (!ok) {
          speaking.current = false;
          duckEntrainment(false);
        }
      })
      .catch(() => {
        speaking.current = false;
        duckEntrainment(false);
      });

    segStart.current = performance.now();
    let raf = 0;
    const step = () => {
      const held = (performance.now() - segStart.current) / 1000;
      // The silence starts when the voice stops, not when it started — so the
      // gap after a line is a real gap and not partly the line itself.
      if (!speaking.current && held > s.hold) {
        if (seg + 1 < meditation.segments.length) setSeg(seg + 1);
        else finish();
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seg, paused, started]);

  // ---- the ring -----------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !started) return undefined;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: rect.width, h: rect.height };
    };
    let dims = size();
    const onResize = () => (dims = size());
    window.addEventListener("resize", onResize);

    const loop = (now) => {
      if (!t0.current) t0.current = now;
      const t = (now - t0.current) / 1000;
      drawRing(ctx, dims.w, dims.h, breathPhase(t, pattern), speaking.current ? 1 : 0);
      setBand(beatAt(t));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [started, pattern]);

  function begin() {
    // This click is also what unlocks audio — same rule the Overture hit.
    if (carrier !== "off") startEntrainment(carrier, 0.5);
    t0.current = 0;
    setSeg(0);
  }

  function finish() {
    stopAll();
    stopEntrainment();
    onClose(true);
  }

  /** Back to the first segment. The carrier keeps running; only the voice
      and the sequence reset. */
  function restart() {
    stopAll();
    t0.current = 0;
    speaking.current = false;
    setPaused(false);
    setSeg(0);
  }

  function quit() {
    stopAll();
    stopEntrainment();
    onClose(false);
  }

  useEffect(() => () => {
    stopAll();
    stopEntrainment();
  }, []);

  const current = meditation.segments[seg];
  const done = started ? seg / meditation.segments.length : 0;

  return (
    <div className="med-overlay">
      <button className="overture-skip med-quit" onClick={quit}>
        {started ? "End" : "Back"}
      </button>

      {!started ? (
        <div className="med-door rise">
          <span className="chip static tiny">{meditation.kind === "channelled" ? "Channelled" : "Guided"}</span>
          <h2 className="med-title">{meditation.name}</h2>
          <p className="soft">{meditation.purpose}</p>

          <div className="med-facts">
            <span>{Math.round(total / 60)} min</span>
            {pattern && <span>{pattern.label}</span>}
            <span>{meditation.segments.filter((s) => s.ground).length}-step return</span>
          </div>

          <div className="med-carrier">
            <div className="label">Carrier tone</div>
            <div className="row tight">
              {[
                ["binaural", "Binaural", "Needs headphones"],
                ["isochronic", "Isochronic", "Works on speakers"],
                ["off", "None", "Voice only"],
              ].map(([id, name, hint]) => (
                <button
                  key={id}
                  className={`chip ${carrier === id ? "on" : ""}`}
                  onClick={() => setCarrier(id)}
                  title={hint}
                >
                  {name}
                </button>
              ))}
            </div>
            <p className="tiny dim med-honest">
              A real tone, played under the voice, drifting from 10Hz down to 6Hz — out of the relaxed
              waking band and into the drowsy, image-rich one. Binaural puts a slightly different pitch in
              each ear and lets your brainstem make the pulse, so it genuinely needs headphones.
              Isochronic pulses the tone itself and survives a speaker.
              <br />
              <br />
              <b>What's actually known:</b> the tone is real and you will hear the beat. That listening
              nudges brainwaves toward it has some published support, with modest and inconsistent
              results. That it opens intuition is not established — treat it as a nudge into the right
              state, not a mechanism. There are no solfeggio or "528Hz" tones here; those have nothing
              behind them.
            </p>
          </div>

          {meditation.intense && (
            <p className="note warn">
              This one turns toward something you avoid. You can stop at any point and nothing is lost.
            </p>
          )}

          <button className="btn primary lg block" onClick={begin}>
            ▶ Begin
          </button>
          <p className="tiny muted center" style={{ marginTop: ".8rem" }}>
            Headphones if you have them. Somewhere you won't be interrupted.
          </p>
        </div>
      ) : (
        <>
          <div className="med-stage">
            <canvas ref={canvasRef} className="med-canvas" />
          </div>

          <p className="med-line" key={seg}>
            {current?.text}
          </p>

          <div className="med-foot">
            <div className="med-bar">
              <i style={{ width: `${done * 100}%` }} />
            </div>
            <div className="med-meta">
              <span>
                {seg + 1} / {meditation.segments.length}
              </span>
              {carrier !== "off" && (
                <span>
                  {band.toFixed(1)}Hz · {bandName(band)}
                </span>
              )}
              <button className="btn ghost sm" onClick={restart} title="Back to the beginning">
                ↺ Start over
              </button>
              <button className="btn ghost sm" onClick={() => setPaused((v) => !v)}>
                {paused ? "▶ Resume" : "❙❙ Pause"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
