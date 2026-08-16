import React from "react";
import { band, readGap, tempColor } from "../lib/temperature.js";

/** One 0-100 hot/cold slider. The thumb takes the colour of the value. */
export function Dial({ label, question, value, onChange }) {
  const color = tempColor(value);
  const b = band(value);
  return (
    <div className="dial">
      <div className="dial-head">
        <span className="dial-q">{question || label}</span>
        <span className="dial-val" style={{ color }}>
          {value} · {b.name}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--thumb": color }}
        aria-label={question || label}
      />
    </div>
  );
}

/** The paired self/higher reading for a single domain, plus its verdict. */
export function DomainDials({ domain, reading, onChange }) {
  const { self, higher } = reading;
  const { gap, verdict, alignment } = readGap(self, higher);
  const lo = Math.min(self, higher);
  const width = Math.abs(gap);

  return (
    <div className="panel">
      <div className="panel-title">
        <h3>
          <span style={{ color: "var(--violet)", marginRight: ".5rem" }}>{domain.glyph}</span>
          {domain.name}
        </h3>
        <span className={`verdict ${verdict.tone}`}>{verdict.label}</span>
      </div>

      <Dial question={domain.selfQ} value={self} onChange={(v) => onChange({ self: v, higher })} />
      <Dial question={domain.higherQ} value={higher} onChange={(v) => onChange({ self, higher: v })} />

      <div className="gapbar" aria-hidden="true">
        <i
          style={{
            left: `${lo}%`,
            width: `${Math.max(1.5, width)}%`,
            background: `linear-gradient(90deg, ${tempColor(self)}, ${tempColor(higher)})`,
          }}
        />
      </div>
      <div className="row spread tiny muted" style={{ marginTop: ".45rem" }}>
        <span>
          Gap {gap > 0 ? "+" : ""}
          {gap} · Alignment {alignment}%
        </span>
        <span>
          {gap > 0
            ? "Your higher self runs hotter here"
            : gap < 0
              ? "You run hotter here than your higher self"
              : "Level"}
        </span>
      </div>
      <p className="small soft" style={{ marginTop: ".6rem", marginBottom: 0 }}>
        {verdict.blurb}
      </p>
    </div>
  );
}
