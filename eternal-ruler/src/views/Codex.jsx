import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { CODEX, PILLAR_INFO } from "../data/codex.js";
import { EVIDENCE_LABEL } from "../data/protocols.js";
import { Panel } from "../components/ui.jsx";

const EVIDENCE_TONE = { researched: "moss", mixed: "", traditional: "violet" };

export function Codex({ go }) {
  const store = useStore();
  const { state } = store;
  const [pillar, setPillar] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CODEX.filter((c) => {
      if (pillar !== "all" && c.pillar !== pillar) return false;
      if (savedOnly && !state.codexSaved.includes(c.id)) return false;
      if (!q) return true;
      return [c.title, c.subtitle, ...c.body, c.practice].join(" ").toLowerCase().includes(q);
    });
  }, [pillar, query, savedOnly, state.codexSaved]);

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">The Library</div>
        <h1>The Codex</h1>
        <p className="lede">
          Everything the practices rest on, in three pillars. Every entry states its evidence class up front,
          because you deserve to know whether you&apos;re reading a replicated finding, a popular idea that
          gets oversold, or a contemplative practice that was never a lab result and doesn&apos;t pretend to
          be. Nothing here is padded to sound more certain than it is.
        </p>
      </div>

      <div className="grid three" style={{ marginBottom: "1.4rem" }}>
        {Object.entries(PILLAR_INFO).map(([k, p]) => (
          <button
            key={k}
            className="stat"
            style={{
              textAlign: "left",
              cursor: "pointer",
              borderColor: pillar === k ? "var(--gold-dim)" : undefined,
            }}
            onClick={() => setPillar(pillar === k ? "all" : k)}
          >
            <div className="serif" style={{ fontSize: "1.25rem", color: "var(--gold)" }}>
              {p.name}
            </div>
            <div className="k">{p.tag}</div>
            <div className="small soft" style={{ marginTop: ".5rem" }}>
              {p.blurb}
            </div>
          </button>
        ))}
      </div>

      <div className="row" style={{ marginBottom: "1.2rem" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the codex…"
          style={{ flex: 1, minWidth: 180 }}
        />
        <button className={`chip ${savedOnly ? "on" : ""}`} onClick={() => setSavedOnly((v) => !v)}>
          ◆ Kept ({state.codexSaved.length})
        </button>
        {pillar !== "all" && (
          <button className="chip on" onClick={() => setPillar("all")}>
            {PILLAR_INFO[pillar].name} ×
          </button>
        )}
      </div>

      {list.length === 0 && <div className="empty">Nothing matches.</div>}

      {list.map((c) => {
        const open = openId === c.id;
        const kept = state.codexSaved.includes(c.id);
        const ev = EVIDENCE_LABEL[c.evidence];
        return (
          <Panel key={c.id} title={c.title} right={<span className="label">{c.read} min</span>}>
            <p className="soft" style={{ marginBottom: ".7rem" }}>
              {c.subtitle}
            </p>
            <div className="row tight" style={{ marginBottom: ".8rem" }}>
              <span className={`chip static ${EVIDENCE_TONE[c.evidence]}`}>{ev.short}</span>
              <span className="chip static">{PILLAR_INFO[c.pillar].name}</span>
              {c.caution && <span className="chip static ember">Has a caution</span>}
            </div>

            {open && (
              <>
                {c.body.map((para, i) => (
                  <p key={i} className="soft">
                    {para}
                  </p>
                ))}
                {c.caution && (
                  <div className="note warn">
                    <strong>Caution.</strong> {c.caution}
                  </div>
                )}
                {c.practice && (
                  <div className="note">
                    <strong>Do this:</strong> {c.practice}
                  </div>
                )}
                <p className="tiny muted">{ev.note}</p>
              </>
            )}

            <div className="row">
              <button className="btn ghost sm" onClick={() => setOpenId(open ? null : c.id)}>
                {open ? "Close" : "Read"}
              </button>
              <button className="btn ghost sm" onClick={() => store.toggleCodexSaved(c.id)}>
                {kept ? "◆ Kept" : "◇ Keep"}
              </button>
              {open && (
                <button
                  className="btn ghost sm"
                  onClick={() => go("journal", { title: c.title, promptText: c.practice })}
                >
                  Journal the practice
                </button>
              )}
            </div>
          </Panel>
        );
      })}

      <Panel tone="violet" title="How to read this library">
        <p className="small soft">
          Three classes, used consistently across the whole app.{" "}
          <span className="chip static moss">Research-backed</span> means the core mechanism has reasonable
          published support — not that it&apos;s certain, and not that every popular claim built on top of it
          is true. <span className="chip static">Mixed evidence</span> means plausible, partially supported,
          and routinely overstated elsewhere; run it as your own experiment.{" "}
          <span className="chip static violet">Traditional practice</span> means it comes from a contemplative
          lineage rather than a laboratory, and is judged by its fruit rather than by a citation.
        </p>
        <p className="small soft" style={{ marginBottom: 0 }}>
          None of this is medical advice, and an app cannot know your history, your medications, or your
          diagnoses. Where an entry carries a caution, the caution is the most important part of the entry.
        </p>
      </Panel>
    </>
  );
}
