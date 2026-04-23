"use client";

import { TopBar } from "@/components/TopBar";
import { EditorCanvas } from "@/components/EditorCanvas";
import { MicDock } from "@/components/MicDock";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useSession } from "@/lib/session";

export default function Page() {
  const { state, toggleMic, dismissError } = useSession();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#fafaf9",
      }}
    >
      <TopBar sessionState={state.sessionState} />
      <EditorCanvas items={state.items} />
      {state.error && (
        <ErrorBanner message={state.error} onDismiss={dismissError} />
      )}
      <MicDock state={state.sessionState} onMic={toggleMic} />
    </div>
  );
}
