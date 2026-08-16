import React, { useState } from "react";
import { useStore } from "../lib/store.jsx";
import { Check, Field } from "../components/ui.jsx";

const GATES = [
  {
    key: "age18",
    title: "I am 18 or older.",
    text: "This app asks questions about trauma, mortality, sexuality, shame, and identity, and it hosts an unmoderated exchange of practices between adults. It is not built for minors.",
  },
  {
    key: "notTherapy",
    title: "I understand this is not therapy, medical care, or crisis support.",
    text: "Eternal Ruler is a journal, a set of practices, and a self-experiment. It is not a clinician and it does not know you. It cannot diagnose anything, it cannot intervene, and nothing in it substitutes for professional care.",
  },
  {
    key: "realityShift",
    title: "I understand this may change how I perceive reality and myself.",
    text: "Sustained contemplative practice can alter your sense of self, your relationships, your beliefs, and your read on what is real. For most people that is gradual and welcome. For some it is disorienting, and occasionally it is destabilizing. That risk is real, it is documented, and you are choosing to accept it.",
  },
  {
    key: "triggerAware",
    title: "I understand some prompts go deliberately deep.",
    text: "Certain journal prompts are designed to reach material you have been avoiding. They are marked before you open them, and you can turn them off entirely in Settings. Deep does not mean mandatory — every one of them can be skipped.",
  },
  {
    key: "peerNotVetted",
    title: "I understand the community is peers, not professionals.",
    text: "Anyone can describe their own experience here and anyone can offer mentorship for money. Nobody is licensed, credentialed, or vetted by this app. Assess every stranger's advice — and every stranger's price — with your own judgment.",
  },
  {
    key: "ownChoice",
    title: "My life, my choices, my responsibility.",
    text: "How you conduct this experiment is yours to decide, and so are the consequences. You choose the intensity. You choose when to stop. Stopping is always allowed and is often the wisest available move.",
  },
];

export function Threshold() {
  const { state, acceptThreshold } = useStore();
  const [gates, setGates] = useState({});
  // Pre-filled if you've been here before and asked to re-read the threshold.
  const [name, setName] = useState(state.profile.name);
  const [higherSelfName, setHigherSelfName] = useState(state.profile.higherSelfName);
  const [intention, setIntention] = useState(state.profile.intention);

  const allChecked = GATES.every((g) => gates[g.key]);

  return (
    <div className="threshold">
      <div className="threshold-inner">
        <div className="sigil">◉</div>
        <h1 className="center" style={{ marginBottom: ".4rem" }}>
          Eternal Ruler
        </h1>
        <p className="center muted small" style={{ letterSpacing: ".22em", textTransform: "uppercase" }}>
          The gate is not locked. It is heavy.
        </p>

        <div className="note grave" style={{ marginTop: "2rem" }}>
          <strong>Read this properly.</strong> This app is built to open and strengthen the line between you and
          your higher self. That is not a small thing to do to a person. Work like this has been known to change
          how people see themselves, what they want, who they stay close to, and what they believe is real. If
          that sounds like a marketing line, read it again — it is a warning.
        </div>

        <p className="soft">
          What follows is a self-experiment that you run and you supervise. There is no expert here. The app
          gives you structure, honest information about what is evidence-backed and what isn&apos;t, a place to
          record what actually happens, and a hard insistence that you keep sleeping, eating, moving, and talking
          to people while you do it.
        </p>
        <p className="soft">
          Cross each line below only if it&apos;s true.
        </p>

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
          <strong>If you are in crisis right now, this is the wrong tool.</strong> Reach a person tonight — in the
          US and Canada call or text <strong>988</strong>; in the UK and Ireland call <strong>116 123</strong>;
          elsewhere use your local emergency number or findahelpline.com. Come back to this when you&apos;re
          steady. It will still be here.
        </div>

        <hr className="rule" />

        <h2 style={{ marginBottom: ".8rem" }}>Before you enter</h2>
        <Field label="What should this app call you?" hint="Used when you speak to yourself by name. That turns out to matter.">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </Field>
        <Field
          label="What do you call the one you're reaching for?"
          hint="Higher self, soul, guide, future self, the Self, a name that came to you, or nothing at all. Optional."
        >
          <input
            type="text"
            value={higherSelfName}
            onChange={(e) => setHigherSelfName(e.target.value)}
            placeholder="Higher self"
          />
        </Field>
        <Field
          label="Why are you actually here?"
          hint="Write it plainly. You'll be shown this again on the days you forget."
        >
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="The true reason, not the impressive one."
          />
        </Field>

        <button
          className="btn solid block"
          disabled={!allChecked}
          onClick={() => {
            acceptThreshold({
              ...gates,
              name: name.trim(),
              higherSelfName: higherSelfName.trim(),
              intention: intention.trim(),
            });
            // The gate is a long page; land on day one at the top of it.
            window.scrollTo(0, 0);
          }}
          style={{ marginTop: ".6rem" }}
        >
          {allChecked ? "Cross the threshold" : "Every line must be true"}
        </button>

        <p className="tiny muted center" style={{ marginTop: "1.2rem" }}>
          Everything you write stays in this browser. Nothing is uploaded, because there is nowhere to upload it
          to. Clearing your browser data erases it permanently — export regularly from Settings.
        </p>
      </div>
    </div>
  );
}
