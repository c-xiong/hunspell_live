import { useCallback, useState } from 'react';

// Personal dictionary and star list, stored entirely in the browser
// (localStorage, bucketed per language code). No backend involved.

interface LanguageWords {
  [language: string]: string[];
}

const DICTIONARY_KEY = 'personalDictionary';
const STARLIST_KEY = 'starList';

const readBuckets = (key: string): LanguageWords => {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
};

const writeBuckets = (key: string, buckets: LanguageWords) => {
  localStorage.setItem(key, JSON.stringify(buckets));
};

const addWord = (key: string, word: string, language: string): LanguageWords => {
  const buckets = readBuckets(key);
  const words = buckets[language] || [];
  if (!words.includes(word)) {
    buckets[language] = [...words, word];
    writeBuckets(key, buckets);
  }
  return buckets;
};

const removeWord = (key: string, word: string, language: string): LanguageWords => {
  const buckets = readBuckets(key);
  buckets[language] = (buckets[language] || []).filter((w) => w !== word);
  writeBuckets(key, buckets);
  return buckets;
};

export const useUserData = () => {
  const [dictionaryWords, setDictionaryWords] = useState<LanguageWords>(() =>
    readBuckets(DICTIONARY_KEY)
  );
  const [starListWords, setStarListWords] = useState<LanguageWords>(() =>
    readBuckets(STARLIST_KEY)
  );

  const getDictionaryWords = useCallback(
    (language: string): string[] => readBuckets(DICTIONARY_KEY)[language] || [],
    []
  );

  const addToDictionary = useCallback((word: string, language: string) => {
    setDictionaryWords(addWord(DICTIONARY_KEY, word, language));
    return true;
  }, []);

  const removeFromDictionary = useCallback((word: string, language: string) => {
    setDictionaryWords(removeWord(DICTIONARY_KEY, word, language));
    return true;
  }, []);

  const addToStarList = useCallback((word: string, language: string) => {
    setStarListWords(addWord(STARLIST_KEY, word, language));
    return true;
  }, []);

  const removeFromStarList = useCallback((word: string, language: string) => {
    setStarListWords(removeWord(STARLIST_KEY, word, language));
    return true;
  }, []);

  return {
    dictionaryWords,
    starListWords,
    getDictionaryWords,
    addToDictionary,
    removeFromDictionary,
    addToStarList,
    removeFromStarList,
  };
};
