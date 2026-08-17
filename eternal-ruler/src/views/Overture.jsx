import React, { useEffect, useRef, useState } from "react";
import { SCENES } from "../lib/overture-scenes.js";

// THE OVERTURE — the story the app opens with.
//
// Seven beats, each one drawn from the real equation for the thing it shows.
// It plays once before the welcome screen and can be replayed any time from
// Settings.
//
// It is skippable from the first frame. Something unskippable between someone
// and the app they came to use is an obstacle no matter how good it looks.

function prefersLessMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function Overture({ onDone, reduceMotion = false }) {
  const still = reduceMotion || prefersLessMotion();
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);
  const startedAt = useRef(0);
  const scene = SCENES[i];
  const last = i === SCENES.length - 1;

  const next = () => (last ? onDone() : setI((n) => n + 1));

  // One rAF loop for the life of the component. It reads the current scene
  // through a ref-free closure by re-subscribing on scene change, which keeps
  // the timing honest: each beat starts its own clock at zero.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
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
    const onResize = () => {
      dims = size();
      if (still) frame(scene.still * 1000 + startedAt.current);
    };
    window.addEventListener("resize", onResize);

    function frame(now) {
      if (!alive) return;
      if (!startedAt.current) startedAt.current = now;
      const elapsed = (now - startedAt.current) / 1000;
      const p = Math.min(1, elapsed / scene.hold);

      ctx.clearRect(0, 0, dims.w, dims.h);
      // Held still, the scene is drawn at a moment chosen to show it well, and
      // fully revealed — no half-faded state anybody has to wait out.
      scene.draw(ctx, { w: dims.w, h: dims.h, t: still ? scene.still : elapsed, p: still ? 1 : p });

      if (still) return;
      setProgress(p);
      if (p >= 1) {
        next();
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
  }, [i, still]);

  // Space and arrow keys advance; Escape leaves.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onDone();
      if (e.key === " " || e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="overture">
      <button className="overture-skip" onClick={onDone}>
        Skip
      </button>

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
        <p className="overture-note">{scene.note}</p>
        {scene.footnote && <p className="overture-footnote">{scene.footnote}</p>}
      </div>

      <div className="overture-foot">
        {last ? (
          <>
            <p className="overture-honest">
              Everything you just watched is drawn from the real equations. The colours are computed from
              wavelength, the swell is its three components summed, the trace is a heartbeat's actual
              shape, the bat's echo really does take 29 milliseconds, and those twelve oscillators found
              each other by ordinary coupling — nothing was added when they locked.
              <br />
              <br />
              That waves amplify when they agree is physics. That spirit has a frequency you can tune to,
              that we are issued guides the way a bat is issued sonar, and that the sixth sense opens onto
              ease and flow — those are Sonia Choquette's teaching in <em>Ask Your Guides</em>, and they are
              teaching, not measurement. This app keeps those two apart everywhere. It isn't going to start
              blurring them on the first screen.
            </p>
            <button className="btn primary lg" onClick={onDone}>
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
