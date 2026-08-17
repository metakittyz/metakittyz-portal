import React, { useEffect, useRef } from "react";
import { STAGES, TOTAL_DAYS } from "../data/path.js";

// WELCOME TO THE WORLD OF SPIRIT.
//
// The screen between the Overture and making an account.
//
// It used to be four blocks of prose. Almost nobody reads four blocks of prose
// standing at a front door, so the six themes are now a drawn arc that climbs
// as you watch, and the words underneath it are as short as they can be while
// still being true.
//
// The one thing that did not get shortened is the warning, and it stays first.
// Somebody deciding whether to begin deserves the awkward part at the same
// moment as the invitation, not after the pitch.

const TAU = Math.PI * 2;

/**
 * The climb: six lit nodes rising left to right, joined by a line that draws
 * itself. It says "this goes somewhere and it goes in order" in about two
 * seconds, which is a sentence nobody would have finished reading.
 */
function ThemeArc({ still }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let t0 = 0;

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

    const at = (i, w, h) => {
      const u = i / (STAGES.length - 1);
      return { x: w * 0.1 + u * w * 0.8, y: h * 0.86 - Math.pow(u, 1.25) * h * 0.68 };
    };

    const draw = (grow) => {
      const { w, h } = dims;
      ctx.clearRect(0, 0, w, h);

      // The line so far.
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const u = (i / 120) * (STAGES.length - 1) * grow;
        const a = at(Math.floor(u), w, h);
        const b = at(Math.min(STAGES.length - 1, Math.floor(u) + 1), w, h);
        const f = u - Math.floor(u);
        const x = a.x + (b.x - a.x) * f;
        const y = a.y + (b.y - a.y) * f;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(232,195,122,.34)";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.stroke();

      STAGES.forEach((s, i) => {
        const lit = Math.max(0, Math.min(1, grow * (STAGES.length - 1) - i + 1));
        if (lit <= 0) return;
        const { x, y } = at(i, w, h);

        ctx.beginPath();
        ctx.arc(x, y, 4 + lit * 2, 0, TAU);
        ctx.fillStyle = `rgba(232,195,122,${0.35 + lit * 0.55})`;
        ctx.shadowBlur = 8 + lit * 16;
        ctx.shadowColor = "rgba(232,195,122,.9)";
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillStyle = `rgba(157,123,245,${0.5 * lit})`;
        ctx.textAlign = "center";
        ctx.fillText(s.n, x, y - 16);
      });
    };

    if (still) {
      draw(1);
      return () => window.removeEventListener("resize", onResize);
    }
    const loop = (now) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / 2600);
      draw(p < 1 ? 0.5 - 0.5 * Math.cos(p * Math.PI) : 1);
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [still]);

  return <canvas ref={ref} className="orient-arc-canvas" aria-hidden="true" />;
}

export function Orientation({ onNext }) {
  const still =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="rise orient">
      <p className="beta-stamp center">Beta · a self-experiment · 18+</p>
      <div className="sigil small">✧</div>
      <h1 className="center orient-h1">Welcome to the world of spirit</h1>
      <p className="creed center">You have been in it the whole time. Now you get the instrument.</p>

      <section className="orient-block orient-plain orient-first">
        <p className="small" style={{ marginBottom: 0 }}>
          Not therapy, medical advice, or crisis support. Adults only. This can genuinely change how
          reality looks to you — that is the point, and the risk. If you are in a fragile stretch, wait.
        </p>
      </section>

      <p className="orient-purpose">
        One line, opened and then made strong enough to run a life on.
      </p>

      <div className="orient-visual">
        <ThemeArc still={still} />
      </div>

      <div className="orient-themes">
        {STAGES.map((s) => (
          <div key={s.id} className="orient-theme">
            <span className="orient-theme-glyph">{s.glyph}</span>
            <b>{s.name}</b>
            <span className="orient-theme-short">{s.promise}</span>
          </div>
        ))}
      </div>

      <p className="center soft small orient-metaphor">
        A course, not a checklist. You learn the <b>notes</b>, then the <b>melodies</b>, then the whole{" "}
        <b>orchestration</b>.
      </p>

      <div className="orient-expect">
        <div>
          <b>{TOTAL_DAYS} days</b>
          <span>one step each, 10–20 min</span>
        </div>
        <div>
          <b>Nothing at first</b>
          <span>that is the normal start</span>
        </div>
        <div>
          <b>Never late</b>
          <span>it moves when you do</span>
        </div>
        <div>
          <b>Stays here</b>
          <span>nothing leaves this device</span>
        </div>
      </div>

      <p className="center soft orient-close">
        Let yourself be guided and you enter the flow of it. That is where the magic stops being a phrase
        and starts being a Tuesday.
      </p>

      <button className="btn primary lg block" onClick={onNext}>
        I&apos;m ready
      </button>
    </div>
  );
}
