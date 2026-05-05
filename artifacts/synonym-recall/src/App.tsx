import { useState } from "react";
import SetupPage from "@/pages/SetupPage";
import FlashcardPage from "@/pages/FlashcardPage";
import ResultsPage from "@/pages/ResultsPage";
import ProgressPage from "@/pages/ProgressPage";
import { type SessionConfig, type CardResult, DEFAULT_CONFIG } from "@/types/session";
import { type FlashCard } from "@/data/flashcards";

type Screen =
  | { view: "setup" }
  | { view: "session"; config: SessionConfig; prebuiltDeck?: FlashCard[] }
  | { view: "results"; results: CardResult[]; config: SessionConfig }
  | { view: "progress" };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ view: "setup" });

  if (screen.view === "progress") {
    return <ProgressPage onBack={() => setScreen({ view: "setup" })} />;
  }

  if (screen.view === "session") {
    return (
      <FlashcardPage
        config={screen.config}
        prebuiltDeck={screen.prebuiltDeck}
        onBack={() => setScreen({ view: "setup" })}
        onFinish={(results) =>
          setScreen({ view: "results", results, config: screen.config })
        }
      />
    );
  }

  if (screen.view === "results") {
    const { results, config } = screen;
    return (
      <ResultsPage
        results={results}
        onReviewMissed={(missedCards) =>
          setScreen({ view: "session", config, prebuiltDeck: missedCards })
        }
        onNewSession={() => setScreen({ view: "session", config })}
        onBackToSetup={() => setScreen({ view: "setup" })}
      />
    );
  }

  return (
    <SetupPage
      onStart={(config) => setScreen({ view: "session", config })}
      onViewProgress={() => setScreen({ view: "progress" })}
    />
  );
}
