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
    case "Definition": return "This card is a definition to...";
    case "Synonym":    return "This card is a synonym to...";
    case "Antonym":    return "This card is an antonym to...";
  }
}

function getExplanation(card: FlashCard): string {
  switch (card.cardType) {
    case "Synonym":    return `"${card.relatedItem}" is a synonym of ${card.correctWord}.`;
    case "Antonym":    return `"${card.relatedItem}" is an antonym of ${card.correctWord}.`;
    case "Definition": return `This definition belongs to ${card.correctWord}.`;
  }
}

function getPillStyle(cardType: FlashCard["cardType"]): string {
  switch (cardType) {
    case "Definition": return "bg-blue-100 text-blue-700";
    case "Synonym":    return "bg-emerald-100 text-emerald-700";
    case "Antonym":    return "bg-orange-100 text-orange-700";
  }
}

function getStatusBadgeStyle(status: FlashCard["sourceStatus"]): string {
  return status === "New"
    ? "bg-violet-100 text-violet-600"
    : "bg-gray-100 text-gray-400";
}

function speak(text: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
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
  const [, setProgressStore] = useState(() => loadProgress());

  const total       = deck.length;
  const card        = deck[currentIndex];
  const isLastCard  = currentIndex + 1 >= total;
  const correctCount = results.filter((r) => r.correct).length;
  const wrongCount   = results.filter((r) => !r.correct).length;
  const accuracy     = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  const handleAnswer = useCallback(
    (chosen: string) => {
      if (answerState !== "unanswered") return;
      const isCorrect = chosen === card.correctWord;
      setSelectedAnswer(chosen);
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
      onFinish(results);
      return;
    }
    const next = currentIndex + 1;
    setCurrentIndex(next);
    setAnswerState("unanswered");
    setSelectedAnswer(null);
    setShowHint(false);
    setChoices(buildChoices(deck[next]));
  }, [isLastCard, currentIndex, deck, results, onFinish]);

  if (total === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg,#22c55e 0%,#16a34a 100%)" }}>
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 text-center animate-scale-in">
          <p className="text-2xl font-bold text-gray-900">No Cards Found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
          <button onClick={onBack}
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold rounded-2xl py-4 transition-all active:scale-95">
            <Settings2 className="w-5 h-5" /> Change Filters
          </button>
        </div>
      </div>
    );
  }

  const progress = (currentIndex / total) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{ background: "linear-gradient(160deg,#22c55e 0%,#16a34a 100%)" }}
      data-testid="flashcard-page">

      <div className="w-full max-w-sm px-4 flex flex-col min-h-screen pb-8">

        {/* ── Progress bar ── */}
        <div className="pt-5 pb-1">
          <div className="w-full bg-black/10 rounded-full h-1">
            <div className="bg-white h-1 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
              data-testid="progress-bar" />
          </div>
        </div>

        {/* ── Top nav ── */}
        <div className="flex items-center justify-between pt-3 pb-2">
          <button data-testid="button-back" onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors active:scale-90">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white font-bold text-sm" data-testid="text-progress">
              Card {currentIndex + 1} / {total}
            </span>
            {results.length > 0 && (
              <span className="text-white/55 text-xs tabular-nums animate-fade-in">
                {correctCount}✓ &nbsp; {wrongCount}✗ &nbsp; {accuracy}%
              </span>
            )}
          </div>

          <div className="w-9 h-9" />
        </div>

        {/* ── Flashcard (animated on index change) ── */}
        <div key={currentIndex} className="relative mt-2 mb-5 animate-card-enter">
          {/* Stacked shadow layers */}
          <div className="absolute inset-x-5 top-3 bottom-0 bg-white/40 rounded-[28px]" style={{ zIndex: 0 }} />
          <div className="absolute inset-x-2 top-1.5 bottom-0 bg-white/65 rounded-[28px]" style={{ zIndex: 1 }} />

          {/* Main white card */}
          <div className="relative bg-white rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.14)] px-7 pt-6 pb-6 flex flex-col items-center gap-4"
            style={{ zIndex: 2, minHeight: "278px" }}
            data-testid="flashcard">

            {/* Type pill + status */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full tracking-wide ${getPillStyle(card.cardType)}`}
                data-testid="text-card-type">
                {card.cardType}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadgeStyle(card.sourceStatus)}`}
                data-testid="text-card-status">
                {card.sourceStatus}
              </span>
            </div>

            {/* Prompt content */}
            <div className="flex-1 flex items-center justify-center w-full px-1">
              <p className={`text-center font-bold text-gray-900 leading-tight ${
                card.cardType === "Definition"
                  ? "text-[15px] font-normal text-gray-600 leading-relaxed"
                  : "text-[32px] tracking-tight"
              }`} data-testid="text-card-content">
                {card.promptText}
              </p>
            </div>

            {/* Hint */}
            {showHint && (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-amber-800 text-sm text-center animate-fade-up"
                data-testid="text-hint">
                {card.cardType === "Synonym"
                  ? `"${card.promptText}" means similar to ${card.correctWord}`
                  : card.cardType === "Antonym"
                  ? `"${card.promptText}" means the opposite of ${card.correctWord}`
                  : "Think about which word matches this definition"}
              </div>
            )}

            {/* Icon buttons */}
            <div className="flex gap-3">
              <button data-testid="button-speaker"
                onClick={() => speak(card.promptText)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors active:scale-90">
                <Volume2 className="w-5 h-5 text-gray-500" />
              </button>
              <button data-testid="button-hint"
                onClick={() => setShowHint((v) => !v)}
                className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors active:scale-90 ${
                  showHint ? "bg-amber-100" : "bg-gray-50 hover:bg-gray-100"
                }`}>
                <Lightbulb className={`w-5 h-5 ${showHint ? "text-amber-500" : "text-gray-500"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Question prompt ── */}
        <p key={`q-${currentIndex}`}
          className="text-white/90 text-center text-[15px] font-medium mb-4 animate-fade-in"
          data-testid="text-question">
          {getQuestionPrompt(card)}
        </p>

        {/* ── Answer buttons — unified layout, no layout shift ── */}
        <div key={answerState} className="flex items-center gap-3">
          {choices.map((word, i) => {
            const isCorrect = word === card.correctWord;
            const isSelected = selectedAnswer === word;

            if (answerState === "unanswered") {
              return (
                <>
                  {i === 1 && (
                    <span key="or" className="text-white font-semibold text-sm shrink-0">or</span>
                  )}
                  <button
                    key={word}
                    data-testid={`button-choice-${i}`}
                    onClick={() => handleAnswer(word)}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl py-4 px-3 text-sm shadow-md transition-all active:scale-95 active:shadow-sm">
                    {word}
                  </button>
                </>
              );
            }

            const animCls = isCorrect
              ? "animate-pop-correct"
              : isSelected
              ? "animate-shake-wrong"
              : "";

            let colorCls = "bg-white/25 text-white/60";
            if (isCorrect)        colorCls = "bg-green-500 text-white shadow-lg";
            else if (isSelected)  colorCls = "bg-red-400   text-white shadow-md";

            return (
              <>
                {i === 1 && (
                  <span key="or" className="text-white font-semibold text-sm shrink-0">or</span>
                )}
                <div
                  key={word}
                  data-testid={`result-choice-${i}`}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-4 px-3 text-sm font-semibold ${colorCls} ${animCls}`}>
                  {isCorrect  && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0" />}
                  {word}
                </div>
              </>
            );
          })}
        </div>

        {/* ── Post-answer: explanation + next button ── */}
        {answerState !== "unanswered" && (
          <div className="flex flex-col gap-3 mt-3 animate-fade-up">
            {/* Explanation */}
            <div
              className={`flex items-start gap-3 rounded-2xl px-4 py-3.5 ${
                answerState === "correct" ? "bg-black/20" : "bg-black/20"
              }`}
              data-testid="text-feedback">
              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                answerState === "correct" ? "bg-green-400" : "bg-red-400"
              }`}>
                {answerState === "correct"
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  : <XCircle className="w-3.5 h-3.5 text-white" />}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {answerState === "correct" ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-white/75 text-sm mt-0.5" data-testid="text-explanation">
                  {getExplanation(card)}
                </p>
              </div>
            </div>

            {/* Next / Finish */}
            <button
              data-testid={isLastCard ? "button-finish" : "button-next"}
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-white text-green-700 font-bold rounded-2xl py-4 shadow-lg hover:bg-gray-50 transition-all active:scale-95 active:shadow-md">
              {isLastCard
                ? <><Flag className="w-5 h-5" /> Finish Session</>
                : <>Next Card <ChevronRight className="w-5 h-5" /></>}
            </button>
          </div>
        )}

        {/* ── Score footer ── */}
        <div className="mt-auto pt-6 flex justify-center gap-8">
          {[
            { label: "Correct",   value: correctCount },
            { label: "Wrong",     value: wrongCount },
            { label: "Left",      value: total - currentIndex - (answerState !== "unanswered" ? 1 : 0) },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-white/50 text-[11px] uppercase tracking-wider">{label}</p>
              <p className="text-white font-black text-xl tabular-nums">{value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
