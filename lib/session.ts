"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SessionState } from "./tokens";
import { startRecording, type RecorderHandle } from "./recorder";

export type ItemStatus = "transcribing" | "ready" | "error";

export interface TranscriptItem {
  id: string;
  createdAt: number;
  text: string;
  status: ItemStatus;
  errorMessage?: string;
}

export interface AppState {
  sessionState: SessionState;
  items: TranscriptItem[];
  error: string | null;
}

const INITIAL: AppState = {
  sessionState: "idle",
  items: [],
  error: null,
};

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function useSession() {
  const [state, setState] = useState<AppState>(INITIAL);
  const recorderRef = useRef<RecorderHandle | null>(null);
  const startingRef = useRef(false);

  const beginRecording = useCallback(async () => {
    if (startingRef.current || recorderRef.current) return;
    startingRef.current = true;

    setState((s) => ({
      ...s,
      sessionState: "listening",
      error: null,
    }));

    try {
      const handle = await startRecording({
        onError: (err) => {
          setState((s) => ({ ...s, error: String(err) }));
        },
      });
      recorderRef.current = handle;
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access was blocked. Enable it in your browser settings and try again."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No microphone found."
            : `Couldn't start recording: ${String(err)}`;
      setState((s) => ({ ...s, sessionState: "idle", error: msg }));
    } finally {
      startingRef.current = false;
    }
  }, []);

  const endRecording = useCallback(async () => {
    const handle = recorderRef.current;
    recorderRef.current = null;
    if (!handle) return;

    const itemId = newId();

    // Transition to processing + insert a placeholder card so the user
    // sees a "Transcribing…" slot the moment they release.
    setState((s) => {
      if (s.sessionState !== "listening") return s;
      const placeholder: TranscriptItem = {
        id: itemId,
        createdAt: Date.now(),
        text: "",
        status: "transcribing",
      };
      return {
        ...s,
        sessionState: "processing",
        items: [...s.items, placeholder],
      };
    });

    let blob: Blob | null = null;
    try {
      blob = await handle.stop();
    } catch {
      // ignore
    }

    if (!blob || blob.size === 0) {
      setState((s) => ({
        ...s,
        sessionState: "idle",
        items: s.items.filter((i) => i.id !== itemId),
      }));
      return;
    }

    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        setState((s) => ({
          ...s,
          sessionState: "post",
          items: s.items.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  status: "error",
                  errorMessage: `Transcription failed (${res.status}). ${body.slice(0, 200)}`,
                }
              : i
          ),
        }));
        return;
      }
      const data = (await res.json()) as { partial?: string };
      const text = (data.partial ?? "").trim();

      setState((s) => {
        if (!text) {
          // Sarvam returned nothing — drop the placeholder, return to idle.
          return {
            ...s,
            sessionState: "idle",
            items: s.items.filter((i) => i.id !== itemId),
          };
        }
        return {
          ...s,
          sessionState: "post",
          items: s.items.map((i) =>
            i.id === itemId ? { ...i, status: "ready", text } : i
          ),
        };
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        sessionState: "post",
        items: s.items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                status: "error",
                errorMessage: `Transcription request failed: ${String(err)}`,
              }
            : i
        ),
      }));
    }
  }, []);

  const toggleMic = useCallback(() => {
    setState((curr) => {
      if (curr.sessionState === "processing") return curr;
      if (curr.sessionState === "listening") {
        queueMicrotask(() => void endRecording());
      } else {
        queueMicrotask(() => void beginRecording());
      }
      return curr;
    });
  }, [beginRecording, endRecording]);

  const dismissError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  // Space push-to-talk
  useEffect(() => {
    let held = false;
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || held || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;
      e.preventDefault();
      held = true;
      void beginRecording();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space" || !held) return;
      e.preventDefault();
      held = false;
      void endRecording();
    };
    document.body.addEventListener("keydown", down);
    document.body.addEventListener("keyup", up);
    return () => {
      document.body.removeEventListener("keydown", down);
      document.body.removeEventListener("keyup", up);
    };
  }, [beginRecording, endRecording]);

  useEffect(() => {
    return () => {
      void recorderRef.current?.stop();
      recorderRef.current = null;
    };
  }, []);

  return useMemo(
    () => ({ state, toggleMic, dismissError }),
    [state, toggleMic, dismissError]
  );
}
