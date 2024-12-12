import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useUserData } from '../hooks/useUserData';
import { FaBook, FaTrash, FaStar, FaUser, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from '../styles/ProfilePage.module.css';
import Dropdown from '../components/Dropdown';
import { LANGUAGE_OPTIONS } from '../constants/language';
import { LANGUAGE_CHOICES, EDUCATION_CHOICES } from '../constants/userChoices';

interface User {
  username: string;
  email: string;
  age: number;
  gender: string;
  education: string;
  mother_languages: string[];
}

const getLanguageName = (code: string): string => {
  const language = LANGUAGE_CHOICES.find(lang => lang.value === code);
  return language?.label || code;
};

const getEducationLabel = (value: string): string => {
  const education = EDUCATION_CHOICES.find(edu => edu.value === value);
  return education?.label || value;
};

const ProfilePage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'info' | 'dictionary' | 'starlist'>('info');
  const [selectedDictLanguage, setSelectedDictLanguage] = useState<string>('');
  const [selectedStarLanguage, setSelectedStarLanguage] = useState<string>('');
  
  const {
    dictionaryWords,
    starListWords,
    dictionaryLanguages,
    starListLanguages,
    isLoading: dataLoading,
    fetchDictionaryWords,
    fetchStarListWords,
    removeFromDictionary,
    removeFromStarList
  } = useUserData();

  const filteredDictionaryOptions = LANGUAGE_OPTIONS.filter(option =>
    dictionaryLanguages.includes(option.value)
  );

  const filteredStarListOptions = LANGUAGE_OPTIONS.filter(option =>
    starListLanguages.includes(option.value)
  );

  useEffect(() => {
    if (dictionaryLanguages.length > 0 && !selectedDictLanguage) {
      setSelectedDictLanguage(dictionaryLanguages[0]);
      fetchDictionaryWords(dictionaryLanguages[0]);
    }
  }, [dictionaryLanguages]);

  useEffect(() => {
    if (starListLanguages.length > 0 && !selectedStarLanguage) {
      setSelectedStarLanguage(starListLanguages[0]);
      fetchStarListWords(starListLanguages[0]);
    }
  }, [starListLanguages]);

  const handleDictionaryLanguageChange = (option: { label: string, value: string }) => {
    setSelectedDictLanguage(option.value);
    fetchDictionaryWords(option.value);
  };

  const handleStarListLanguageChange = (option: { label: string, value: string }) => {
    setSelectedStarLanguage(option.value);
    fetchStarListWords(option.value);
  };

  if (authLoading || dataLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ''}`}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <Link to="/" className={styles.homeButton}>
              <FaHome className={styles.buttonIcon} />
              Return to Home
            </Link>
            <h1 className={styles.title}>My Profile</h1>
          </div>
          <div className={styles.headerNav}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'info' ? styles.active : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <FaUser /> Overview
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'dictionary' ? styles.active : ''}`}
              onClick={() => setActiveTab('dictionary')}
            >
              <FaBook /> Dictionary
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'starlist' ? styles.active : ''}`}
              onClick={() => setActiveTab('starlist')}
            >
              <FaStar /> Starred Words
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {activeTab === 'info' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>User Information</h2>
              <div className={styles.userInfo}>
                <div className={styles.infoCard}>
                  <span className={styles.label}>Username</span>
                  <span className={styles.value}>{user?.username}</span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{user?.email}</span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.label}>Age</span>
                  <span className={styles.value}>{user?.age || 'Not provided'}</span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.label}>Gender</span>
                  <span className={styles.value}>{user?.gender || 'Not provided'}</span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.label}>Education</span>
                  <span className={styles.value}>
                    {user?.education ? getEducationLabel(user.education) : 'Not provided'}
                  </span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.label}>Native Languages</span>
                  <span className={styles.value}>
                    {user?.mother_languages?.length > 0 
                      ? user.mother_languages.map(code => getLanguageName(code)).join(', ')
                      : 'Not provided'}
                  </span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.label}>Dictionary Words</span>
                  <span className={styles.value}>
                    {Object.values(dictionaryWords).flat().length}
                  </span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.label}>Starred Words</span>
                  <span className={styles.value}>
                    {Object.values(starListWords).flat().length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dictionary' && (
            <div className={styles.section}>
              {dictionaryWords[selectedDictLanguage]?.length > 0 ? (
                <>
                  <div className={styles.sectionHeader}>
                    <Dropdown
                      options={filteredDictionaryOptions}
                      value={filteredDictionaryOptions.find(option => option.value === selectedDictLanguage)}
                      onChange={handleDictionaryLanguageChange}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div className={styles.wordGrid}>
                    {dictionaryWords[selectedDictLanguage]?.map(word => (
                      <div key={word} className={styles.wordCard}>
                        <span className={styles.word}>{word}</span>
                        <button 
                          className={styles.deleteButton}
                          onClick={() => removeFromDictionary(word, selectedDictLanguage)}
                          title="Delete word"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>No dictionary words found</div>
              )}
            </div>
          )}

          {activeTab === 'starlist' && (
            <div className={styles.section}>
              {starListWords[selectedStarLanguage]?.length > 0 ? (
                <>
                  <div className={styles.sectionHeader}>
                    <Dropdown
                      options={filteredStarListOptions}
                      value={filteredStarListOptions.find(option => option.value === selectedStarLanguage)}
                      onChange={handleStarListLanguageChange}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div className={styles.wordGrid}>
                    {starListWords[selectedStarLanguage]?.map(word => (
                      <div key={word} className={styles.wordCard}>
                        <span className={styles.word}>{word}</span>
                        <button 
                          className={styles.unstarButton}
                          onClick={() => removeFromStarList(word, selectedStarLanguage)}
                          title="Remove from starred"
                        >
                          <FaStar />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>No starred words found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 