export type WordStatus = "New" | "Old";

export type VocabRelatedWord = {
  word: string;
  arabic?: string;
  status: WordStatus;
};

export type VocabItem = {
  mission: number;
  set: number;
  word: string;
  definitions: string[];
  synonyms: VocabRelatedWord[];
  antonyms: VocabRelatedWord[];
};

// ─── Mission 1 · Set 1 ───────────────────────────────────────────────────────

export const mission1Set1: VocabItem[] = [
  {
    mission: 1, set: 1,
    word: "Abound",
    definitions: ["Exist in a large number, quantity or amount; plentiful."],
    synonyms: [
      { word: "Teem",        status: "New" },
      { word: "Thrive",      status: "Old" },
      { word: "Proliferate", status: "Old" },
      { word: "Flourish",    status: "Old" },
      { word: "Overflow",    status: "Old" },
    ],
    antonyms: [{ word: "Lack", status: "Old" }],
  },
  {
    mission: 1, set: 1,
    word: "Amorphous",
    definitions: ["Without a clearly defined shape; lacking structure."],
    synonyms: [
      { word: "Vague",        status: "Old" },
      { word: "Shapeless",    status: "Old" },
      { word: "Formless",     status: "Old" },
      { word: "Nebulous",     status: "New" },
      { word: "Unclear",      status: "Old" },
      { word: "Unstructured", status: "Old" },
      { word: "Indefinite",   status: "Old" },
    ],
    antonyms: [{ word: "Defined", status: "Old" }],
  },
  {
    mission: 1, set: 1,
    word: "Austere",
    definitions: [
      "Person: Severe, strict and stern in manner or attitude.",
      "Things: Lacking luxury or comforts; extremely harsh.",
    ],
    synonyms: [
      { word: "Strict",      status: "Old" },
      { word: "Harsh",       status: "Old" },
      { word: "Stern",       status: "New" },
      { word: "Dour",        status: "New" },
      { word: "Grim",        status: "New" },
      { word: "Ascetic",     status: "New" },
      { word: "Spartan",     status: "New" },
      { word: "Abstemious",  status: "New" },
      { word: "Severe",      status: "Old" },
    ],
    antonyms: [{ word: "Lavish", status: "New" }],
  },
  {
    mission: 1, set: 1,
    word: "Belie",
    definitions: ["To give a false impression."],
    synonyms: [
      { word: "Disguise",      status: "Old" },
      { word: "Mask",          status: "Old" },
      { word: "Misrepresent", status: "Old" },
      { word: "Contradict",    status: "Old" },
      { word: "Conceal",       status: "New" },
    ],
    antonyms: [{ word: "Reveal", status: "Old" }],
  },
  {
    mission: 1, set: 1,
    word: "Capricious",
    definitions: ["Having varying moods or behaviors."],
    synonyms: [
      { word: "Fickle",     status: "New" },
      { word: "Mercurial",  status: "New" },
      { word: "Whimsical",  status: "New" },
      { word: "Impulsive",  status: "New" },
      { word: "Volatile",   status: "Old" },
      { word: "Unsteady",   status: "Old" },
    ],
    antonyms: [{ word: "Steady", status: "Old" }],
  },
  {
    mission: 1, set: 1,
    word: "Cerebral",
    definitions: [
      "Related to the intellect and learning; requires thinking.",
      "Related to the brain.",
    ],
    synonyms: [
      { word: "Intellectual",  status: "Old" },
      { word: "Analytical",    status: "Old" },
      { word: "Rational",      status: "Old" },
      { word: "Academic",      status: "Old" },
      { word: "Neurological",  status: "New" },
      { word: "Cranial",       status: "New" },
      { word: "Cortical",      status: "New" },
    ],
    antonyms: [{ word: "Instinctive", status: "New" }],
  },
  {
    mission: 1, set: 1,
    word: "Congenial",
    definitions: [
      "Person: Likeable and friendly due to shared interests.",
      "Things: Enjoyable because it aligns with one's tendencies.",
    ],
    synonyms: [
      { word: "Sociable",    status: "Old" },
      { word: "Friendly",    status: "Old" },
      { word: "Likeable",    status: "Old" },
      { word: "Affable",     status: "New" },
      { word: "Convivial",   status: "New" },
      { word: "Genial",      status: "New" },
      { word: "Kindred",     status: "New" },
      { word: "Appealing",   status: "Old" },
      { word: "Pleasant",    status: "Old" },
      { word: "Agreeable",   status: "Old" },
      { word: "Compatible",  status: "Old" },
    ],
    antonyms: [{ word: "Unpleasant", status: "Old" }],
  },
  {
    mission: 1, set: 1,
    word: "Conspicuous",
    definitions: ["Clearly visible or seen; attracting notice or attention."],
    synonyms: [
      { word: "Standing out", status: "Old" },
      { word: "Noticeable",   status: "Old" },
      { word: "Glaring",      status: "New" },
      { word: "Prominent",    status: "New" },
      { word: "Manifest",     status: "New" },
      { word: "Patent",       status: "New" },
      { word: "Striking",     status: "New" },
    ],
    antonyms: [{ word: "Hidden", status: "Old" }],
  },
  {
    mission: 1, set: 1,
    word: "Cursory",
    definitions: ["Quick, not thorough or detailed; lacking effort or care."],
    synonyms: [
      { word: "Hasty",        status: "Old" },
      { word: "Superficial",  status: "New" },
      { word: "Perfunctory",  status: "New" },
      { word: "Token",        status: "New" },
      { word: "Desultory",    status: "New" },
    ],
    antonyms: [
      { word: "Detailed",  status: "Old" },
      { word: "Thorough",  status: "Old" },
    ],
  },
  {
    mission: 1, set: 1,
    word: "Daunting",
    definitions: ["Seeming difficult or impossible."],
    synonyms: [
      { word: "Scary",         status: "Old" },
      { word: "Intimidating",  status: "Old" },
      { word: "Frightening",   status: "Old" },
      { word: "Overwhelming",  status: "New" },
      { word: "Formidable",    status: "New" },
      { word: "Unnerving",     status: "New" },
      { word: "Discouraging",  status: "Old" },
    ],
    antonyms: [{ word: "Reassuring", status: "New" }],
  },
];

// ─── Mission 1 · Set 2 ───────────────────────────────────────────────────────

export const mission1Set2: VocabItem[] = [
  {
    mission: 1, set: 2,
    word: "Deify",
    definitions: ["Worship or regard as a god (someone or something)"],
    synonyms: [
      { word: "Idealize",  status: "New" },
      { word: "Idolize",   status: "New" },
      { word: "Exalt",     status: "New" },
      { word: "Lionize",   status: "New" },
      { word: "Venerate",  status: "New" },
    ],
    antonyms: [{ word: "Demonize", status: "New" }],
  },
  {
    mission: 1, set: 2,
    word: "Didactic",
    definitions: ["Intended to teach, educational"],
    synonyms: [
      { word: "Instructive",  status: "Old" },
      { word: "Doctrinal",    status: "New" },
      { word: "Pedagogic",    status: "New" },
      { word: "Moralizing",   status: "New" },
    ],
    antonyms: [{ word: "Entertaining", status: "Old" }],
  },
  {
    mission: 1, set: 2,
    word: "Disseminate",
    definitions: ["Distribute or circulate broadly"],
    synonyms: [
      { word: "Spread",      status: "Old" },
      { word: "Broadcast",   status: "Old" },
      { word: "Disperse",    status: "New" },
      { word: "Promulgate",  status: "New" },
      { word: "Propagate",   status: "New" },
    ],
    antonyms: [{ word: "Conceal", status: "Old" }],
  },
  {
    mission: 1, set: 2,
    word: "Feasible",
    definitions: ["Likely to be achieved; practical; reasonable to do"],
    synonyms: [
      { word: "Attainable",   status: "Old" },
      { word: "Realizable",   status: "Old" },
      { word: "Achievable",   status: "Old" },
      { word: "Possible",     status: "Old" },
      { word: "Practicable",  status: "Old" },
      { word: "Expedient",    status: "New" },
      { word: "Viable",       status: "New" },
      { word: "Impossible",   status: "Old" },
    ],
    antonyms: [],
  },
  {
    mission: 1, set: 2,
    word: "Flout",
    definitions: ["Break, disregard or disobey a rule, law, or convention"],
    synonyms: [
      { word: "Defy",         status: "New" },
      { word: "Scorn",        status: "New" },
      { word: "Contravene",   status: "New" },
    ],
    antonyms: [{ word: "Obey", status: "Old" }],
  },
  {
    mission: 1, set: 2,
    word: "Homogeneous",
    definitions: ["Of the same kind; uniform in structure or composition"],
    synonyms: [
      { word: "Uniform",           status: "Old" },
      { word: "Analogous",         status: "Old" },
      { word: "Undistinguishable", status: "Old" },
      { word: "Consistent",        status: "Old" },
      { word: "Alike",             status: "Old" },
    ],
    antonyms: [{ word: "Heterogeneous", status: "New" }],
  },
  {
    mission: 1, set: 2,
    word: "Humdrum",
    definitions: ["Boring; lacking variety or excitement"],
    synonyms: [
      { word: "Dull",        status: "New" },
      { word: "Monotonous",  status: "New" },
      { word: "Tedious",     status: "New" },
      { word: "Mundane",     status: "New" },
      { word: "Banal",       status: "New" },
      { word: "Prosaic",     status: "New" },
    ],
    antonyms: [{ word: "Exciting", status: "Old" }],
  },
  {
    mission: 1, set: 2,
    word: "Insipid",
    definitions: ["Lacking flavor, vigor, energy, or interest"],
    synonyms: [
      { word: "Bland",      status: "New" },
      { word: "Vapid",      status: "New" },
      { word: "Tasteless",  status: "Old" },
      { word: "Dull",       status: "New" },
    ],
    antonyms: [{ word: "Flavorful", status: "New" }],
  },
  {
    mission: 1, set: 2,
    word: "Loquacious",
    definitions: ["Tending to talk a great deal"],
    synonyms: [
      { word: "Wordy",      status: "New" },
      { word: "Talkative",  status: "Old" },
      { word: "Garrulous",  status: "New" },
      { word: "Verbose",    status: "New" },
      { word: "Voluble",    status: "New" },
    ],
    antonyms: [{ word: "Taciturn", status: "New" }],
  },
  {
    mission: 1, set: 2,
    word: "Misanthropic",
    definitions: ["Having a dislike or distrust of humankind"],
    synonyms: [
      { word: "Unsociable",    status: "Old" },
      { word: "Cynical",       status: "New" },
      { word: "Antisocial",    status: "New" },
      { word: "Reclusive",     status: "New" },
      { word: "Inhospitable",  status: "New" },
    ],
    antonyms: [{ word: "Sociable", status: "Old" }],
  },
];

// ─── Mission 1 · Set 3 ───────────────────────────────────────────────────────

export const mission1Set3: VocabItem[] = [
  {
    mission: 1, set: 3,
    word: "Misnomer",
    definitions: ["A misleading or inaccurate name"],
    synonyms: [
      { word: "Mislabeling",     status: "New" },
      { word: "Misapplication",  status: "Old" },
      { word: "Inaccuracy",      status: "Old" },
    ],
    antonyms: [{ word: "Accuracy", status: "Old" }],
  },
  {
    mission: 1, set: 3,
    word: "Negligent",
    definitions: ["Lacking care or attention"],
    synonyms: [
      { word: "Remiss",        status: "New" },
      { word: "Neglectful",    status: "Old" },
      { word: "Lax",           status: "New" },
      { word: "Careless",      status: "Old" },
      { word: "Inattentive",   status: "Old" },
    ],
    antonyms: [{ word: "Attentive", status: "Old" }],
  },
  {
    mission: 1, set: 3,
    word: "Obsequious",
    definitions: ["Excessively submissive to authority; excessively compliant"],
    synonyms: [
      { word: "Obedient",     status: "Old" },
      { word: "Flattering",   status: "New" },
      { word: "Sycophantic",  status: "New" },
      { word: "Fawning",      status: "New" },
      { word: "Servile",      status: "New" },
      { word: "Unctuous",     status: "New" },
    ],
    antonyms: [{ word: "Assertive", status: "New" }],
  },
  {
    mission: 1, set: 3,
    word: "Placate",
    definitions: ["Decrease someone's anger"],
    synonyms: [
      { word: "Appease",      status: "New" },
      { word: "Mollify",      status: "New" },
      { word: "Pacify",       status: "New" },
      { word: "Conciliate",   status: "New" },
      { word: "Calm",         status: "Old" },
      { word: "Soothe",       status: "New" },
    ],
    antonyms: [{ word: "Anger", status: "Old" }],
  },
  {
    mission: 1, set: 3,
    word: "Proclivity",
    definitions: ["Tendency to choose or do something regularly"],
    synonyms: [
      { word: "Inclination",     status: "New" },
      { word: "Predisposition",  status: "New" },
      { word: "Propensity",      status: "Old" },
      { word: "Tendency",        status: "New" },
    ],
    antonyms: [{ word: "Aversion", status: "New" }],
  },
  {
    mission: 1, set: 3,
    word: "Puerile",
    definitions: ["Immature and childish"],
    synonyms: [
      { word: "Juvenile",   status: "New" },
      { word: "Immature",   status: "Old" },
      { word: "Childish",   status: "Old" },
      { word: "Infantile",  status: "New" },
      { word: "Inane",      status: "New" },
    ],
    antonyms: [{ word: "Mature", status: "Old" }],
  },
  {
    mission: 1, set: 3,
    word: "Quixotic",
    definitions: ["Excessively visionary and idealistic; unfeasible"],
    synonyms: [
      { word: "Unrealistic",  status: "Old" },
      { word: "Impractical",  status: "Old" },
      { word: "Visionary",    status: "New" },
      { word: "Idealistic",   status: "Old" },
      { word: "Utopian",      status: "New" },
      { word: "Nonviable",    status: "New" },
    ],
    antonyms: [{ word: "Pragmatic", status: "New" }],
  },
  {
    mission: 1, set: 3,
    word: "Spendthrift",
    definitions: ["Someone who spends money recklessly, irresponsibly"],
    synonyms: [
      { word: "Wasteful",     status: "Old" },
      { word: "Wastrel",      status: "New" },
      { word: "Prodigal",     status: "New" },
      { word: "Squanderer",   status: "New" },
      { word: "Profligate",   status: "New" },
    ],
    antonyms: [{ word: "Miser", status: "New" }],
  },
  {
    mission: 1, set: 3,
    word: "Taciturn",
    definitions: ["Of few words; speaking little; habitually silent"],
    synonyms: [
      { word: "Reticent",       status: "New" },
      { word: "Reserved",       status: "New" },
      { word: "Laconic",        status: "New" },
      { word: "Unforthcoming",  status: "New" },
      { word: "Retiring",       status: "New" },
    ],
    antonyms: [{ word: "Loquacious", status: "New" }],
  },
  {
    mission: 1, set: 3,
    word: "Wary",
    definitions: ["Exercising caution; careful"],
    synonyms: [
      { word: "Cautious",  status: "Old" },
      { word: "Guarded",   status: "New" },
      { word: "Vigilant",  status: "New" },
      { word: "Chary",     status: "New" },
      { word: "Heedful",   status: "New" },
    ],
    antonyms: [{ word: "Careless", status: "Old" }],
  },
];

// ─── Combined ────────────────────────────────────────────────────────────────

export const allVocab: VocabItem[] = [
  ...mission1Set1,
  ...mission1Set2,
  ...mission1Set3,
];
