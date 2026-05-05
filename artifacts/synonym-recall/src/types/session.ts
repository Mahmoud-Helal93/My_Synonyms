export type CardTypeFilter =
  | "all"
  | "definitions"
  | "synonyms"
  | "antonyms"
  | "synonyms-antonyms";

export type StatusFilter = "all" | "new" | "old";

export type CardCountOption = "all" | 10 | 20 | "custom";

export interface SessionConfig {
  cardTypeFilter: CardTypeFilter;
  statusFilter: StatusFilter;
  selectedWords: string[];
  cardCount: number | "all";
  shuffle: boolean;
}

export const DEFAULT_CONFIG: SessionConfig = {
  cardTypeFilter: "all",
  statusFilter: "all",
  selectedWords: [],
  cardCount: "all",
  shuffle: true,
};
