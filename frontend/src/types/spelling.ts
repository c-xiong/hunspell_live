export interface SpellingSuggestion {
  suggestions: string[];
  language: string;
}

export interface SpellingResult {
  index: number;
  word: string;
  length: number;
}

export interface LanguageOption {
  label: string;
  value: string;
}

export interface WordInfo {
  word: string;
  start: number;
  end: number;
} 