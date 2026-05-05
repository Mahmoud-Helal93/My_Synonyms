import { mission1Set1, type VocabItem, type WordStatus } from "./vocab";

export type CardType = "Definition" | "Synonym" | "Antonym";

export interface FlashCard {
  id: string;
  cardType: CardType;
  promptText: string;
  correctWord: string;
  incorrectWord: string;
  sourceStatus: WordStatus;
  relatedItem: string;
  targetWord: string;
}

function pickDistractor(allWords: string[], exclude: string): string {
  const pool = allWords.filter((w) => w !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function generateCards(vocab: VocabItem[]): FlashCard[] {
  const allWords = vocab.map((v) => v.word);
  const cards: FlashCard[] = [];

  for (const item of vocab) {
    const distractor = () => pickDistractor(allWords, item.word);

    for (let i = 0; i < item.definitions.length; i++) {
      cards.push({
        id: `${item.word}-def-${i}`,
        cardType: "Definition",
        promptText: item.definitions[i],
        correctWord: item.word,
        incorrectWord: distractor(),
        sourceStatus: "Old",
        relatedItem: item.definitions[i],
        targetWord: item.word,
      });
    }

    for (const syn of item.synonyms) {
      cards.push({
        id: `${item.word}-syn-${syn.word}`,
        cardType: "Synonym",
        promptText: syn.word,
        correctWord: item.word,
        incorrectWord: distractor(),
        sourceStatus: syn.status,
        relatedItem: syn.word,
        targetWord: item.word,
      });
    }

    for (const ant of item.antonyms) {
      cards.push({
        id: `${item.word}-ant-${ant.word}`,
        cardType: "Antonym",
        promptText: ant.word,
        correctWord: item.word,
        incorrectWord: distractor(),
        sourceStatus: ant.status,
        relatedItem: ant.word,
        targetWord: item.word,
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

export const allCards = generateCards(mission1Set1);
