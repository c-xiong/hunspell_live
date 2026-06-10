var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useState } from 'react';
import { apiRequest } from '../config/api';
import { LANGUAGE_CODE_MAP } from '../constants/language';
import { toast } from 'react-toastify';
const PARTICIPANT_ID_KEY = 'participantId';
export const getParticipantId = () => localStorage.getItem(PARTICIPANT_ID_KEY) || '';
export const setParticipantId = (id) => {
    if (id.trim()) {
        localStorage.setItem(PARTICIPANT_ID_KEY, id.trim());
    }
    else {
        localStorage.removeItem(PARTICIPANT_ID_KEY);
    }
};
export const useApi = (selectedLanguage) => {
    const [spellingResults, setSpellingResults] = useState([]);
    const [suggestionCache, setSuggestionCache] = useState({});
    const resolveLanguage = () => LANGUAGE_CODE_MAP[selectedLanguage] || selectedLanguage || 'en_US';
    // Batch fetch suggestions for multiple words
    const batchGetSuggestions = (words) => __awaiter(void 0, void 0, void 0, function* () {
        const uncachedWords = words.filter((word) => !suggestionCache[word]);
        if (uncachedWords.length === 0)
            return {};
        try {
            const response = yield apiRequest('/api/get-list/', {
                method: 'POST',
                body: JSON.stringify({
                    words: uncachedWords,
                    language: resolveLanguage(),
                }),
            });
            if (!response.ok)
                throw new Error('Failed to get suggestions');
            const result = yield response.json();
            const newSuggestions = {};
            uncachedWords.forEach((word) => {
                var _a;
                newSuggestions[word] = Array.isArray((_a = result.suggestions) === null || _a === void 0 ? void 0 : _a[word])
                    ? result.suggestions[word]
                    : [];
            });
            setSuggestionCache((prev) => (Object.assign(Object.assign({}, prev), newSuggestions)));
            return newSuggestions;
        }
        catch (error) {
            console.error('Error getting batch suggestions:', error);
            return {};
        }
    });
    // Check spelling for the provided text; localDictionaryWords are words the
    // user marked as correct (browser-side personal dictionary).
    const checkSpelling = (text_1, ...args_1) => __awaiter(void 0, [text_1, ...args_1], void 0, function* (text, localDictionaryWords = []) {
        if (!text.trim()) {
            toast.warning('Please enter some text to check spelling');
            return [];
        }
        try {
            const wordRegex = /[\p{L}\p{M}]+/gu;
            let match;
            const wordsWithIndices = [];
            while ((match = wordRegex.exec(text)) !== null) {
                wordsWithIndices.push({ word: match[0], index: match.index });
            }
            const uniqueWords = [...new Set(wordsWithIndices.map((item) => item.word))];
            const response = yield apiRequest('/api/check/', {
                method: 'POST',
                body: JSON.stringify({
                    words: uniqueWords,
                    language: resolveLanguage(),
                }),
            });
            if (response.status === 404) {
                const data = yield response.json();
                const err = new Error(data.error || 'Dictionary session expired');
                err.code = 'SESSION_EXPIRED';
                throw err;
            }
            if (!response.ok)
                throw new Error('Failed to check spelling');
            const result = yield response.json();
            const incorrectWords = result.results
                .filter((res) => !res.is_correct)
                .map((res) => res.word)
                .filter((word) => !localDictionaryWords.includes(word));
            const newResults = wordsWithIndices
                .filter(({ word }) => incorrectWords.includes(word))
                .map(({ word, index }) => ({ index, length: word.length, word }));
            setSpellingResults(newResults);
            return newResults;
        }
        catch (error) {
            if (error.code === 'SESSION_EXPIRED') {
                throw error;
            }
            console.error('Error checking spelling:', error);
            toast.error('Failed to check spelling. Please try again.');
            return [];
        }
    });
    // Fetch suggestions for a single word
    const getSuggestions = (word) => __awaiter(void 0, void 0, void 0, function* () {
        if (suggestionCache[word]) {
            return { suggestions: suggestionCache[word], language: selectedLanguage };
        }
        const newSuggestions = yield batchGetSuggestions([word]);
        return {
            suggestions: newSuggestions[word] || [],
            language: selectedLanguage,
        };
    });
    // Anonymous "error -> correction" report; only stored if the server has
    // replacement logging enabled (self-hosted research instances).
    const recordReplacement = (originalWord, replacementWord) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield apiRequest('/api/replacements/', {
                method: 'POST',
                body: JSON.stringify({
                    original_word: originalWord,
                    replacement_word: replacementWord,
                    language: resolveLanguage(),
                    participant_id: getParticipantId() || null,
                }),
            });
            return response.ok;
        }
        catch (error) {
            console.error('Error recording replacement:', error);
            return false;
        }
    });
    return {
        spellingResults,
        suggestionCache,
        checkSpelling,
        getSuggestions,
        recordReplacement,
    };
};
