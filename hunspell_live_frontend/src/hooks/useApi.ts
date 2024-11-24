import { useState } from 'react';
import { apiRequest } from '../config/api';
import { SpellingResult, SpellingSuggestion } from '../types/spelling';
import { LANGUAGE_CODE_MAP } from '../constants/language';
import { toast } from 'react-toastify';

export const useApi = (selectedLanguage: string) => {
  const [spellingResults, setSpellingResults] = useState<SpellingResult[]>([]);
  const [suggestionCache, setSuggestionCache] = useState<Record<string, string[]>>({});
  
  // Batch fetch suggestions for multiple words
  const batchGetSuggestions = async (words: string[]): Promise<Record<string, string[]>> => {
    // Remove normalization - use original words
    const uncachedWords = words.filter(word => !suggestionCache[word]);
    
    if (uncachedWords.length === 0) return {};

    try {
      const response = await apiRequest("/api/get-list/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: uncachedWords, // Send original words
          language: LANGUAGE_CODE_MAP[selectedLanguage] || 'en_US',
        }),
      });

      if (!response.ok) throw new Error("Failed to get suggestions");

      const result = await response.json();
      
      // Update suggestion handling to preserve case
      const newSuggestions: Record<string, string[]> = {};
      uncachedWords.forEach((word) => {
        let wordSuggestions: string[] = [];
        if (result.suggestions) {
          if (Array.isArray(result.suggestions[word])) {
            wordSuggestions = result.suggestions[word];
          }
        }
        newSuggestions[word] = wordSuggestions;
      });

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

    // Use original words instead of lowercase
    const uniqueWords = [...new Set(wordsWithIndices.map(item => item.word))];

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
        .map((res: { word: string; is_correct: boolean }) => res.word);

      // Create new results for all instances of incorrect words
      const newResults = wordsWithIndices
        .filter(({ word }) => incorrectWords.includes(word))
        .map(({ word, index }) => ({
          index,
          word,
          length: word.length,
        }));

      setSpellingResults(newResults);
      return newResults; // Return the results array
    } catch (error) {
      console.error("Error checking spelling:", error);
      toast.error('Failed to check spelling. Please try again.');
      return [];
    }
  };

  // Fetch suggestions for a single word
  const getSuggestions = async (word: string): Promise<SpellingSuggestion> => {
    // Use original word instead of lowercase
    if (suggestionCache[word]) {
      console.log(`Cache hit for word "${word}":`, suggestionCache[word]);
      return {
        suggestions: suggestionCache[word],
        language: selectedLanguage
      };
    }

    const newSuggestions = await batchGetSuggestions([word]);

    if (newSuggestions[word]) {
      console.log(`Fetched and cached suggestions for "${word}":`, newSuggestions[word]);
      return {
        suggestions: newSuggestions[word],
        language: selectedLanguage
      };
    } else {
      console.warn(`No suggestions found for "${word}"`);
      return {
        suggestions: [],
        language: selectedLanguage
      };
    }
  };

  const addWordToDictionary = async (word: string): Promise<boolean> => {
    try {
      const response = await apiRequest("/api/dictionary/add/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word,
          language: LANGUAGE_CODE_MAP[selectedLanguage] || 'en_US',
        }),
      });

      if (!response.ok) throw new Error("Failed to add word");
      
      // Clear the suggestion cache for this word
      setSuggestionCache(prev => {
        const newCache = { ...prev };
        delete newCache[word];
        return newCache;
      });

      return true;
    } catch (error) {
      console.error("Error adding word to dictionary:", error);
      return false;
    }
  };

  const addWordToStarList = async (word: string): Promise<boolean> => {
    try {
      const response = await apiRequest("/api/star-list/add/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word,
          language: LANGUAGE_CODE_MAP[selectedLanguage] || 'en_US',
        }),
      });

      if (!response.ok) throw new Error("Failed to add word");
      
      // Clear the suggestion cache for this word
      setSuggestionCache(prev => {
        const newCache = { ...prev };
        delete newCache[word];
        return newCache;
      });

      return true;
    } catch (error) {
      console.error("Error adding word to star list:", error);
      return false;
    }
  };

  return {
    spellingResults,
    suggestionCache,
    checkSpelling,
    getSuggestions,
    addWordToDictionary,
    addWordToStarList
  };
};