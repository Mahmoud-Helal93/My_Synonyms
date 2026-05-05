import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  Target,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Settings2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { type CardResult } from "@/types/session";
import { type FlashCard } from "@/data/flashcards";

interface Props {
  results: CardResult[];
  onReviewMissed: (missedCards: FlashCard[]) => void;
  onNewSession: () => void;
  onBackToSetup: () => void;
}

function getPillStyle(cardType: FlashCard["cardType"]): string {
  switch (cardType) {
    case "Definition":
      return "bg-blue-100 text-blue-700";
    case "Synonym":
      return "bg-green-100 text-green-700";
    case "Antonym":
      return "bg-orange-100 text-orange-700";
  }
}

function getRelationship(card: FlashCard): string {
  switch (card.cardType) {
    case "Synonym":
      return `${card.relatedItem} → ${card.correctWord}`;
    case "Antonym":
      return `${card.relatedItem} is an antonym of ${card.correctWord}`;
    case "Definition":
      return `Definition of ${card.correctWord}`;
  }
}

export default function ResultsPage({ results, onReviewMissed, onNewSession, onBackToSetup }: Props) {
  const [showMissed, setShowMissed] = useState(true);

  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const wrongCount = results.filter((r) => !r.correct).length;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const missedResults = results.filter((r) => !r.correct);
  const missedCards = missedResults.map((r) => r.card);
  const missedWords = [...new Set(missedCards.map((c) => c.targetWord))];

  const ringColor =
    accuracy >= 80 ? "text-green-500" : accuracy >= 50 ? "text-yellow-500" : "text-red-400";
  const barColor =
    accuracy >= 80 ? "bg-green-500" : accuracy >= 50 ? "bg-yellow-400" : "bg-red-400";
  const message =
    accuracy >= 80
      ? "Excellent work! Your vocabulary is growing."
      : accuracy >= 50
      ? "Good effort — keep practicing."
      : "Keep going — repetition builds mastery.";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-10 pb-10"
      style={{ background: "linear-gradient(160deg, #22c55e 0%, #16a34a 100%)" }}
      data-testid="results-page"
    >
      <div className="w-full max-w-sm flex flex-col gap-4">

        {/* Score hero */}
        <div className="bg-white rounded-3xl shadow-xl px-6 py-7 flex flex-col items-center gap-3">
          <div className={`text-6xl font-black ${ringColor}`} data-testid="text-accuracy">
            {accuracy}%
          </div>
          <p className="text-gray-800 font-bold text-xl">Session Complete</p>
          <p className="text-gray-500 text-sm text-center">{message}</p>
          <div className="w-full bg-gray-100 rounded-full h-3 mt-1">
            <div
              className={`h-3 rounded-full transition-all ${barColor}`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-blue-500" />}
            label="Total Cards"
            value={String(total)}
            testId="stat-total"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
            label="Correct"
            value={String(correctCount)}
            testId="stat-correct"
          />
          <StatCard
            icon={<XCircle className="w-5 h-5 text-red-400" />}
            label="Wrong"
            value={String(wrongCount)}
            testId="stat-wrong"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
            label="Accuracy"
            value={`${accuracy}%`}
            testId="stat-accuracy"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5 text-orange-400" />}
            label="Missed Cards"
            value={String(missedResults.length)}
            testId="stat-missed-cards"
          />
          <StatCard
            icon={<Target className="w-5 h-5 text-rose-500" />}
            label="Missed Words"
            value={String(missedWords.length)}
            testId="stat-missed-words"
          />
        </div>

        {/* Missed words chips */}
        {missedWords.length > 0 && (
          <div className="bg-white/90 rounded-3xl px-5 py-4">
            <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-500" />
              Words to Review
            </p>
            <div className="flex flex-wrap gap-2">
              {missedWords.map((word) => (
                <span
                  key={word}
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-xl"
                  data-testid={`missed-word-${word}`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missed cards list */}
        {missedResults.length > 0 && (
          <div className="bg-white/90 rounded-3xl overflow-hidden">
            <button
              data-testid="button-toggle-missed"
              onClick={() => setShowMissed((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <XCircle className="w-4 h-4 text-red-400" />
                Missed Cards ({missedResults.length})
              </span>
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform ${showMissed ? "rotate-90" : ""}`}
              />
            </button>

            {showMissed && (
              <div className="border-t border-gray-100 divide-y divide-gray-100">
                {missedResults.map((r, i) => (
                  <MissedCardRow key={i} result={r} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-1">
          {missedCards.length > 0 && (
            <button
              data-testid="button-review-missed"
              onClick={() => onReviewMissed(missedCards)}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-red-600 font-bold rounded-2xl py-4 shadow-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Review Missed Cards
            </button>
          )}
          <button
            data-testid="button-new-session"
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-green-700 font-bold rounded-2xl py-4 shadow-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Start New Session
          </button>
          <button
            data-testid="button-back-setup"
            onClick={onBackToSetup}
            className="w-full flex items-center justify-center gap-2 bg-white/30 hover:bg-white/40 text-white font-semibold rounded-2xl py-4 transition-colors"
          >
            <Settings2 className="w-5 h-5" />
            Back to Setup
          </button>
        </div>

      </div>
    </div>
  );
}

function MissedCardRow({ result, index }: { result: CardResult; index: number }) {
  return (
    <div className="px-5 py-4 flex flex-col gap-2" data-testid={`missed-card-${index}`}>
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getPillStyle(result.card.cardType)}`}>
          {result.card.cardType}
        </span>
        <span className="text-xs text-gray-400">{result.card.sourceStatus}</span>
      </div>

      {/* Prompt */}
      <p className="text-sm font-semibold text-gray-800">
        {result.card.cardType === "Definition"
          ? result.card.promptText.length > 80
            ? result.card.promptText.slice(0, 80) + "…"
            : result.card.promptText
          : `"${result.card.promptText}"`}
      </p>

      {/* Relationship */}
      <p className="text-xs text-gray-500 italic">{getRelationship(result.card)}</p>

      {/* Answers */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-lg">
          <XCircle className="w-3.5 h-3.5" />
          You chose: {result.chosen}
        </span>
        <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
        <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Correct: {result.card.correctWord}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
      {icon}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-black text-gray-900" data-testid={testId}>
          {value}
        </p>
      </div>
    </div>
  );
}
