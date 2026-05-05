import { useState, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Volume2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Flag,
  Settings2,
} from "lucide-react";
import { type FlashCard } from "@/data/flashcards";
import { type SessionConfig, type CardResult } from "@/types/session";
import { buildSession } from "@/utils/filterCards";
import { loadProgress, recordAnswer, saveProgress } from "@/utils/progress";

type AnswerState = "unanswered" | "correct" | "incorrect";

function getQuestionPrompt(card: FlashCard): string {
  switch (card.cardType) {
    case "Definition":
      return "This card is a definition to...";
    case "Synonym":
      return "This card is a synonym to...";
    case "Antonym":
      return "This card is an antonym to...";
  }
}

function getExplanation(card: FlashCard): string {
  switch (card.cardType) {
    case "Synonym":
      return `"${card.relatedItem}" is a synonym of ${card.correctWord}.`;
    case "Antonym":
      return `"${card.relatedItem}" is an antonym of ${card.correctWord}.`;
    case "Definition":
      return `This definition belongs to ${card.correctWord}.`;
  }
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

function getStatusBadgeStyle(status: FlashCard["sourceStatus"]): string {
  return status === "New"
    ? "bg-purple-100 text-purple-700"
    : "bg-gray-100 text-gray-500";
}

function speak(text: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }
}

function buildChoices(card: FlashCard): [string, string] {
  return Math.random() > 0.5
    ? [card.correctWord, card.incorrectWord]
    : [card.incorrectWord, card.correctWord];
}

interface Props {
  config: SessionConfig;
  prebuiltDeck?: FlashCard[];
  onBack: () => void;
  onFinish: (results: CardResult[]) => void;
}

export default function FlashcardPage({ config, prebuiltDeck, onBack, onFinish }: Props) {
  const builtDeck = useMemo(() => buildSession(config), [config]);
  const deck = prebuiltDeck ?? builtDeck;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [choices, setChoices] = useState<[string, string]>(() =>
    deck.length > 0 ? buildChoices(deck[0]) : ["—", "—"]
  );
  const [results, setResults] = useState<CardResult[]>([]);
  const [progressStore, setProgressStore] = useState(() => loadProgress());

  const total = deck.length;
  const card = deck[currentIndex];
  const isLastCard = currentIndex + 1 >= total;

  const correctCount = results.filter((r) => r.correct).length;
  const wrongCount = results.filter((r) => !r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  const handleAnswer = useCallback(
    (chosen: string) => {
      if (answerState !== "unanswered") return;
      setSelectedAnswer(chosen);
      const isCorrect = chosen === card.correctWord;
      setAnswerState(isCorrect ? "correct" : "incorrect");
      setResults((prev) => [...prev, { card, correct: isCorrect, chosen }]);
      setProgressStore((prev) => {
        const updated = recordAnswer(prev, card.id, isCorrect);
        saveProgress(updated);
        return updated;
      });
    },
    [answerState, card]
  );

  const handleNext = useCallback(() => {
    if (isLastCard) {
      onFinish([...results, { card, correct: selectedAnswer === card.correctWord, chosen: selectedAnswer ?? "" }]);
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setAnswerState("unanswered");
    setSelectedAnswer(null);
    setShowHint(false);
    setChoices(buildChoices(deck[nextIndex]));
  }, [isLastCard, currentIndex, deck, results, card, selectedAnswer, onFinish]);

  if (total === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #22c55e 0%, #16a34a 100%)" }}
      >
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 text-center">
          <p className="text-2xl font-bold text-gray-900">No Cards Found</p>
          <p className="text-gray-500 text-sm">
            Your current filters returned no cards. Try adjusting them.
          </p>
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold rounded-2xl py-4"
          >
            <Settings2 className="w-5 h-5" />
            Change Filters
          </button>
        </div>
      </div>
    );
  }

  const progress = (currentIndex / total) * 100;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start"
      style={{ background: "linear-gradient(160deg, #22c55e 0%, #16a34a 100%)" }}
      data-testid="flashcard-page"
    >
      <div className="w-full max-w-sm px-4 flex flex-col min-h-screen pb-8">
        {/* Progress bar */}
        <div className="pt-4 pb-1">
          <div className="w-full bg-green-700/40 rounded-full h-1.5">
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>

        {/* Top nav */}
        <div className="flex items-center justify-between py-3">
          <button
            data-testid="button-back"
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-sm" data-testid="text-progress">
              Card {currentIndex + 1} / {total}
            </span>
            {results.length > 0 && (
              <span className="text-white/60 text-xs">
                {correctCount}✓ {wrongCount}✗
              </span>
            )}
          </div>

          <div className="w-9 h-9" />
        </div>

        {/* Stacked card effect */}
        <div className="relative mt-1 mb-5">
          <div
            className="absolute inset-x-0 top-2 mx-4 bg-white/50 rounded-3xl"
            style={{ height: "100%", zIndex: 0 }}
          />
          <div
            className="absolute inset-x-0 top-1 mx-2 bg-white/70 rounded-3xl"
            style={{ height: "100%", zIndex: 1 }}
          />

          {/* Main card */}
          <div
            className="relative bg-white rounded-3xl shadow-xl px-6 pt-5 pb-5 flex flex-col items-center gap-3"
            style={{ zIndex: 2, minHeight: "270px" }}
            data-testid="flashcard"
          >
            {/* Pill + status */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${getPillStyle(card.cardType)}`}
                data-testid="text-card-type"
              >
                {card.cardType}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadgeStyle(card.sourceStatus)}`}
                data-testid="text-card-status"
              >
                {card.sourceStatus}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center w-full">
              <p
                className={`text-center font-bold text-gray-900 leading-snug ${
                  card.cardType === "Definition"
                    ? "text-sm font-normal text-gray-700"
                    : "text-3xl"
                }`}
                data-testid="text-card-content"
              >
                {card.promptText}
              </p>
            </div>

            {/* Hint */}
            {showHint && (
              <div
                className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-amber-800 text-sm text-center"
                data-testid="text-hint"
              >
                {card.cardType === "Synonym"
                  ? `"${card.promptText}" means similar to ${card.correctWord}`
                  : card.cardType === "Antonym"
                  ? `"${card.promptText}" means the opposite of ${card.correctWord}`
                  : `Think about which word matches this definition`}
              </div>
            )}

            {/* Icon buttons */}
            <div className="flex gap-4">
              <button
                data-testid="button-speaker"
                onClick={() => speak(card.promptText)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                <Volume2 className="w-5 h-5 text-gray-600" />
              </button>
              <button
                data-testid="button-hint"
                onClick={() => setShowHint((v) => !v)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                  showHint
                    ? "bg-amber-100 hover:bg-amber-200"
                    : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                }`}
              >
                <Lightbulb
                  className={`w-5 h-5 ${showHint ? "text-amber-500" : "text-gray-600"}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Question */}
        <p
          className="text-white text-center text-base font-medium mb-4"
          data-testid="text-question"
        >
          {getQuestionPrompt(card)}
        </p>

        {/* Answer area */}
        {answerState === "unanswered" ? (
          <div className="flex items-center gap-3">
            <button
              data-testid="button-choice-0"
              onClick={() => handleAnswer(choices[0])}
              className="flex-1 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 font-semibold rounded-2xl py-4 px-3 text-sm shadow-md transition-all active:scale-95"
            >
              {choices[0]}
            </button>
            <span className="text-white font-semibold text-sm shrink-0">or</span>
            <button
              data-testid="button-choice-1"
              onClick={() => handleAnswer(choices[1])}
              className="flex-1 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 font-semibold rounded-2xl py-4 px-3 text-sm shadow-md transition-all active:scale-95"
            >
              {choices[1]}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Revealed choice buttons */}
            <div className="flex items-center gap-3">
              {choices.map((word, i) => {
                const isCorrect = word === card.correctWord;
                const isSelected = selectedAnswer === word;
                let cls =
                  "flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-4 px-3 text-sm font-semibold ";
                if (isCorrect) cls += "bg-green-500 text-white shadow-md";
                else if (isSelected) cls += "bg-red-400 text-white shadow-md";
                else cls += "bg-white/30 text-white/70";
                return (
                  <div key={i} className={cls} data-testid={`result-choice-${i}`}>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    {isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0" />}
                    {word}
                  </div>
                );
              })}
            </div>

            {/* "or" overlay */}
            <div className="flex items-center gap-3 -mt-[3.4rem] pointer-events-none">
              <div className="flex-1" />
              <span className="text-white font-semibold text-sm shrink-0">or</span>
              <div className="flex-1" />
            </div>

            {/* Explanation */}
            <div
              className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 ${
                answerState === "correct" ? "bg-green-900/30" : "bg-red-900/30"
              }`}
              data-testid="text-feedback"
            >
              {answerState === "correct" ? (
                <CheckCircle2 className="w-5 h-5 text-green-200 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-200 shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-semibold text-sm ${
                    answerState === "correct" ? "text-green-100" : "text-red-100"
                  }`}
                >
                  {answerState === "correct" ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-white/80 text-sm mt-0.5" data-testid="text-explanation">
                  {getExplanation(card)}
                </p>
              </div>
            </div>

            {/* Next / Finish */}
            <button
              data-testid={isLastCard ? "button-finish" : "button-next"}
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-green-700 font-bold rounded-2xl py-4 transition-colors shadow-lg"
            >
              {isLastCard ? (
                <>
                  <Flag className="w-5 h-5" />
                  Finish Session
                </>
              ) : (
                <>
                  Next Card
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Live score footer */}
        <div className="mt-auto pt-5 flex justify-center gap-6">
          <div className="text-center">
            <p className="text-white/60 text-xs">Correct</p>
            <p className="text-white font-bold text-lg" data-testid="text-score-correct">
              {correctCount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-xs">Wrong</p>
            <p className="text-white font-bold text-lg" data-testid="text-score-wrong">
              {wrongCount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-xs">Accuracy</p>
            <p className="text-white font-bold text-lg" data-testid="text-score-accuracy">
              {results.length > 0 ? `${accuracy}%` : "—"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-xs">Remaining</p>
            <p className="text-white font-bold text-lg" data-testid="text-score-remaining">
              {total - currentIndex - (answerState !== "unanswered" ? 1 : 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
