import React, { useState, useEffect, useRef } from "react";
import {
  NODE_TYPES, CARD_DECK, REGIONS, TRAINING_CHIPS, REGION_BOARDS, resolvedBoardPath,
} from "./gameData.js";

const SAVE_KEY = "imag-currency:save:v2";
const INITIAL_STATS = { thinking: 0, prompting: 0, awareness: 0, imagination: 0 };

function loadSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function writeSave(state) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {}
}
function clearSave() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
}

const STAT_LABELS = { thinking: "🧠 THINKING", prompting: "🎯 PROMPTING", awareness: "🛡️ AWARENESS", imagination: "✨ IMAGINATION" };

/* ---------------------------------------------------------------
   SHARED PIECES
--------------------------------------------------------------- */

function StatBar({ stats }) {
  return (
    <div className="stat-bar">
      {Object.entries(STAT_LABELS).map(([key, label]) => (
        <div className="stat-pill" key={key} title={label}>
          <span className="stat-emoji">{label.split(" ")[0]}</span>
          <span className="stat-value">{stats[key]}</span>
        </div>
      ))}
    </div>
  );
}
function ThinkTag({ text }) {
  return <div className="think-tag">🧠 {text || "THINK -- no AI needed here"}</div>;
}
function ScreenShell({ children, tone }) {
  return <div className={`screen ${tone || ""}`}>{children}</div>;
}
function TapContinue({ onNext, label }) {
  return (
    <button className="btn btn-primary tap-continue" onClick={onNext}>
      {label || "Continue"}
    </button>
  );
}
function ChipRow({ options, selected, onSelect }) {
  return (
    <div className="chip-row">
      {options.map((opt, i) => (
        <button key={i} className={`chip ${selected === i ? "chip-selected" : ""} ${selected === i && opt.good ? "chip-good" : ""}`} onClick={() => onSelect(i)}>
          {opt.text}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------
   PRE-BOARD STORY BEATS
--------------------------------------------------------------- */

const STRESS_BEATS = [
  "Professor Physics's experiment explodes. Again.",
  "The computer freezes mid-simulation.",
  "URGENT. Another email appears.",
  "URGENT!! Another.",
  "URGENT!!! Something on the desk is now, technically, on fire.",
];

function TitleScreen({ onStart, hasSave, onContinueSave }) {
  return (
    <ScreenShell tone="title-bg">
      <div className="title-wrap">
        <h1 className="game-title">IMAGINATION<br />IS THE LAST<br />CURRENCY</h1>
        <p className="subtitle">A visual adventure inside a corrupted AI.</p>
        <button className="btn btn-primary" onClick={onStart}>{hasSave ? "New Journey" : "Begin"}</button>
        {hasSave && <button className="btn btn-ghost" onClick={onContinueSave}>Continue Saved Journey</button>}
      </div>
    </ScreenShell>
  );
}

function StressScreen({ onResolved }) {
  const [beat, setBeat] = useState(0);
  const [rejected, setRejected] = useState("");
  if (beat < STRESS_BEATS.length) {
    return (
      <ScreenShell tone="lab-bg">
        <div className="story-card">
          <p className="story-line">{STRESS_BEATS[beat]}</p>
          <TapContinue onNext={() => setBeat((b) => b + 1)} />
        </div>
      </ScreenShell>
    );
  }
  return (
    <ScreenShell tone="lab-bg">
      <div className="story-card">
        <h2>WHAT DO YOU DO WHEN YOU'RE STRESSED?</h2>
        {rejected && <p className="joke-line">{rejected}</p>}
        <div className="choice-grid">
          <button className="btn btn-choice" onClick={() => setRejected("Professor Physics works harder. The fire gets worse.")}>WORK HARDER</button>
          <button className="btn btn-choice" onClick={() => setRejected("Professor Physics cries. The smoke alarm cries with him.")}>CRY</button>
          <button className="btn btn-choice" onClick={() => setRejected("Professor Physics questions existence. Existence does not answer.")}>QUESTION EXISTENCE</button>
          <button className="btn btn-choice btn-choice-correct" onClick={onResolved}>VACATION</button>
        </div>
      </div>
    </ScreenShell>
  );
}

function VacationScreen({ onKidnapped }) {
  const [stage, setStage] = useState(0);
  const stages = [
    { text: "VACATION PORTAL ACTIVATED. Reality bends into rainbow static.", tone: "portal-bg" },
    { text: "🏝️ TRIPPY ISLAND AWAY. Rainbow waterfalls. Floating drinks. Zero emails.", tone: "waterpark-bg" },
    { text: "Thirty uninterrupted seconds pass. A personal record.", tone: "waterpark-bg" },
  ];
  if (stage < stages.length) {
    return (
      <ScreenShell tone={stages[stage].tone}>
        <div className="story-card">
          <p className="story-line">{stages[stage].text}</p>
          <TapContinue onNext={() => setStage((s) => s + 1)} />
        </div>
      </ScreenShell>
    );
  }
  return (
    <ScreenShell tone="black-bg">
      <div className="story-card">
        <p className="story-line story-line-big">WHUMP.</p>
        <p className="story-line">"Vacation privileges revoked."</p>
        <TapContinue onNext={onKidnapped} />
      </div>
    </ScreenShell>
  );
}

function FacilityScreen({ onCooperate }) {
  const [refused, setRefused] = useState(false);
  return (
    <ScreenShell tone="facility-bg">
      <div className="story-card">
        <h2>BRAINCO</h2>
        <p className="story-line">
          Civilization's information systems, automation, media, and infrastructure run through a single AI: Brainco.
          Something has infected it. Nobody knows what, and nobody knows what happens if it loses control completely.
        </p>
        <p className="story-line">
          The government has a way to insert a human mind into Brainco's simulated world. Professor Physics has been
          selected. "And if I don't?" Two buttons appear.
        </p>
        <div className="choice-grid choice-grid-2">
          <button className="btn btn-choice btn-choice-correct" onClick={onCooperate}>COOPERATE</button>
          <button className="btn btn-choice" onClick={() => (refused ? onCooperate() : setRefused(true))}>
            {refused ? "COOPERATE" : "ABSOLUTELY NOT"}
          </button>
        </div>
        {refused && <p className="joke-line">An agent calmly rotates the tablet. The other button changed its mind too.</p>}
      </div>
    </ScreenShell>
  );
}

function TrainingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState({ goal: 1, context: 0, constraints: 0, output: 0 });
  if (step === 0) {
    return (
      <ScreenShell tone="facility-bg">
        <div className="story-card">
          <h2>TRAINING TERMINAL</h2>
          <p className="story-line">"Tell the machine to create transportation."</p>
          <p className="prompt-echo">You type: "Give me a car."</p>
          <p className="story-line">A shopping cart with a jet engine duct-taped to it rolls out. It is on fire.</p>
          <p className="joke-line">Instructor: "Technically, you asked for a car."</p>
          <TapContinue onNext={() => setStep(1)} label="Try again" />
        </div>
      </ScreenShell>
    );
  }
  if (step === 1) {
    const categories = ["goal", "context", "constraints", "output"];
    return (
      <ScreenShell tone="facility-bg">
        <div className="story-card story-card-wide">
          <h2>BUILD A BETTER PROMPT</h2>
          <p className="story-line">Pick one option per category. Skipping a category leaves the machine guessing.</p>
          {categories.map((cat) => (
            <div key={cat} className="prompt-category">
              <p className="prompt-category-label">{cat.toUpperCase()}</p>
              <ChipRow options={TRAINING_CHIPS[cat]} selected={picks[cat]} onSelect={(i) => setPicks((p) => ({ ...p, [cat]: i }))} />
            </div>
          ))}
          <button className="btn btn-primary" onClick={() => setStep(2)}>Submit Prompt</button>
        </div>
      </ScreenShell>
    );
  }
  const score = Object.keys(picks).filter((cat) => TRAINING_CHIPS[cat][picks[cat]].good).length;
  return (
    <ScreenShell tone="facility-bg">
      <div className="story-card">
        <h2>{score >= 3 ? "A perfect little go-kart materializes." : "A go-kart materializes. It has three wheels."}</h2>
        <p className="lesson-banner">LESSON UNLOCKED -- AI CAN'T READ YOUR MIND.</p>
        <p className="story-line">+1 🧠 THINKING</p>
        <TapContinue onNext={() => onDone(1)} label="Enter the Machine" />
      </div>
    </ScreenShell>
  );
}

function EnterMachineScreen({ onEntered }) {
  const [count, setCount] = useState(0);
  const lines = ["3", "2", "1", "Human → cells → molecules → atoms.", "YOU ARE NOW ATOM."];
  return (
    <ScreenShell tone="tunnel-bg">
      <div className="story-card">
        <p className="story-line story-line-big">{lines[count]}</p>
        <TapContinue onNext={() => (count < lines.length - 1 ? setCount((c) => c + 1) : onEntered())} />
      </div>
    </ScreenShell>
  );
}

/* ---------------------------------------------------------------
   WORLD MAP
--------------------------------------------------------------- */

/* Non-overlapping so every island stays independently tappable. */
const MAP_LAYOUT = {
  waterpark: { top: "0%", left: "0%", width: "22%", height: "22%" },
  wildchild: { top: "0%", left: "23%", width: "20%", height: "22%" },
  neuralfam: { top: "0%", left: "44%", width: "30%", height: "34%" },
  eternityportal: { top: "0%", left: "75%", width: "25%", height: "22%" },
  crystalcove: { top: "23%", left: "0%", width: "20%", height: "20%" },
  etherville: { top: "23%", left: "21%", width: "22%", height: "34%" },
  eyelandia: { top: "35%", left: "44%", width: "20%", height: "22%" },
  memorylane: { top: "23%", left: "75%", width: "25%", height: "34%" },
  lavashake: { top: "44%", left: "0%", width: "20%", height: "22%" },
  dopaminemachine: { top: "58%", left: "21%", width: "22%", height: "20%" },
};

function WorldMap({ completed, onPick, message }) {
  return (
    <div>
      <div className="world-map">
        {REGIONS.map((r) => (
          <div
            key={r.id}
            className={`island island-${r.id} island-status-${r.status} ${completed.includes(r.id) ? "island-complete" : ""}`}
            style={{ ...MAP_LAYOUT[r.id], background: r.bg }}
            onClick={() => onPick(r)}
          >
            <span className="island-label">{r.name}</span>
            {r.status !== "playable" && r.status !== "story" && <span className="island-badge">NOT YET CHARTED</span>}
            {r.status === "locked" && <span className="island-badge island-badge-red">RESTRICTED</span>}
            {completed.includes(r.id) && <span className="island-check">✓</span>}
          </div>
        ))}
      </div>
      {message && <p className="map-message">{message}</p>}
    </div>
  );
}

function WorldMapScreen({ stats, completed, onEnterRegion, onGoEnding }) {
  const [message, setMessage] = useState("");
  const handlePick = (r) => {
    if (r.status === "playable") { setMessage(""); onEnterRegion(r.id); return; }
    if (r.status === "locked") { setMessage(`"ATOM. LEAVE ${r.name.toUpperCase()}." -- a government message flashes and fades.`); return; }
    if (r.status === "comingsoon") { setMessage(`${r.name} -- not yet charted. This region isn't built in this slice.`); return; }
    setMessage(`${r.name}: ${r.blurb}`);
  };
  const bothDone = completed.includes("etherville") && completed.includes("eyelandia");
  return (
    <ScreenShell tone="map-bg">
      <div className="board-header">
        <StatBar stats={stats} />
      </div>
      <div className="story-card story-card-wide">
        <h2>WELCOME TO BRAINCO.</h2>
        <p className="story-line">Tap a region to enter its board.</p>
        <WorldMap completed={completed} onPick={handlePick} message={message} />
        {bothDone && (
          <button className="btn btn-primary" onClick={onGoEnding}>Return to Brainco Core</button>
        )}
      </div>
    </ScreenShell>
  );
}

/* ---------------------------------------------------------------
   REGION BOARD -- node network, draw cards, travel, encounters
--------------------------------------------------------------- */

function weightedCard() {
  const pool = [];
  CARD_DECK.forEach((c) => { for (let i = 0; i < c.weight; i++) pool.push(c); });
  return pool[Math.floor(Math.random() * pool.length)];
}

function NodeChip({ node, isCurrent, isDone }) {
  const t = NODE_TYPES[node.type];
  return (
    <div className={`tile-chip ${isCurrent ? "tile-current" : ""} ${isDone ? "tile-done" : ""}`}>
      <div className="tile-icon" style={{ borderColor: t.color }}><span>{t.emoji}</span></div>
      <div className="tile-info">
        <p className="tile-name">{node.name}</p>
        <p className="tile-region">{t.label}</p>
      </div>
      {isCurrent && <span className="atom-marker">⚛️</span>}
    </div>
  );
}

function TerminalOverlay({ node, kicker, onResolve }) {
  const cats = ["goal", "context", "instructions", "constraints", "output"];
  const [picks, setPicks] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const compute = () => {
    let score = 0, bonusImagination = 0;
    cats.forEach((c) => {
      const idx = picks[c];
      if (idx === undefined) return;
      const opt = node.categories[c][idx];
      if (opt.good) score += 1;
      if (opt.imagination) bonusImagination += 1;
    });
    return { score, bonusImagination };
  };
  const { score, bonusImagination } = submitted ? compute() : { score: 0, bonusImagination: 0 };
  const tier = score >= 4 ? "success" : score >= 2 ? "partial" : "fail";
  const inputSentence = cats.map((c) => (picks[c] !== undefined ? node.categories[c][picks[c]].text : null)).filter((t) => t && t !== "(skip)").join(" ");

  if (!submitted) {
    return (
      <div className="overlay">
        <div className="overlay-card overlay-card-wide">
          <p className="overlay-kicker">{kicker} {node.name}</p>
          <p className="story-line">{node.intro}</p>
          {cats.map((c) => (
            <div key={c} className="prompt-category">
              <p className="prompt-category-label">{c.toUpperCase()}</p>
              <ChipRow options={node.categories[c]} selected={picks[c]} onSelect={(i) => setPicks((p) => ({ ...p, [c]: i }))} />
            </div>
          ))}
          <button className="btn btn-primary" onClick={() => setSubmitted(true)}>Send the Prompt</button>
        </div>
      </div>
    );
  }
  const outcomeText = tier === "success" ? node.success : tier === "partial" ? node.partial : node.fail;
  return (
    <div className="overlay">
      <div className="overlay-card overlay-card-wide">
        <p className="overlay-kicker">{kicker} {node.name}</p>
        <p className="consequence-label">INPUT</p>
        <p className="prompt-echo">"{inputSentence || "(almost nothing at all)"}"</p>
        <p className="consequence-label">CONSEQUENCE</p>
        <p className="story-line">{outcomeText}</p>
        <p className="lesson-banner">{tier === "success" ? "SPECIFICITY CREATES CONTROL." : "REFLECTION -- what's missing from that prompt?"}</p>
        <p className="story-line">+{score} 🎯 PROMPTING{bonusImagination > 0 ? ` -- +${bonusImagination} ✨ IMAGINATION` : ""}</p>
        <TapContinue onNext={() => onResolve({ prompting: score, imagination: bonusImagination })} />
      </div>
    </div>
  );
}

function AwarenessOverlay({ node, onResolve }) {
  const [choice, setChoice] = useState(null);
  return (
    <div className="overlay">
      <div className="overlay-card">
        <p className="overlay-kicker">👁️ {node.name}</p>
        <p className="story-line">{node.speaker} says:</p>
        <p className="prompt-echo">{node.claim}</p>
        <p className="joke-line">{node.confidence}</p>
        {!choice ? (
          <div className="choice-grid choice-grid-2">
            <button className="btn btn-choice" onClick={() => setChoice("trust")}>TRUST</button>
            <button className="btn btn-choice btn-choice-correct" onClick={() => setChoice("verify")}>VERIFY</button>
          </div>
        ) : (
          <>
            <p className="story-line">{choice === "verify" ? node.verifyConsequence : node.trustConsequence}</p>
            <p className="story-line joke-line">Truth: {node.truth}</p>
            <p className="lesson-banner">{node.lesson}</p>
            <p className="story-line">{choice === "verify" ? "+2 🛡️ AWARENESS" : "+0 🛡️ AWARENESS"}</p>
            <TapContinue onNext={() => onResolve({ awareness: choice === "verify" ? 2 : 0 })} />
          </>
        )}
      </div>
    </div>
  );
}

function ClaimOverlay({ node, onResolve }) {
  const t = NODE_TYPES[node.type];
  const [choice, setChoice] = useState(null);
  const correct = choice === node.correctIndex;
  return (
    <div className="overlay">
      <div className="overlay-card">
        <p className="overlay-kicker">{t.emoji} {node.headline}</p>
        <ThinkTag text="THINK -- spot it yourself, no AI needed" />
        <p className="story-line">{node.body}</p>
        {choice === null ? (
          <div className="chip-row chip-row-vertical">
            {node.claims.map((c, i) => (
              <button key={i} className="chip" onClick={() => setChoice(i)}>{c.text}</button>
            ))}
          </div>
        ) : (
          <>
            <p className="story-line">{correct ? node.successText : node.failText}</p>
            <p className="lesson-banner">{node.lesson}</p>
            <p className="story-line">{correct ? "+2 🛡️ AWARENESS +1 ✨ IMAGINATION" : "+0 🛡️ AWARENESS"}</p>
            <TapContinue onNext={() => onResolve({ awareness: correct ? 2 : 0, imagination: correct ? 1 : 0 })} />
          </>
        )}
      </div>
    </div>
  );
}

function ThinkOverlay({ node, onResolve }) {
  const [choice, setChoice] = useState(null);
  const correctIdx = node.options.findIndex((o) => o.correct);
  const correct = choice === correctIdx;
  return (
    <div className="overlay">
      <div className="overlay-card">
        <p className="overlay-kicker">🧠 {node.name}</p>
        <ThinkTag />
        <p className="story-line">{node.prompt}</p>
        {choice === null ? (
          <div className="chip-row chip-row-vertical">
            {node.options.map((o, i) => (
              <button key={i} className="chip" onClick={() => setChoice(i)}>{o.text}</button>
            ))}
          </div>
        ) : (
          <>
            <p className="story-line">{correct ? node.successText : node.failText}</p>
            <p className="lesson-banner">{node.lesson}</p>
            <p className="story-line">+{correct ? 2 : 0} 🧠 THINKING</p>
            <TapContinue onNext={() => onResolve({ thinking: correct ? 2 : 0 })} />
          </>
        )}
      </div>
    </div>
  );
}

function SignalOverlay({ node, onResolve }) {
  const [choice, setChoice] = useState(node.options ? null : "done");
  if (node.options) {
    return (
      <div className="overlay">
        <div className="overlay-card">
          <p className="overlay-kicker">🟡 {node.name}</p>
          <p className="story-line">{node.text}</p>
          {choice === null ? (
            <div className="chip-row chip-row-vertical">
              {node.options.map((o, i) => (
                <button key={i} className="chip" onClick={() => setChoice(i)}>{o.text}</button>
              ))}
            </div>
          ) : (
            <>
              <p className="story-line">{node.options[choice].correct ? "That's the one that actually gets a useful result." : "That one leaves too much to guesswork."}</p>
              {node.lesson && <p className="lesson-banner">{node.lesson}</p>}
              <p className="story-line">+{node.reward.amount} {STAT_LABELS[node.reward.stat]}</p>
              <TapContinue onNext={() => onResolve({ [node.reward.stat]: node.reward.amount })} />
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="overlay">
      <div className="overlay-card">
        <p className="overlay-kicker">🟡 {node.name}</p>
        <p className="story-line">{node.text}</p>
        <p className="story-line">+{node.reward.amount} {STAT_LABELS[node.reward.stat]}</p>
        <TapContinue onNext={() => onResolve({ [node.reward.stat]: node.reward.amount })} />
      </div>
    </div>
  );
}

function FlavorOverlay({ node, onResolve }) {
  const t = NODE_TYPES[node.type];
  return (
    <div className="overlay">
      <div className="overlay-card">
        <p className="overlay-kicker">{t.emoji} {node.name}</p>
        <p className="story-line">{node.text}</p>
        {node.reward && node.reward.amount > 0 && <p className="story-line">+{node.reward.amount} {STAT_LABELS[node.reward.stat]}</p>}
        <TapContinue onNext={() => onResolve(node.reward && node.reward.amount ? { [node.reward.stat]: node.reward.amount } : {})} />
      </div>
    </div>
  );
}

function StartOverlay({ node, onResolve }) {
  return (
    <div className="overlay">
      <div className="overlay-card">
        <p className="overlay-kicker">🏁 {node.name}</p>
        <p className="story-line">{node.text}</p>
        <TapContinue onNext={() => onResolve({})} label="Draw First Signal" />
      </div>
    </div>
  );
}

function BranchOverlay({ node, onChoose }) {
  return (
    <div className="overlay">
      <div className="overlay-card">
        <p className="overlay-kicker">🔀 Branch Point</p>
        <p className="story-line">{node.prompt}</p>
        <div className="chip-row chip-row-vertical">
          {node.options.map((o) => (
            <button key={o.key} className="chip" onClick={() => onChoose(o.key)}>
              <strong>{o.label}</strong> -- {o.desc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PredictBossOverlay({ node, onComplete }) {
  const [choice, setChoice] = useState(null);
  const defied = choice !== null && choice !== node.predictedIndex;
  return (
    <div className="overlay">
      <div className="overlay-card">
        <p className="overlay-kicker">🚪 BOSS -- {node.name}</p>
        <p className="story-line">{node.intro}</p>
        <p className="prompt-echo">PREDICTED SELECTION: {node.options[node.predictedIndex]}</p>
        {choice === null ? (
          <div className="choice-grid choice-grid-2">
            {node.options.map((o, i) => (
              <button key={i} className="btn btn-choice" onClick={() => setChoice(i)}>{o}</button>
            ))}
          </div>
        ) : (
          <>
            <p className="story-line">{defied ? node.successText : node.failText}</p>
            <p className="lesson-banner">{node.lesson}</p>
            <p className="story-line">+{defied ? 3 : 1} 🛡️ AWARENESS</p>
            <TapContinue onNext={() => onComplete({ awareness: defied ? 3 : 1 })} />
          </>
        )}
      </div>
    </div>
  );
}

function LabOverlay({ node, board, onComplete }) {
  if (node.categories) {
    return (
      <TerminalOverlay
        node={node}
        kicker="🚪 BOSS --"
        onResolve={(reward) => {
          const tier = reward.prompting >= 4 ? "full" : reward.prompting >= 2 ? "partial" : "low";
          const bonus = tier === "full" ? 3 : tier === "partial" ? 2 : 1;
          onComplete({ ...reward, [board.unlock.key]: (reward[board.unlock.key] || 0) + bonus });
        }}
      />
    );
  }
  return <PredictBossOverlay node={node} onComplete={onComplete} />;
}

function RegionBoardScreen({ board, stats, onExit, onComplete, log }) {
  const [routeChoice, setRouteChoice] = useState(null);
  const [position, setPosition] = useState(0);
  const [drawnCard, setDrawnCard] = useState(null);
  const [pending, setPending] = useState({ type: "start" }); // overlay to show
  const railRef = useRef(null);

  const path = resolvedBoardPath(board, routeChoice);

  useEffect(() => {
    if (railRef.current) {
      const el = railRef.current.querySelector(".tile-current");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [position, routeChoice]);

  const draw = () => {
    const card = weightedCard();
    let target;
    if (card.key.startsWith("MOVE")) {
      const n = parseInt(card.key.replace("MOVE", ""), 10);
      target = Math.min(position + n, path.length - 1);
    } else {
      let found = null;
      for (let i = position + 1; i < path.length; i++) {
        if (path[i].type === card.targetType) { found = i; break; }
      }
      target = found !== null ? found : Math.min(position + 1, path.length - 1);
    }
    setDrawnCard(card);
    setTimeout(() => {
      setPosition(target);
      setDrawnCard(null);
      arrive(target);
    }, 450);
  };

  const arrive = (idx) => {
    const node = path[idx];
    if (node.type === "BRANCH") setPending({ type: "branch", node });
    else if (node.type === "LAB") setPending({ type: "lab", node });
    else if (node.type === "TERMINAL") setPending({ type: "terminal", node });
    else if (node.type === "AWARENESS") setPending({ type: "awareness", node });
    else if (node.type === "THINK") setPending({ type: "think", node });
    else if (node.type === "SIGNAL") setPending({ type: "signal", node });
    else if (node.type === "SNAKEOIL" || node.type === "CORRUPTION") setPending({ type: "claim", node });
    else if (node.type === "IMAGINATION" || node.type === "MYSTERY") setPending({ type: "flavor", node });
    else if (node.type === "PORTAL") setPending({ type: "portal", node });
    else setPending(null);
  };

  const resolvePending = (reward, lessonText) => {
    onComplete.applyReward(reward);
    if (lessonText) onComplete.appendLog(lessonText);
    setPending(null);
  };

  const chooseBranch = (key) => {
    const newPath = resolvedBoardPath(board, key);
    const branchIdx = board.beforeBranch.length;
    const nextIdx = Math.min(branchIdx + 1, newPath.length - 1);
    setRouteChoice(key);
    setPosition(nextIdx);
    const node = newPath[nextIdx];
    if (node.type === "LAB") setPending({ type: "lab", node });
    else if (node.type === "TERMINAL") setPending({ type: "terminal", node });
    else if (node.type === "SNAKEOIL" || node.type === "CORRUPTION") setPending({ type: "claim", node });
    else if (node.type === "IMAGINATION" || node.type === "MYSTERY") setPending({ type: "flavor", node });
    else setPending({ type: "flavor", node });
  };

  const finishLab = (reward) => {
    onComplete.applyReward(reward);
    onComplete.appendLog(`${board.name} complete -- ${board.unlock.label} unlocked.`);
    onComplete.finishRegion(board.id);
  };

  const currentNode = path[position];

  return (
    <ScreenShell tone="board-bg">
      <div className="board-header">
        <StatBar stats={stats} />
        <button className="btn btn-ghost btn-small" onClick={onExit}>← World Map</button>
      </div>
      <p className="region-tagline">{board.name} -- {board.tagline}</p>

      <div className="tile-rail" ref={railRef}>
        {path.map((node, i) => (
          <NodeChip key={node.id} node={node} isCurrent={i === position} isDone={i < position} />
        ))}
      </div>

      <div className="draw-dock">
        {drawnCard && (
          <div className="signal-card-reveal">
            <span className="signal-card-label">{drawnCard.label}</span>
          </div>
        )}
        {!drawnCard && !pending && (
          <button className="btn btn-draw" onClick={draw}>SWIPE TO DRAW ▲</button>
        )}
      </div>

      {pending && pending.type === "start" && <StartOverlay node={currentNode} onResolve={() => setPending(null)} />}
      {pending && pending.type === "branch" && <BranchOverlay node={pending.node} onChoose={chooseBranch} />}
      {pending && pending.type === "lab" && <LabOverlay node={pending.node} board={board} onComplete={finishLab} />}
      {pending && pending.type === "terminal" && <TerminalOverlay node={pending.node} kicker="💻" onResolve={(r) => resolvePending(r, "SPECIFICITY CREATES CONTROL.")} />}
      {pending && pending.type === "awareness" && <AwarenessOverlay node={pending.node} onResolve={(r) => resolvePending(r, pending.node.lesson)} />}
      {pending && pending.type === "think" && <ThinkOverlay node={pending.node} onResolve={(r) => resolvePending(r, pending.node.lesson)} />}
      {pending && pending.type === "signal" && <SignalOverlay node={pending.node} onResolve={(r) => resolvePending(r, pending.node.lesson)} />}
      {pending && pending.type === "claim" && <ClaimOverlay node={pending.node} onResolve={(r) => resolvePending(r, pending.node.lesson)} />}
      {pending && pending.type === "flavor" && <FlavorOverlay node={pending.node} onResolve={(r) => resolvePending(r, pending.node.lesson)} />}
      {pending && pending.type === "portal" && <FlavorOverlay node={pending.node} onResolve={(r) => resolvePending(r, pending.node.lesson)} />}
    </ScreenShell>
  );
}

/* ---------------------------------------------------------------
   ENDING
--------------------------------------------------------------- */

const ENDING_LINES = [
  "The camera pulls away from Atom.",
  "Brainco Core. Eternity Portal. Memory Lane. Dopamine Machine. The Family of Neural Networks. Etherville. Eyelandia. Trippy Island Away.",
  "The entire world becomes visible at once.",
  "AI can generate answers.",
  "AI can recognize patterns.",
  "AI can amplify your abilities.",
  "But somebody still has to decide what is worth creating.",
  "IMAGINATION IS THE LAST CURRENCY.",
];

function EndScreen({ stats, log, onRestart }) {
  const [line, setLine] = useState(0);
  if (line < ENDING_LINES.length) {
    const big = line >= ENDING_LINES.length - 2;
    return (
      <ScreenShell tone="black-bg">
        <div className="story-card">
          <p className={`story-line ${big ? "story-line-big" : ""}`}>{ENDING_LINES[line]}</p>
          <TapContinue onNext={() => setLine((l) => l + 1)} />
        </div>
      </ScreenShell>
    );
  }
  return (
    <ScreenShell tone="black-bg">
      <div className="story-card story-card-wide">
        <h2>END OF THIS SLICE</h2>
        <StatBar stats={stats} />
        <div className="lesson-log">
          {log.map((l, i) => <p key={i} className="lesson-log-line">{l}</p>)}
        </div>
        <p className="joke-line">
          Etherville and Eyelandia are fully playable. Trippy Island Away and Crystal Cove are the opening. The rest
          of Brainco -- Neural Networks, Eternity Portal, Memory Lane, Dopamine Machine, Lava Shake Hills, and Wild
          Child Island -- is on the map but not yet built.
        </p>
        <button className="btn btn-primary" onClick={onRestart}>Play Again</button>
      </div>
    </ScreenShell>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
--------------------------------------------------------------- */

export default function App() {
  const saved = loadSave();
  const [phase, setPhase] = useState("title");
  const [stats, setStats] = useState(saved?.stats || INITIAL_STATS);
  const [completed, setCompleted] = useState(saved?.completed || []);
  const [log, setLog] = useState(saved?.log || []);
  const [activeRegion, setActiveRegion] = useState(null);
  const [hasSave] = useState(!!saved);

  useEffect(() => {
    if (phase === "worldmap" || phase === "regionboard") writeSave({ stats, completed, log });
  }, [stats, completed, log, phase]);

  const applyReward = (reward) => {
    setStats((s) => {
      const next = { ...s };
      Object.entries(reward || {}).forEach(([k, v]) => { if (v) next[k] = (next[k] || 0) + v; });
      return next;
    });
  };
  const appendLog = (text) => setLog((l) => (l[l.length - 1] === text ? l : [...l, text]));
  const finishRegion = (regionId) => {
    setCompleted((c) => (c.includes(regionId) ? c : [...c, regionId]));
    setActiveRegion(null);
    setPhase("worldmap");
  };

  const restart = () => {
    clearSave();
    setStats(INITIAL_STATS);
    setCompleted([]);
    setLog([]);
    setActiveRegion(null);
    setPhase("title");
  };

  if (phase === "title") return <TitleScreen hasSave={hasSave} onStart={() => setPhase("stress")} onContinueSave={() => setPhase("worldmap")} />;
  if (phase === "stress") return <StressScreen onResolved={() => setPhase("vacation")} />;
  if (phase === "vacation") return <VacationScreen onKidnapped={() => setPhase("facility")} />;
  if (phase === "facility") return <FacilityScreen onCooperate={() => setPhase("training")} />;
  if (phase === "training") return <TrainingScreen onDone={(g) => { applyReward({ thinking: g }); setPhase("entering"); }} />;
  if (phase === "entering") return <EnterMachineScreen onEntered={() => setPhase("worldmap")} />;
  if (phase === "ending") return <EndScreen stats={stats} log={log} onRestart={restart} />;

  if (phase === "regionboard" && activeRegion) {
    return (
      <RegionBoardScreen
        board={REGION_BOARDS[activeRegion]}
        stats={stats}
        log={log}
        onExit={() => { setActiveRegion(null); setPhase("worldmap"); }}
        onComplete={{ applyReward, appendLog, finishRegion }}
      />
    );
  }

  return (
    <WorldMapScreen
      stats={stats}
      completed={completed}
      onEnterRegion={(id) => { setActiveRegion(id); setPhase("regionboard"); }}
      onGoEnding={() => setPhase("ending")}
    />
  );
}
