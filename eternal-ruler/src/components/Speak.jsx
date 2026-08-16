import React, { useCallback, useEffect, useState } from "react";
import { useStore } from "../lib/store.jsx";
import {
  onVoicesReady,
  resolvePreset,
  speakLine,
  speechSupported,
  stopAll,
} from "../lib/voice.js";

/**
 * Speak on demand. Every call carries a line id so that "Your Own Voice" can
 * substitute your recording for that exact line.
 */
export function useGuide() {
  const { state } = useStore();
  const v = state.voice;

  const say = useCallback(
    (lineId, text, opts) => {
      if (!v.enabled || !text) return false;
      return speakLine(lineId, text, v, opts);
    },
    [v]
  );

  useEffect(() => stopAll, []);

  return { say, stop: stopAll, enabled: v.enabled, supported: speechSupported() };
}

/** Auto-speak whenever the line changes. Used for guided protocol steps. */
export function useNarrate(lineId, text, active = true) {
  const { say } = useGuide();
  useEffect(() => {
    if (!active || !text) return undefined;
    say(lineId, text);
    return stopAll;
  }, [lineId, text, active, say]);
}

/** A small "read this aloud" button. */
export function SpeakButton({ lineId = null, text, label = "Listen", className = "btn ghost sm" }) {
  const { say, stop, enabled, supported } = useGuide();
  const [talking, setTalking] = useState(false);

  useEffect(() => stopAll, []);
  if (!supported || !enabled) return null;

  return (
    <button
      className={className}
      onClick={() => {
        if (talking) {
          stop();
          setTalking(false);
          return;
        }
        setTalking(true);
        say(lineId, text, { onEnd: () => setTalking(false) });
      }}
    >
      {talking ? "◼ Stop" : `▶ ${label}`}
    </button>
  );
}

/** Header mute toggle. */
export function VoiceToggle() {
  const store = useStore();
  const on = store.state.voice.enabled;
  if (!speechSupported()) return null;
  return (
    <button
      className={`voice-toggle ${on ? "on" : ""}`}
      onClick={() => {
        if (on) stopAll();
        store.setVoice({ enabled: !on });
      }}
      title={on ? "Guide voice on — tap to mute" : "Guide voice muted — tap to unmute"}
      aria-label={on ? "Mute the guide voice" : "Unmute the guide voice"}
      aria-pressed={on}
    >
      {on ? "◉))" : "◉"}
    </button>
  );
}

/** Live list of device voices, for the manual override picker. */
export function useDeviceVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => onVoicesReady(() => setVoices([...(window.speechSynthesis.getVoices() || [])])), []);
  return voices;
}

export { resolvePreset };
