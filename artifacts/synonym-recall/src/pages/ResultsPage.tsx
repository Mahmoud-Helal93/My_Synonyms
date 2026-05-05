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
    case "Definition": return "bg-blue-100 text-blue-700";
    case "Synonym":    return "bg-emerald-100 text-emerald-700";
    case "Antonym":    return "bg-orange-100 text-orange-700";
  }
}

function getRelationship(card: FlashCard): string {
  switch (card.cardType) {
    case "Synonym":    return `${card.relatedItem} → ${card.correctWord}`;
    case "Antonym":    return `${card.relatedItem} is an antonym of ${card.correctWord}`;
    case "Definition": return `Definition of ${card.correctWord}`;
  }
}

export default function ResultsPage({ results, onReviewMissed, onNewSession, onBackToSetup }: Props) {
  const [showMissed, setShowMissed] = useState(true);

  const total        = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const wrongCount   = results.filter((r) => !r.correct).length;
  const accuracy     = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const missedResults = results.filter((r) => !r.correct);
  const missedCards   = missedResults.map((r) => r.card);
  const missedWords   = [...new Set(missedCards.map((c) => c.targetWord))];

  const ringColor =
    accuracy >= 80 ? "text-green-500" : accuracy >= 50 ? "text-yellow-400" : "text-red-400";
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
      className="min-h-screen flex flex-col items-center px-4 pt-10 pb-10 animate-fade-in"
      style={{ background: "linear-gradient(160deg,#22c55e 0%,#16a34a 100%)" }}
      data-testid="results-page"
    >
      <div className="w-full max-w-sm flex flex-col gap-4">

        {/* Score hero */}
        <div className="bg-white rounded-3xl shadow-xl px-6 py-8 flex flex-col items-center gap-3 animate-scale-in">
          <div className={`text-7xl font-black tabular-nums ${ringColor}`} data-testid="text-accuracy">
            {accuracy}%
          </div>
          <p className="text-gray-800 font-bold text-xl">Session Complete</p>
          <p className="text-gray-400 text-sm text-center">{message}</p>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mt-1 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <BookOpen    className="w-5 h-5 text-blue-500" />,   label: "Total Cards",   value: total,           id: "stat-total" },
            { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, label: "Correct",       value: correctCount,    id: "stat-correct" },
            { icon: <XCircle     className="w-5 h-5 text-red-400" />,    label: "Wrong",         value: wrongCount,      id: "stat-wrong" },
            { icon: <TrendingUp  className="w-5 h-5 text-purple-500" />, label: "Accuracy",      value: `${accuracy}%`,  id: "stat-accuracy" },
            { icon: <AlertCircle className="w-5 h-5 text-orange-400" />, label: "Missed Cards",  value: missedResults.length, id: "stat-missed-cards" },
            { icon: <Target      className="w-5 h-5 text-rose-500" />,   label: "Missed Words",  value: missedWords.length,   id: "stat-missed-words" },
          ].map(({ icon, label, value, id }) => (
            <div key={id} className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
              {icon}
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-lg font-black text-gray-900 tabular-nums" data-testid={id}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Words to review */}
        {missedWords.length > 0 && (
          <div className="bg-white/90 rounded-3xl px-5 py-4">
            <p className="text-sm font-bold text-gray-700 mb-2.5 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-500" />
              Words to Review
            </p>
            <div className="flex flex-wrap gap-2">
              {missedWords.map((word) => (
                <span key={word}
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-xl"
                  data-testid={`missed-word-${word}`}>
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
              className="w-full flex items-center justify-between px-5 py-4">
              <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <XCircle className="w-4 h-4 text-red-400" />
                Missed Cards ({missedResults.length})
              </span>
              <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${showMissed ? "rotate-90" : ""}`} />
            </button>

            {showMissed && (
              <div className="border-t border-gray-100 divide-y divide-gray-100 animate-fade-up">
                {missedResults.map((r, i) => (
                  <div key={i} className="px-5 py-4 flex flex-col gap-2.5" data-testid={`missed-card-${i}`}>
                    {/* Type + status */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getPillStyle(r.card.cardType)}`}>
                        {r.card.cardType}
                      </span>
                      <span className="text-xs text-gray-400">{r.card.sourceStatus}</span>
                    </div>

                    {/* Prompt */}
                    <p className="text-sm font-semibold text-gray-800">
                      {r.card.cardType === "Definition"
                        ? r.card.promptText.length > 80
                          ? r.card.promptText.slice(0, 80) + "…"
                          : r.card.promptText
                        : `"${r.card.promptText}"`}
                    </p>

                    {/* Relationship */}
                    <p className="text-xs text-gray-400 italic">{getRelationship(r.card)}</p>

                    {/* Answer comparison */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 bg-red-50 text-red-500 text-xs font-medium px-2.5 py-1 rounded-lg">
                        <XCircle className="w-3.5 h-3.5" />
                        {r.chosen}
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {r.card.correctWord}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5 mt-1">
          {missedCards.length > 0 && (
            <button data-testid="button-review-missed"
              onClick={() => onReviewMissed(missedCards)}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-red-600 font-bold rounded-2xl py-4 shadow-lg transition-all active:scale-[0.98] active:shadow-md">
              <RotateCcw className="w-5 h-5" />
              Review Missed Cards
            </button>
          )}
          <button data-testid="button-new-session"
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 font-bold rounded-2xl py-4 shadow-lg transition-all active:scale-[0.98] active:shadow-md">
            <RotateCcw className="w-5 h-5" />
            Start New Session
          </button>
          <button data-testid="button-back-setup"
            onClick={onBackToSetup}
            className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-2xl py-4 transition-all active:scale-[0.98]">
            <Settings2 className="w-5 h-5" />
            Back to Setup
          </button>
        </div>

      </div>
    </div>
  );
}
