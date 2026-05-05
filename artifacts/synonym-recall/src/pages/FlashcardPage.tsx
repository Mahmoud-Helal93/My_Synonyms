import { useState, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Volume2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { type FlashCard } from "@/data/flashcards";
import { type SessionConfig } from "@/types/session";
import { buildSession } from "@/utils/filterCards";

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
  onBack: () => void;
}

export default function FlashcardPage({ config, onBack }: Props) {
  const deck = useMemo(() => buildSession(config), [config]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [choices, setChoices] = useState<[string, string]>(() =>
    deck.length > 0 ? buildChoices(deck[0]) : ["—", "—"]
  );
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  const total = deck.length;
  const card = deck[currentIndex];

  const handleAnswer = useCallback(
    (chosen: string) => {
      if (answerState !== "unanswered") return;
      setSelectedAnswer(chosen);
      const isCorrect = chosen === card.correctWord;
      setAnswerState(isCorrect ? "correct" : "incorrect");
      setScore((s) => ({
        correct: s.correct + (isCorrect ? 1 : 0),
        total: s.total + 1,
      }));
    },
    [answerState, card]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setFinished(true);
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setAnswerState("unanswered");
    setSelectedAnswer(null);
    setShowHint(false);
    setChoices(buildChoices(deck[nextIndex]));
  }, [currentIndex, total, deck]);

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

  if (finished) {
    const pct = Math.round((score.correct / score.total) * 100);
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #22c55e 0%, #16a34a 100%)" }}
        data-testid="finished-screen"
      >
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5">
          <div className="text-5xl font-black text-green-600">{pct}%</div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">Session Complete!</p>
            <p className="mt-1 text-gray-500 text-sm">
              {score.correct} correct out of {score.total} cards
            </p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-gray-500 text-sm text-center">
            {pct >= 80
              ? "Excellent work! Your vocabulary is growing."
              : pct >= 50
              ? "Good effort! Keep practicing these words."
              : "Keep going — repetition builds mastery."}
          </p>
          <div className="flex flex-col gap-2 w-full">
            <button
              data-testid="button-restart"
              onClick={() => {
                setCurrentIndex(0);
                setAnswerState("unanswered");
                setSelectedAnswer(null);
                setShowHint(false);
                setChoices(buildChoices(deck[0]));
                setScore({ correct: 0, total: 0 });
                setFinished(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl py-3.5 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Restart Session
            </button>
            <button
              data-testid="button-change-filters"
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 border-2 border-green-200 text-green-700 font-semibold rounded-2xl py-3.5 hover:bg-green-50 transition-colors"
            >
              <Settings2 className="w-5 h-5" />
              Change Filters
            </button>
          </div>
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
        <div className="flex items-center justify-between py-4">
          <button
            data-testid="button-back"
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-white/80 text-sm font-medium" data-testid="text-progress">
            {currentIndex + 1} / {total}
          </span>
          <div className="w-9 h-9" />
        </div>

        {/* Stacked card effect */}
        <div className="relative mt-2 mb-6">
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
            className="relative bg-white rounded-3xl shadow-xl px-6 pt-6 pb-6 flex flex-col items-center gap-3"
            style={{ zIndex: 2, minHeight: "290px" }}
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
            <div className="flex gap-4 mt-1">
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
                <Lightbulb className={`w-5 h-5 ${showHint ? "text-amber-500" : "text-gray-600"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Question */}
        <p className="text-white text-center text-base font-medium mb-5" data-testid="text-question">
          {getQuestionPrompt(card)}
        </p>

        {/* Answer buttons */}
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
            {/* Feedback banner */}
            <div
              className={`flex items-center gap-2 justify-center rounded-2xl px-4 py-3 ${
                answerState === "correct" ? "bg-green-900/30" : "bg-red-900/30"
              }`}
              data-testid="text-feedback"
            >
              {answerState === "correct" ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-200 shrink-0" />
                  <span className="text-green-100 font-semibold text-sm">
                    Correct! The answer is{" "}
                    <span className="font-bold">{card.correctWord}</span>
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-200 shrink-0" />
                  <span className="text-red-100 font-semibold text-sm">
                    Incorrect. The correct answer is{" "}
                    <span className="font-bold">{card.correctWord}</span>
                  </span>
                </>
              )}
            </div>

            {/* Revealed choices */}
            <div className="flex items-center gap-3">
              {choices.map((word, i) => {
                const isCorrect = word === card.correctWord;
                const isSelected = selectedAnswer === word;
                let cls = "flex-1 rounded-2xl py-4 px-3 text-sm font-semibold text-center ";
                if (isCorrect) cls += "bg-green-500 text-white shadow-md";
                else if (isSelected) cls += "bg-red-400 text-white shadow-md";
                else cls += "bg-white/30 text-white/70";
                return (
                  <div key={i} className={cls}>
                    {word}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 -mt-[3.4rem] pointer-events-none">
              <div className="flex-1" />
              <span className="text-white font-semibold text-sm shrink-0">or</span>
              <div className="flex-1" />
            </div>

            {/* Next card */}
            <button
              data-testid="button-next"
              onClick={handleNext}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-green-700 font-bold rounded-2xl py-4 transition-colors shadow-lg"
            >
              {currentIndex + 1 >= total ? "See Results" : "Next Card"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Score footer */}
        <div className="mt-auto pt-6 flex justify-center gap-6">
          <div className="text-center">
            <p className="text-white/60 text-xs">Correct</p>
            <p className="text-white font-bold text-lg" data-testid="text-score-correct">
              {score.correct}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-xs">Attempted</p>
            <p className="text-white font-bold text-lg" data-testid="text-score-total">
              {score.total}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-xs">Remaining</p>
            <p className="text-white font-bold text-lg" data-testid="text-score-remaining">
              {total - currentIndex}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
