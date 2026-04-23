"use client";

// Single-take recorder: records one continuous audio blob and returns it
// on stop. Transcribing the full utterance in one request gives Sarvam
// the sentence-level context needed for good accuracy — much better than
// splitting into short independent chunks.

export interface RecorderHandle {
  stop: () => Promise<Blob>;
  isRecording: () => boolean;
}

export interface StartRecordingOpts {
  onError?: (err: unknown) => void;
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m));
}

export async function startRecording(
  opts: StartRecordingOpts = {}
): Promise<RecorderHandle> {
  const mimeType = pickMimeType();

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
    },
  });

  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  let stopped = false;

  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  rec.onerror = (e) => opts.onError?.(e);

  rec.start();

  return {
    isRecording: () => !stopped,
    stop: () =>
      new Promise<Blob>((resolve) => {
        stopped = true;
        const finish = () => {
          stream.getTracks().forEach((t) => t.stop());
          const type = (mimeType ?? "audio/webm").split(";")[0];
          resolve(new Blob(chunks, { type }));
        };
        if (rec.state === "recording") {
          rec.addEventListener("stop", finish, { once: true });
          rec.stop();
        } else {
          finish();
        }
      }),
  };
}
