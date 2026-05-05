import { useState } from "react";
import SetupPage from "@/pages/SetupPage";
import FlashcardPage from "@/pages/FlashcardPage";
import { type SessionConfig } from "@/types/session";

export default function App() {
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);

  if (sessionConfig) {
    return (
      <FlashcardPage
        config={sessionConfig}
        onBack={() => setSessionConfig(null)}
      />
    );
  }

  return <SetupPage onStart={(config) => setSessionConfig(config)} />;
}
