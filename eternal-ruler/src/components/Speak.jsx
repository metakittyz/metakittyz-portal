import React, { useCallback, useEffect, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { onVoicesReady, pickGuideVoice, speak, speechSupported, stopSpeaking } from "../lib/voice.js";

/** Speak on demand, honouring the global mute. */
export function useGuide() {
  const { state } = useStore();
  const v = state.voice;

  const say = useCallback(
    (text, opts) => {
      if (!v.enabled || !text) return false;
      return speak(text, v, opts);
    },
    [v]
  );

  // Never leave the guide talking into an empty room.
  useEffect(() => stopSpeaking, []);

  return { say, stop: stopSpeaking, enabled: v.enabled, supported: speechSupported() };
}

/** Auto-speak `text` whenever it changes. Used for guided protocol steps. */
export function useNarrate(text, active = true) {
  const { say } = useGuide();
  useEffect(() => {
    if (!active || !text) return undefined;
    say(text);
    return stopSpeaking;
  }, [text, active, say]);
}

/** A small "read this aloud" button. */
export function SpeakButton({ text, label = "Listen", className = "btn ghost sm" }) {
  const { say, stop, enabled, supported } = useGuide();
  const [talking, setTalking] = useState(false);

  useEffect(() => stopSpeaking, []);
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
        say(text, { onEnd: () => setTalking(false) });
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
        if (on) stopSpeaking();
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

/** Live list of device voices, for the Settings picker. */
export function useDeviceVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => onVoicesReady(() => setVoices([...(window.speechSynthesis.getVoices() || [])])), []);
  return voices;
}

export { pickGuideVoice };
