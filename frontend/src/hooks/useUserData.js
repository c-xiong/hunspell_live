import { useCallback, useState } from 'react';
const DICTIONARY_KEY = 'personalDictionary';
const STARLIST_KEY = 'starList';
const readBuckets = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || '{}');
    }
    catch (_a) {
        return {};
    }
};
const writeBuckets = (key, buckets) => {
    localStorage.setItem(key, JSON.stringify(buckets));
};
const addWord = (key, word, language) => {
    const buckets = readBuckets(key);
    const words = buckets[language] || [];
    if (!words.includes(word)) {
        buckets[language] = [...words, word];
        writeBuckets(key, buckets);
    }
    return buckets;
};
const removeWord = (key, word, language) => {
    const buckets = readBuckets(key);
    buckets[language] = (buckets[language] || []).filter((w) => w !== word);
    writeBuckets(key, buckets);
    return buckets;
};
export const useUserData = () => {
    const [dictionaryWords, setDictionaryWords] = useState(() => readBuckets(DICTIONARY_KEY));
    const [starListWords, setStarListWords] = useState(() => readBuckets(STARLIST_KEY));
    const getDictionaryWords = useCallback((language) => readBuckets(DICTIONARY_KEY)[language] || [], []);
    const addToDictionary = useCallback((word, language) => {
        setDictionaryWords(addWord(DICTIONARY_KEY, word, language));
        return true;
    }, []);
    const removeFromDictionary = useCallback((word, language) => {
        setDictionaryWords(removeWord(DICTIONARY_KEY, word, language));
        return true;
    }, []);
    const addToStarList = useCallback((word, language) => {
        setStarListWords(addWord(STARLIST_KEY, word, language));
        return true;
    }, []);
    const removeFromStarList = useCallback((word, language) => {
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
