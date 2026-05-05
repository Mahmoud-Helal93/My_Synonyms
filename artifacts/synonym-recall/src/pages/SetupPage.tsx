import { useState, useMemo } from "react";
import {
  BookOpen,
  Repeat2,
  ArrowLeftRight,
  Layers,
  Sparkles,
  Clock,
  Shuffle,
  ChevronRight,
  CheckSquare,
  Square,
  BarChart2,
} from "lucide-react";
import { mission1Set1 } from "@/data/vocab";
import {
  type SessionConfig,
  type CardTypeFilter,
  type StatusFilter,
  DEFAULT_CONFIG,
} from "@/types/session";
import { computeSummary } from "@/utils/filterCards";

interface Props {
  onStart: (config: SessionConfig) => void;
  onViewProgress: () => void;
}

const CARD_TYPE_OPTIONS: { value: CardTypeFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Cards", icon: <Layers className="w-4 h-4" /> },
  { value: "definitions", label: "Definitions Only", icon: <BookOpen className="w-4 h-4" /> },
  { value: "synonyms", label: "Synonyms Only", icon: <Repeat2 className="w-4 h-4" /> },
  { value: "antonyms", label: "Antonyms Only", icon: <ArrowLeftRight className="w-4 h-4" /> },
  { value: "synonyms-antonyms", label: "Synonyms + Antonyms", icon: <Sparkles className="w-4 h-4" /> },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string; desc: string }[] = [
  { value: "all", label: "All", desc: "Every card" },
  { value: "new", label: "New Only", desc: "Focus on unfamiliar words" },
  { value: "old", label: "Old Only", desc: "Review familiar words" },
];

const COUNT_OPTIONS: { value: number | "all"; label: string }[] = [
  { value: "all", label: "All available" },
  { value: 10, label: "10 cards" },
  { value: 20, label: "20 cards" },
  { value: "custom", label: "Custom" } as unknown as { value: number | "all"; label: string },
];

const ALL_WORDS = mission1Set1.map((v) => v.word);

export default function SetupPage({ onStart, onViewProgress }: Props) {
  const [cardTypeFilter, setCardTypeFilter] = useState<CardTypeFilter>(DEFAULT_CONFIG.cardTypeFilter);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(DEFAULT_CONFIG.statusFilter);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [countOption, setCountOption] = useState<"all" | 10 | 20 | "custom">("all");
  const [customCount, setCustomCount] = useState<string>("15");
  const [shuffle, setShuffle] = useState(true);

  const config: SessionConfig = useMemo(() => {
    let cardCount: number | "all" = "all";
    if (countOption === "custom") {
      const n = parseInt(customCount, 10);
      cardCount = isNaN(n) || n < 1 ? 1 : n;
    } else if (countOption !== "all") {
      cardCount = countOption;
    }
    return {
      cardTypeFilter,
      statusFilter,
      selectedWords,
      cardCount,
      shuffle,
    };
  }, [cardTypeFilter, statusFilter, selectedWords, countOption, customCount, shuffle]);

  const summary = useMemo(() => computeSummary(config), [config]);

  const toggleWord = (word: string) => {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  };

  const toggleAllWords = () => {
    setSelectedWords((prev) => (prev.length === ALL_WORDS.length ? [] : [...ALL_WORDS]));
  };

  const canStart = summary.totalInSession > 0;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start"
      style={{ background: "linear-gradient(160deg, #22c55e 0%, #16a34a 100%)" }}
      data-testid="setup-page"
    >
      <div className="w-full max-w-sm px-4 pt-8 pb-10 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-white text-2xl font-black tracking-tight">Synonym Recall</h1>
            <p className="text-white/70 text-sm mt-0.5">Mission 1 · Set 1</p>
          </div>
          <button
            data-testid="button-progress"
            onClick={onViewProgress}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            Progress
          </button>
        </div>

        {/* Card Type */}
        <Section title="Card Type">
          <div className="flex flex-col gap-2">
            {CARD_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                data-testid={`filter-type-${opt.value}`}
                onClick={() => setCardTypeFilter(opt.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  cardTypeFilter === opt.value
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white/90 text-gray-700 hover:bg-white"
                }`}
              >
                <span className={cardTypeFilter === opt.value ? "text-white" : "text-green-600"}>
                  {opt.icon}
                </span>
                {opt.label}
                {cardTypeFilter === opt.value && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-white/70" />
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Status Filter */}
        <Section title="Status Filter">
          <div className="grid grid-cols-3 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                data-testid={`filter-status-${opt.value}`}
                onClick={() => setStatusFilter(opt.value)}
                className={`flex flex-col items-center py-3 px-2 rounded-2xl text-xs font-semibold transition-all ${
                  statusFilter === opt.value
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white/90 text-gray-700 hover:bg-white"
                }`}
              >
                <span className="font-bold text-sm">{opt.label}</span>
                <span className={`text-center mt-0.5 leading-tight ${statusFilter === opt.value ? "text-white/80" : "text-gray-400"}`}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* Word Filter */}
        <Section title="Word Filter">
          <div className="flex flex-col gap-2">
            <button
              data-testid="filter-words-toggle-all"
              onClick={toggleAllWords}
              className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-white/90 hover:bg-white rounded-2xl px-4 py-2.5 transition-all"
            >
              {selectedWords.length === ALL_WORDS.length ? (
                <CheckSquare className="w-4 h-4 text-green-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              {selectedWords.length === 0
                ? "All words (default)"
                : selectedWords.length === ALL_WORDS.length
                ? "Deselect all"
                : `${selectedWords.length} of ${ALL_WORDS.length} selected`}
            </button>
            <div className="flex flex-wrap gap-2">
              {ALL_WORDS.map((word) => {
                const active = selectedWords.includes(word);
                return (
                  <button
                    key={word}
                    data-testid={`filter-word-${word}`}
                    onClick={() => toggleWord(word)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-white/90 text-gray-600 hover:bg-white"
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Number of Cards */}
        <Section title="Number of Cards">
          <div className="grid grid-cols-2 gap-2">
            {COUNT_OPTIONS.map((opt) => {
              const val = opt.value as "all" | 10 | 20 | "custom";
              return (
                <button
                  key={String(opt.value)}
                  data-testid={`filter-count-${String(opt.value)}`}
                  onClick={() => setCountOption(val)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    countOption === val
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white/90 text-gray-700 hover:bg-white"
                  }`}
                >
                  {val === "all" && <Layers className="w-4 h-4" />}
                  {val === "custom" && <Clock className="w-4 h-4" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
          {countOption === "custom" && (
            <div className="mt-2 flex items-center gap-3 bg-white/90 rounded-2xl px-4 py-3">
              <span className="text-sm text-gray-500 shrink-0">Number of cards:</span>
              <input
                data-testid="input-custom-count"
                type="number"
                min={1}
                max={999}
                value={customCount}
                onChange={(e) => setCustomCount(e.target.value)}
                className="w-20 text-center font-bold text-gray-900 bg-transparent border-b-2 border-green-500 outline-none text-lg"
              />
            </div>
          )}
        </Section>

        {/* Shuffle */}
        <Section title="Shuffle">
          <button
            data-testid="toggle-shuffle"
            onClick={() => setShuffle((v) => !v)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              shuffle ? "bg-green-600 text-white shadow-md" : "bg-white/90 text-gray-700"
            }`}
          >
            <span className="flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Shuffle cards
            </span>
            <span
              className={`w-10 h-6 rounded-full relative transition-all ${
                shuffle ? "bg-white/30" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all ${
                  shuffle ? "left-4 bg-white" : "left-0.5 bg-white"
                }`}
              />
            </span>
          </button>
        </Section>

        {/* Summary */}
        <div
          className="bg-white/20 rounded-3xl px-5 py-4 flex flex-col gap-3"
          data-testid="session-summary"
        >
          <p className="text-white font-bold text-sm uppercase tracking-wide">Session Summary</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <SummaryRow label="Target words" value={summary.wordCount} />
            <SummaryRow
              label="Definition cards"
              value={summary.definitionCount}
              hidden={cardTypeFilter === "synonyms" || cardTypeFilter === "antonyms" || cardTypeFilter === "synonyms-antonyms"}
            />
            <SummaryRow
              label="Synonym cards"
              value={summary.synonymCount}
              hidden={cardTypeFilter === "definitions" || cardTypeFilter === "antonyms"}
            />
            <SummaryRow
              label="Antonym cards"
              value={summary.antonymCount}
              hidden={cardTypeFilter === "definitions" || cardTypeFilter === "synonyms"}
            />
          </div>
          <div className="border-t border-white/30 pt-2 flex items-center justify-between">
            <span className="text-white/80 text-sm">Total cards in session</span>
            <span className="text-white font-black text-xl" data-testid="summary-total">
              {summary.totalInSession}
              {config.cardCount !== "all" && summary.totalBeforeLimit > summary.totalInSession && (
                <span className="text-white/60 font-normal text-sm ml-1">
                  / {summary.totalBeforeLimit} available
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Start button */}
        <button
          data-testid="button-start"
          disabled={!canStart}
          onClick={() => onStart(config)}
          className={`w-full flex items-center justify-center gap-2 font-bold rounded-2xl py-4 text-base transition-all shadow-lg ${
            canStart
              ? "bg-white text-green-700 hover:bg-gray-50 active:bg-gray-100 active:scale-95"
              : "bg-white/30 text-white/50 cursor-not-allowed"
          }`}
        >
          Start Review
          <ChevronRight className="w-5 h-5" />
        </button>
        {!canStart && (
          <p className="text-white/70 text-xs text-center -mt-3">
            No cards match your current filters.
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/80 text-xs font-bold uppercase tracking-widest px-1">{title}</p>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  hidden,
}: {
  label: string;
  value: number;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <>
      <span className="text-white/70">{label}</span>
      <span className="text-white font-semibold text-right">{value}</span>
    </>
  );
}
