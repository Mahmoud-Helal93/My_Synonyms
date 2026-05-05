import { useState, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Volume2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Flag,
  RotateCcw,
  Settings2,
  BookOpen,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { type FlashCard } from "@/data/flashcards";
import { type SessionConfig } from "@/types/session";
import { buildSession } from "@/utils/filterCards";

type AnswerState = "unanswered" | "correct" | "incorrect";

interface CardResult {
  card: FlashCard;
  correct: boolean;
  chosen: string;
}

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
  const [results, setResults] = useState<CardResult[]>([]);
  const [finished, setFinished] = useState(false);

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
    },
    [answerState, card]
  );

  const handleNext = useCallback(() => {
    if (isLastCard) {
      setFinished(true);
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setAnswerState("unanswered");
    setSelectedAnswer(null);
    setShowHint(false);
    setChoices(buildChoices(deck[nextIndex]));
  }, [currentIndex, isLastCard, deck]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setAnswerState("unanswered");
    setSelectedAnswer(null);
    setShowHint(false);
    setChoices(buildChoices(deck[0]));
    setResults([]);
    setFinished(false);
  }, [deck]);

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
    return (
      <ResultsScreen
        results={results}
        correctCount={correctCount}
        wrongCount={wrongCount}
        accuracy={accuracy}
        total={total}
        onRestart={handleRestart}
        onBack={onBack}
      />
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
                  "flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-4 px-3 text-sm font-semibold transition-all ";
                if (isCorrect) {
                  cls += "bg-green-500 text-white shadow-md";
                } else if (isSelected) {
                  cls += "bg-red-400 text-white shadow-md";
                } else {
                  cls += "bg-white/30 text-white/70";
                }
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
                <p
                  className="text-white/80 text-sm mt-0.5"
                  data-testid="text-explanation"
                >
                  {getExplanation(card)}
                </p>
              </div>
            </div>

            {/* Next / Finish button */}
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

/* ───────── Results Screen ───────── */

interface ResultsProps {
  results: CardResult[];
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  total: number;
  onRestart: () => void;
  onBack: () => void;
}

function ResultsScreen({
  results,
  correctCount,
  wrongCount,
  accuracy,
  total,
  onRestart,
  onBack,
}: ResultsProps) {
  const missedCards = results.filter((r) => !r.correct);
  const missedWords = [...new Set(missedCards.map((r) => r.card.targetWord))];
  const [showMissed, setShowMissed] = useState(false);

  const ringColor =
    accuracy >= 80 ? "text-green-500" : accuracy >= 50 ? "text-yellow-500" : "text-red-400";
  const message =
    accuracy >= 80
      ? "Excellent work!"
      : accuracy >= 50
      ? "Good effort — keep going!"
      : "Keep practicing — repetition builds mastery.";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-10 pb-10"
      style={{ background: "linear-gradient(160deg, #22c55e 0%, #16a34a 100%)" }}
      data-testid="finished-screen"
    >
      <div className="w-full max-w-sm flex flex-col gap-4">

        {/* Score ring */}
        <div className="bg-white rounded-3xl shadow-xl px-6 py-7 flex flex-col items-center gap-3">
          <div className={`text-6xl font-black ${ringColor}`}>{accuracy}%</div>
          <p className="text-gray-800 font-bold text-xl">Session Complete</p>
          <p className="text-gray-500 text-sm text-center">{message}</p>
          <div className="w-full bg-gray-100 rounded-full h-3 mt-1">
            <div
              className={`h-3 rounded-full transition-all ${
                accuracy >= 80
                  ? "bg-green-500"
                  : accuracy >= 50
                  ? "bg-yellow-400"
                  : "bg-red-400"
              }`}
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
            bg="bg-white"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
            label="Correct"
            value={String(correctCount)}
            bg="bg-white"
          />
          <StatCard
            icon={<XCircle className="w-5 h-5 text-red-400" />}
            label="Wrong"
            value={String(wrongCount)}
            bg="bg-white"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
            label="Accuracy"
            value={`${accuracy}%`}
            bg="bg-white"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5 text-orange-400" />}
            label="Missed Cards"
            value={String(missedCards.length)}
            bg="bg-white"
          />
          <StatCard
            icon={<Target className="w-5 h-5 text-rose-500" />}
            label="Missed Words"
            value={String(missedWords.length)}
            bg="bg-white"
          />
        </div>

        {/* Missed cards section */}
        {missedCards.length > 0 && (
          <div className="bg-white/90 rounded-3xl overflow-hidden">
            <button
              data-testid="button-toggle-missed"
              onClick={() => setShowMissed((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-gray-800"
            >
              <span className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                Missed Cards ({missedCards.length})
              </span>
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform ${showMissed ? "rotate-90" : ""}`}
              />
            </button>

            {showMissed && (
              <div className="border-t border-gray-100 px-5 pb-4 flex flex-col gap-3 mt-1">
                {missedCards.map((r, i) => (
                  <div key={i} className="flex flex-col gap-0.5" data-testid={`missed-card-${i}`}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getPillStyle(r.card.cardType)}`}
                      >
                        {r.card.cardType}
                      </span>
                      <span className="text-xs text-gray-400">{r.card.sourceStatus}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {r.card.cardType === "Definition"
                        ? r.card.promptText.length > 60
                          ? r.card.promptText.slice(0, 60) + "…"
                          : r.card.promptText
                        : `"${r.card.promptText}"`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getExplanation(r.card)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Missed target words */}
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

        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            data-testid="button-restart"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 font-bold rounded-2xl py-4 shadow-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Restart Session
          </button>
          <button
            data-testid="button-change-filters"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 bg-white/30 hover:bg-white/40 text-white font-semibold rounded-2xl py-4 transition-colors"
          >
            <Settings2 className="w-5 h-5" />
            Change Filters
          </button>
        </div>

      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm`}>
      {icon}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}
