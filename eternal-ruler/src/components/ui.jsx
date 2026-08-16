import React, { useEffect, useState } from "react";

export function Panel({ title, right, tone = "", children, className = "" }) {
  return (
    <section className={`panel ${tone} ${className}`.trim()}>
      {(title || right) && (
        <div className="panel-title">
          {title && <h3>{title}</h3>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ glyph = "◇", children }) {
  return (
    <div className="empty">
      <span className="glyph">{glyph}</span>
      {children}
    </div>
  );
}

export function Stat({ n, k }) {
  return (
    <div className="stat">
      <div className="n">{n}</div>
      <div className="k">{k}</div>
    </div>
  );
}

export function Bar({ pct }) {
  return (
    <div className="bar">
      <i style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function Spark({ values, colorFor }) {
  if (!values.length) return null;
  return (
    <div className="spark" aria-hidden="true">
      {values.map((v, i) => (
        <i
          key={i}
          style={{
            height: `${Math.max(6, (v / 100) * 100)}%`,
            background: colorFor ? colorFor(v) : "var(--violet)",
          }}
        />
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { maxWidth: 780 } : undefined} role="dialog" aria-modal="true" aria-label={title}>
        <div className="panel-title">
          <h2>{title}</h2>
          <button className="btn ghost sm" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Two-step destructive button — no browser confirm(), no accidental wipes. */
export function DangerButton({ children, confirmLabel = "Certain?", onConfirm, className = "btn danger sm" }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      className={className}
      onClick={() => {
        if (armed) {
          onConfirm();
          setArmed(false);
        } else setArmed(true);
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div className="field-group">
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}

export function Check({ checked, onChange, title, children }) {
  return (
    <label className={`check ${checked ? "on" : ""}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {title && (
          <strong style={{ display: "block", fontWeight: 600, fontSize: "0.9rem" }}>{title}</strong>
        )}
        <span className="small soft">{children}</span>
      </span>
    </label>
  );
}
