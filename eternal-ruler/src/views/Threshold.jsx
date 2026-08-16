import React, { useState } from "react";
import { useStore } from "../lib/store.jsx";
import { Check } from "../components/ui.jsx";

const GATES = [
  {
    key: "age18",
    title: "I am 18 or older.",
    text: "This asks about trauma, mortality, sexuality, shame, and identity. Not built for minors.",
  },
  {
    key: "notTherapy",
    title: "This is not therapy, medical care, or crisis support.",
    text: "A journal, a set of practices, a self-experiment. It cannot diagnose or intervene, and it does not replace professional care.",
  },
  {
    key: "realityShift",
    title: "This may change how I perceive reality and myself.",
    text: "Sustained practice can shift your sense of self, your relationships, and your read on what's real. Usually gradual. Sometimes disorienting. Occasionally destabilizing. The risk is documented and you're accepting it.",
  },
  {
    key: "triggerAware",
    title: "Some prompts go deliberately deep.",
    text: "They're marked before you open them, every one is skippable, and you can switch them off in Settings.",
  },
  {
    key: "peerNotVetted",
    title: "The community is peers, not professionals.",
    text: "Nobody here is licensed, credentialed, or vetted. Judge every stranger's advice — and price — yourself.",
  },
  {
    key: "ownChoice",
    title: "My life, my choices, my responsibility.",
    text: "You set the intensity. You choose when to stop. Stopping is always allowed and often the wisest move.",
  },
];

export function Threshold() {
  const { acceptThreshold } = useStore();
  const [gates, setGates] = useState({});

  const allChecked = GATES.every((g) => gates[g.key]);

  return (
    <div className="gate">
      <div className="gate-inner">
        <div className="sigil">◉</div>
        <h1 className="center" style={{ marginBottom: ".4rem" }}>
          Eternal Ruler
        </h1>
        <p className="center muted small" style={{ letterSpacing: ".22em", textTransform: "uppercase" }}>
          The gate is not locked. It is heavy.
        </p>

        <div className="note grave" style={{ marginTop: "2rem" }}>
          <strong>Read this properly.</strong> This is built to open the line between you and your higher self.
          Work like this changes how people see themselves, what they want, and who they stay close to. If that
          reads like a marketing line, read it again — it&apos;s a warning.
        </div>

        <p className="soft">
          A self-experiment you run and you supervise. No expert here. You get structure, honest labelling of
          what&apos;s evidence-backed and what isn&apos;t, somewhere to record what happens, and an insistence
          that you keep sleeping, eating, moving, and talking to people while you do it.
        </p>
        <p className="soft">Cross each line only if it&apos;s true.</p>

        <div style={{ margin: "1.5rem 0" }}>
          {GATES.map((g) => (
            <Check
              key={g.key}
              checked={!!gates[g.key]}
              onChange={(v) => setGates((p) => ({ ...p, [g.key]: v }))}
              title={g.title}
            >
              {g.text}
            </Check>
          ))}
        </div>

        <div className="note calm">
          <strong>In crisis right now? This is the wrong tool.</strong> Reach a person tonight — US &amp; Canada
          call or text <strong>988</strong>, UK &amp; Ireland <strong>116 123</strong>, elsewhere your local
          emergency number or findahelpline.com. This will still be here.
        </div>

        <button
          className="btn solid block"
          disabled={!allChecked}
          onClick={() => {
            acceptThreshold(gates);
            // The gate is a long page; land on day one at the top of it.
            window.scrollTo(0, 0);
          }}
          style={{ marginTop: ".6rem" }}
        >
          {allChecked ? "Cross the threshold" : "Every line must be true"}
        </button>

        <p className="tiny muted center" style={{ marginTop: "1.2rem" }}>
          Everything stays in this browser. Nothing is uploaded. Clearing site data erases it — export from
          Settings.
        </p>
      </div>
    </div>
  );
}
