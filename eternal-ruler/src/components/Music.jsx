import React, { useEffect, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { Check, Field, Panel } from "./ui.jsx";
import {
  installGestureStart,
  isPlaying,
  musicSupported,
  onMusicChange,
  setVolume,
  setWanted,
} from "../lib/ambient.js";

/**
 * Keeps the score in step with the saved setting. Mounted once, at the top of
 * the app.
 */
export function AmbientDriver() {
  const { state } = useStore();
  const { enabled, volume } = state.music;

  useEffect(() => installGestureStart(), []);
  useEffect(() => {
    setWanted(enabled);
  }, [enabled]);
  useEffect(() => {
    setVolume(volume);
  }, [volume]);

  return null;
}

/**
 * Topbar control. Shows whether the score is actually sounding, not just
 * whether it is switched on — before the page has been touched those are
 * different, and the browser is the one deciding.
 */
export function MusicToggle() {
  const store = useStore();
  const on = store.state.music.enabled;
  const [sounding, setSounding] = useState(isPlaying());

  useEffect(() => onMusicChange(setSounding), []);

  if (!musicSupported()) return null;

  const label = !on
    ? "Music off — tap to play"
    : sounding
      ? "Music on — tap to silence"
      : "Music on — starts when you touch the page";

  return (
    <button
      className={`music-toggle ${on ? "on" : ""}`}
      onClick={() => store.setMusic({ enabled: !on })}
      title={label}
      aria-label={label}
      aria-pressed={on}
    >
      {on ? "♪)" : "♪"}
    </button>
  );
}

/** The fuller control, for Settings. */
export function MusicPanel() {
  const store = useStore();
  const { enabled, volume } = store.state.music;

  return (
    <Panel title="Score">
      {!musicSupported() ? (
        <p className="soft small">This browser can't play the background score.</p>
      ) : (
        <>
          <Check
            checked={enabled}
            onChange={(v) => store.setMusic({ enabled: v })}
            title="Play the background score"
          >
            A slow piece written for this app and composed live in your browser — nothing is streamed, and
            it works offline. It steps back on its own whenever the guide speaks.
          </Check>
          <Field label={`Volume — ${Math.round(volume * 100)}%`} hint="Quiet by design. Full is still soft.">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              disabled={!enabled}
              aria-label="Score volume"
              onChange={(e) => store.setMusic({ volume: Number(e.target.value) })}
            />
          </Field>
        </>
      )}
    </Panel>
  );
}
