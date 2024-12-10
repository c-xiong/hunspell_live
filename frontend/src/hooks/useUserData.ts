import { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';
import { toast } from 'react-toastify';
import { useAuthContext } from '../contexts/AuthContext';

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
  const { accessToken } = useAuthContext();

  const fetchDictionaryLanguages = async () => {
    if (!accessToken) return;
    
    try {
      const response = await apiRequest('/api/dictionary/languages/', {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDictionaryLanguages(data.languages);
      }
    } catch (error) {
      console.error('Error fetching dictionary languages:', error);
    }
  };

  const fetchStarListLanguages = async () => {
    if (!accessToken) return;
    
    try {
      const response = await apiRequest('/api/star-list/languages/', {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStarListLanguages(data.languages);
      }
    } catch (error) {
      console.error('Error fetching star list languages:', error);
    }
  };

  const fetchDictionaryWords = async (language: string) => {
    if (!dictionaryLanguages.includes(language)) {
      console.log('Language not in dictionary languages:', language); // Debug log
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      console.log('Fetching dictionary words for language:', language); // Debug log
      
      const response = await apiRequest(`/api/dictionary/words/?language=${language}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received dictionary words:', data.words); // Debug log
        setDictionaryWords(prev => ({
          ...prev,
          [language]: data.words
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
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
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
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
      if (accessToken) {
        await Promise.all([
          fetchDictionaryLanguages(),
          fetchStarListLanguages()
        ]);
      }
      setIsLoading(false);
    };

    initializeData();
  }, [accessToken]);

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