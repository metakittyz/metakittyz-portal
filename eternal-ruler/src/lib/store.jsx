import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { dayKey, uid } from "./util.js";

// ---------------------------------------------------------------------------
// Everything lives in this one JSON blob in localStorage. That is a deliberate
// choice for the beta: your journal, your ratings, and your deeply personal
// answers never leave the device. It is also the main limitation — see
// README "Where your data lives".
// ---------------------------------------------------------------------------

const KEY = "eternal_ruler:state:v1";
const VERSION = 1;

export const EMPTY_STATE = {
  version: VERSION,
  // Local-only account record. `method` is what the person chose at the gate;
  // `connected` stays false until a real provider is wired up (see README,
  // "What still needs a server"). Nothing here authenticates anything.
  account: null, // { method: 'google'|'apple'|'email', email, createdAt, connected: false }
  consent: null,
  profile: { name: "", higherSelfName: "", intention: "", onboarded: false },
  // The Path: which steps you've finished, and whether you've opted out of the
  // progressive unlock. Position is derived from `completed`, never from dates —
  // miss a month and you resume exactly where you stopped.
  path: { completed: [], completedAt: {}, startedAt: null, freeRoam: false, practiceCount: 0 },
  sealsSeen: [], // so a newly earned seal can be announced exactly once
  checkins: {}, // dayKey -> { at, readings: { domainId: {self, higher} }, note }
  intake: [], // { id, at, dayKey, channel, what, charge }
  intakeDays: {}, // dayKey -> { sleep, note }
  journal: [],
  goals: [],
  manifestations: [],
  recordings: [], // metadata only; audio blobs live in IndexedDB
  practiceLog: {}, // dayKey -> [protocolId]
  ascentLog: [], // { id, at, protocolId, secondsHeld, stateBefore, stateAfter }
  savedRemarks: [],
  remarkNotes: {},
  codexSaved: [],
  council: { mentorProfile: null, requests: [], threads: [] },
  settings: {
    showDeepPrompts: true,
    reduceMotion: false,
    anchorHour: 7,
  },
  // The score that plays under everything. Quiet by default, and it ducks
  // itself whenever the guide speaks.
  music: { enabled: true, volume: 0.5 },
  // The guide voice. `presetId` names a character from the Voice Library;
  // `voiceURI` empty means "let the preset choose the device voice".
  // `engine`: "auto" (the default) uses the natural OpenAI voice wherever it
  // is reachable and silently falls back to the browser's speech synthesis
  // where it isn't; "device" forces the browser voice always. `apiKey` is only
  // set in bring-your-own-key mode and never leaves this browser except as a
  // header to our own /api/tts.
  voice: {
    enabled: true,
    presetId: "solace",
    engine: "auto",
    model: "gpt-4o-mini-tts",
    apiKey: "",
    voiceURI: "",
    rateOffset: 0,
    pitchOffset: 0,
  },
  ownVoice: {}, // lineId -> { at, duration }; the audio lives in IndexedDB
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw);
    // Shallow-merge so a state file written by an older build still boots.
    return {
      ...EMPTY_STATE,
      ...parsed,
      profile: { ...EMPTY_STATE.profile, ...(parsed.profile || {}) },
      settings: { ...EMPTY_STATE.settings, ...(parsed.settings || {}) },
      council: { ...EMPTY_STATE.council, ...(parsed.council || {}) },
      path: { ...EMPTY_STATE.path, ...(parsed.path || {}) },
      voice: { ...EMPTY_STATE.voice, ...(parsed.voice || {}) },
      music: { ...EMPTY_STATE.music, ...(parsed.music || {}) },
    };
  } catch (err) {
    console.warn("Eternal Ruler: could not read saved state, starting fresh.", err);
    return { ...EMPTY_STATE };
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const writeTimer = useRef(null);

  useEffect(() => {
    clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch (err) {
        console.error("Eternal Ruler: save failed (storage may be full).", err);
      }
    }, 250);
    return () => clearTimeout(writeTimer.current);
  }, [state]);

  const update = useCallback((fn) => setState((prev) => ({ ...prev, ...fn(prev) })), []);

  const api = useMemo(() => {
    const patchList = (listName, id, patch) => (prev) => ({
      [listName]: prev[listName].map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });

    return {
      // ---- account -----------------------------------------------------------
      createAccount({ method, email = "" }) {
        update(() => ({
          account: { method, email, createdAt: new Date().toISOString(), connected: false },
        }));
      },
      signOut() {
        // Clears the account only. Your journal, path, and readings stay on this
        // device — there is no server to sync them from if we dropped them.
        update(() => ({ account: null }));
      },

      // ---- consent + profile -------------------------------------------------
      acceptThreshold(record) {
        const { name, higherSelfName, intention, ...gates } = record;
        update((prev) => ({
          consent: { ...gates, acceptedAt: new Date().toISOString() },
          // Onboarding normally sets these; the spread keeps every other
          // profile field (notably `onboarded`) intact.
          profile: {
            ...prev.profile,
            name: name || prev.profile.name,
            higherSelfName: higherSelfName || prev.profile.higherSelfName,
            intention: intention || prev.profile.intention,
          },
        }));
      },
      revokeThreshold() {
        update(() => ({ consent: null }));
      },
      setProfile(patch) {
        update((prev) => ({ profile: { ...prev.profile, ...patch } }));
      },
      setSettings(patch) {
        update((prev) => ({ settings: { ...prev.settings, ...patch } }));
      },
      setVoice(patch) {
        update((prev) => ({ voice: { ...prev.voice, ...patch } }));
      },
      markOverture(seen = true) {
        update(() => ({ overtureSeen: seen }));
      },
      setMusic(patch) {
        update((prev) => ({ music: { ...prev.music, ...patch } }));
      },
      setOwnLine(lineId, meta) {
        update((prev) => ({ ownVoice: { ...prev.ownVoice, [lineId]: meta } }));
      },
      clearOwnLine(lineId) {
        update((prev) => {
          const next = { ...prev.ownVoice };
          delete next[lineId];
          return { ownVoice: next };
        });
      },
      markSealsSeen(ids) {
        update((prev) => ({ sealsSeen: [...new Set([...prev.sealsSeen, ...ids])] }));
      },

      // ---- the path ----------------------------------------------------------
      completeDay(day) {
        update((prev) => {
          if (prev.path.completed.includes(day)) return {};
          return {
            path: {
              ...prev.path,
              startedAt: prev.path.startedAt || new Date().toISOString(),
              completed: [...prev.path.completed, day].sort((a, b) => a - b),
              // When each step was taken, so the Calendar can place it.
              completedAt: { ...(prev.path.completedAt || {}), [day]: dayKey() },
            },
          };
        });
      },
      undoDay(day) {
        update((prev) => ({
          path: { ...prev.path, completed: prev.path.completed.filter((d) => d !== day) },
        }));
      },
      completePractice() {
        update((prev) => ({ path: { ...prev.path, practiceCount: (prev.path.practiceCount || 0) + 1 } }));
      },
      setFreeRoam(on) {
        update((prev) => ({ path: { ...prev.path, freeRoam: on } }));
      },

      // ---- hot & cold check-ins ---------------------------------------------
      saveCheckin(readings, note = "") {
        const key = dayKey();
        update((prev) => ({
          checkins: {
            ...prev.checkins,
            [key]: { at: new Date().toISOString(), readings, note },
          },
        }));
        return key;
      },
      deleteCheckin(key) {
        update((prev) => {
          const next = { ...prev.checkins };
          delete next[key];
          return { checkins: next };
        });
      },

      // ---- intake ------------------------------------------------------------
      addIntake(entry) {
        const record = {
          id: uid("in"),
          at: new Date().toISOString(),
          dayKey: dayKey(),
          channel: "content",
          what: "",
          charge: 0,
          ...entry,
        };
        update((prev) => ({ intake: [record, ...prev.intake] }));
        return record;
      },
      updateIntake(id, patch) {
        update((prev) => ({ intake: prev.intake.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
      },
      deleteIntake(id) {
        update((prev) => ({ intake: prev.intake.filter((i) => i.id !== id) }));
      },
      setIntakeDay(patch, key = dayKey()) {
        update((prev) => ({
          intakeDays: { ...prev.intakeDays, [key]: { ...(prev.intakeDays[key] || {}), ...patch } },
        }));
      },

      // ---- journal -----------------------------------------------------------
      addEntry(entry) {
        const record = {
          id: uid("jrnl"),
          at: new Date().toISOString(),
          dayKey: dayKey(),
          title: "",
          body: "",
          promptId: null,
          tags: [],
          flagged: false,
          recordingId: null,
          ...entry,
        };
        update((prev) => ({ journal: [record, ...prev.journal] }));
        return record;
      },
      updateEntry(id, patch) {
        update(patchList("journal", id, patch));
      },
      deleteEntry(id) {
        update((prev) => ({ journal: prev.journal.filter((e) => e.id !== id) }));
      },

      // ---- goals -------------------------------------------------------------
      addGoal(goal) {
        const record = {
          id: uid("goal"),
          createdAt: new Date().toISOString(),
          title: "",
          why: "",
          domain: "purpose",
          nextAction: "",
          horizon: "",
          done: false,
          doneAt: null,
          ...goal,
        };
        update((prev) => ({ goals: [record, ...prev.goals] }));
        return record;
      },
      updateGoal(id, patch) {
        update(patchList("goals", id, patch));
      },
      toggleGoal(id) {
        update((prev) => ({
          goals: prev.goals.map((g) =>
            g.id === id ? { ...g, done: !g.done, doneAt: g.done ? null : new Date().toISOString() } : g
          ),
        }));
      },
      deleteGoal(id) {
        update((prev) => ({ goals: prev.goals.filter((g) => g.id !== id) }));
      },

      // ---- manifestations ----------------------------------------------------
      addManifestation(m) {
        const record = {
          id: uid("mnfs"),
          createdAt: new Date().toISOString(),
          title: "",
          desire: "",
          whyItMatters: "",
          currentPosition: "",
          identityShift: "",
          alreadyTrue: "",
          dailyMinimum: "",
          obstacles: [],
          milestones: [],
          evidence: [],
          archived: false,
          ...m,
        };
        update((prev) => ({ manifestations: [record, ...prev.manifestations] }));
        return record;
      },
      updateManifestation(id, patch) {
        update(patchList("manifestations", id, patch));
      },
      deleteManifestation(id) {
        update((prev) => ({ manifestations: prev.manifestations.filter((m) => m.id !== id) }));
      },

      // ---- voice -------------------------------------------------------------
      addRecording(meta) {
        const record = {
          id: meta.id || uid("voc"),
          at: new Date().toISOString(),
          title: "Untitled",
          kind: "affirmation",
          text: "",
          duration: 0,
          ...meta,
        };
        update((prev) => ({ recordings: [record, ...prev.recordings] }));
        return record;
      },
      updateRecording(id, patch) {
        update(patchList("recordings", id, patch));
      },
      removeRecording(id) {
        update((prev) => ({ recordings: prev.recordings.filter((r) => r.id !== id) }));
      },

      // ---- practices + ascents ----------------------------------------------
      logPractice(protocolId) {
        const key = dayKey();
        update((prev) => {
          const today = prev.practiceLog[key] || [];
          if (today.includes(protocolId)) return {};
          return { practiceLog: { ...prev.practiceLog, [key]: [...today, protocolId] } };
        });
      },
      unlogPractice(protocolId) {
        const key = dayKey();
        update((prev) => ({
          practiceLog: { ...prev.practiceLog, [key]: (prev.practiceLog[key] || []).filter((p) => p !== protocolId) },
        }));
      },
      logAscent(record) {
        update((prev) => ({
          ascentLog: [{ id: uid("asc"), at: new Date().toISOString(), ...record }, ...prev.ascentLog].slice(0, 500),
        }));
      },

      // ---- remarks + codex ---------------------------------------------------
      toggleSavedRemark(id) {
        update((prev) => ({
          savedRemarks: prev.savedRemarks.includes(id)
            ? prev.savedRemarks.filter((r) => r !== id)
            : [id, ...prev.savedRemarks],
        }));
      },
      setRemarkNote(id, text) {
        update((prev) => ({ remarkNotes: { ...prev.remarkNotes, [id]: text } }));
      },
      toggleCodexSaved(id) {
        update((prev) => ({
          codexSaved: prev.codexSaved.includes(id)
            ? prev.codexSaved.filter((c) => c !== id)
            : [id, ...prev.codexSaved],
        }));
      },

      // ---- council -----------------------------------------------------------
      setMentorProfile(profile) {
        update((prev) => ({ council: { ...prev.council, mentorProfile: profile } }));
      },
      addMentorRequest(request) {
        const record = { id: uid("req"), at: new Date().toISOString(), status: "pending", ...request };
        update((prev) => ({ council: { ...prev.council, requests: [record, ...prev.council.requests] } }));
        return record;
      },
      updateMentorRequest(id, patch) {
        update((prev) => ({
          council: {
            ...prev.council,
            requests: prev.council.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
          },
        }));
      },

      // ---- data control ------------------------------------------------------
      replaceAll(next) {
        setState({ ...EMPTY_STATE, ...next });
      },
      wipe() {
        setState({ ...EMPTY_STATE });
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* nothing else to do */
        }
      },
    };
  }, [update]);

  const value = useMemo(() => ({ state, ...api }), [state, api]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
