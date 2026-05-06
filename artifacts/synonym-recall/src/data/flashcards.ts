import { allVocab, type VocabItem, type WordStatus } from "./vocab";

export type CardType = "Definition" | "Synonym" | "Antonym";

export interface FlashCard {
  id: string;
  mission: number;
  set: number;
  cardType: CardType;
  promptText: string;
  correctWord: string;
  incorrectWord: string;
  sourceStatus: WordStatus;
  relatedItem: string;
  targetWord: string;
  arabic?: string;
}

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export function makeCardId(
  mission: number,
  set: number,
  word: string,
  cardType: "def" | "syn" | "ant",
  related: string,
  index?: number
): string {
  if (cardType === "def") {
    return `mission-${mission}-set-${set}-${slug(word)}-def-${index ?? 0}`;
  }
  return `mission-${mission}-set-${set}-${slug(word)}-${cardType}-${slug(related)}`;
}

function pickDistractor(allWords: string[], exclude: string): string {
  const pool = allWords.filter((w) => w !== exclude);
  if (pool.length === 0) return exclude;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateCards(vocab: VocabItem[]): FlashCard[] {
  const allWords = vocab.map((v) => v.word);
  const cards: FlashCard[] = [];

  for (const item of vocab) {
    const distractor = () => pickDistractor(allWords, item.word);

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

    for (const syn of item.synonyms) {
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

    for (const ant of item.antonyms) {
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

  return cards;
}

export function shuffleCards<T>(cards: T[]): T[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** All cards across every mission and set — used by the Progress page */
export const allCards = generateCards(allVocab);
