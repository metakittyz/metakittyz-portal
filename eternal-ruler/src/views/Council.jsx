import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { COUNCIL_TERMS, FOCUS_AREAS, SEED_MENTORS } from "../data/mentors.js";
import { DangerButton, Empty, Field, Modal, Panel } from "../components/ui.jsx";
import { prettyDate } from "../lib/util.js";

export function Council() {
  const store = useStore();
  const { state } = store;
  const [tab, setTab] = useState("mentors");

  const fieldNotes = useMemo(
    () => state.journal.filter((e) => e.tags?.includes("field-note")),
    [state.journal]
  );

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Community</div>
        <h1>The Council</h1>
        <p className="lede">
          Not gurus, not clinicians — practitioners further down the same road, who can be paid for their time.
        </p>
      </div>

      <div className="note warn">
        <strong>Runs entirely on your device.</strong> No server yet, so nothing here reaches another human:
        sample profiles, private drafts, no payments. The interface is real; the network is the next build.
      </div>

      <div className="row tight" style={{ marginBottom: "1.3rem" }}>
        {[
          ["mentors", "Find a mentor"],
          ["requests", `Your requests (${state.council.requests.length})`],
          ["become", "Become a mentor"],
          ["notes", `Field notes (${fieldNotes.length})`],
          ["terms", "How this works"],
        ].map(([k, label]) => (
          <button key={k} className={`chip ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "mentors" && <Directory store={store} />}
      {tab === "requests" && <Requests store={store} />}
      {tab === "become" && <BecomeMentor store={store} />}
      {tab === "notes" && <FieldNotes store={store} notes={fieldNotes} />}
      {tab === "terms" && <Terms />}
    </>
  );
}

function Directory({ store }) {
  const [focus, setFocus] = useState("all");
  const [requesting, setRequesting] = useState(null);

  const list = focus === "all" ? SEED_MENTORS : SEED_MENTORS.filter((m) => m.focus.includes(focus));

  return (
    <>
      <div className="row tight" style={{ marginBottom: "1.2rem" }}>
        <button className={`chip ${focus === "all" ? "on" : ""}`} onClick={() => setFocus("all")}>
          All focuses
        </button>
        {FOCUS_AREAS.map((f) => (
          <button key={f} className={`chip ${focus === f ? "on" : ""}`} onClick={() => setFocus(f)}>
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 && <Empty glyph="◈">Nobody listed for that focus yet.</Empty>}

      {list.map((m) => (
        <Panel
          key={m.id}
          title={m.handle}
          right={
            <span className="label">
              ${m.rate} / {m.unit}
            </span>
          }
        >
          <p className="soft" style={{ marginBottom: ".6rem" }}>
            {m.title} · {m.years} years of practice
          </p>
          <div className="row tight" style={{ marginBottom: ".8rem" }}>
            <span className="chip static">Sample profile</span>
            {m.focus.map((f) => (
              <span key={f} className="chip static violet">
                {f}
              </span>
            ))}
          </div>
          <p className="small soft">{m.approach}</p>
          <div className="grid two small muted" style={{ marginBottom: ".8rem" }}>
            <div>
              <span className="field-label">Tone</span>
              {m.tone}
            </div>
            <div>
              <span className="field-label">Availability</span>
              {m.availability}
            </div>
          </div>
          {m.note && <div className="note calm">{m.note}</div>}
          <button className="btn sm" onClick={() => setRequesting(m)}>
            Request a session
          </button>
        </Panel>
      ))}

      {requesting && (
        <RequestModal
          mentor={requesting}
          onClose={() => setRequesting(null)}
          onSend={(payload) => {
            store.addMentorRequest({ mentorId: requesting.id, mentorHandle: requesting.handle, ...payload });
            setRequesting(null);
          }}
        />
      )}
    </>
  );
}

function RequestModal({ mentor, onClose, onSend }) {
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [ask, setAsk] = useState("");

  return (
    <Modal title={`Request a session with ${mentor.handle}`} onClose={onClose}>
      <div className="note warn">
        This saves a private draft on your device. Nothing is sent, nobody is notified, and no money moves —
        this beta has no server. When the marketplace goes live, this is the message that would go out.
      </div>
      <Field label="What are you working on?" hint="Enough that they can tell whether they're the right person.">
        <textarea value={what} onChange={(e) => setWhat(e.target.value)} />
      </Field>
      <Field label="Where are you in it?" hint="How long you've been practising, what's happened, what's changed.">
        <textarea value={where} onChange={(e) => setWhere(e.target.value)} />
      </Field>
      <Field label="What do you actually want from the session?" hint="A specific ask gets a far better hour than 'guidance'.">
        <textarea value={ask} onChange={(e) => setAsk(e.target.value)} />
      </Field>
      <div className="note calm">
        Before you pay anyone: a good mentor will tell you what they don&apos;t do, will refer you elsewhere
        when you need something they can&apos;t give, and will never suggest that leaving is a failure of
        commitment. Anyone urging urgency, secrecy, or escalating payments is not a mentor.
      </div>
      <div className="row">
        <button className="btn solid" onClick={() => onSend({ what, where, ask, rate: mentor.rate, unit: mentor.unit })}>
          Save the draft
        </button>
        <button className="btn ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

function Requests({ store }) {
  const { requests } = store.state.council;
  if (!requests.length)
    return <Empty glyph="◈">No drafts yet. Nothing sends in this beta, but writing the ask is useful practice on its own.</Empty>;

  return requests.map((r) => (
    <div key={r.id} className="entry">
      <div className="entry-meta">
        <span>{prettyDate(r.at.slice(0, 10))}</span>
        <span className="chip static">{r.mentorHandle}</span>
        <span className="chip static ember">Draft — not sent</span>
        <div className="topbar-spacer" />
        <DangerButton onConfirm={() => store.updateMentorRequest(r.id, { status: "withdrawn" })}>
          Withdraw
        </DangerButton>
      </div>
      {r.status === "withdrawn" && <div className="tiny muted">Withdrawn.</div>}
      <div className="stack small soft">
        {r.what && (
          <div>
            <span className="field-label">Working on</span>
            {r.what}
          </div>
        )}
        {r.where && (
          <div>
            <span className="field-label">Where they are</span>
            {r.where}
          </div>
        )}
        {r.ask && (
          <div>
            <span className="field-label">The ask</span>
            {r.ask}
          </div>
        )}
      </div>
    </div>
  ));
}

function BecomeMentor({ store }) {
  const existing = store.state.council.mentorProfile;
  const [p, setP] = useState(
    existing || { handle: "", title: "", years: "", focus: [], rate: "", unit: "60 min", approach: "", limits: "" }
  );
  const [saved, setSaved] = useState(false);

  function toggleFocus(f) {
    setP((prev) => ({
      ...prev,
      focus: prev.focus.includes(f) ? prev.focus.filter((x) => x !== f) : [...prev.focus, f],
    }));
  }

  return (
    <>
      <Panel tone="gold" title="Offer your experience">
        <p className="soft">
          If you have done this work for years and can help someone earlier on the road, you can be paid for
          that. What the Council asks in return is honesty about your limits: what you know, what you
          don&apos;t, and when you&apos;ll tell someone to go and see a professional instead.
        </p>
        <div className="note warn">
          Draft only. Profiles cannot be published in this beta — there is no server to publish them to. When
          the marketplace goes live it will need identity verification, a payments processor, a platform fee,
          and a reporting route. All of that is described in the README.
        </div>

        <Field label="How you want to be known" hint="A handle is fine. Many people prefer not to use their legal name here.">
          <input type="text" value={p.handle} onChange={(e) => setP({ ...p, handle: e.target.value })} />
        </Field>
        <Field label="One line on what you offer">
          <input type="text" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} placeholder="e.g. Discernment & first contact" />
        </Field>
        <div className="grid two">
          <Field label="Years of practice">
            <input type="number" value={p.years} onChange={(e) => setP({ ...p, years: e.target.value })} />
          </Field>
          <Field label="Rate (USD)">
            <input type="number" value={p.rate} onChange={(e) => setP({ ...p, rate: e.target.value })} />
          </Field>
        </div>
        <Field label="Session length">
          <select value={p.unit} onChange={(e) => setP({ ...p, unit: e.target.value })}>
            <option>30 min</option>
            <option>45 min</option>
            <option>60 min</option>
            <option>90 min</option>
          </select>
        </Field>
        <Field label="What you focus on">
          <div className="row tight">
            {FOCUS_AREAS.map((f) => (
              <button key={f} className={`chip ${p.focus.includes(f) ? "on" : ""}`} onClick={() => toggleFocus(f)}>
                {f}
              </button>
            ))}
          </div>
        </Field>
        <Field
          label="Your approach"
          hint="What you actually do in a session, and what your own road looked like. Specificity beats credentials here."
        >
          <textarea value={p.approach} onChange={(e) => setP({ ...p, approach: e.target.value })} />
        </Field>
        <Field
          label="Your limits"
          hint="Required. What you don't work with, and what makes you refer someone to a licensed professional."
        >
          <textarea value={p.limits} onChange={(e) => setP({ ...p, limits: e.target.value })} />
        </Field>

        <div className="row">
          <button
            className="btn solid"
            disabled={!p.handle.trim() || !p.limits.trim()}
            onClick={() => {
              store.setMentorProfile(p);
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            }}
          >
            Save draft profile
          </button>
          {saved && <span className="small" style={{ color: "var(--moss)" }}>Saved locally.</span>}
        </div>
      </Panel>

      <Panel title="What being a mentor here means">
        <ul className="small soft" style={{ paddingLeft: "1.1rem" }}>
          <li style={{ marginBottom: ".5rem" }}>You are a peer with more road behind you. Not a therapist, not a doctor, not an authority on anyone&apos;s life but your own.</li>
          <li style={{ marginBottom: ".5rem" }}>You state your limits publicly and you honour them.</li>
          <li style={{ marginBottom: ".5rem" }}>You refer out — to clinicians, to crisis services — without hesitation and without framing it as a failure.</li>
          <li style={{ marginBottom: ".5rem" }}>You do not claim certainty about someone&apos;s guidance, their future, or their purpose.</li>
          <li style={{ marginBottom: ".5rem" }}>You do not create dependence. A mentor whose people never graduate is running something else.</li>
          <li>You never push urgency or escalating payment. Both are the oldest tells there are.</li>
        </ul>
      </Panel>
    </>
  );
}

function FieldNotes({ store, notes }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState("");

  function save() {
    store.addEntry({
      title: title.trim() || "Field note",
      body: `${body.trim()}\n\nWhat came of it: ${result.trim() || "—"}`,
      tags: ["field-note"],
    });
    setTitle("");
    setBody("");
    setResult("");
  }

  return (
    <>
      <Panel tone="violet" title="Write a field note">
        <p className="soft">
          The strategy, the hack, the practice — and, critically, what actually happened afterwards. The
          results half is the part almost nobody writes down, and it&apos;s the only part worth reading.
        </p>
        <Field label="What you tried">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Four minutes of cold before every difficult call" />
        </Field>
        <Field label="How you did it" hint="Enough detail that a stranger could reproduce it.">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} />
        </Field>
        <Field label="What came of it" hint="Including if the answer is 'nothing'. Null results are the most useful notes in any log.">
          <textarea value={result} onChange={(e) => setResult(e.target.value)} />
        </Field>
        <button className="btn solid" onClick={save} disabled={!body.trim()}>
          Save the note
        </button>
        <div className="field-hint">
          Saved to your journal, tagged as a field note. Export from Settings to share it anywhere.
        </div>
      </Panel>

      {notes.length === 0 ? (
        <Empty glyph="❋">No field notes yet.</Empty>
      ) : (
        notes.map((n) => (
          <div key={n.id} className="entry">
            <div className="entry-meta">
              <span>{prettyDate(n.dayKey)}</span>
              <span className="chip static violet">Field note</span>
            </div>
            <h3 style={{ marginBottom: ".4rem" }}>{n.title}</h3>
            <div className="entry-body">{n.body}</div>
          </div>
        ))
      )}
    </>
  );
}

function Terms() {
  return (
    <Panel title="How the Council works">
      <ul className="soft small" style={{ paddingLeft: "1.1rem" }}>
        {COUNCIL_TERMS.map((t, i) => (
          <li key={i} style={{ marginBottom: ".6rem" }}>
            {t}
          </li>
        ))}
      </ul>
      <div className="note grave">
        <strong>The oldest warning in this field.</strong> Walk away from anyone who tells you what your
        guidance means, puts themselves between you and your own discernment, discourages you from talking to
        friends or professionals, or whose fees rise with your dependence. Your connection is yours.
      </div>
      <div className="note calm">
        <strong>Peer support is not crisis care.</strong> US &amp; Canada 988 · UK &amp; Ireland 116 123 ·
        elsewhere, your local emergency number or findahelpline.com.
      </div>
    </Panel>
  );
}
