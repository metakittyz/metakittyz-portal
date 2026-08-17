// WAVEFORMS — the arithmetic behind the opening story.
//
// Everything the Overture draws comes from here, and all of it is real. The
// light really is coloured by its wavelength, the swell really is a sum of
// simple waves, the heartbeat really has that shape. A story about frequency
// drawn with decorative squiggles would be making its own point badly.
//
// Pure functions only: no canvas, no React, no time source. That keeps them
// checkable — the same call always returns the same number.

export const TAU = Math.PI * 2;

/**
 * Visible wavelength in nanometres to an RGB triple.
 *
 * An approximation of the CIE curves (the widely used Bruton method), which is
 * what makes the light scene an actual demonstration rather than an
 * illustration: the colour of each wave is computed from its frequency, not
 * chosen to look nice. 700nm comes out red because 700nm *is* red.
 */
export function wavelengthToRGB(nm) {
  let r = 0;
  let g = 0;
  let b = 0;

  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else if (nm <= 780) {
    r = 1;
  }

  // Human sensitivity falls away at both ends of the range.
  let fade = 1;
  if (nm >= 380 && nm < 420) fade = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm > 700 && nm <= 780) fade = 0.3 + (0.7 * (780 - nm)) / 80;

  const out = (v) => Math.round(255 * Math.pow(Math.max(0, v) * fade, 0.8));
  return [out(r), out(g), out(b)];
}

export function rgbCss([r, g, b], alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Frequency of a light wave, in terahertz, from its wavelength. */
export function nmToTHz(nm) {
  return 299792.458 / nm; // c in nm·THz
}

/**
 * One heartbeat, as a function of position through the cycle (0..1).
 *
 * The P wave, the QRS spike and the T wave, each a gaussian, at roughly the
 * amplitudes and offsets a lead-II trace shows. Sized so the R peak is 1.
 */
export function ecg(phase) {
  const x = phase - Math.floor(phase);
  const g = (mu, sigma, amp) => amp * Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
  return (
    g(0.18, 0.022, 0.12) - // P — atria
    g(0.36, 0.008, 0.16) + // Q
    g(0.4, 0.009, 1.0) - //  R — the spike you feel
    g(0.44, 0.013, 0.3) + // S
    g(0.63, 0.042, 0.28) //  T — ventricles resetting
  );
}

/**
 * Sea surface at a point, as the sum of its components.
 *
 * This is how ocean swell is actually modelled: not one wave but a spectrum of
 * them, each with its own frequency, wavelength and phase, added together. The
 * complicated-looking surface is simple waves on top of each other, which is
 * the whole point of the scene.
 */
export function seaSurface(components, x, t) {
  let sum = 0;
  for (const c of components) {
    sum += c.amp * Math.sin(x * c.k - t * c.omega + (c.phase || 0));
  }
  return sum;
}

export const SWELL = [
  { amp: 1.0, k: 0.9, omega: 0.62, phase: 0 },
  { amp: 0.52, k: 2.1, omega: 1.02, phase: 1.4 },
  { amp: 0.28, k: 3.7, omega: 1.53, phase: 3.1 },
];

/**
 * Two waves of equal amplitude, offset in phase, and what they come to.
 *
 * In phase they reinforce to double height; a half-cycle apart they cancel to
 * nothing. Same two waves, same energy each — the only variable is whether
 * they agree. That is the whole of the resonance scene, and it is ordinary
 * physics rather than a metaphor reaching.
 */
export function interfere(x, t, phaseGap) {
  const a = Math.sin(x - t);
  const b = Math.sin(x - t + phaseGap);
  return { a, b, sum: a + b };
}

/** How strongly a receiver tuned to `tuned` responds to a signal at `f`. */
export function resonance(f, tuned, width = 0.09) {
  return Math.exp(-((f - tuned) ** 2) / (2 * width * width));
}

// --------------------------------------------------------------- senses --
// Instruments other animals are issued, and the numbers behind them.

export const SPEED_OF_SOUND = 343; // m/s in air at 20°C

/** How long a bat waits for its own voice to come back from something. */
export function echoDelayMs(metres, c = SPEED_OF_SOUND) {
  return ((2 * metres) / c) * 1000;
}

/**
 * The angle Earth's magnetic field dips into the ground at a given latitude,
 * for a dipole: horizontal at the equator, straight down at the pole.
 *
 * This is the part worth knowing — a bird reading the dip angle is reading its
 * latitude directly off the planet. It isn't a direction sense, it's a
 * position sense.
 */
export function dipoleInclination(latDeg) {
  return (Math.atan(2 * Math.tan((latDeg * Math.PI) / 180)) * 180) / Math.PI;
}

/** Hearing ranges, in hertz. The gap between these two is the whole point. */
export const HEARING = {
  human: [20, 20000],
  bat: [20000, 120000],
};

// ---------------------------------------------------------- coherence --
// Coupled oscillators, and how they find each other.
//
// The Kuramoto model: a population each ticking at its own natural rate, each
// nudged slightly by all the others. Below a critical coupling they stay
// scattered and their combined output is mush. Above it they spontaneously
// fall into step and the same population produces one strong smooth wave.
//
// This is not a metaphor borrowed for the occasion — it is the standard model
// for metronomes synchronising on a shared board, fireflies flashing together,
// and pacemaker cells in a heart agreeing on a beat. Nothing is added to the
// system when it locks. The parts stop working against each other, and that
// alone is the difference between noise and flow.

/** Twelve oscillators, natural rates spread either side of 1. */
export const FLOCK = {
  omegas: [0.82, 1.31, 0.94, 1.18, 0.71, 1.06, 1.42, 0.88, 1.24, 0.97, 1.11, 0.79],
  phases: [0.3, 2.8, 5.1, 1.2, 4.4, 0.9, 3.6, 5.8, 2.1, 4.9, 1.7, 3.2],
};

/**
 * Integrate the population forward to time `t` at coupling `K`.
 *
 * Integrated from zero on every call rather than kept in a running state, so
 * the same (t, K) always gives the same answer — which is what lets the scene
 * be a pure draw function and hold still on request.
 */
export function kuramoto(t, K, flock = FLOCK, dt = 1 / 60) {
  const { omegas } = flock;
  const n = omegas.length;
  let th = flock.phases.slice();
  const steps = Math.min(Math.max(0, Math.floor(t / dt)), 2400);

  const rateAt = (state, i) => {
    let pull = 0;
    for (let j = 0; j < n; j++) pull += Math.sin(state[j] - state[i]);
    return omegas[i] + (K / n) * pull;
  };

  for (let s = 0; s < steps; s++) {
    const next = new Array(n);
    for (let i = 0; i < n; i++) next[i] = th[i] + dt * rateAt(th, i);
    th = next;
  }

  // The rate each one is *actually* turning at, which is not its natural rate
  // once the others are pulling on it. Entrainment shows up here first: the
  // spread in these collapses before the phases finish gathering.
  const rates = omegas.map((_, i) => rateAt(th, i));
  return { phases: th, rates };
}

/**
 * How together the population is: 0 is scattered, 1 is perfectly in step.
 * The standard order parameter — the length of the mean phase vector.
 */
export function orderParameter(phases) {
  let x = 0;
  let y = 0;
  for (const th of phases) {
    x += Math.cos(th);
    y += Math.sin(th);
  }
  x /= phases.length;
  y /= phases.length;
  return { r: Math.hypot(x, y), psi: Math.atan2(y, x) };
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Ease used for every fade in the Overture, so the beats feel of a piece. */
export function easeInOut(t) {
  const x = clamp01(t);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
