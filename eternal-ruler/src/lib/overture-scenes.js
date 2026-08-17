// THE OVERTURE — nine beats, drawn.
//
// Each scene is a pure draw function: given a context, a size and a time, it
// paints one frame. No state of its own, so a frame can be rendered at any `t`
// — which is what lets the whole thing hold still for anyone who has asked for
// less motion, and what makes it testable.
//
// The argument the sequence makes is cumulative, so the scenes are in the
// order the argument needs:
//
//   1 matter        · the smallest things move, and each at its own rate
//   2 light         · frequency isn't abstract — it's the colour you see
//   3 ocean         · complicated surfaces are simple waves added up
//   4 heartbeat     · you are already keeping time
//   5 everything    · all of it at once
//   6 resonance     · two waves that agree amplify; that's connection
//   7 senses        · every creature is issued an instrument for what it can't see
//   8 recognition   · a receiver only finds what it is tuned to
//   9 flow          · parts that stop fighting produce one clean wave
//
// Beats 7 and 9 carry lines from Sonia Choquette's *Ask Your Guides*, credited
// on the beat itself. Where her framing and the measurable thing diverge, both
// are shown — see the `footnote` on the senses beat.

import {
  SWELL,
  TAU,
  clamp01,
  dipoleInclination,
  kuramoto,
  orderParameter,
  easeInOut,
  ecg,
  interfere,
  lerp,
  nmToTHz,
  resonance,
  rgbCss,
  seaSurface,
  wavelengthToRGB,
} from "./waveforms.js";

const GOLD = "232, 195, 122";
const VIOLET = "157, 123, 245";
const FROST = "94, 200, 255";
const BLOOD = "224, 90, 109";

/** Stroke y = fn(x) across the width. */
function plot(ctx, w, fn, { color, width = 1.6, glow = 0, steps = 260 }) {
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w;
    const y = fn(x, i / steps);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (glow) {
    ctx.shadowBlur = glow;
    ctx.shadowColor = color;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function label(ctx, text, x, y, { color = `rgba(${GOLD}, .55)`, size = 11, align = "left" } = {}) {
  ctx.font = `${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
}

// ------------------------------------------------------------ 1. matter --
// A lattice, each site oscillating at its own rate. Nothing here is still,
// which is the only claim the scene makes.
function matter(ctx, { w, h, t, p }) {
  const cols = 9;
  const rows = 5;
  const padX = w * 0.12;
  const padY = h * 0.18;
  const dx = (w - padX * 2) / (cols - 1);
  const dy = (h - padY * 2) / (rows - 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = r * cols + c;
      const freq = 0.6 + ((seed * 37) % 11) * 0.34;
      const phase = ((seed * 53) % 17) / 17 * TAU;
      const amp = lerp(2, 7, ((seed * 29) % 7) / 6) * easeInOut(p * 2);

      const ox = Math.sin(t * freq + phase) * amp;
      const oy = Math.cos(t * freq * 0.82 + phase * 1.3) * amp;
      const x = padX + c * dx + ox;
      const y = padY + r * dy + oy;

      // Fast sites read gold, slow ones violet — frequency made visible before
      // the light scene says so outright.
      const hot = clamp01((freq - 0.6) / 3.4);
      const tint = `rgba(${hot > 0.5 ? GOLD : VIOLET}, ${0.25 + 0.55 * easeInOut(p * 1.6)})`;

      ctx.beginPath();
      ctx.arc(x, y, 2.1 + hot * 1.5, 0, TAU);
      ctx.fillStyle = tint;
      ctx.shadowBlur = 10;
      ctx.shadowColor = tint;
      ctx.fill();
      ctx.shadowBlur = 0;

      // The rest position, so the displacement is legible as displacement.
      ctx.beginPath();
      ctx.arc(padX + c * dx, padY + r * dy, 0.8, 0, TAU);
      ctx.fillStyle = "rgba(255,255,255,.07)";
      ctx.fill();
    }
  }
  label(ctx, "nothing here is still", w / 2, h - 14, { align: "center", color: "rgba(255,255,255,.28)" });
}

// ------------------------------------------------------------- 2. light --
// Five wavelengths, each stroked in the colour that wavelength actually is.
// Same wave, different rate, and the difference is something you can see.
const LIGHT_BANDS = [660, 600, 550, 490, 440];
const LIGHT_WORDS = ["red", "orange", "green", "cyan", "blue"];

function light(ctx, { w, h, t, p }) {
  const padX = w * 0.16;
  const usable = w - padX * 2;
  const top = h * 0.16;
  const gap = (h * 0.66) / (LIGHT_BANDS.length - 1);

  LIGHT_BANDS.forEach((nm, i) => {
    const reveal = easeInOut(clamp01(p * 2.2 - i * 0.13));
    if (reveal <= 0) return;
    const y0 = top + i * gap;
    const rgb = wavelengthToRGB(nm);
    // Shorter wavelength packs more cycles into the same span — the picture is
    // literally what "higher frequency" means.
    const cycles = 620 / nm * 5;

    plot(
      ctx,
      w,
      (x) => {
        const u = clamp01((x - padX) / usable);
        if (x < padX || x > padX + usable) return y0;
        const env = Math.sin(u * Math.PI); // taper at both ends
        return y0 + Math.sin(u * cycles * TAU - t * (2.2 + i * 0.5)) * 13 * env * reveal;
      },
      { color: rgbCss(rgb, 0.9 * reveal), width: 1.8, glow: 14 }
    );

    label(ctx, LIGHT_WORDS[i], padX - 12, y0, { align: "right", color: rgbCss(rgb, 0.8 * reveal) });
    label(ctx, i === 0 ? "slow" : i === LIGHT_BANDS.length - 1 ? "fast" : "", padX + usable + 12, y0, {
      color: `rgba(255,255,255,${0.32 * reveal})`,
    });
  });

  label(ctx, "one wave. change its speed, change its colour", w / 2, h - 14, {
    align: "center",
    color: "rgba(255,255,255,.28)",
  });
}

// ------------------------------------------------------------- 3. ocean --
// The three components above, their sum below. A swell is not one thing.
function ocean(ctx, { w, h, t, p }) {
  const compTop = h * 0.16;
  const compGap = h * 0.13;
  const reveal = easeInOut(clamp01(p * 2));

  SWELL.forEach((c, i) => {
    const y0 = compTop + i * compGap;
    plot(ctx, w, (x, u) => y0 + seaSurface([c], u * 12, t) * 9, {
      color: `rgba(${FROST}, ${0.3 * reveal})`,
      width: 1.1,
    });
    label(ctx, `wave ${i + 1}`, w - 14, y0, {
      align: "right",
      color: `rgba(255,255,255,${0.24 * reveal})`,
    });
  });

  const sumY = h * 0.72;
  const merge = easeInOut(clamp01(p * 1.8 - 0.35));

  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let i = 0; i <= 300; i++) {
    const u = i / 300;
    ctx.lineTo(u * w, sumY + seaSurface(SWELL, u * 12, t) * 13 * merge);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, sumY - 20, 0, h);
  grad.addColorStop(0, `rgba(${FROST}, ${0.22 * merge})`);
  grad.addColorStop(1, "rgba(12, 10, 21, 0)");
  ctx.fillStyle = grad;
  ctx.fill();

  plot(ctx, w, (x, u) => sumY + seaSurface(SWELL, u * 12, t) * 13 * merge, {
    color: `rgba(${FROST}, ${0.85 * merge})`,
    width: 2,
    glow: 12,
  });

  label(ctx, "three simple waves, added", w / 2, h - 14, {
    align: "center",
    color: "rgba(255,255,255,.28)",
  });
}

// --------------------------------------------------------- 4. heartbeat --
// One beat a second, scrolling, with the live point lit. Yours, right now.
function heartbeat(ctx, { w, h, t, p }) {
  const mid = h * 0.5;
  const bpm = 60;
  const cyclesAcross = 3.2;
  const reveal = easeInOut(clamp01(p * 2));

  ctx.beginPath();
  ctx.moveTo(0, mid);
  ctx.lineTo(w, mid);
  ctx.strokeStyle = "rgba(255,255,255,.05)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const at = (u) => mid - ecg(u * cyclesAcross - (t * bpm) / 60) * h * 0.3 * reveal;
  plot(ctx, w, (x, u) => at(u), { color: `rgba(${BLOOD}, ${0.9 * reveal})`, width: 2, glow: 16 });

  // The R peak nearest the middle of the screen, pulsing on the beat.
  const beat = ((t * bpm) / 60) % 1;
  const pulse = Math.exp(-Math.pow((beat - 0.4) * 9, 2));
  ctx.beginPath();
  ctx.arc(w * 0.5, at(0.5), 3 + pulse * 5, 0, TAU);
  ctx.fillStyle = `rgba(${BLOOD}, ${(0.5 + pulse * 0.5) * reveal})`;
  ctx.shadowBlur = 22;
  ctx.shadowColor = `rgba(${BLOOD}, .9)`;
  ctx.fill();
  ctx.shadowBlur = 0;

  label(ctx, "about once a second, your whole life", w / 2, h - 14, {
    align: "center",
    color: "rgba(255,255,255,.28)",
  });
}

// -------------------------------------------------------- 5. everything --
// All four at once. Not a new claim — the weight of the previous four.
function everything(ctx, { w, h, t, p }) {
  const reveal = easeInOut(clamp01(p * 1.6));
  const bands = [
    { y: 0.2, fn: (u) => Math.sin(u * 26 - t * 2.6) * 8, color: VIOLET, a: 0.4 },
    { y: 0.36, fn: (u) => Math.sin(u * 44 - t * 3.4) * 6, color: GOLD, a: 0.45 },
    { y: 0.54, fn: (u) => seaSurface(SWELL, u * 12, t) * 8, color: FROST, a: 0.5 },
    { y: 0.72, fn: (u) => -ecg(u * 3.2 - t) * 26, color: BLOOD, a: 0.55 },
  ];

  bands.forEach((b, i) => {
    const on = easeInOut(clamp01(p * 2.4 - i * 0.1));
    plot(ctx, w, (x, u) => h * b.y + b.fn(u) * on, {
      color: `rgba(${b.color}, ${b.a * on})`,
      width: 1.5,
      glow: 8,
    });
  });

  // Everything summed onto one line — the sea itself.
  const seaY = h * 0.88;
  const merged = easeInOut(clamp01(p * 2 - 0.5));
  if (merged > 0) {
    plot(
      ctx,
      w,
      (x, u) =>
        seaY +
        (Math.sin(u * 26 - t * 2.6) * 8 +
          Math.sin(u * 44 - t * 3.4) * 6 +
          seaSurface(SWELL, u * 12, t) * 8 -
          ecg(u * 3.2 - t) * 26) *
          0.28 *
          merged,
      { color: `rgba(${GOLD}, ${0.75 * merged})`, width: 2, glow: 16 }
    );
  }

  label(ctx, "one sea, in motion", w / 2, h - 14, { align: "center", color: `rgba(${GOLD}, ${0.4 * reveal})` });
}

// --------------------------------------------------------- 6. resonance --
// Two waves closing from a half-cycle apart to none. Below, what they come to.
function resonanceScene(ctx, { w, h, t, p }) {
  // Drift in from opposition to agreement, then hold there.
  const gap = Math.PI * (1 - easeInOut(clamp01(p * 1.5)));
  const topY = h * 0.26;
  const sumY = h * 0.68;
  const k = 22;

  plot(ctx, w, (x, u) => topY + interfere(u * k, t * 2.2, gap).a * 16, {
    color: `rgba(${VIOLET}, .55)`,
    width: 1.6,
  });
  plot(ctx, w, (x, u) => topY + interfere(u * k, t * 2.2, gap).b * 16, {
    color: `rgba(${GOLD}, .55)`,
    width: 1.6,
  });

  const agreement = 1 - gap / Math.PI;
  ctx.beginPath();
  ctx.moveTo(0, sumY);
  ctx.lineTo(w, sumY);
  ctx.strokeStyle = "rgba(255,255,255,.05)";
  ctx.lineWidth = 1;
  ctx.stroke();

  plot(ctx, w, (x, u) => sumY + interfere(u * k, t * 2.2, gap).sum * 16, {
    color: `rgba(${GOLD}, ${0.35 + 0.6 * agreement})`,
    width: 2 + agreement * 1.4,
    glow: 8 + agreement * 26,
  });

  label(ctx, gap > 0.15 ? "out of step" : "in step", w / 2, topY - h * 0.15, {
    align: "center",
    color: "rgba(255,255,255,.34)",
  });
  label(
    ctx,
    agreement > 0.9 ? "twice as big — same two waves" : "cancelling out",
    w / 2,
    h - 14,
    { align: "center", color: `rgba(${GOLD}, ${0.3 + 0.4 * agreement})` }
  );
}

// ------------------------------------------------------------ 7. senses --
// Three creatures, three instruments, one axis each. The bat's is sound, the
// bird's is a magnetic field, and ours is the one with no organ to point at.
//
// Drawn as three separate diagrams rather than three bands on a shared axis,
// because they are genuinely three different kinds of physics and flattening
// them onto one scale would be the sort of tidy lie this sequence is trying
// not to tell.
function senses(ctx, { w, h, t, p }) {
  const rowY = [h * 0.2, h * 0.5, h * 0.8];
  const padX = w * 0.17;
  const span = w - padX * 2;

  // ---- bat: a call, and its own voice coming back -------------------------
  const on1 = easeInOut(clamp01(p * 3.6));
  if (on1 > 0) {
    const y = rowY[0];
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(padX + span, y);
    ctx.strokeStyle = "rgba(255,255,255,.05)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // The call goes out, then returns quieter and later. 5m away, 29ms round trip.
    const cycle = (t * 0.55) % 1;
    const burst = (centre, amp, alpha) => {
      plot(
        ctx,
        w,
        (x, u) => {
          const d = (x - (padX + centre * span)) / (span * 0.06);
          if (Math.abs(d) > 3) return y;
          return y - Math.exp(-d * d) * Math.sin(d * 22) * amp;
        },
        { color: `rgba(${GOLD}, ${alpha * on1})`, width: 1.5, glow: 10 }
      );
    };
    burst(0.08 + cycle * 0.42, 15, 0.85);
    if (cycle > 0.32) burst(0.92 - (cycle - 0.32) * 0.55, 8, 0.4);

    label(ctx, "bat", padX - 12, y, { align: "right", color: `rgba(${GOLD}, ${0.7 * on1})` });
    label(ctx, "it shouts, and hears the echo come back", padX, y + 26, {
      color: `rgba(255,255,255,${0.26 * on1})`,
      size: 10,
    });
  }

  // ---- bird: the dip of the field tells it where it is --------------------
  const on2 = easeInOut(clamp01(p * 3.3 - 0.28));
  if (on2 > 0) {
    const y = rowY[1];
    for (let i = 0; i < 5; i++) {
      const off = (i - 2) * (h * 0.035);
      plot(ctx, w, (x, u) => y + off + Math.sin(u * Math.PI) * h * 0.05 * (1 - Math.abs(i - 2) / 3), {
        color: `rgba(${VIOLET}, ${0.16 * on2})`,
        width: 1,
      });
    }
    // A bird crossing latitudes; the needle follows the real dip angle.
    const u = (t * 0.09) % 1;
    const lat = lerp(5, 70, u);
    const dip = dipoleInclination(lat);
    const bx = padX + u * span;
    // Riding the centre field line, which is the one drawn at full amplitude.
    const by = y + Math.sin(u * Math.PI) * h * 0.05;
    const r = 11;
    const a = (dip * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(bx - Math.cos(a) * r, by - Math.sin(a) * r);
    ctx.lineTo(bx + Math.cos(a) * r, by + Math.sin(a) * r);
    ctx.strokeStyle = `rgba(${VIOLET}, ${0.9 * on2})`;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${VIOLET}, .8)`;
    ctx.stroke();
    ctx.shadowBlur = 0;

    label(ctx, "bird", padX - 12, y, { align: "right", color: `rgba(${VIOLET}, ${0.7 * on2})` });
    label(ctx, "it feels the tilt, and knows how far north it is", padX, y + h * 0.1, {
      color: `rgba(255,255,255,${0.26 * on2})`,
      size: 10,
    });
  }

  // ---- us: receiving, with nothing to point at ----------------------------
  const on3 = easeInOut(clamp01(p * 3 - 0.35));
  if (on3 > 0) {
    const y = rowY[2];
    for (let i = 0; i < 3; i++) {
      plot(ctx, w, (x, u) => y + Math.sin(u * (14 + i * 9) - t * (1.1 + i * 0.4)) * (3 + i * 2), {
        color: `rgba(${FROST}, ${(0.12 + i * 0.05) * on3})`,
        width: 1,
      });
    }
    ctx.beginPath();
    ctx.arc(padX + span * 0.5, y, 4 + Math.sin(t * 1.4) * 1.2, 0, TAU);
    ctx.fillStyle = `rgba(${GOLD}, ${0.8 * on3})`;
    ctx.shadowBlur = 20;
    ctx.shadowColor = `rgba(${GOLD}, .9)`;
    ctx.fill();
    ctx.shadowBlur = 0;

    label(ctx, "us", padX - 12, y, { align: "right", color: `rgba(${GOLD}, ${0.7 * on3})` });
    label(ctx, "no ears for this one. listening anyway", padX, y + 26, {
      color: `rgba(255,255,255,${0.26 * on3})`,
      size: 10,
    });
  }
}

// ------------------------------------------------------- 8. recognition --
// You, tuned. Around you, others. The ones near your frequency come up out of
// the dark — not because they arrived, but because you can finally hear them.
const NEIGHBOURS = [0.42, 0.63, 0.88, 0.97, 1.12, 1.38, 1.74];
const TUNED = 0.97;

function recognition(ctx, { w, h, t, p }) {
  const selfY = h * 0.5;
  const wake = easeInOut(clamp01(p * 1.7));

  NEIGHBOURS.forEach((f, i) => {
    if (Math.abs(f - TUNED) < 0.001) return;
    const spread = (i - (NEIGHBOURS.length - 1) / 2) / NEIGHBOURS.length;
    const y = selfY + spread * h * 0.78;
    // Always drawn. What changes is whether you can make it out.
    const heard = resonance(f, TUNED) * wake;
    const alpha = 0.05 + heard * 0.6;
    plot(ctx, w, (x, u) => y + Math.sin(u * 30 * f - t * 2 * f) * (5 + heard * 9), {
      color: `rgba(${VIOLET}, ${alpha})`,
      width: 1 + heard * 1.2,
      glow: heard * 18,
    });
  });

  plot(ctx, w, (x, u) => selfY + Math.sin(u * 30 * TUNED - t * 2 * TUNED) * (7 + wake * 8), {
    color: `rgba(${GOLD}, ${0.5 + 0.45 * wake})`,
    width: 2.2,
    glow: 10 + wake * 24,
  });
  label(ctx, "you", 14, selfY, { color: `rgba(${GOLD}, ${0.4 + 0.4 * wake})` });

  label(ctx, "you only pick up what you are tuned to", w / 2, h - 14, {
    align: "center",
    color: `rgba(255,255,255,${0.2 + 0.2 * wake})`,
  });
}

// -------------------------------------------------------------- 9. flow --
// Twelve oscillators. Coupling rises; they fall into step on their own.
//
// The measured effect is height, not tidiness — scattered, they cancel down to
// about 45% of what they could be; locked, they reach 100%. Same twelve waves,
// same energy each. So the scene shows amplitude rather than pretending the
// incoherent state looks like noise, which at this spread it doesn't.
function flow(ctx, { w, h, t, p }) {
  const K = easeInOut(clamp01(p * 1.35)) * 3.2;
  const { phases, rates } = kuramoto(t, K);
  const { r, psi } = orderParameter(phases);

  // ---- the phase circle: scattered, then a single cluster -----------------
  const cx = w * 0.5;
  const cy = h * 0.3;
  const rad = Math.min(w, h) * 0.17;

  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, TAU);
  ctx.strokeStyle = "rgba(255,255,255,.07)";
  ctx.lineWidth = 1;
  ctx.stroke();

  phases.forEach((th, i) => {
    const x = cx + Math.cos(th) * rad;
    const y = cy + Math.sin(th) * rad;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, TAU);
    const tint = `rgba(${lerp(157, 232, r) | 0}, ${lerp(123, 195, r) | 0}, ${lerp(245, 122, r) | 0}, ${0.5 + r * 0.45})`;
    ctx.fillStyle = tint;
    ctx.shadowBlur = 8 + r * 14;
    ctx.shadowColor = tint;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // The mean vector: short while they disagree, long when they don't.
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(psi) * rad * r, cy + Math.sin(psi) * rad * r);
  ctx.strokeStyle = `rgba(${GOLD}, ${0.25 + r * 0.6})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  label(ctx, `${Math.round(r * 100)}% in step`, cx, cy + rad + 22, {
    align: "center",
    color: `rgba(${GOLD}, ${0.35 + r * 0.45})`,
  });

  // ---- what they add up to ------------------------------------------------
  const sumY = h * 0.82;
  ctx.beginPath();
  ctx.moveTo(0, sumY);
  ctx.lineTo(w, sumY);
  ctx.strokeStyle = "rgba(255,255,255,.05)";
  ctx.lineWidth = 1;
  ctx.stroke();

  plot(
    ctx,
    w,
    (x, u) => {
      // Each contributes at the rate it is actually turning, not its natural
      // one. What changes as they lock is height, not tidiness: scattered,
      // twelve waves cancel each other down to under half; in step, the same
      // twelve reach full amplitude. Nothing was added — they simply stopped
      // subtracting from one another.
      let sum = 0;
      for (let i = 0; i < phases.length; i++) sum += Math.sin(phases[i] + u * rates[i] * 9);
      return sumY + (sum / phases.length) * h * 0.13;
    },
    { color: `rgba(${GOLD}, ${0.3 + r * 0.65})`, width: 1.6 + r * 1.6, glow: 6 + r * 26 }
  );

  label(ctx, r < 0.45 ? "pulling against each other" : "together now", w / 2, h - 12, {
    align: "center",
    color: `rgba(255,255,255,${0.24 + r * 0.24})`,
  });
}

// ---------------------------------------------------------------------------

export const SCENES = [
  {
    id: "matter",
    draw: matter,
    hold: 7,
    line: "Nothing in you has ever been still.",
    note: "Not one atom. Not for one second of your life.",
    still: 3.1,
  },
  {
    id: "light",
    draw: light,
    hold: 8,
    line: "Everything you have ever seen was a speed.",
    note: "Slow waves look red. Fast ones look blue. That is the whole difference.",
    still: 2.4,
  },
  {
    id: "ocean",
    draw: ocean,
    hold: 7,
    line: "Nothing overwhelming is ever one thing.",
    note: "This whole sea is three simple waves, stacked.",
    still: 4.2,
  },
  {
    id: "heart",
    draw: heartbeat,
    hold: 7,
    line: "You have kept time your entire life.",
    note: "About once a second, since before you were born.",
    still: 1.6,
  },
  {
    id: "everything",
    draw: everything,
    hold: 7,
    line: "You are not in the world. You are made of its motion.",
    note: "Matter, light, water, blood. Not like waves. Waves.",
    still: 3.4,
  },
  {
    id: "resonance",
    draw: resonanceScene,
    hold: 9,
    line: "Nothing changes but agreement. And everything changes.",
    note: "Out of step, two waves cancel to nothing. In step, the same two double. Connection was never about being close.",
    still: 6.5,
  },
  {
    id: "senses",
    draw: senses,
    hold: 10,
    line: "Birds have radar, bats have sonar — and we have guides.",
    note: "Every creature is given a way to sense what it otherwise couldn't.",
    source: "Sonia Choquette · Ask Your Guides",
    // The app labels its claims everywhere else; it doesn't get to stop here.
    footnote:
      "Bats really do use sonar. Birds don't use radar, though — they feel the Earth's magnetic pull, and its angle tells them how far north they are. Stranger than radar, and it can be measured.",
    still: 5.5,
  },
  {
    id: "recognition",
    draw: recognition,
    hold: 9,
    line: "Nothing arrives. You come into range.",
    note: "The faint ones were always there, the whole time you could not hear them.",
    still: 7,
  },
  {
    id: "flow",
    draw: flow,
    hold: 13,
    line: "Stop working against yourself, and life plays as one thing.",
    note: "Twelve things ticking apart cancel each other out. In step, nothing new is added — they simply stop cancelling. That is ease, and flow.",
    source: "Sonia Choquette · Ask Your Guides",
    still: 12,
  },
];

/** The narration id for a beat, so the Voice Studio can address it. */
export const overtureLineId = (sceneId) => `overture:${sceneId}`;

/** What the guide actually reads out on each beat. */
export const OVERTURE_LINES = SCENES.map((s) => ({
  id: overtureLineId(s.id),
  text: s.note ? `${s.line} ${s.note}` : s.line,
  label: s.line,
}));
