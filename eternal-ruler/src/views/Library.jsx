import React, { useEffect, useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { CODEX, PILLAR_INFO } from "../data/codex.js";
import { EVIDENCE_LABEL, PROTOCOLS } from "../data/protocols.js";
import { Panel } from "../components/ui.jsx";
import { Runner } from "../components/Runner.jsx";

const TONE = { researched: "moss", mixed: "", traditional: "violet" };

export function Library({ params, go }) {
  const [tab, setTab] = useState(params?.openId ? "read" : "practices");
  const [running, setRunning] = useState(null);

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Everything else</div>
        <h1>The Library</h1>
        <p className="lede">
          The Path hands you what you need when you need it. This is everything, if you want to go looking.
        </p>
      </div>

      <div className="row tight" style={{ marginBottom: "1.3rem" }}>
        <button className={`chip ${tab === "practices" ? "on" : ""}`} onClick={() => setTab("practices")}>
          Practices ({PROTOCOLS.length})
        </button>
        <button className={`chip ${tab === "read" ? "on" : ""}`} onClick={() => setTab("read")}>
          Reading ({CODEX.length})
        </button>
      </div>

      {tab === "practices" ? <Practices onRun={setRunning} /> : <Reading params={params} go={go} />}

      {running && <Runner protocol={running} onClose={() => setRunning(null)} />}
    </>
  );
}

function Practices({ onRun }) {
  const [open, setOpen] = useState(null);
  return (
    <>
      <p className="small muted">
        Every one of these is also one tap away from any screen — the <strong>I need something now</strong>{" "}
        button at the top.
      </p>
      {PROTOCOLS.map((p) => {
        const isOpen = open === p.id;
        const ev = EVIDENCE_LABEL[p.evidence];
        return (
          <Panel
            key={p.id}
            title={
              <>
                <span style={{ color: "var(--violet)", marginRight: ".5rem" }}>{p.glyph}</span>
                {p.name}
              </>
            }
            right={<span className="label">{p.minutes} min</span>}
          >
            <p className="soft" style={{ marginBottom: ".7rem" }}>
              {p.tagline}
            </p>
            <div className="row tight" style={{ marginBottom: ".8rem" }}>
              <span className={`chip static ${TONE[p.evidence]}`}>{ev.short}</span>
              {p.caution && <span className="chip static ember">Read the caution</span>}
            </div>

            {isOpen && (
              <>
                <p className="small soft">{p.why}</p>
                <p className="tiny muted">{ev.note}</p>
                {p.caution && (
                  <div className="note warn">
                    <strong>Caution.</strong> {p.caution}
                  </div>
                )}
                <ol className="small soft" style={{ paddingLeft: "1.1rem" }}>
                  {p.steps.map((s, i) => (
                    <li key={i} style={{ marginBottom: ".45rem" }}>
                      <strong style={{ color: "var(--text)", fontWeight: 500 }}>{s.label}</strong>
                      <div>{s.detail}</div>
                    </li>
                  ))}
                </ol>
              </>
            )}

            <div className="row">
              <button className="btn solid sm" onClick={() => onRun(p)}>
                Begin
              </button>
              <button className="btn ghost sm" onClick={() => setOpen(isOpen ? null : p.id)}>
                {isOpen ? "Hide the detail" : "Read it first"}
              </button>
            </div>
          </Panel>
        );
      })}
    </>
  );
}

function Reading({ params, go }) {
  const store = useStore();
  const { state } = store;
  const [pillar, setPillar] = useState("all");
  const [openId, setOpenId] = useState(params?.openId || null);
  const [query, setQuery] = useState("");

  // A Path step can deep-link straight to its companion reading.
  useEffect(() => {
    if (params?.openId) {
      setOpenId(params.openId);
      const el = document.getElementById(params.openId);
      if (el) el.scrollIntoView({ block: "center" });
    }
  }, [params]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CODEX.filter((c) => {
      if (pillar !== "all" && c.pillar !== pillar) return false;
      if (!q) return true;
      return [c.title, c.subtitle, ...c.body].join(" ").toLowerCase().includes(q);
    });
  }, [pillar, query]);

  return (
    <>
      <div className="row" style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          style={{ flex: 1, minWidth: 160 }}
        />
        <button className={`chip ${pillar === "all" ? "on" : ""}`} onClick={() => setPillar("all")}>
          All
        </button>
        {Object.entries(PILLAR_INFO).map(([k, p]) => (
          <button key={k} className={`chip ${pillar === k ? "on" : ""}`} onClick={() => setPillar(k)}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="note">
        <span className="chip static moss">Research-backed</span> reasonable published support ·{" "}
        <span className="chip static">Mixed evidence</span> plausible, oversold elsewhere ·{" "}
        <span className="chip static violet">Traditional practice</span> a lineage, not a lab
      </div>

      {list.map((c) => {
        const open = openId === c.id;
        const kept = state.codexSaved.includes(c.id);
        return (
          <div key={c.id} id={c.id}>
            <Panel title={c.title} right={<span className="label">{c.read} min</span>}>
              <p className="soft" style={{ marginBottom: ".7rem" }}>
                {c.subtitle}
              </p>
              <div className="row tight" style={{ marginBottom: ".8rem" }}>
                <span className={`chip static ${TONE[c.evidence]}`}>{EVIDENCE_LABEL[c.evidence].short}</span>
                <span className="chip static">{PILLAR_INFO[c.pillar].name}</span>
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
                </>
              )}

              <div className="row">
                <button className="btn ghost sm" onClick={() => setOpenId(open ? null : c.id)}>
                  {open ? "Close" : "Read"}
                </button>
                <button className="btn ghost sm" onClick={() => store.toggleCodexSaved(c.id)}>
                  {kept ? "◆ Kept" : "◇ Keep"}
                </button>
                {open && c.practice && (
                  <button
                    className="btn ghost sm"
                    onClick={() => go("journal", { title: c.title, promptText: c.practice })}
                  >
                    Journal it
                  </button>
                )}
              </div>
            </Panel>
          </div>
        );
      })}
    </>
  );
}
