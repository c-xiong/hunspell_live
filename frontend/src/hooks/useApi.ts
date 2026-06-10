import { useState } from 'react';
import { apiRequest } from '../config/api';
import { SpellingResult, SpellingSuggestion } from '../types/spelling';
import { LANGUAGE_CODE_MAP } from '../constants/language';
import { toast } from 'react-toastify';

const PARTICIPANT_ID_KEY = 'participantId';

export const getParticipantId = (): string =>
  localStorage.getItem(PARTICIPANT_ID_KEY) || '';

export const setParticipantId = (id: string) => {
  if (id.trim()) {
    localStorage.setItem(PARTICIPANT_ID_KEY, id.trim());
  } else {
    localStorage.removeItem(PARTICIPANT_ID_KEY);
  }
};

export const useApi = (selectedLanguage: string) => {
  const [spellingResults, setSpellingResults] = useState<SpellingResult[]>([]);
  const [suggestionCache, setSuggestionCache] = useState<Record<string, string[]>>({});

  const resolveLanguage = () => LANGUAGE_CODE_MAP[selectedLanguage] || selectedLanguage || 'en_US';

  // Batch fetch suggestions for multiple words
  const batchGetSuggestions = async (words: string[]): Promise<Record<string, string[]>> => {
    const uncachedWords = words.filter((word) => !suggestionCache[word]);
    if (uncachedWords.length === 0) return {};

    try {
      const response = await apiRequest('/api/get-list/', {
        method: 'POST',
        body: JSON.stringify({
          words: uncachedWords,
          language: resolveLanguage(),
        }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');

      const result = await response.json();
      const newSuggestions: Record<string, string[]> = {};
      uncachedWords.forEach((word) => {
        newSuggestions[word] = Array.isArray(result.suggestions?.[word])
          ? result.suggestions[word]
          : [];
      });

      setSuggestionCache((prev) => ({ ...prev, ...newSuggestions }));
      return newSuggestions;
    } catch (error) {
      console.error('Error getting batch suggestions:', error);
      return {};
    }
  };

  // Check spelling for the provided text; localDictionaryWords are words the
  // user marked as correct (browser-side personal dictionary).
  const checkSpelling = async (text: string, localDictionaryWords: string[] = []) => {
    if (!text.trim()) {
      toast.warning('Please enter some text to check spelling');
      return [];
    }

    try {
      const wordRegex = /[\p{L}\p{M}]+/gu;
      let match;
      const wordsWithIndices: { word: string; index: number }[] = [];

      while ((match = wordRegex.exec(text)) !== null) {
        wordsWithIndices.push({ word: match[0], index: match.index });
      }

      const uniqueWords = [...new Set(wordsWithIndices.map((item) => item.word))];

      const response = await apiRequest('/api/check/', {
        method: 'POST',
        body: JSON.stringify({
          words: uniqueWords,
          language: resolveLanguage(),
        }),
      });

      if (!response.ok) throw new Error('Failed to check spelling');

      const result = await response.json();
      const incorrectWords = result.results
        .filter((res: { word: string; is_correct: boolean }) => !res.is_correct)
        .map((res: { word: string; is_correct: boolean }) => res.word)
        .filter((word: string) => !localDictionaryWords.includes(word));

      const newResults = wordsWithIndices
        .filter(({ word }) => incorrectWords.includes(word))
        .map(({ word, index }) => ({ index, length: word.length, word }));

      setSpellingResults(newResults);
      return newResults;
    } catch (error) {
      console.error('Error checking spelling:', error);
      toast.error('Failed to check spelling. Please try again.');
      return [];
    }
  };

  // Fetch suggestions for a single word
  const getSuggestions = async (word: string): Promise<SpellingSuggestion> => {
    if (suggestionCache[word]) {
      return { suggestions: suggestionCache[word], language: selectedLanguage };
    }

    const newSuggestions = await batchGetSuggestions([word]);
    return {
      suggestions: newSuggestions[word] || [],
      language: selectedLanguage,
    };
  };

  // Anonymous "error -> correction" report; only stored if the server has
  // replacement logging enabled (self-hosted research instances).
  const recordReplacement = async (
    originalWord: string,
    replacementWord: string
  ): Promise<boolean> => {
    try {
      const response = await apiRequest('/api/replacements/', {
        method: 'POST',
        body: JSON.stringify({
          original_word: originalWord,
          replacement_word: replacementWord,
          language: resolveLanguage(),
          participant_id: getParticipantId() || null,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error recording replacement:', error);
      return false;
    }
  };

  return {
    spellingResults,
    suggestionCache,
    checkSpelling,
    getSuggestions,
    recordReplacement,
  };
};
