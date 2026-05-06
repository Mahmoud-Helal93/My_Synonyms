import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  AudioLines,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Flag,
  Settings2,
  Keyboard,
} from "lucide-react";
import { type FlashCard } from "@/data/flashcards";
import { type SessionConfig, type CardResult } from "@/types/session";
import { buildSession } from "@/utils/filterCards";
import {
  loadProgress,
  recordAnswer,
  saveProgress,
  masteryBg,
  masteryLabel,
} from "@/utils/progress";
import {
  playSuccess,
  playFailure,
  loadMuted,
  saveMuted,
  loadAutoSpeak,
  saveAutoSpeak,
} from "@/utils/audio";

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

function getCardAccent(cardType: FlashCard["cardType"]): { primary: string; secondary: string; pill: string } {
  switch (cardType) {
    case "Synonym":
      return { primary: "#3B82F6", secondary: "#EF4444", pill: "bg-blue-500/20 text-blue-300" };
    case "Antonym":
      return { primary: "#EF4444", secondary: "#F59E0B", pill: "bg-red-500/20 text-red-300" };
    case "Definition":
      return { primary: "#F59E0B", secondary: "#3B82F6", pill: "bg-amber-500/20 text-amber-300" };
  }
}

/** Returns the word to speak for a card (correctWord for definitions, promptText otherwise) */
function getSpeakWord(card: FlashCard): string {
  return card.cardType === "Definition" ? card.correctWord : card.promptText;
}

function speak(text: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88;
    window.speechSynthesis.speak(u);
  }
}

/** First-letter hint: "A _ _ _ _" plus Arabic meaning if available */
function getHintContent(card: FlashCard): { letterHint: string; arabic?: string } {
  const word = card.correctWord;
  const underscores = Array.from({ length: word.length - 1 }, () => "_").join(" ");
  const letterHint = `${word[0].toUpperCase()} ${underscores}`;
  return { letterHint, arabic: card.arabic };
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
  const [answerState, setAnswerState]   = useState<AnswerState>("unanswered");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint]         = useState(false);
  const [showKbHelp, setShowKbHelp]     = useState(false);
  const [muted, setMuted]               = useState(() => loadMuted());
  const [autoSpeak, setAutoSpeak]       = useState(() => loadAutoSpeak());
  const autoSpeakTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [choices, setChoices]           = useState<[string, string]>(() =>
    deck.length > 0 ? buildChoices(deck[0]) : ["—", "—"]
  );
  const [results, setResults]           = useState<CardResult[]>([]);
  const [progressStore, setProgressStore] = useState(() => loadProgress());

  const total        = deck.length;
  const card         = deck[currentIndex];
  const isLastCard   = currentIndex + 1 >= total;
  const correctCount = results.filter((r) => r.correct).length;
  const wrongCount   = results.filter((r) => !r.correct).length;
  const accuracy     = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  const cardProgress = progressStore[card.id];
  const hasProgress  = (cardProgress?.attempts ?? 0) > 0;

  const handleAnswer = useCallback(
    (chosen: string) => {
      if (answerState !== "unanswered") return;
      const isCorrect = chosen === card.correctWord;
      setSelectedAnswer(chosen);
      setAnswerState(isCorrect ? "correct" : "incorrect");
      if (!muted) { if (isCorrect) void playSuccess(); else void playFailure(); }
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
    if (isLastCard) { onFinish(results); return; }
    const next = currentIndex + 1;
    const nextCard = deck[next];
    setCurrentIndex(next);
    setAnswerState("unanswered");
    setSelectedAnswer(null);
    setShowHint(false);
    setChoices(buildChoices(nextCard));
    // Auto-pronounce: speak after card-enter animation settles (280 ms)
    if (autoSpeakTimer.current) clearTimeout(autoSpeakTimer.current);
    if (!muted && autoSpeak) {
      const word = nextCard.cardType === "Definition"
        ? nextCard.correctWord
        : nextCard.promptText;
      autoSpeakTimer.current = setTimeout(() => speak(word), 280);
    }
  }, [isLastCard, currentIndex, deck, results, onFinish, muted, autoSpeak]);

  // ── Cancel auto-speak timer on unmount ──────────────────────────────────────
  useEffect(() => () => {
    if (autoSpeakTimer.current) clearTimeout(autoSpeakTimer.current);
    window.speechSynthesis?.cancel();
  }, []);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  // Use refs so the effect doesn't need to re-register on every render
  const choicesRef     = useRef(choices);
  const answerStateRef = useRef(answerState);
  choicesRef.current     = choices;
  answerStateRef.current = answerState;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "Escape": onBack(); break;
        case "1":
          if (answerStateRef.current === "unanswered") handleAnswer(choicesRef.current[0]);
          break;
        case "2":
          if (answerStateRef.current === "unanswered") handleAnswer(choicesRef.current[1]);
          break;
        case "Enter":
          if (answerStateRef.current !== "unanswered") handleNext();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack, handleAnswer, handleNext]);

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

  const progress    = (currentIndex / total) * 100;
  const hintContent = getHintContent(card);
  const accent      = getCardAccent(card.cardType);

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{ background: "linear-gradient(160deg,#22c55e 0%,#16a34a 100%)" }}
      data-testid="flashcard-page">

      {/* ── Centered column — wider on larger screens ── */}
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg px-4 flex flex-col min-h-screen pb-8">

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

          {/* Right controls: auto-speak + mute + keyboard help */}
          <div className="flex items-center gap-1.5">
            {/* Auto-pronounce toggle */}
            <button
              data-testid="button-auto-speak"
              onClick={() => {
                const next = !autoSpeak;
                setAutoSpeak(next);
                saveAutoSpeak(next);
              }}
              title={autoSpeak ? "Auto-pronounce ON (tap to turn off)" : "Auto-pronounce OFF (tap to turn on)"}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors active:scale-90 ${
                autoSpeak
                  ? "bg-white/30 hover:bg-white/40"
                  : "bg-white/10 hover:bg-white/20"
              }`}>
              <AudioLines className={`w-4 h-4 ${autoSpeak ? "text-white" : "text-white/40"}`} />
            </button>
            {/* Mute toggle */}
            <button
              data-testid="button-mute"
              onClick={() => {
                const next = !muted;
                setMuted(next);
                saveMuted(next);
              }}
              title={muted ? "Unmute sounds" : "Mute sounds"}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors active:scale-90">
              {muted
                ? <VolumeX className="w-4 h-4 text-white/60" />
                : <Volume2 className="w-4 h-4 text-white" />}
            </button>
            {/* Keyboard shortcut help */}
            <button
              onClick={() => setShowKbHelp((v) => !v)}
              title="Keyboard shortcuts"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors active:scale-90">
              <Keyboard className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ── Keyboard shortcut tooltip ── */}
        {showKbHelp && (
          <div className="mb-3 bg-black/25 rounded-2xl px-4 py-3 flex flex-wrap gap-x-5 gap-y-1.5 animate-fade-up">
            {[
              { key: "1", desc: "Left answer" },
              { key: "2", desc: "Right answer" },
              { key: "↵", desc: "Next card" },
              { key: "Esc", desc: "Back to setup" },
            ].map(({ key, desc }) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-white/80">
                <kbd className="px-1.5 py-0.5 bg-white/20 rounded-md font-mono text-white font-semibold text-[11px] min-w-[1.5rem] text-center">
                  {key}
                </kbd>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Flashcard (animated on index change) ── */}
        <div key={currentIndex} className="relative mt-2 mb-5 animate-card-enter">
          {/* Stacked depth layers */}
          <div className="absolute inset-x-5 top-3 bottom-0 rounded-[28px]"
            style={{ zIndex: 0, background: "rgba(5,12,30,0.45)" }} />
          <div className="absolute inset-x-2 top-1.5 bottom-0 rounded-[28px]"
            style={{ zIndex: 1, background: "rgba(5,12,30,0.70)" }} />

          {/* Main dark card */}
          <div className="relative rounded-[28px] overflow-hidden flex flex-col"
            style={{ zIndex: 2, minHeight: "278px", background: "#0F172A",
                     boxShadow: "0 8px 40px rgba(0,0,0,0.45)" }}
            data-testid="flashcard">

            {/* ── Colored accent bar ── */}
            <div className="flex h-[5px] w-full shrink-0">
              <div className="flex-1" style={{ background: accent.primary }} />
              <div className="w-20" style={{ background: accent.secondary }} />
            </div>

            {/* Card body */}
            <div className="px-7 pt-5 pb-6 flex flex-col items-center gap-4 flex-1">

              {/* Type pill + mastery badge */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide ${accent.pill}`}
                  data-testid="text-card-type">
                  {card.cardType}
                </span>
                {hasProgress ? (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${masteryBg(cardProgress.masteryScore)}`}
                    data-testid="text-mastery-badge"
                    title={`Mastery score: ${cardProgress.masteryScore}/5`}>
                    {masteryLabel(cardProgress.masteryScore)}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-white/40"
                    data-testid="text-card-status">
                    {card.sourceStatus}
                  </span>
                )}
              </div>

              {/* Prompt word */}
              <div className="flex-1 flex items-center justify-center w-full px-1">
                <p className="text-center font-extrabold text-white leading-tight text-[32px] md:text-[38px] tracking-tight"
                  data-testid="text-card-content">
                  {card.promptText}
                </p>
              </div>

              {/* ── Hint ── */}
              {showHint && (
                <div className="w-full bg-white/8 border border-white/10 rounded-2xl px-4 py-3 flex flex-col items-center gap-1 animate-fade-up"
                  data-testid="text-hint">
                  <p className="text-white font-black text-lg tracking-[0.25em]">
                    {hintContent.letterHint}
                  </p>
                  {hintContent.arabic && (
                    <p className="text-white/60 text-xs" dir="rtl">
                      {hintContent.arabic}
                    </p>
                  )}
                  {!hintContent.arabic && (
                    <p className="text-white/40 text-xs">First letter of the answer</p>
                  )}
                </div>
              )}

              {/* Speaker + Hint buttons */}
              <div className="flex gap-3">
                <button data-testid="button-speaker"
                  onClick={() => speak(getSpeakWord(card))}
                  title={`Pronounce "${getSpeakWord(card)}"`}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/18 transition-colors active:scale-90">
                  <Volume2 className="w-5 h-5 text-white/70" />
                </button>
                <button data-testid="button-hint"
                  onClick={() => setShowHint((v) => !v)}
                  title="Show hint"
                  className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors active:scale-90 ${
                    showHint ? "bg-amber-500/25" : "bg-white/10 hover:bg-white/18"
                  }`}>
                  <Lightbulb className={`w-5 h-5 ${showHint ? "text-amber-400" : "text-white/70"}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Question prompt ── */}
        <p key={`q-${currentIndex}`}
          className="text-white/90 text-center text-[15px] font-medium mb-4 animate-fade-in"
          data-testid="text-question">
          {getQuestionPrompt(card)}
        </p>

        {/* ── Answer buttons — unified layout, keyboard hints on unanswered ── */}
        <div key={answerState} className="flex items-center gap-3">
          {choices.map((word, i) => {
            const isCorrect  = word === card.correctWord;
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
                    className="relative flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl py-4 px-3 text-sm shadow-md transition-all active:scale-95 active:shadow-sm">
                    {word}
                    {/* Keyboard shortcut badge */}
                    <kbd className="absolute bottom-1.5 right-2 text-[10px] font-mono text-gray-300 bg-gray-100 rounded px-1 leading-4 select-none">
                      {i + 1}
                    </kbd>
                  </button>
                </>
              );
            }

            const animCls = isCorrect  ? "animate-pop-correct"
                          : isSelected ? "animate-shake-wrong"
                          : "";

            let colorCls = "bg-white/25 text-white/60";
            if (isCorrect)       colorCls = "bg-green-500 text-white shadow-lg";
            else if (isSelected) colorCls = "bg-red-400   text-white shadow-md";

            return (
              <>
                {i === 1 && (
                  <span key="or" className="text-white font-semibold text-sm shrink-0">or</span>
                )}
                <div
                  key={word}
                  data-testid={`result-choice-${i}`}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-4 px-3 text-sm font-semibold ${colorCls} ${animCls}`}>
                  {isCorrect               && <CheckCircle2 className="w-4 h-4 shrink-0" />}
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
            <div
              className="flex items-start gap-3 rounded-2xl px-4 py-3.5 bg-black/20"
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

            <button
              data-testid={isLastCard ? "button-finish" : "button-next"}
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 bg-white text-green-700 font-bold rounded-2xl py-4 shadow-lg hover:bg-gray-50 transition-all active:scale-95 active:shadow-md">
              {isLastCard
                ? <><Flag className="w-5 h-5" /> Finish Session</>
                : <>Next Card <ChevronRight className="w-5 h-5" /></>}
              <kbd className="ml-1 text-[10px] font-mono text-green-400 bg-green-50 rounded px-1.5 py-0.5 leading-4 select-none">↵</kbd>
            </button>
          </div>
        )}

        {/* ── Score footer ── */}
        <div className="mt-auto pt-6 flex justify-center gap-8">
          {[
            { label: "Correct", value: correctCount },
            { label: "Wrong",   value: wrongCount   },
            { label: "Left",    value: total - currentIndex - (answerState !== "unanswered" ? 1 : 0) },
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
