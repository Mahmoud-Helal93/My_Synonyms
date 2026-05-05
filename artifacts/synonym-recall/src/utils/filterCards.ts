import { mission1Set1, type VocabItem } from "@/data/vocab";
import { type FlashCard } from "@/data/flashcards";
import { type SessionConfig } from "@/types/session";

const ALL_WORDS = mission1Set1.map((v) => v.word);

function pickDistractor(exclude: string): string {
  const pool = ALL_WORDS.filter((w) => w !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export interface CardSummary {
  definitionCount: number;
  synonymCount: number;
  antonymCount: number;
  totalBeforeLimit: number;
  totalInSession: number;
  wordCount: number;
}

function shouldIncludeDefinition(item: VocabItem, statusFilter: SessionConfig["statusFilter"]): boolean {
  if (statusFilter === "all") return true;
  const allRelated = [...item.synonyms, ...item.antonyms];
  if (statusFilter === "new") return allRelated.some((r) => r.status === "New");
  if (statusFilter === "old") return allRelated.some((r) => r.status === "Old");
  return true;
}

export function buildFilteredCards(config: SessionConfig): FlashCard[] {
  const vocabPool =
    config.selectedWords.length > 0
      ? mission1Set1.filter((v) => config.selectedWords.includes(v.word))
      : mission1Set1;

  const includeDefinitions =
    config.cardTypeFilter === "all" || config.cardTypeFilter === "definitions";
  const includeSynonyms =
    config.cardTypeFilter === "all" ||
    config.cardTypeFilter === "synonyms" ||
    config.cardTypeFilter === "synonyms-antonyms";
  const includeAntonyms =
    config.cardTypeFilter === "all" ||
    config.cardTypeFilter === "antonyms" ||
    config.cardTypeFilter === "synonyms-antonyms";

  const cards: FlashCard[] = [];

  for (const item of vocabPool) {
    if (includeDefinitions && shouldIncludeDefinition(item, config.statusFilter)) {
      item.definitions.forEach((def, i) => {
        cards.push({
          id: `${item.word}-def-${i}`,
          cardType: "Definition",
          promptText: def,
          correctWord: item.word,
          incorrectWord: pickDistractor(item.word),
          sourceStatus: "Old",
          relatedItem: def,
          targetWord: item.word,
        });
      });
    }

    if (includeSynonyms) {
      const syns =
        config.statusFilter === "all"
          ? item.synonyms
          : item.synonyms.filter(
              (s) => s.status === (config.statusFilter === "new" ? "New" : "Old")
            );
      syns.forEach((syn) => {
        cards.push({
          id: `${item.word}-syn-${syn.word}`,
          cardType: "Synonym",
          promptText: syn.word,
          correctWord: item.word,
          incorrectWord: pickDistractor(item.word),
          sourceStatus: syn.status,
          relatedItem: syn.word,
          targetWord: item.word,
        });
      });
    }

    if (includeAntonyms) {
      const ants =
        config.statusFilter === "all"
          ? item.antonyms
          : item.antonyms.filter(
              (a) => a.status === (config.statusFilter === "new" ? "New" : "Old")
            );
      ants.forEach((ant) => {
        cards.push({
          id: `${item.word}-ant-${ant.word}`,
          cardType: "Antonym",
          promptText: ant.word,
          correctWord: item.word,
          incorrectWord: pickDistractor(item.word),
          sourceStatus: ant.status,
          relatedItem: ant.word,
          targetWord: item.word,
        });
      });
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
  if (config.cardCount !== "all") {
    cards = cards.slice(0, config.cardCount as number);
  }
  return cards;
}

export function computeSummary(config: SessionConfig): CardSummary {
  const all = buildFilteredCards(config);
  const defCount = all.filter((c) => c.cardType === "Definition").length;
  const synCount = all.filter((c) => c.cardType === "Synonym").length;
  const antCount = all.filter((c) => c.cardType === "Antonym").length;
  const totalBeforeLimit = all.length;

  const wordSet = new Set(all.map((c) => c.targetWord));

  let totalInSession = totalBeforeLimit;
  if (config.cardCount !== "all") {
    totalInSession = Math.min(totalBeforeLimit, config.cardCount as number);
  }

  return {
    definitionCount: defCount,
    synonymCount: synCount,
    antonymCount: antCount,
    totalBeforeLimit,
    totalInSession,
    wordCount: wordSet.size,
  };
}
