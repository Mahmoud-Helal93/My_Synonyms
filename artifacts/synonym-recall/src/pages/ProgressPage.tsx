import { useState, useMemo } from "react";
import {
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  BarChart2,
  Target,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { allCards, type FlashCard } from "@/data/flashcards";
import { mission1Set1 } from "@/data/vocab";
import {
  loadProgress,
  resetProgress,
  isMastered,
  isWeak,
  masteryBg,
  masteryLabel,
  type CardProgress,
} from "@/utils/progress";

interface Props {
  onBack: () => void;
}

function getPillStyle(cardType: FlashCard["cardType"]): string {
  switch (cardType) {
    case "Definition": return "bg-blue-100 text-blue-700";
    case "Synonym":    return "bg-green-100 text-green-700";
    case "Antonym":    return "bg-orange-100 text-orange-700";
  }
}

function MasteryDots({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < score ? "bg-green-500" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProgressPage({ onBack }: Props) {
  const [store, setStore] = useState(loadProgress);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  const tracked = Object.values(store);
  const attempted = tracked.filter((p) => p.attempts > 0);
  const totalAttempts = attempted.reduce((sum, p) => sum + p.attempts, 0);
  const totalCorrect = attempted.reduce((sum, p) => sum + p.correctAttempts, 0);
  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const masteredCount = attempted.filter(isMastered).length;
  const weakCount = attempted.filter(isWeak).length;

  const weakCards = useMemo(() => {
    return allCards
      .map((card) => ({ card, progress: store[card.id] }))
      .filter(({ progress }) => progress && isWeak(progress))
      .sort((a, b) => (a.progress?.masteryScore ?? 0) - (b.progress?.masteryScore ?? 0));
  }, [store]);

  const wordStats = useMemo(() => {
    return mission1Set1.map((vocab) => {
      const vocabCards = allCards.filter((c) => c.targetWord === vocab.word);
      const progEntries = vocabCards
        .map((c) => store[c.id])
        .filter((p): p is CardProgress => !!p && p.attempts > 0);

      const attempts = progEntries.reduce((s, p) => s + p.attempts, 0);
      const correct = progEntries.reduce((s, p) => s + p.correctAttempts, 0);
      const mastered = progEntries.filter(isMastered).length;
      const weak = progEntries.filter(isWeak).length;
      const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : null;

      return {
        word: vocab.word,
        totalCards: vocabCards.length,
        reviewed: progEntries.length,
        mastered,
        weak,
        accuracy,
        attempts,
      };
    });
  }, [store]);

  const handleReset = () => {
    resetProgress();
    setStore({});
    setShowResetConfirm(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start"
      style={{ background: "linear-gradient(160deg, #22c55e 0%, #16a34a 100%)" }}
      data-testid="progress-page"
    >
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg px-4 pt-6 pb-10 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            data-testid="button-back"
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-black text-xl leading-tight">My Progress</h1>
            <p className="text-white/60 text-xs">Mission 1 · Set 1</p>
          </div>
        </div>

        {/* Overall stats */}
        <div className="flex flex-col gap-2">
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest px-1">Overall</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<BarChart2 className="w-5 h-5 text-blue-500" />}
              label="Total Attempts"
              value={String(totalAttempts)}
              testId="stat-total-attempts"
            />
            <StatCard
              icon={<Zap className="w-5 h-5 text-yellow-500" />}
              label="Accuracy"
              value={totalAttempts > 0 ? `${overallAccuracy}%` : "—"}
              testId="stat-accuracy"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
              label="Cards Mastered"
              value={String(masteredCount)}
              sub={`of ${allCards.length}`}
              testId="stat-mastered"
            />
            <StatCard
              icon={<Target className="w-5 h-5 text-red-400" />}
              label="Weak Cards"
              value={String(weakCount)}
              testId="stat-weak"
            />
          </div>
        </div>

        {/* Progress by word */}
        <div className="flex flex-col gap-2">
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest px-1">By Word</p>
          <div className="bg-white/90 rounded-3xl overflow-hidden divide-y divide-gray-100">
            {wordStats.map((ws) => (
              <div key={ws.word}>
                <button
                  data-testid={`word-row-${ws.word}`}
                  onClick={() =>
                    setExpandedWord((prev) => (prev === ws.word ? null : ws.word))
                  }
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-gray-900 text-sm">{ws.word}</span>
                    <span className="text-xs text-gray-400">
                      {ws.reviewed}/{ws.totalCards} reviewed
                      {ws.accuracy !== null ? ` · ${ws.accuracy}% accuracy` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {ws.mastered > 0 && (
                      <span className="text-xs font-semibold text-green-600">
                        {ws.mastered}✓
                      </span>
                    )}
                    {ws.weak > 0 && (
                      <span className="text-xs font-semibold text-red-500">
                        {ws.weak}✗
                      </span>
                    )}
                    {ws.reviewed === 0 && (
                      <span className="text-xs text-gray-300">Not started</span>
                    )}
                    {expandedWord === ws.word ? (
                      <ChevronDown className="w-4 h-4 text-gray-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                </button>

                {expandedWord === ws.word && (
                  <div className="bg-gray-50 px-5 pb-4 pt-2 flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <MiniStat label="Total" value={ws.totalCards} />
                      <MiniStat label="Mastered" value={ws.mastered} color="text-green-600" />
                      <MiniStat label="Weak" value={ws.weak} color="text-red-500" />
                    </div>
                    {allCards
                      .filter((c) => c.targetWord === ws.word)
                      .map((card) => {
                        const p = store[card.id];
                        return (
                          <div
                            key={card.id}
                            className="flex items-center justify-between gap-2 py-1.5 border-t border-gray-100 first:border-t-0"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${getPillStyle(card.cardType)}`}>
                                {card.cardType.slice(0, 3)}
                              </span>
                              <span className="text-xs text-gray-600 truncate">
                                {card.cardType === "Definition"
                                  ? card.promptText.slice(0, 28) + (card.promptText.length > 28 ? "…" : "")
                                  : card.promptText}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {p && p.attempts > 0 ? (
                                <>
                                  <MasteryDots score={p.masteryScore} />
                                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-lg ${masteryBg(p.masteryScore)}`}>
                                    {masteryLabel(p.masteryScore)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-gray-300">Not tried</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weak card list */}
        {weakCards.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest px-1">
              Weak Cards ({weakCards.length})
            </p>
            <div className="bg-white/90 rounded-3xl overflow-hidden divide-y divide-gray-100">
              {weakCards.map(({ card, progress: p }, i) => (
                <div key={card.id} className="px-5 py-3.5 flex items-center gap-3" data-testid={`weak-card-${i}`}>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${getPillStyle(card.cardType)}`}>
                        {card.cardType}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{card.targetWord}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {card.cardType === "Definition"
                        ? card.promptText.slice(0, 45) + (card.promptText.length > 45 ? "…" : "")
                        : `"${card.promptText}"`}
                    </p>
                    {p && (
                      <p className="text-xs text-gray-400">
                        {p.attempts} attempt{p.attempts !== 1 ? "s" : ""} · {p.correctAttempts} correct
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <MasteryDots score={p?.masteryScore ?? 0} />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${masteryBg(p?.masteryScore ?? 0)}`}>
                      {masteryLabel(p?.masteryScore ?? 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {weakCards.length === 0 && totalAttempts === 0 && (
          <div className="bg-white/20 rounded-3xl px-5 py-6 text-center">
            <BookOpen className="w-8 h-8 text-white/50 mx-auto mb-2" />
            <p className="text-white/80 text-sm font-medium">No sessions completed yet.</p>
            <p className="text-white/50 text-xs mt-1">Start a review to track your progress.</p>
          </div>
        )}

        {/* Reset button */}
        {totalAttempts > 0 && (
          <div className="mt-2">
            {!showResetConfirm ? (
              <button
                data-testid="button-reset"
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white/80 font-medium rounded-2xl py-3.5 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Progress
              </button>
            ) : (
              <div className="bg-white rounded-3xl px-5 py-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Reset all progress?</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      This will permanently delete all mastery scores, attempt counts, and history. This cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    data-testid="button-reset-cancel"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl py-2.5 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    data-testid="button-reset-confirm"
                    onClick={handleReset}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                  >
                    Yes, Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  testId: string;
}) {
  return (
    <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
      {icon}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-black text-gray-900 leading-tight" data-testid={testId}>
          {value}
          {sub && <span className="text-xs font-normal text-gray-400 ml-1">{sub}</span>}
        </p>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color = "text-gray-800" }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white rounded-xl py-2">
      <p className={`text-base font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
