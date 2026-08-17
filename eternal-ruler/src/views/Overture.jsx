import React, { useEffect, useRef, useState } from "react";
import { OVERTURE_LINES, SCENES, overtureLineId } from "../lib/overture-scenes.js";
import { speakLine, stopAll } from "../lib/voice.js";
import { duckTrack, playTrack, releaseTrack } from "../lib/track.js";
import { suspendScore } from "../lib/ambient.js";
import { useStore } from "../lib/store.jsx";

// THE OVERTURE — the story the app opens with.
//
// Nine beats, each drawn from the real equation for the thing it shows, and
// each read aloud by the guide. It plays once before the welcome screen and
// can be replayed any time from Settings.
//
// It is skippable from the first frame. Something unskippable between someone
// and the app they came to use is an obstacle no matter how good it looks.

function prefersLessMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function Overture({ onDone, reduceMotion = false }) {
  const { state } = useStore();
  const still = reduceMotion || prefersLessMotion();

  // Browsers block every kind of sound until the page has been clicked once.
  // The Overture is the first screen there is, so without a door to knock on,
  // its opening line is refused outright (NotAllowedError) and the guide falls
  // back to the robotic device voice for the one line that sets the tone.
  // The title card is that door.
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const [narrate, setNarrate] = useState(state.voice.enabled);
  // Whether the recorded track took. If it didn't — file missing, codec
  // refused, autoplay blocked — the generated score comes back rather than the
  // intro running dry.
  const trackRef = useRef(false);

  const canvasRef = useRef(null);
  const startedAt = useRef(0);
  // True while the guide is still mid-sentence. A beat will not advance out
  // from under its own narration, however short the hold is.
  const speaking = useRef(false);
  const advance = useRef(() => {});

  const scene = SCENES[i];
  const last = i === SCENES.length - 1;

  const next = () => (last ? finish() : setI((n) => n + 1));
  advance.current = next;

  function finish() {
    stopAll();
    releaseTrack();
    suspendScore(false);
    onDone();
  }

  // Hold the generated score off for the whole intro, and hand it back on the
  // way out however the intro ends — finished, skipped or unmounted.
  useEffect(() => {
    suspendScore(true);
    return () => {
      releaseTrack();
      suspendScore(false);
    };
  }, []);

  // ---- narration ----------------------------------------------------------
  // Read on arrival at each beat. The line carries a stable id, so it resolves
  // through the same three tiers as everything else the guide says: your own
  // recording first, then the natural voice, then the device voice.
  useEffect(() => {
    if (!started || !narrate) {
      speaking.current = false;
      duckTrack(false);
      stopAll();
      return undefined;
    }
    const line = OVERTURE_LINES[i];
    speaking.current = true;
    duckTrack(true);
    speakLine(overtureLineId(scene.id), line.text, state.voice, {
      onEnd: () => {
        speaking.current = false;
        duckTrack(false);
      },
    })
      .then((ok) => {
        if (!ok) {
          speaking.current = false; // nothing will speak, so nothing will end
          duckTrack(false);
        }
      })
      .catch(() => {
        // A refused or failed line must never hold the sequence hostage.
        speaking.current = false;
        duckTrack(false);
      });
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, narrate, started]);

  // ---- drawing ------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !started) return undefined;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let alive = true;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: rect.width, h: rect.height };
    };

    let dims = size();
    const draw = (t, p) => {
      ctx.clearRect(0, 0, dims.w, dims.h);
      scene.draw(ctx, { w: dims.w, h: dims.h, t, p });
    };
    const onResize = () => {
      dims = size();
      if (still) draw(scene.still, 1);
    };
    window.addEventListener("resize", onResize);

    function frame(now) {
      if (!alive) return;
      if (!startedAt.current) startedAt.current = now;
      const elapsed = (now - startedAt.current) / 1000;
      const p = Math.min(1, elapsed / scene.hold);

      // Held still, the scene is drawn at a moment chosen to show it well and
      // fully revealed — no half-faded state anybody has to wait out.
      draw(still ? scene.still : elapsed, still ? 1 : p);
      if (still) return;

      setProgress(p);
      // A beat waits for its own narration, but only so far — if a line never
      // reports finishing, the sequence still moves.
      if (p >= 1 && (!speaking.current || elapsed > scene.hold + 14)) {
        advance.current();
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    startedAt.current = 0;
    setProgress(0);
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, still, started]);

  // Space and arrows advance; Escape leaves.
  useEffect(() => {
    const onKey = (e) => {
      if (!started) return;
      if (e.key === "Escape") finish();
      if (e.key === " " || e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!started) {
    return (
      <div className="overture overture-door">
        <button className="overture-skip" onClick={finish}>
          Skip
        </button>
        <div className="rise center">
          <p className="beta-stamp">Beta · a self-experiment · 18+</p>
          <div className="sigil">◉</div>
          <h1 style={{ marginBottom: ".5rem" }}>Eternal Ruler</h1>
          <p className="creed">Become the eternal ruler of your own reality.</p>
          <p className="soft" style={{ margin: "2rem auto", maxWidth: "34ch" }}>
            Before anything else, a short story about how all of this works. Nine moments, about a
            minute, read aloud.
          </p>
          <button
            className="btn primary lg"
            onClick={async () => {
              setStarted(true);
              setNarrate(state.voice.enabled);
              if (state.music.enabled) {
                trackRef.current = await playTrack();
                // If the recording won't play, fall back rather than run silent.
                if (!trackRef.current) suspendScore(false);
              }
            }}
          >
            ▶ Begin
          </button>
          <p className="tiny muted" style={{ marginTop: "1rem" }}>
            Best with sound on. You can mute it once it starts.
          </p>
          <p className="tiny muted" style={{ marginTop: ".4rem" }}>
            Not therapy, medical advice, or crisis support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overture">
      <div className="overture-controls">
        <button
          className={`overture-narrate ${narrate ? "on" : ""}`}
          onClick={() => setNarrate((v) => !v)}
          aria-pressed={narrate}
          title={narrate ? "Narration on — tap to read it yourself" : "Narration off — tap to hear it"}
        >
          {narrate ? "◉))" : "◉"}
        </button>
        <button className="overture-skip" onClick={finish}>
          Skip
        </button>
      </div>

      <div className="overture-beats" aria-hidden="true">
        {SCENES.map((s, n) => (
          <span key={s.id} className={`ob ${n < i ? "done" : ""} ${n === i ? "at" : ""}`}>
            <i style={{ transform: `scaleX(${n === i && !still ? progress : n < i ? 1 : 0})` }} />
          </span>
        ))}
      </div>

      <div className="overture-stage" onClick={next} role="presentation">
        <canvas ref={canvasRef} className="overture-canvas" />
      </div>

      <div className="overture-words" key={scene.id}>
        <p className="overture-line">{scene.line}</p>
        {scene.source && <p className="overture-source">{scene.source}</p>}
        {scene.note && <p className="overture-note">{scene.note}</p>}
        {scene.footnote && <p className="overture-footnote">{scene.footnote}</p>}
      </div>

      <div className="overture-foot">
        {last ? (
          <>
            <p className="overture-honest">
              Everything you just watched was drawn from real measurements. The colours were worked out
              from the actual speed of the light. The sea really is those three waves added together. The
              bat's echo really does take that long to come back. That waves get bigger when they line up
              is plain physics, and you can check any of it.
              <br />
              <br />
              The rest — that spirit has a frequency you can tune into, that we are given guides the way a
              bat is given sonar, that a sixth sense opens onto ease and flow — comes from Sonia
              Choquette's <em>Ask Your Guides</em>. That part is a teaching, not a measurement. This app
              tells you which is which everywhere else, so it is going to tell you here too.
            </p>
            <button className="btn primary lg" onClick={finish}>
              Begin
            </button>
          </>
        ) : (
          <button className="btn ghost sm" onClick={next}>
            {still ? "Next" : "Skip ahead"} →
          </button>
        )}
      </div>
    </div>
  );
}
