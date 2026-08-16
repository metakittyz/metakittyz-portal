import React from "react";
import { protocolById } from "../data/protocols.js";

// The door that's open on every screen. No filtering, no browsing, no reading —
// you say what's wrong in plain language and it puts you straight into the timer.
export const NEEDS_NOW = [
  { id: "the-ascent", glyph: "▲", label: "I want my best state", sub: "The full ladder · 12 min" },
  { id: "spiral-break", glyph: "◐", label: "I'm spiralling", sub: "Interrupt it · 3 min" },
  { id: "courage-gate", glyph: "✦", label: "I'm afraid of the next thing", sub: "Before you walk in · 4 min" },
  { id: "focus-lock", glyph: "◇", label: "I can't focus", sub: "Scattered to locked in · 5 min" },
  { id: "ignite", glyph: "◉", label: "I'm flat", sub: "Nothing is pulling me · 6 min" },
  { id: "reconnect", glyph: "❋", label: "I feel disconnected", sub: "The line's gone quiet · 10 min" },
  { id: "discernment", glyph: "◆", label: "Is this real guidance?", sub: "Or fear in its coat · 5 min" },
  { id: "grounding", glyph: "◈", label: "I'm too open", sub: "Come all the way back · 5 min" },
  { id: "reset", glyph: "◍", label: "I just took a hit", sub: "After a conflict · 5 min" },
  { id: "descend", glyph: "◑", label: "I can't come down", sub: "Wind down properly · 8 min" },
];

export function NeedNow({ onPick, onClose }) {
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="What do you need right now?">
        <div className="panel-title">
          <h2>What do you need?</h2>
          <button className="btn ghost sm" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="small muted">Say it plainly. You&apos;ll be in the practice within one tap.</p>
        <div className="need-grid">
          {NEEDS_NOW.map((n) => (
            <button key={n.id} className="need-tile" onClick={() => onPick(protocolById[n.id])}>
              <span className="need-glyph">{n.glyph}</span>
              <strong>{n.label}</strong>
              <span className="tiny muted">{n.sub}</span>
            </button>
          ))}
        </div>
        <div className="note grave" style={{ marginTop: "1.2rem", marginBottom: 0 }}>
          If you&apos;re in danger right now, none of these are the right tool. Reach a person tonight — US
          &amp; Canada 988, UK &amp; Ireland 116 123, or your local emergency number.
        </div>
      </div>
    </div>
  );
}
