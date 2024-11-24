import { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';
import { toast } from 'react-toastify';

interface UserWord {
  word: string;
  language: string;
}

interface LanguageWords {
  [language: string]: string[];
}

export const useUserData = () => {
  const [dictionaryWords, setDictionaryWords] = useState<LanguageWords>({});
  const [starListWords, setStarListWords] = useState<LanguageWords>({});
  const [dictionaryLanguages, setDictionaryLanguages] = useState<string[]>([]);
  const [starListLanguages, setStarListLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDictionaryLanguages = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await apiRequest('/api/dictionary/languages/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDictionaryLanguages(data.languages);
      }
    } catch (error) {
      console.error('Error fetching dictionary languages:', error);
      toast.error('Failed to load dictionary languages');
    }
  };

  const fetchStarListLanguages = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await apiRequest('/api/star-list/languages/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStarListLanguages(data.languages);
      }
    } catch (error) {
      console.error('Error fetching star list languages:', error);
      toast.error('Failed to load star list languages');
    }
  };

  const fetchDictionaryWords = async (language: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await apiRequest(`/api/dictionary/words/?language=${language}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDictionaryWords(prev => ({
          ...prev,
          [language]: data.words
        }));
      }
    } catch (error) {
      console.error('Error fetching dictionary words:', error);
      toast.error('Failed to load dictionary words');
    }
  };

  const fetchStarListWords = async (language: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await apiRequest(`/api/star-list/words/?language=${language}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStarListWords(prev => ({
          ...prev,
          [language]: data.words
        }));
      }
    } catch (error) {
      console.error('Error fetching star list words:', error);
      toast.error('Failed to load star list words');
    }
  };

  const addToDictionary = async (word: string, language: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await apiRequest('/api/dictionary/add/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word, language })
      });
      
      if (response.ok) {
        setDictionaryWords(prev => ({
          ...prev,
          [language]: [...(prev[language] || []), word]
        }));
        toast.success('Word added to dictionary');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding word to dictionary:', error);
      toast.error('Failed to add word to dictionary');
      return false;
    }
  };

  const removeFromDictionary = async (word: string, language: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await apiRequest('/api/dictionary/remove/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word, language })
      });
      
      if (response.ok) {
        setDictionaryWords(prev => ({
          ...prev,
          [language]: prev[language].filter(w => w !== word)
        }));
        toast.success('Word removed from dictionary');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing word from dictionary:', error);
      toast.error('Failed to remove word from dictionary');
      return false;
    }
  };

  const addToStarList = async (word: string, language: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await apiRequest('/api/star-list/add/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word, language })
      });
      
      if (response.ok) {
        setStarListWords(prev => ({
          ...prev,
          [language]: [...(prev[language] || []), word]
        }));
        toast.success('Word added to star list');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding word to star list:', error);
      toast.error('Failed to add word to star list');
      return false;
    }
  };

  const removeFromStarList = async (word: string, language: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await apiRequest('/api/star-list/remove/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ word, language })
      });
      
      if (response.ok) {
        setStarListWords(prev => ({
          ...prev,
          [language]: prev[language].filter(w => w !== word)
        }));
        toast.success('Word removed from star list');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing word from star list:', error);
      toast.error('Failed to remove word from star list');
      return false;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDictionaryLanguages(),
        fetchStarListLanguages()
      ]);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  return {
    dictionaryWords,
    starListWords,
    dictionaryLanguages,
    starListLanguages,
    isLoading,
    fetchDictionaryWords,
    fetchStarListWords,
    addToDictionary,
    removeFromDictionary,
    removeFromStarList,
    addToStarList
  };
}; 