// Voice storage + recording.
//
// Audio blobs are far too large for localStorage (~5MB total), so they live in
// IndexedDB instead. The *metadata* for each recording (title, script, length)
// lives in the main store; the blob is keyed by the same id here.

import { useCallback, useEffect, useRef, useState } from "react";

const DB_NAME = "eternal_ruler_voice";
const STORE = "clips";

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser has no IndexedDB, so voice clips cannot be saved."));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export const clips = {
  put: (id, blob) => tx("readwrite", (s) => s.put(blob, id)),
  get: (id) => tx("readonly", (s) => s.get(id)),
  delete: (id) => tx("readwrite", (s) => s.delete(id)),
  keys: () => tx("readonly", (s) => s.getAllKeys()),
};

/** Resolves a stored clip to an object URL, revoking the previous one. */
export function useClipUrl(id) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let dead = false;
    let made = null;
    if (!id) {
      setUrl(null);
      return undefined;
    }
    clips
      .get(id)
      .then((blob) => {
        if (dead || !blob) return;
        made = URL.createObjectURL(blob);
        setUrl(made);
      })
      .catch(() => setUrl(null));
    return () => {
      dead = true;
      if (made) URL.revokeObjectURL(made);
    };
  }, [id]);
  return url;
}

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

export function recordingSupported() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined"
  );
}

/**
 * Microphone recorder with a live input level (so the UI can breathe with the
 * voice). Call start(), then stop() — stop() resolves to { blob, duration }.
 */
export function useRecorder() {
  const [status, setStatus] = useState("idle"); // idle | requesting | recording | error
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startedRef = useRef(0);
  const rafRef = useRef(null);
  const audioCtxRef = useRef(null);

  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    recorderRef.current = null;
    setLevel(0);
  }, []);

  useEffect(() => teardown, [teardown]);

  const start = useCallback(async () => {
    if (!recordingSupported()) {
      setError("Recording needs a browser with microphone support, served over HTTPS or localhost.");
      setStatus("error");
      return false;
    }
    setError(null);
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 3.2));
        setElapsed((Date.now() - startedRef.current) / 1000);
        rafRef.current = requestAnimationFrame(tick);
      };

      const mime = pickMimeType();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.start(250);
      recorderRef.current = rec;
      startedRef.current = Date.now();
      setElapsed(0);
      setStatus("recording");
      rafRef.current = requestAnimationFrame(tick);
      return true;
    } catch (err) {
      teardown();
      setError(
        err?.name === "NotAllowedError"
          ? "Microphone permission was denied. Your browser's address bar has the switch to turn it back on."
          : `Could not open the microphone: ${err?.message || err}`
      );
      setStatus("error");
      return false;
    }
  }, [teardown]);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return Promise.resolve(null);
    const duration = (Date.now() - startedRef.current) / 1000;
    return new Promise((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        chunksRef.current = [];
        teardown();
        setStatus("idle");
        resolve({ blob, duration });
      };
      rec.stop();
    });
  }, [teardown]);

  const cancel = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.onstop = null;
      rec.stop();
    }
    chunksRef.current = [];
    teardown();
    setStatus("idle");
  }, [teardown]);

  return { status, error, elapsed, level, start, stop, cancel };
}
