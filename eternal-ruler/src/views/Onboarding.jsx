import React, { useState } from "react";
import { useStore } from "../lib/store.jsx";
import { Field } from "../components/ui.jsx";

// Welcome → account → name → who you're reaching for.
// One question per screen. The consent Threshold comes after this.

export function Onboarding() {
  const store = useStore();
  const { state } = store;
  const [step, setStep] = useState(state.account ? "name" : "welcome");

  return (
    <div className="gate">
      <div className="gate-inner">
        {step === "welcome" && <Welcome onNext={() => setStep("account")} />}
        {step === "account" && <Account store={store} onNext={() => setStep("name")} />}
        {step === "name" && <Name store={store} onNext={() => setStep("who")} />}
        {step === "who" && <Who store={store} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- welcome --
function Welcome({ onNext }) {
  return (
    <div className="rise">
      <div className="sigil">◉</div>
      <h1 className="center" style={{ marginBottom: ".5rem" }}>
        Eternal Ruler
      </h1>
      <p className="creed center">Become the eternal ruler of your own reality.</p>

      <p className="center soft" style={{ margin: "2rem 0" }}>
        Forty-two days. One step a day. You open the line to your higher self, learn to tell its voice from
        every other voice in your head, and end up running your own life.
      </p>

      <div className="arc">
        {[
          ["I", "Make contact"],
          ["II", "Tell signal from noise"],
          ["III", "Look at what you avoid"],
          ["IV", "Put a date on it"],
          ["V", "Make it yours"],
        ].map(([n, what]) => (
          <div key={n} className="arc-step">
            <span className="arc-n">{n}</span>
            <span>{what}</span>
          </div>
        ))}
      </div>

      <button className="btn solid block big" onClick={onNext} style={{ marginTop: "2rem" }}>
        Start
      </button>
      <p className="tiny muted center" style={{ marginTop: "1rem" }}>
        18+. A self-experiment, not therapy.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- account --
function Account({ store, onNext }) {
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  function choose(method, addr = "") {
    store.createAccount({ method, email: addr });
    onNext();
  }

  return (
    <div className="rise">
      <div className="sigil small">◉</div>
      <h1 className="center" style={{ marginBottom: "1.8rem" }}>
        Create your account
      </h1>

      {emailMode ? (
        <>
          <Field label="Your email">
            <input
              type="text"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && valid && choose("email", email.trim())}
              placeholder="you@example.com"
              autoFocus
            />
          </Field>
          <button className="btn solid block" disabled={!valid} onClick={() => choose("email", email.trim())}>
            Continue
          </button>
          <button className="btn ghost block" style={{ marginTop: ".5rem" }} onClick={() => setEmailMode(false)}>
            Back
          </button>
        </>
      ) : (
        <div className="auth">
          <button className="auth-btn light" onClick={() => choose("google")}>
            Continue with Google
          </button>
          <button className="auth-btn dark" onClick={() => choose("apple")}>
            Continue with Apple
          </button>
          <button className="auth-btn outline" onClick={() => setEmailMode(true)}>
            Continue with email
          </button>
        </div>
      )}

      <div className="note calm" style={{ marginTop: "1.6rem", marginBottom: 0 }}>
        <strong>Beta:</strong> your account lives on this device. Google and Apple sign-in aren&apos;t connected
        yet, so nothing is sent anywhere and there&apos;s no password to lose.
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- name --
function Name({ store, onNext }) {
  const [name, setName] = useState(store.state.profile.name);
  const ok = name.trim().length > 0;

  function save() {
    store.setProfile({ name: name.trim() });
    onNext();
  }

  return (
    <div className="rise">
      <div className="sigil small">◉</div>
      <h1 className="center" style={{ marginBottom: ".6rem" }}>
        What is your name?
      </h1>
      <p className="center soft" style={{ marginBottom: "1.8rem" }}>
        You&apos;ll be speaking to yourself by name. That turns out to matter.
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && ok && save()}
        placeholder="Your name"
        autoFocus
        style={{ textAlign: "center", fontSize: "1.15rem", padding: ".8rem" }}
      />
      <button className="btn solid block big" disabled={!ok} onClick={save} style={{ marginTop: "1.2rem" }}>
        Continue
      </button>
    </div>
  );
}

// -------------------------------------------------------------------- who --
function Who({ store }) {
  const [higherSelfName, setHigherSelfName] = useState(store.state.profile.higherSelfName);
  const [intention, setIntention] = useState(store.state.profile.intention);
  const name = store.state.profile.name;

  function save() {
    // `onboarded` is the flag App watches; setting it hands over to the Threshold.
    store.setProfile({
      higherSelfName: higherSelfName.trim(),
      intention: intention.trim(),
      onboarded: true,
    });
  }

  return (
    <div className="rise">
      <div className="sigil small">◉</div>
      <h1 className="center" style={{ marginBottom: ".6rem" }}>
        Who are you reaching for, {name}?
      </h1>
      <p className="center soft" style={{ marginBottom: "1.8rem" }}>
        Both optional. Skip and set them later if you&apos;d rather.
      </p>

      <Field label="What you call them" hint="Higher self, soul, guide, future self — or nothing.">
        <input
          type="text"
          value={higherSelfName}
          onChange={(e) => setHigherSelfName(e.target.value)}
          placeholder="Higher self"
        />
      </Field>
      <Field label="Why you're here" hint="You'll be shown this on the days you forget.">
        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="The true reason, not the impressive one."
        />
      </Field>

      <button className="btn solid block big" onClick={save}>
        Continue
      </button>
    </div>
  );
}
