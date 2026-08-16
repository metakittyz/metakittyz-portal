import React, { useCallback, useEffect, useState } from "react";
import { StoreProvider, useStore } from "./lib/store.jsx";
import { Threshold } from "./views/Threshold.jsx";
import { Path } from "./views/Path.jsx";
import { Attunement } from "./views/Attunement.jsx";
import { Journal } from "./views/Journal.jsx";
import { VoiceRoom } from "./views/VoiceRoom.jsx";
import { Manifest } from "./views/Manifest.jsx";
import { Library } from "./views/Library.jsx";
import { Council } from "./views/Council.jsx";
import { Settings } from "./views/Settings.jsx";
import { NeedNow } from "./components/NeedNow.jsx";
import { Runner } from "./components/Runner.jsx";
import { ROOM_UNLOCKS, nextUnlock, unlockedRooms } from "./data/path.js";

// Six rooms, and five of them are earned. On day one there is exactly one place
// to be, which is the entire point.
const ROUTES = [
  { key: "path", label: "Path", View: Path, always: true },
  { key: "journal", label: "Journal", View: Journal },
  { key: "reading", label: "Reading", View: Attunement },
  { key: "voice", label: "Voice", View: VoiceRoom },
  { key: "forge", label: "Forge", View: Manifest },
  { key: "council", label: "Council", View: Council },
  { key: "library", label: "Library", View: Library, more: true },
  { key: "settings", label: "Settings", View: Settings, more: true },
];

function Inner() {
  const { state } = useStore();
  const [route, setRoute] = useState("path");
  const [params, setParams] = useState(null);
  const [needNow, setNeedNow] = useState(false);
  const [running, setRunning] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const open = unlockedRooms(state.path.completed, state.path.freeRoam);
  const coming = nextUnlock(state.path.completed);

  const go = useCallback((next, p = null) => {
    setRoute(next);
    setParams(p);
    setMoreOpen(false);
    window.scrollTo(0, 0);
  }, []);

  // Route lives in the hash so a refresh keeps your place and Back works.
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace("#", "");
      if (ROUTES.some((r) => r.key === h)) setRoute(h);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    window.location.hash = route;
  }, [route]);

  if (!state.consent) return <Threshold />;

  // A locked room reached by an old hash quietly returns you to the path.
  const entry = ROUTES.find((r) => r.key === route && (r.always || r.more || open.has(r.key))) || ROUTES[0];
  const { View } = entry;
  const visible = ROUTES.filter((r) => !r.more && (r.always || open.has(r.key)));

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            Eternal Ruler
            <small>Beta · a self-experiment</small>
          </div>
          <div className="topbar-spacer" />
          <button className="btn need-btn" onClick={() => setNeedNow(true)}>
            ◈ I need something now
          </button>
        </div>
      </header>

      <nav className="nav" aria-label="Sections">
        <div className="nav-inner">
          {visible.map((r) => (
            <button key={r.key} onClick={() => go(r.key)} aria-current={route === r.key ? "page" : undefined}>
              {r.label}
            </button>
          ))}
          {coming && !state.path.freeRoam && (
            <span className="nav-locked" title={`Opens on day ${coming.day}`}>
              ✧ day {coming.day}
            </span>
          )}
          <div className="topbar-spacer" />
          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-current={entry.more ? "page" : undefined}
            aria-expanded={moreOpen}
          >
            More ▾
          </button>
        </div>
        {moreOpen && (
          <div className="more-menu">
            {ROUTES.filter((r) => r.more).map((r) => (
              <button key={r.key} onClick={() => go(r.key)}>
                {r.label}
              </button>
            ))}
          </div>
        )}
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
          findahelpline.com.
        </p>
      </footer>

      {needNow && (
        <NeedNow
          onClose={() => setNeedNow(false)}
          onPick={(p) => {
            setNeedNow(false);
            setRunning(p);
          }}
        />
      )}
      {running && <Runner protocol={running} onClose={() => setRunning(null)} />}
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

export { ROOM_UNLOCKS };
