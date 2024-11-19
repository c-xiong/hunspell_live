import { useState } from 'react';
import { apiRequest } from '../config/api';
import { SpellingResult, SpellingSuggestion } from '../types/spelling';
import { LANGUAGE_CODE_MAP } from '../constants/language';
import { toast } from 'react-toastify';

export const useSpellChecker = (selectedLanguage: string) => {
  const [spellingResults, setSpellingResults] = useState<SpellingResult[]>([]);
  const [suggestionCache, setSuggestionCache] = useState<Record<string, string[]>>({});
  
  // Batch fetch suggestions for multiple words
  const batchGetSuggestions = async (words: string[]): Promise<Record<string, string[]>> => {
    // Normalize words to lowercase
    const normalizedWords = words.map(word => word.toLowerCase());
    const uncachedWords = normalizedWords.filter(word => !suggestionCache[word]);
    
    if (uncachedWords.length === 0) return {};

    try {
      const response = await apiRequest("/api/get-list/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: uncachedWords,
          language: LANGUAGE_CODE_MAP[selectedLanguage] || 'en_US',
        }),
      });

      if (!response.ok) throw new Error("Failed to get suggestions");

      const result = await response.json();
      
      // Ensure the result.suggestions is in the correct format
      const newSuggestions: Record<string, string[]> = {};
      uncachedWords.forEach((word) => {
        let wordSuggestions: string[] = [];
        if (result.suggestions) {
          if (Array.isArray(result.suggestions[word])) {
            wordSuggestions = result.suggestions[word];
          } else if (Array.isArray(result.suggestions[word.toLowerCase()])) {
            wordSuggestions = result.suggestions[word.toLowerCase()];
          }
        }
        newSuggestions[word] = wordSuggestions;
      });

      // Update the cache with new suggestions
      setSuggestionCache(prev => ({
        ...prev,
        ...newSuggestions
      }));

      return newSuggestions;
    } catch (error) {
      console.error("Error getting batch suggestions:", error);
      return {};
    }
  };

  // Check spelling for the provided text
  const checkSpelling = async (text: string) => {
    if (!text.trim()) {
      toast.warning('Please enter some text to check spelling');
      return [];
    }

    const wordRegex = /[\p{L}\p{M}]+/gu;
    let match;
    const wordsWithIndices: { word: string; index: number }[] = [];

    while ((match = wordRegex.exec(text)) !== null) {
      wordsWithIndices.push({ 
        word: match[0],
        index: match.index 
      });
    }

    // Normalize words to lowercase for consistency
    const uniqueWords = [...new Set(wordsWithIndices.map(item => item.word.toLowerCase()))];

    try {
      const response = await apiRequest("/api/check/", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          words: uniqueWords,
          language: LANGUAGE_CODE_MAP[selectedLanguage] || 'en_US',
        })
      });

      if (!response.ok) throw new Error("Failed to check spelling");
      
      const result = await response.json();
      const incorrectWords = result.results
        .filter((res: { word: string; is_correct: boolean }) => !res.is_correct)
        .map((res: { word: string; is_correct: boolean }) => res.word.toLowerCase());

      // Pre-fetch suggestions for all incorrect words
      let fetchedSuggestions: Record<string, string[]> = {};
      if (incorrectWords.length > 0) {
        fetchedSuggestions = await batchGetSuggestions(incorrectWords);
      }

      // Map results back to their original indices
      const newResults = wordsWithIndices
        .filter(({ word }) => 
          incorrectWords.includes(word.toLowerCase()))
        .map(({ word, index }) => ({
          index,
          word,
          length: word.length,
        }));

      setSpellingResults(newResults);
      return newResults;
    } catch (error) {
      console.error("Error checking spelling:", error);
      toast.error('Failed to check spelling. Please try again.');
      return [];
    }
  };

  // Fetch suggestions for a single word
  const getSuggestions = async (word: string): Promise<SpellingSuggestion> => {
    const normalizedWord = word.toLowerCase();
    // If we have cached suggestions, return them immediately
    if (suggestionCache[normalizedWord]) {
      console.log(`Cache hit for word "${normalizedWord}":`, suggestionCache[normalizedWord]);
      return {
        suggestions: suggestionCache[normalizedWord],
        language: selectedLanguage
      };
    }

    // If not in cache, fetch suggestions
    const newSuggestions = await batchGetSuggestions([normalizedWord]);

    if (newSuggestions[normalizedWord]) {
      console.log(`Fetched and cached suggestions for "${normalizedWord}":`, newSuggestions[normalizedWord]);
      return {
        suggestions: newSuggestions[normalizedWord],
        language: selectedLanguage
      };
    } else {
      console.warn(`No suggestions found for "${normalizedWord}"`);
      return {
        suggestions: [],
        language: selectedLanguage
      };
    }
  };

  return {
    spellingResults,
    suggestionCache,
    checkSpelling,
    getSuggestions,
  };
};