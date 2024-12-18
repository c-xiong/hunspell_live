import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { FaBook, FaTrash, FaStar, FaUser, FaSun, FaMoon, FaHistory } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from '../styles/ProfilePage.module.css';
import Dropdown from '../components/Dropdown';
import { LANGUAGE_OPTIONS } from '../constants/language';
import { LANGUAGE_CHOICES, EDUCATION_CHOICES } from '../constants/userChoices';
import * as dateFns from 'date-fns';

// interface User {
//   username: string;
//   email: string;
//   age: number;
//   gender: string;
//   education: string;
//   mother_languages: string[];
// }

const getLanguageName = (code: string): string => {
  const language = LANGUAGE_OPTIONS.find(lang => lang.value === code);
  return language?.label || code;
};

const getNativeLanguageName = (code: string): string => {
  const language = LANGUAGE_CHOICES.find(lang => lang.value === code);
  return language?.label || code;
};

const getEducationLabel = (value: string): string => {
  const education = EDUCATION_CHOICES.find(edu => edu.value === value);
  return education?.label || value;
};

const ProfilePage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const [activeTab, setActiveTab] = useState<'info' | 'dictionary' | 'starlist' | 'replacements'>('info');
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
    removeFromStarList,
    replacements,
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

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme");
      setIsDarkMode(savedTheme === "dark");
    };

    window.addEventListener("storage", handleThemeChange);
    return () => window.removeEventListener("storage", handleThemeChange);
  }, []);

  const handleDictionaryLanguageChange = (option: { label: string, value: string }) => {
    setSelectedDictLanguage(option.value);
    fetchDictionaryWords(option.value);
  };

  const handleStarListLanguageChange = (option: { label: string, value: string }) => {
    setSelectedStarLanguage(option.value);
    fetchStarListWords(option.value);
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(!isDarkMode);
  };

  const handleTabChange = (tab: 'info' | 'dictionary' | 'starlist' | 'replacements') => {
    setActiveTab(tab);
  };

  if (authLoading || dataLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={`${styles.pageWrapper} ${isDarkMode ? styles.darkMode : ''}`}>
      <header className={`${styles.header} ${isDarkMode ? styles.darkMode : ''}`}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>Hunspell Live</div>
            <nav>
              <Link to="/" className={styles.navLink}>Home</Link>
            </nav>
          </div>
          <div className={styles.headerRight}>
            <button 
              className={styles.themeToggle}
              onClick={toggleTheme}
            >
              {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button 
          onClick={() => handleTabChange('info')} 
          className={`${styles.tabButton} ${activeTab === 'info' ? styles.active : ''}`}
        >
          <FaUser /> User Info
        </button>
        <button 
          onClick={() => handleTabChange('dictionary')} 
          className={`${styles.tabButton} ${activeTab === 'dictionary' ? styles.active : ''}`}
        >
          <FaBook /> Dictionary
        </button>
        <button 
          onClick={() => handleTabChange('starlist')} 
          className={`${styles.tabButton} ${activeTab === 'starlist' ? styles.active : ''}`}
        >
          <FaStar /> Star List
        </button>
        <button 
          onClick={() => handleTabChange('replacements')} 
          className={`${styles.tabButton} ${activeTab === 'replacements' ? styles.active : ''}`}
        >
          <FaHistory /> Replacements
        </button>
      </div>

      <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ''}`}>
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
                      ? user.mother_languages.map(code => getNativeLanguageName(code)).join(', ')
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

          {activeTab === 'replacements' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Replacement History</h2>
              {replacements.length > 0 ? (
                <div className={styles.replacementsGrid}>
                  {replacements.map((replacement, index) => (
                    <div key={index} className={styles.replacementCard}>
                      <div className={styles.replacementWords}>
                        <span className={styles.originalWord}>{replacement.original_word}</span>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.replacementWord}>{replacement.replacement_word}</span>
                      </div>
                      <div className={styles.replacementMeta}>
                        <span className={styles.language}>{getLanguageName(replacement.lang_code)}</span>
                        <span className={styles.date}>
                          {dateFns.format(new Date(replacement.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>No replacement history found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 