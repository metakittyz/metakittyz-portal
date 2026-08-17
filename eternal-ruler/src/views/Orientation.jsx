import React from "react";
import { STAGES, TOTAL_DAYS } from "../data/path.js";

// WELCOME TO THE WORLD OF SPIRIT.
//
// The screen between the Overture and making an account. It answers the four
// questions someone actually has before they hand over a name: what is this,
// what is it for, what will it ask of me, and how is it laid out.
//
// The honest bits are not buried at the bottom. Somebody deciding whether to
// start deserves the awkward paragraph at the same moment as the invitation.

export function Orientation({ onNext }) {
  return (
    <div className="rise orient">
      <div className="sigil small">✧</div>
      <h1 className="center orient-h1">Welcome to the world of spirit</h1>
      <p className="creed center">You have been in it the whole time. Now you get the instrument.</p>

      <section className="orient-block">
        <h2 className="orient-h2">What this is for</h2>
        <p className="soft">
          One purpose: to open the line between you and your higher self, and then make that line strong
          enough to run a life on. Not a feeling you chase on good days — a working connection you can
          reach for on the worst one.
        </p>
        <p className="soft">
          Everything here serves that. The readings measure the line. The journal records what came down
          it. The body work keeps the receiver clean. The rest is scaffolding.
        </p>
      </section>

      <section className="orient-block">
        <h2 className="orient-h2">What to expect</h2>
        <ul className="orient-list">
          <li>
            <b>One step a day, {TOTAL_DAYS} days.</b> Ten to twenty minutes. Never two steps at once — the
            app will not let you rush it.
          </li>
          <li>
            <b>Nothing will happen for a while.</b> That is the normal beginning, not a sign you can't do
            this. Most people hear nothing for the first week and the ones who continue anyway are the ones
            it works for.
          </li>
          <li>
            <b>Some days go somewhere uncomfortable.</b> The middle of this asks what you avoid, and means
            it. You can lower the intensity in Settings at any time, and skipping a day costs you nothing.
          </li>
          <li>
            <b>Your position never expires.</b> Progress moves when you move, not with the calendar. Come
            back after a month and you resume on the exact step you left.
          </li>
          <li>
            <b>It stays on this device.</b> No account server, no sync, nothing uploaded. That is privacy
            and it is also fragility — export from Settings regularly.
          </li>
        </ul>
      </section>

      <section className="orient-block">
        <h2 className="orient-h2">How it's laid out</h2>
        <p className="soft">
          Think of it as a course rather than an app — closer to a music appreciation class than a habit
          tracker. Six themes, seven days each. You learn the <b>notes</b> of the realm of spirit, then the{" "}
          <b>melodies</b> of spirit guidance, and finally the <b>composition and orchestration</b> of
          six-sensory, divinely guided, creative living.
        </p>

        <div className="orient-arc">
          {STAGES.map((s) => (
            <div key={s.id} className="orient-stage">
              <span className="orient-stage-glyph">{s.glyph}</span>
              <div>
                <div className="orient-stage-head">
                  <span className="orient-stage-n">{s.n}</span>
                  <b>{s.name}</b>
                  <span className="orient-stage-days">
                    days {s.days[0]}–{s.days[1]}
                  </span>
                </div>
                <p className="orient-stage-teaches">{s.teaches}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="soft small">
          The order is not decoration. You cannot tune an instrument you haven't picked up, and you cannot
          hear a melody through a receiver full of static. Each theme is built on the one under it, and the
          rooms of the app unlock as you reach the point where they'd actually help.
        </p>
      </section>

      <section className="orient-block orient-plain">
        <h2 className="orient-h2">Before you start</h2>
        <p className="small">
          This is a self-experiment, not treatment. It is not therapy, medical advice, or crisis support,
          and it does not replace any of them. It is for adults. Practices like these can genuinely shift
          how reality looks to you, which is the point and also the risk — if you are in a fragile stretch,
          the kind thing is to wait.
        </p>
        <p className="small" style={{ marginBottom: 0 }}>
          You'll be asked to agree to all of that properly in a moment. Your life, your choices.
        </p>
      </section>

      <p className="center soft orient-close">
        Let yourself be guided and you enter the flow of the thing. That is where the magic of this
        universe stops being a phrase and starts being a Tuesday.
      </p>

      <button className="btn primary lg block" onClick={onNext}>
        I'm ready
      </button>
    </div>
  );
}
