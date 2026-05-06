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
  BarChart2,
  Check,
} from "lucide-react";
import {
  type SessionConfig,
  type CardTypeFilter,
  type StatusFilter,
  type SetFilter,
  DEFAULT_CONFIG,
} from "@/types/session";
import { computeSummary, setLabel } from "@/utils/filterCards";

interface Props {
  onStart: (config: SessionConfig) => void;
  onViewProgress: () => void;
}

const CARD_TYPE_OPTIONS: { value: CardTypeFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all",               label: "All Cards",           icon: <Layers className="w-4 h-4" /> },
  { value: "definitions",       label: "Definitions Only",    icon: <BookOpen className="w-4 h-4" /> },
  { value: "synonyms",          label: "Synonyms Only",       icon: <Repeat2 className="w-4 h-4" /> },
  { value: "antonyms",          label: "Antonyms Only",       icon: <ArrowLeftRight className="w-4 h-4" /> },
  { value: "synonyms-antonyms", label: "Synonyms + Antonyms", icon: <Sparkles className="w-4 h-4" /> },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string; desc: string }[] = [
  { value: "all", label: "All",      desc: "Every card" },
  { value: "new", label: "New Only", desc: "Focus on unfamiliar" },
  { value: "old", label: "Old Only", desc: "Review familiar" },
];

const COUNT_OPTIONS: { value: "all" | 10 | 20 | "custom"; label: string }[] = [
  { value: "all",    label: "All available" },
  { value: 10,       label: "10 cards" },
  { value: 20,       label: "20 cards" },
  { value: "custom", label: "Custom" },
];

const SET_OPTIONS: { value: SetFilter; label: string }[] = [
  { value: 1,     label: "Set 1" },
  { value: 2,     label: "Set 2" },
  { value: 3,     label: "Set 3" },
  { value: "all", label: "All Sets" },
];

export default function SetupPage({ onStart, onViewProgress }: Props) {
  const [setFilter,      setSetFilter]      = useState<SetFilter>(DEFAULT_CONFIG.setFilter);
  const [cardTypeFilter, setCardTypeFilter] = useState<CardTypeFilter>(DEFAULT_CONFIG.cardTypeFilter);
  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>(DEFAULT_CONFIG.statusFilter);
  const [countOption,    setCountOption]    = useState<"all" | 10 | 20 | "custom">("all");
  const [customCount,    setCustomCount]    = useState("15");
  const [shuffle,        setShuffle]        = useState(true);

  const handleSetChange = (newSet: SetFilter) => {
    setSetFilter(newSet);
  };

  const config: SessionConfig = useMemo(() => {
    let cardCount: number | "all" = "all";
    if (countOption === "custom") {
      const n = parseInt(customCount, 10);
      cardCount = isNaN(n) || n < 1 ? 1 : n;
    } else if (countOption !== "all") {
      cardCount = countOption;
    }
    return { setFilter, cardTypeFilter, statusFilter, selectedWords: [], cardCount, shuffle };
  }, [setFilter, cardTypeFilter, statusFilter, countOption, customCount, shuffle]);

  const summary  = useMemo(() => computeSummary(config), [config]);
  const canStart = summary.totalInSession > 0;

  return (
    <div
      className="min-h-screen flex flex-col items-center animate-fade-in"
      style={{ background: "linear-gradient(160deg,#22c55e 0%,#16a34a 100%)" }}
      data-testid="setup-page"
    >
      <div className="w-full max-w-sm md:max-w-xl lg:max-w-2xl px-4 pt-7 pb-10 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-black tracking-tight leading-tight">
              Synonym Recall
            </h1>
            <p className="text-white/60 text-sm mt-0.5">Mission 1 · {setLabel(setFilter)}</p>
          </div>
          <button
            data-testid="button-progress"
            onClick={onViewProgress}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Progress
          </button>
        </div>

        {/* Set selector */}
        <FilterSection title="Set">
          <div className="grid grid-cols-4 gap-2">
            {SET_OPTIONS.map((opt) => {
              const active = setFilter === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  data-testid={`filter-set-${String(opt.value)}`}
                  onClick={() => handleSetChange(opt.value)}
                  className={`flex items-center justify-center py-3 px-2 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                    active ? "bg-white/25 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Card Type */}
        <FilterSection title="Card Type">
          <div className="flex flex-col gap-2">
            {CARD_TYPE_OPTIONS.map((opt) => {
              const active = cardTypeFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  data-testid={`filter-type-${opt.value}`}
                  onClick={() => setCardTypeFilter(opt.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.98] ${
                    active ? "bg-white/25 text-white shadow-inner" : "bg-white/90 text-gray-700 hover:bg-white"
                  }`}
                >
                  <span className={active ? "text-white" : "text-green-600"}>{opt.icon}</span>
                  {opt.label}
                  {active && <Check className="ml-auto w-4 h-4 text-white/80" />}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Status Filter */}
        <FilterSection title="Status">
          <div className="grid grid-cols-3 gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const active = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  data-testid={`filter-status-${opt.value}`}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`flex flex-col items-center py-3 px-2 rounded-2xl text-xs font-semibold transition-all active:scale-95 ${
                    active ? "bg-white/25 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
                  }`}
                >
                  <span className="font-bold text-sm">{opt.label}</span>
                  <span className={`mt-0.5 text-center leading-tight ${active ? "text-white/70" : "text-gray-400"}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Number of cards */}
        <FilterSection title="Cards">
          <div className="grid grid-cols-2 gap-2">
            {COUNT_OPTIONS.map((opt) => {
              const active = countOption === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  data-testid={`filter-count-${String(opt.value)}`}
                  onClick={() => setCountOption(opt.value)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${
                    active ? "bg-white/25 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
                  }`}
                >
                  {opt.value === "custom" && <Clock className="w-4 h-4" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
          {countOption === "custom" && (
            <div className="mt-2 flex items-center gap-3 bg-white/90 rounded-2xl px-4 py-3 animate-fade-up">
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
        </FilterSection>

        {/* Shuffle */}
        <FilterSection title="Options">
          <button
            data-testid="toggle-shuffle"
            onClick={() => setShuffle((v) => !v)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] ${
              shuffle ? "bg-white/25 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Shuffle cards
            </span>
            <span className={`w-11 h-6 rounded-full relative transition-all duration-200 ${
              shuffle ? "bg-green-400/60" : "bg-gray-200"
            }`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all duration-200 ${
                shuffle ? "left-5 bg-white" : "left-0.5 bg-white"
              }`} />
            </span>
          </button>
        </FilterSection>

        {/* Summary */}
        <div className="bg-white/15 rounded-3xl px-5 py-5" data-testid="session-summary">
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-3">
            Session Summary
          </p>
          <div className="flex flex-col gap-1.5">
            <SummaryRow label="Mission"       value={`Mission 1 · ${setLabel(setFilter)}`} isText />
            <SummaryRow label="Target words"  value={summary.wordCount} />
            {cardTypeFilter !== "synonyms" && cardTypeFilter !== "antonyms" && cardTypeFilter !== "synonyms-antonyms" && (
              <SummaryRow label="Definition cards" value={summary.definitionCount} />
            )}
            {cardTypeFilter !== "definitions" && cardTypeFilter !== "antonyms" && (
              <SummaryRow label="Synonym cards"    value={summary.synonymCount} />
            )}
            {cardTypeFilter !== "definitions" && cardTypeFilter !== "synonyms" && (
              <SummaryRow label="Antonym cards"    value={summary.antonymCount} />
            )}
            <SummaryRow label="New cards" value={summary.newCount} />
            <SummaryRow label="Old cards" value={summary.oldCount} />
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
            <span className="text-white/70 text-sm">Total in session</span>
            <span className="text-white font-black text-2xl tabular-nums" data-testid="summary-total">
              {summary.totalInSession}
              {config.cardCount !== "all" && summary.totalBeforeLimit > summary.totalInSession && (
                <span className="text-white/50 font-normal text-sm ml-1.5">
                  / {summary.totalBeforeLimit}
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
              ? "bg-white text-green-700 hover:bg-gray-50 active:scale-[0.98] active:shadow-md"
              : "bg-white/25 text-white/40 cursor-not-allowed"
          }`}
        >
          Start Review
          <ChevronRight className="w-5 h-5" />
        </button>
        {!canStart && (
          <p className="text-white/60 text-xs text-center -mt-3">
            No cards match your filters.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest px-1">{title}</p>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, isText }: { label: string; value: number | string; isText?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/65 text-sm">{label}</span>
      {isText
        ? <span className="text-white font-semibold text-sm">{value}</span>
        : <span className="text-white font-semibold tabular-nums">{value}</span>}
    </div>
  );
}
