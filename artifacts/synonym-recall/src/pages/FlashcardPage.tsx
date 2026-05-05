import { useState, useCallback } from "react";
import { ArrowLeft, Volume2, Lightbulb, CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { flashcards, shuffleCards, type FlashCard } from "@/data/flashcards";

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

function getPillColor(cardType: FlashCard["cardType"]): string {
  switch (cardType) {
    case "Definition":
      return "bg-blue-100 text-blue-700";
    case "Synonym":
      return "bg-green-100 text-green-700";
    case "Antonym":
      return "bg-orange-100 text-orange-700";
  }
}

function speak(text: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }
}

function getShuffledChoices(card: FlashCard): [string, string] {
  return Math.random() > 0.5
    ? [card.targetWord, card.wrongChoice]
    : [card.wrongChoice, card.targetWord];
}

export default function FlashcardPage() {
  const [deck, setDeck] = useState<FlashCard[]>(() => shuffleCards(flashcards));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [choices, setChoices] = useState<[string, string]>(() =>
    getShuffledChoices(shuffleCards(flashcards)[0])
  );
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  const card = deck[currentIndex];
  const total = deck.length;

  const handleAnswer = useCallback(
    (chosen: string) => {
      if (answerState !== "unanswered") return;
      setSelectedAnswer(chosen);
      const isCorrect = chosen === card.targetWord;
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
    setChoices(getShuffledChoices(deck[nextIndex]));
  }, [currentIndex, total, deck]);

  const handleRestart = useCallback(() => {
    const reshuffled = shuffleCards(flashcards);
    setDeck(reshuffled);
    setCurrentIndex(0);
    setAnswerState("unanswered");
    setSelectedAnswer(null);
    setShowHint(false);
    setChoices(getShuffledChoices(reshuffled[0]));
    setScore({ correct: 0, total: 0 });
    setFinished(false);
  }, []);

  if (finished) {
    const pct = Math.round((score.correct / score.total) * 100);
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #22c55e 0%, #16a34a 100%)" }}
        data-testid="finished-screen"
      >
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6">
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
          <button
            data-testid="button-restart"
            onClick={handleRestart}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold rounded-2xl py-4 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex) / total) * 100;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-0"
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
          {/* Shadow cards behind */}
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
            className="relative bg-white rounded-3xl shadow-xl px-6 pt-6 pb-6 flex flex-col items-center gap-4"
            style={{ zIndex: 2, minHeight: "280px" }}
            data-testid="flashcard"
          >
            {/* Pill label */}
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${getPillColor(card.cardType)}`}
              data-testid="text-card-type"
            >
              {card.cardType}
            </span>

            {/* Card content */}
            <div className="flex-1 flex items-center justify-center w-full">
              <p
                className={`text-center font-bold text-gray-900 leading-snug ${
                  card.cardType === "Definition"
                    ? "text-base font-normal text-gray-700"
                    : "text-3xl"
                }`}
                data-testid="text-card-content"
              >
                {card.content}
              </p>
            </div>

            {/* Hint tooltip */}
            {showHint && (
              <div
                className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-amber-800 text-sm text-center"
                data-testid="text-hint"
              >
                {card.hint}
              </div>
            )}

            {/* Icon buttons */}
            <div className="flex gap-4 mt-1">
              <button
                data-testid="button-speaker"
                onClick={() => speak(card.content)}
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

        {/* Question prompt */}
        <p className="text-white text-center text-base font-medium mb-5" data-testid="text-question">
          {getQuestionPrompt(card)}
        </p>

        {/* Answer buttons */}
        {answerState === "unanswered" ? (
          <div className="flex items-center gap-3">
            <AnswerButton
              word={choices[0]}
              state="unanswered"
              isCorrect={choices[0] === card.targetWord}
              onClick={() => handleAnswer(choices[0])}
              testId="button-choice-0"
            />
            <span className="text-white font-semibold text-sm shrink-0">or</span>
            <AnswerButton
              word={choices[1]}
              state="unanswered"
              isCorrect={choices[1] === card.targetWord}
              onClick={() => handleAnswer(choices[1])}
              testId="button-choice-1"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Feedback */}
            <div
              className={`flex items-center gap-2 justify-center rounded-2xl px-4 py-3 ${
                answerState === "correct"
                  ? "bg-green-900/30"
                  : "bg-red-900/30"
              }`}
              data-testid="text-feedback"
            >
              {answerState === "correct" ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-200 shrink-0" />
                  <span className="text-green-100 font-semibold text-sm">
                    Correct! The answer is{" "}
                    <span className="font-bold">{card.targetWord}</span>
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-200 shrink-0" />
                  <span className="text-red-100 font-semibold text-sm">
                    Incorrect. The correct answer is{" "}
                    <span className="font-bold">{card.targetWord}</span>
                  </span>
                </>
              )}
            </div>

            {/* Revealed choices */}
            <div className="flex items-center gap-3">
              <RevealedChoice
                word={choices[0]}
                isCorrect={choices[0] === card.targetWord}
                isSelected={selectedAnswer === choices[0]}
              />
              <span className="text-white font-semibold text-sm shrink-0">or</span>
              <RevealedChoice
                word={choices[1]}
                isCorrect={choices[1] === card.targetWord}
                isSelected={selectedAnswer === choices[1]}
              />
            </div>

            {/* Next card button */}
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

        {/* Score indicator */}
        <div className="mt-auto pt-6 flex justify-center gap-6">
          <div className="text-center">
            <p className="text-white/60 text-xs">Correct</p>
            <p className="text-white font-bold text-lg" data-testid="text-score-correct">{score.correct}</p>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-xs">Attempted</p>
            <p className="text-white font-bold text-lg" data-testid="text-score-total">{score.total}</p>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-xs">Remaining</p>
            <p className="text-white font-bold text-lg" data-testid="text-score-remaining">{total - currentIndex}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnswerButton({
  word,
  onClick,
  testId,
}: {
  word: string;
  state: AnswerState;
  isCorrect: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className="flex-1 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 font-semibold rounded-2xl py-4 px-3 text-sm shadow-md transition-all active:scale-95"
    >
      {word}
    </button>
  );
}

function RevealedChoice({
  word,
  isCorrect,
  isSelected,
}: {
  word: string;
  isCorrect: boolean;
  isSelected: boolean;
}) {
  let className = "flex-1 rounded-2xl py-4 px-3 text-sm font-semibold text-center ";
  if (isCorrect) {
    className += "bg-green-500 text-white shadow-md";
  } else if (isSelected && !isCorrect) {
    className += "bg-red-400 text-white shadow-md";
  } else {
    className += "bg-white/30 text-white/70";
  }
  return <div className={className}>{word}</div>;
}
