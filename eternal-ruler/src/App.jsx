import React, { useCallback, useEffect, useState } from "react";
import { StoreProvider, useStore } from "./lib/store.jsx";
import { Threshold } from "./views/Threshold.jsx";
import { Today } from "./views/Today.jsx";
import { Attunement } from "./views/Attunement.jsx";
import { Journal } from "./views/Journal.jsx";
import { Ascend } from "./views/Ascend.jsx";
import { VoiceRoom } from "./views/VoiceRoom.jsx";
import { Manifest } from "./views/Manifest.jsx";
import { Goals } from "./views/Goals.jsx";
import { Codex } from "./views/Codex.jsx";
import { Council } from "./views/Council.jsx";
import { Settings } from "./views/Settings.jsx";

const ROUTES = [
  ["today", "Today", Today],
  ["attunement", "Hot & Cold", Attunement],
  ["ascend", "Ascend", Ascend],
  ["journal", "Journal", Journal],
  ["voice", "Voice", VoiceRoom],
  ["manifest", "Forge", Manifest],
  ["goals", "Goals", Goals],
  ["codex", "Codex", Codex],
  ["council", "Council", Council],
  ["settings", "Settings", Settings],
];

function Inner() {
  const { state } = useStore();
  const [route, setRoute] = useState("today");
  const [params, setParams] = useState(null);

  const go = useCallback((next, p = null) => {
    setRoute(next);
    setParams(p);
    window.scrollTo(0, 0);
  }, []);

  // Route lives in the hash so a refresh doesn't dump you back on Today, and
  // so the browser's back button moves between rooms rather than leaving.
  useEffect(() => {
    const sync = () => {
      const fromHash = window.location.hash.replace("#", "");
      if (ROUTES.some(([k]) => k === fromHash)) setRoute(fromHash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    window.location.hash = route;
  }, [route]);

  if (!state.consent) return <Threshold />;

  const entry = ROUTES.find(([k]) => k === route) || ROUTES[0];
  const View = entry[2];
  const hsName = state.profile.higherSelfName || "your higher self";

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            Eternal Ruler
            <small>Beta · a self-experiment</small>
          </div>
          <div className="topbar-spacer" />
          <button className="btn ghost sm" onClick={() => go("ascend")} title="Enter your maximum state">
            ▲ Ascend
          </button>
        </div>
      </header>

      <nav className="nav" aria-label="Sections">
        <div className="nav-inner">
          {ROUTES.map(([key, label]) => (
            <button
              key={key}
              onClick={() => go(key)}
              aria-current={route === key ? "page" : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main>
        <View key={route} params={params} go={go} />
      </main>

      <footer className="foot">
        <p>
          Eternal Ruler is a self-experiment, not therapy, medical advice, or crisis support. 18+. Everything
          you write stays in this browser. Your life, your choices, your responsibility.
        </p>
        <p style={{ marginBottom: 0 }}>
          In crisis: US &amp; Canada 988 · UK &amp; Ireland 116 123 · elsewhere, your local emergency number or
          findahelpline.com. Reaching {hsName} can wait until you&apos;re safe.
        </p>
      </footer>
    </div>
  );
}

function Backdrop() {
  const { state } = useStore();
  return <div className={`field ${state.settings.reduceMotion ? "still" : ""}`} aria-hidden="true" />;
}

export default function App() {
  return (
    <StoreProvider>
      <Backdrop />
      <Inner />
    </StoreProvider>
  );
}
