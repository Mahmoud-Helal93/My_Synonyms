export type WordStatus = "New" | "Old";

export type VocabRelatedWord = {
  word: string;
  arabic?: string;
  status: WordStatus;
};

export type VocabItem = {
  word: string;
  definitions: string[];
  synonyms: VocabRelatedWord[];
  antonyms: VocabRelatedWord[];
};

export const mission1Set1: VocabItem[] = [
  {
    word: "Abound",
    definitions: ["Exist in a large number, quantity or amount; plentiful."],
    synonyms: [
      { word: "Teem", status: "New" },
      { word: "Thrive", status: "Old" },
      { word: "Proliferate", status: "Old" },
      { word: "Flourish", status: "Old" },
      { word: "Overflow", status: "Old" },
    ],
    antonyms: [{ word: "Lack", status: "Old" }],
  },
  {
    word: "Amorphous",
    definitions: ["Without a clearly defined shape; lacking structure."],
    synonyms: [
      { word: "Vague", status: "Old" },
      { word: "Shapeless", status: "Old" },
      { word: "Formless", status: "Old" },
      { word: "Nebulous", status: "New" },
      { word: "Unclear", status: "Old" },
      { word: "Unstructured", status: "Old" },
      { word: "Indefinite", status: "Old" },
    ],
    antonyms: [{ word: "Defined", status: "Old" }],
  },
  {
    word: "Austere",
    definitions: [
      "Person: Severe, strict and stern in manner or attitude.",
      "Things: Lacking luxury or comforts; extremely harsh.",
    ],
    synonyms: [
      { word: "Strict", status: "Old" },
      { word: "Harsh", status: "Old" },
      { word: "Stern", status: "New" },
      { word: "Dour", status: "New" },
      { word: "Grim", status: "New" },
      { word: "Ascetic", status: "New" },
      { word: "Spartan", status: "New" },
      { word: "Abstemious", status: "New" },
      { word: "Severe", status: "Old" },
    ],
    antonyms: [{ word: "Lavish", status: "New" }],
  },
  {
    word: "Belie",
    definitions: ["To give a false impression."],
    synonyms: [
      { word: "Disguise", status: "Old" },
      { word: "Mask", status: "Old" },
      { word: "Misrepresent", status: "Old" },
      { word: "Contradict", status: "Old" },
      { word: "Conceal", status: "New" },
    ],
    antonyms: [{ word: "Reveal", status: "Old" }],
  },
  {
    word: "Capricious",
    definitions: ["Having varying moods or behaviors."],
    synonyms: [
      { word: "Fickle", status: "New" },
      { word: "Mercurial", status: "New" },
      { word: "Whimsical", status: "New" },
      { word: "Impulsive", status: "New" },
      { word: "Volatile", status: "Old" },
      { word: "Unsteady", status: "Old" },
    ],
    antonyms: [{ word: "Steady", status: "Old" }],
  },
  {
    word: "Cerebral",
    definitions: [
      "Related to the intellect and learning; requires thinking.",
      "Related to the brain.",
    ],
    synonyms: [
      { word: "Intellectual", status: "Old" },
      { word: "Analytical", status: "Old" },
      { word: "Rational", status: "Old" },
      { word: "Academic", status: "Old" },
      { word: "Neurological", status: "New" },
      { word: "Cranial", status: "New" },
      { word: "Cortical", status: "New" },
    ],
    antonyms: [{ word: "Instinctive", status: "New" }],
  },
  {
    word: "Congenial",
    definitions: [
      "Person: Likeable and friendly due to shared interests.",
      "Things: Enjoyable because it aligns with one's tendencies.",
    ],
    synonyms: [
      { word: "Sociable", status: "Old" },
      { word: "Friendly", status: "Old" },
      { word: "Likeable", status: "Old" },
      { word: "Affable", status: "New" },
      { word: "Convivial", status: "New" },
      { word: "Genial", status: "New" },
      { word: "Kindred", status: "New" },
      { word: "Appealing", status: "Old" },
      { word: "Pleasant", status: "Old" },
      { word: "Agreeable", status: "Old" },
      { word: "Compatible", status: "Old" },
    ],
    antonyms: [{ word: "Unpleasant", status: "Old" }],
  },
  {
    word: "Conspicuous",
    definitions: ["Clearly visible or seen; attracting notice or attention."],
    synonyms: [
      { word: "Standing out", status: "Old" },
      { word: "Noticeable", status: "Old" },
      { word: "Glaring", status: "New" },
      { word: "Prominent", status: "New" },
      { word: "Manifest", status: "New" },
      { word: "Patent", status: "New" },
      { word: "Striking", status: "New" },
    ],
    antonyms: [{ word: "Hidden", status: "Old" }],
  },
  {
    word: "Cursory",
    definitions: ["Quick, not thorough or detailed; lacking effort or care."],
    synonyms: [
      { word: "Hasty", status: "Old" },
      { word: "Superficial", status: "New" },
      { word: "Perfunctory", status: "New" },
      { word: "Token", status: "New" },
      { word: "Desultory", status: "New" },
    ],
    antonyms: [
      { word: "Detailed", status: "Old" },
      { word: "Thorough", status: "Old" },
    ],
  },
  {
    word: "Daunting",
    definitions: ["Seeming difficult or impossible."],
    synonyms: [
      { word: "Scary", status: "Old" },
      { word: "Intimidating", status: "Old" },
      { word: "Frightening", status: "Old" },
      { word: "Overwhelming", status: "New" },
      { word: "Formidable", status: "New" },
      { word: "Unnerving", status: "New" },
      { word: "Discouraging", status: "Old" },
    ],
    antonyms: [{ word: "Reassuring", status: "New" }],
  },
];
