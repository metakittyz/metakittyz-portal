import React, { useCallback, useEffect, useState } from "react";
import { StoreProvider, useStore } from "./lib/store.jsx";
import { Onboarding } from "./views/Onboarding.jsx";
import { Threshold } from "./views/Threshold.jsx";
import { Path } from "./views/Path.jsx";
import { Attunement } from "./views/Attunement.jsx";
import { Journal } from "./views/Journal.jsx";
import { Intake } from "./views/Intake.jsx";
import { VoiceRoom } from "./views/VoiceRoom.jsx";
import { Meditate } from "./views/Meditate.jsx";
import { Manifest } from "./views/Manifest.jsx";
import { Library } from "./views/Library.jsx";
import { Council } from "./views/Council.jsx";
import { Profile } from "./views/Profile.jsx";
import { Settings } from "./views/Settings.jsx";
import { Calendar } from "./views/Calendar.jsx";
import { VoiceLibrary } from "./views/VoiceLibrary.jsx";
import { VoiceToggle } from "./components/Speak.jsx";
import { Overture } from "./views/Overture.jsx";
import { AmbientDriver, MusicToggle } from "./components/Music.jsx";
import { NeedNow } from "./components/NeedNow.jsx";
import { Runner } from "./components/Runner.jsx";
import { TOTAL_DAYS, currentDay, nextUnlock, stageOf, unlockedRooms } from "./data/path.js";

// Six rooms, five of them earned. On day one there is exactly one place to be.
const ROUTES = [
  { key: "path", label: "Path", View: Path, always: true },
  { key: "journal", label: "Journal", View: Journal },
  { key: "reading", label: "Reading", View: Attunement },
  { key: "voice", label: "Voice", View: VoiceRoom },
  { key: "meditate", label: "Meditate", View: Meditate },
  { key: "intake", label: "Intake", View: Intake },
  { key: "forge", label: "Forge", View: Manifest },
  { key: "council", label: "Council", View: Council },
  { key: "profile", label: "Profile", View: Profile, more: true },
  { key: "calendar", label: "Calendar", View: Calendar, more: true },
  { key: "voicelib", label: "Guide Voice", View: VoiceLibrary, more: true },
  { key: "library", label: "Library", View: Library, more: true },
  { key: "settings", label: "Settings", View: Settings, more: true },
];

function Inner() {
  const store = useStore();
  const { state } = store;
  const [route, setRoute] = useState("path");
  const [params, setParams] = useState(null);
  const [needNow, setNeedNow] = useState(false);
  const [running, setRunning] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);

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

  // The opening story, then welcome → account → name → who, then the consent
  // gate, then the app.
  if (!state.overtureSeen) {
    return <Overture onDone={() => store.markOverture()} reduceMotion={state.settings.reduceMotion} />;
  }
  if (!state.account || !state.profile.onboarded) return <Onboarding />;
  if (!state.consent) return <Threshold />;

  const open = unlockedRooms(state.path.completed, state.path.freeRoam);
  const coming = nextUnlock(state.path.completed);
  const day = currentDay(state.path.completed);
  const graduated = day > TOTAL_DAYS;
  const stage = graduated ? null : stageOf(day);
  const pct = (state.path.completed.length / TOTAL_DAYS) * 100;
  const initial = (state.profile.name || "?").trim().charAt(0).toUpperCase();

  // A locked room reached by an old hash quietly returns you to the path.
  const entry = ROUTES.find((r) => r.key === route && (r.always || r.more || open.has(r.key))) || ROUTES[0];
  const { View } = entry;
  const visible = ROUTES.filter((r) => !r.more && (r.always || open.has(r.key)));

  return (
    <div className="shell">
      {/* One sticky block: topbar, nav, and journey strip pin together, so no
          hand-tuned offsets can drift out of alignment. */}
      <div className="chrome">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            Eternal Ruler
            <small>Beta · a self-experiment</small>
          </div>
          <div className="topbar-spacer" />
          <MusicToggle />
          <VoiceToggle />
          <button className="btn need-btn" onClick={() => setNeedNow(true)}>
            ◈<span className="need-label"> I need something now</span>
          </button>
          <button
            className="avatar"
            onClick={() => go("profile")}
            title={`${state.profile.name || "Profile"} — your profile`}
            aria-label="Your profile"
          >
            {initial}
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

      {/* The through-line, on every screen: where you are and what it's for. */}
      <button className="journey" onClick={() => go("path")} aria-label="Your position on the path">
        <span className="journey-where">
          <span className="journey-glyph">{graduated ? "✧" : stage.glyph}</span>
          {graduated ? "The Practice" : `${stage.name} · Day ${day}/${TOTAL_DAYS}`}
        </span>
        <span className="journey-line" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </span>
        <span className="journey-creed">Becoming your own eternal ruler</span>
      </button>
      </div>

      <main>
        <View key={route} params={params} go={go} />
      </main>

      <footer className="foot">
        <p>A self-experiment. Not therapy, medical advice, or crisis support. 18+.</p>
        <p style={{ marginBottom: 0 }}>
          In crisis: US &amp; Canada 988 · UK &amp; Ireland 116 123 · elsewhere findahelpline.com
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
      {/* Above the onboarding gate, so the score is there from the welcome
          screen rather than arriving once you're already inside. */}
      <AmbientDriver />
      <Inner />
    </StoreProvider>
  );
}
