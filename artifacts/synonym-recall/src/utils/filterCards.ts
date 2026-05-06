import {
  mission1Set1,
  mission1Set2,
  mission1Set3,
  allVocab,
  type VocabItem,
} from "@/data/vocab";
import { makeCardId, type FlashCard } from "@/data/flashcards";
import { type SessionConfig, type SetFilter } from "@/types/session";

// ─── Vocab pool helpers ───────────────────────────────────────────────────────

export function getVocabPool(setFilter: SetFilter): VocabItem[] {
  if (setFilter === "all") return allVocab;
  if (setFilter === 1) return mission1Set1;
  if (setFilter === 2) return mission1Set2;
  return mission1Set3;
}

export function setLabel(setFilter: SetFilter): string {
  if (setFilter === "all") return "All Sets";
  return `Set ${setFilter}`;
}

// ─── Distractor ───────────────────────────────────────────────────────────────

function pickDistractor(pool: string[], exclude: string): string {
  const candidates = pool.filter((w) => w !== exclude);
  if (candidates.length === 0) return exclude;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ─── Definition status helper ────────────────────────────────────────────────

function shouldIncludeDefinition(
  item: VocabItem,
  statusFilter: SessionConfig["statusFilter"]
): boolean {
  if (statusFilter === "all") return true;
  const all = [...item.synonyms, ...item.antonyms];
  if (statusFilter === "new") return all.some((r) => r.status === "New");
  if (statusFilter === "old") return all.some((r) => r.status === "Old");
  return true;
}

// ─── Card builder ─────────────────────────────────────────────────────────────

export interface CardSummary {
  setFilter: SetFilter;
  definitionCount: number;
  synonymCount: number;
  antonymCount: number;
  newCount: number;
  oldCount: number;
  totalBeforeLimit: number;
  totalInSession: number;
  wordCount: number;
}

export function buildFilteredCards(config: SessionConfig): FlashCard[] {
  // Full set pool for distractors (all words from selected sets, ignoring word filter)
  const fullPool = getVocabPool(config.setFilter).map((v) => v.word);

  // Filtered vocab items (honours word filter)
  const base = getVocabPool(config.setFilter);
  const vocabPool =
    config.selectedWords.length > 0
      ? base.filter((v) => config.selectedWords.includes(v.word))
      : base;

  const incDef =
    config.cardTypeFilter === "all" || config.cardTypeFilter === "definitions";
  const incSyn =
    config.cardTypeFilter === "all" ||
    config.cardTypeFilter === "synonyms" ||
    config.cardTypeFilter === "synonyms-antonyms";
  const incAnt =
    config.cardTypeFilter === "all" ||
    config.cardTypeFilter === "antonyms" ||
    config.cardTypeFilter === "synonyms-antonyms";

  const cards: FlashCard[] = [];

  for (const item of vocabPool) {
    const distractor = () => pickDistractor(fullPool, item.word);

    if (incDef && shouldIncludeDefinition(item, config.statusFilter)) {
      item.definitions.forEach((def, i) => {
        cards.push({
          id: makeCardId(item.mission, item.set, item.word, "def", def, i),
          mission: item.mission,
          set: item.set,
          cardType: "Definition",
          promptText: def,
          correctWord: item.word,
          incorrectWord: distractor(),
          sourceStatus: "Old",
          relatedItem: def,
          targetWord: item.word,
        });
      });
    }

    if (incSyn) {
      const syns =
        config.statusFilter === "all"
          ? item.synonyms
          : item.synonyms.filter(
              (s) => s.status === (config.statusFilter === "new" ? "New" : "Old")
            );
      for (const syn of syns) {
        cards.push({
          id: makeCardId(item.mission, item.set, item.word, "syn", syn.word),
          mission: item.mission,
          set: item.set,
          cardType: "Synonym",
          promptText: syn.word,
          correctWord: item.word,
          incorrectWord: distractor(),
          sourceStatus: syn.status,
          relatedItem: syn.word,
          targetWord: item.word,
          arabic: syn.arabic,
        });
      }
    }

    if (incAnt) {
      const ants =
        config.statusFilter === "all"
          ? item.antonyms
          : item.antonyms.filter(
              (a) => a.status === (config.statusFilter === "new" ? "New" : "Old")
            );
      for (const ant of ants) {
        cards.push({
          id: makeCardId(item.mission, item.set, item.word, "ant", ant.word),
          mission: item.mission,
          set: item.set,
          cardType: "Antonym",
          promptText: ant.word,
          correctWord: item.word,
          incorrectWord: distractor(),
          sourceStatus: ant.status,
          relatedItem: ant.word,
          targetWord: item.word,
          arabic: ant.arabic,
        });
      }
    }
  }

  return cards;
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildSession(config: SessionConfig): FlashCard[] {
  let cards = buildFilteredCards(config);
  if (config.shuffle) cards = shuffleArray(cards);
  if (config.cardCount !== "all") cards = cards.slice(0, config.cardCount as number);
  return cards;
}

export function computeSummary(config: SessionConfig): CardSummary {
  const all = buildFilteredCards(config);
  const defCount  = all.filter((c) => c.cardType === "Definition").length;
  const synCount  = all.filter((c) => c.cardType === "Synonym").length;
  const antCount  = all.filter((c) => c.cardType === "Antonym").length;
  const newCount  = all.filter((c) => c.sourceStatus === "New").length;
  const oldCount  = all.filter((c) => c.sourceStatus === "Old").length;
  const wordSet   = new Set(all.map((c) => c.targetWord));
  const total     = all.length;
  const inSession = config.cardCount !== "all"
    ? Math.min(total, config.cardCount as number)
    : total;

  return {
    setFilter: config.setFilter,
    definitionCount: defCount,
    synonymCount:    synCount,
    antonymCount:    antCount,
    newCount,
    oldCount,
    totalBeforeLimit: total,
    totalInSession:   inSession,
    wordCount: wordSet.size,
  };
}
