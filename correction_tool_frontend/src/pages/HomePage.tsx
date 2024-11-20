import React, { useState, useRef, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import VisualKeyboard from "../components/VisualKeyboard";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrashAlt, FaPaste, FaCopy, FaCut, FaCheck, FaQuestion, FaUser } from 'react-icons/fa';
import { useApi } from '../hooks/useApi';
import { styles as inlineStyles } from '../styles/HomePage.styles';
import { LanguageOption, SpellingResult } from '../types/spelling';
import styles from '../styles/HomePage.module.css';
import { useAuth } from '../hooks/useAuth';
import { LANGUAGE_OPTIONS, SPECIAL_CHARACTERS, TEXT_DIRECTION_MAP } from '../constants/language';

const HomePage: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<LanguageOption>(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage ? JSON.parse(savedLanguage) : { label: "English", value: "en" };
  });
  const [text, setText] = useState('');
  const [spellingResults, setSpellingResults] = useState<SpellingResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { logout, isLoading, isAuthenticated, user } = useAuth();

  const { checkSpelling, getSuggestions, addWordToDictionary } = useApi(selectedOption.value);

  const options: LanguageOption[] = LANGUAGE_OPTIONS;

  const handleSelectChange = (option: LanguageOption, event?: React.MouseEvent) => {
    event?.stopPropagation();
    localStorage.setItem('selectedLanguage', JSON.stringify(option));
    setSelectedOption(option);
    setText('');
    setSpellingResults([]);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      // Update the text direction based on the selected language
      editorRef.current.style.direction = TEXT_DIRECTION_MAP[option.value] || 'ltr';
      editorRef.current.style.textAlign = TEXT_DIRECTION_MAP[option.value] === 'rtl' ? 'right' : 'left';
    }
  };

  const handleClearText = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setText('');
      setSpellingResults([]);
      toast.success('Text cleared successfully');
    }
  };

  const handlePaste = async () => {
    try {
      const pastedText = await navigator.clipboard.readText();
      if (editorRef.current) {
        editorRef.current.innerHTML = pastedText;
        setText(pastedText);
        setSpellingResults([]);
        
        // Move cursor to end of text
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false); // false means collapse to end
        selection?.removeAllRanges();
        selection?.addRange(range);
        
        // Add success toast
        toast.success('Text pasted successfully');
      }
    } catch (error) {
      toast.error('Unable to access clipboard');
    }
  };

  const handleTextChange = (event: React.FormEvent<HTMLDivElement>) => {
    const newText = event.currentTarget.innerText;
    setText(newText);
    setSpellingResults([]);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parentSpan = range.startContainer.parentElement;
      if (
        parentSpan?.classList.contains('misspelled') || 
        (range.startContainer.previousSibling?.nodeName === 'SPAN' || 
         range.startContainer.nextSibling?.nodeName === 'SPAN') ||
        newText.length === 0
      ) {
        const textNode = document.createTextNode(newText);
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
          editorRef.current.appendChild(textNode);
          range.setStart(textNode, textNode.length);
          range.setEnd(textNode, textNode.length);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  };

  const handleCheckSpelling = async () => {
    if (!text.trim()) {
      toast.warning('Please enter some text to check spelling');
      return;
    }
    
    // Show loading toast
    const loadingToast = toast.loading('Checking spelling...');
    
    try {
      const newResults = await checkSpelling(text);
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (newResults.length > 0) {
        highlightMisspelledWords(newResults);
        toast.error(`Found ${newResults.length} spelling error${newResults.length === 1 ? '' : 's'}`);
      } else {
        toast.success('No spelling errors found!');
      }
    } catch (error) {
      // Dismiss loading toast and show error if something goes wrong
      toast.dismiss(loadingToast);
      toast.error('Error checking spelling');
    }
  };

  const highlightMisspelledWords = (results: SpellingResult[]) => {
    if (!editorRef.current) return;
    const textContent = editorRef.current.innerText;
    let html = '';
    let lastIndex = 0;
    results.forEach((result) => {
      const wordStart = result.index;
      const wordEnd = result.index + result.word.length;
      html += textContent.slice(lastIndex, wordStart);
      const misspelledWord = textContent.slice(wordStart, wordEnd);
      html += `<span class="misspelled" data-word="${misspelledWord}" data-start="${wordStart}" style="text-decoration: solid underline red 4px; text-underline-offset: 0.25em; cursor: help; font-style: italic;">${misspelledWord}</span>`;
      lastIndex = wordEnd;
    });
    html += textContent.slice(lastIndex);
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    editorRef.current.innerHTML = html;
    setSpellingResults(results);
    const misspelledElements = editorRef.current.getElementsByClassName('misspelled');
    Array.from(misspelledElements).forEach(element => {
      element.addEventListener('click', handleMisspelledWordClick);
    });
    if (editorRef.current) {
      const newRange = document.createRange();
      const lastChild = editorRef.current.lastChild;
      if (lastChild) {
        newRange.setStartAfter(lastChild);
        newRange.setEndAfter(lastChild);
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
    }
  };

  const handleMisspelledWordClick = async (event: Event) => {
    const element = event.target as HTMLSpanElement;
    const word = element.dataset.word;
    const startPosition = parseInt(element.dataset.start || '0', 10);
    if (!word) return;
    
    // Preserve the original word case when getting suggestions
    const suggestions = await getSuggestions(word);
    
    // If no suggestions are returned for the exact case, try lowercase
    if (suggestions.suggestions.length === 0) {
      const lowercaseSuggestions = await getSuggestions(word.toLowerCase());
      // Filter suggestions to only include ones that differ from the original word
      suggestions.suggestions = lowercaseSuggestions.suggestions.filter(
        suggestion => suggestion.toLowerCase() !== word.toLowerCase()
      );
    }

    const rect = element.getBoundingClientRect();

    // Main popup container - allows tooltips to overflow
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.bottom + 8}px`;
    popup.style.backgroundColor = '#ffffff';
    popup.style.border = '2px solid #e2e8f0';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    popup.style.zIndex = '1000';
    popup.style.minWidth = `${Math.max(rect.width + 200, 300)}px`;
    popup.style.overflow = 'visible';

    // Inner scrollable container for suggestions
    const scrollContainer = document.createElement('div');
    scrollContainer.style.maxHeight = '400px';
    scrollContainer.style.overflowY = 'auto';
    scrollContainer.style.padding = '12px 0';
    popup.appendChild(scrollContainer);

    if (suggestions.suggestions.length === 0) {
      const noSuggestionsElement = document.createElement('div');
      noSuggestionsElement.textContent = 'No suggestions available';
      noSuggestionsElement.style.padding = '8px 16px';
      noSuggestionsElement.style.fontSize = '18px';
      noSuggestionsElement.style.fontWeight = 'bold';
      noSuggestionsElement.style.color = '#6b7280';
      noSuggestionsElement.style.fontStyle = 'italic';
      scrollContainer.appendChild(noSuggestionsElement);  // Append to scrollContainer instead of popup
    } else {
      const ignoreElement = document.createElement('div');
      ignoreElement.textContent = 'Ignore';
      ignoreElement.style.padding = '8px 16px';
      ignoreElement.style.cursor = 'pointer';
      ignoreElement.style.fontSize = '20px';
      ignoreElement.style.fontWeight = 'bold';
      ignoreElement.style.color = '#6b7280';
      ignoreElement.style.borderBottom = '1px solid #e5e7eb';
      ignoreElement.style.margin = '0';
      ignoreElement.style.textAlign = 'center';
      ignoreElement.style.width = '100%';
      ignoreElement.addEventListener('mouseover', () => {
        ignoreElement.style.backgroundColor = '#f3f4f6';
        ignoreElement.style.color = '#4b5563';
      });
      ignoreElement.addEventListener('mouseout', () => {
        ignoreElement.style.backgroundColor = 'transparent';
        ignoreElement.style.color = '#6b7280';
      });
      ignoreElement.addEventListener('click', () => {
        if (element && editorRef.current) {
          // Replace the span with the original word without any formatting
          element.outerHTML = word;
          // Remove the word from spellingResults
          setSpellingResults(prev => 
            prev.filter(result => !(result.word.toLowerCase() === word.toLowerCase() && result.index === startPosition))
          );
        }
        document.body.removeChild(popup);
      });
      scrollContainer.appendChild(ignoreElement);  // Append to scrollContainer instead of popup

      suggestions.suggestions.forEach(suggestion => {
        const suggestionContainer = document.createElement('div');
        suggestionContainer.style.display = 'flex';
        suggestionContainer.style.justifyContent = 'space-between';
        suggestionContainer.style.alignItems = 'center';
        suggestionContainer.style.padding = '8px 50px 8px 50px';
        suggestionContainer.style.margin = '0';
        suggestionContainer.style.cursor = 'pointer';
        suggestionContainer.style.minWidth = '250px';

        const suggestionElement = document.createElement('div');
        suggestionElement.textContent = suggestion;
        suggestionElement.style.fontSize = '20px';
        suggestionElement.style.fontWeight = 'bold';
        suggestionElement.style.color = '#374151';
        suggestionElement.style.flex = '1';

        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.style.marginLeft = '8px';
        addButton.style.padding = '2px 8px';
        addButton.style.borderRadius = '4px';
        addButton.style.backgroundColor = '#e5e7eb';
        addButton.style.border = 'none';
        addButton.style.cursor = 'pointer';
        addButton.style.fontSize = '16px';
        addButton.style.fontWeight = 'bold';
        addButton.style.position = 'relative';

        const tooltip = document.createElement('span');
        tooltip.textContent = 'Add to dictionary';
        tooltip.style.visibility = 'hidden';
        tooltip.style.backgroundColor = '#333';
        tooltip.style.color = '#fff';
        tooltip.style.textAlign = 'center';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '6px';
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '1002';
        tooltip.style.left = '50%';
        tooltip.style.top = 'calc(100% + 8px)';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.fontSize = '14px';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.fontWeight = 'normal';
        tooltip.style.pointerEvents = 'none';

        addButton.addEventListener('mouseover', () => {
          tooltip.style.visibility = 'visible';
          addButton.style.backgroundColor = '#d1d5db';
        });

        addButton.addEventListener('mouseout', () => {
          tooltip.style.visibility = 'hidden';
          addButton.style.backgroundColor = '#e5e7eb';
        });

        addButton.appendChild(tooltip);

        suggestionContainer.appendChild(suggestionElement);
        suggestionContainer.appendChild(addButton);

        suggestionContainer.addEventListener('mouseover', () => {
          suggestionContainer.style.backgroundColor = '#f3f4f6';
          suggestionElement.style.color = '#000000';
        });
        suggestionContainer.addEventListener('mouseout', () => {
          suggestionContainer.style.backgroundColor = 'transparent';
          suggestionElement.style.color = '#374151';
        });

        // Click handlers
        suggestionElement.addEventListener('click', () => {
          handleSuggestionClick(suggestion, word, startPosition);
          document.body.removeChild(popup);
        });

        addButton.addEventListener('click', async (e) => {
          e.stopPropagation();
          
          try {
            // Show loading toast
            const loadingToast = toast.loading('Adding word to dictionary...');
            
            const success = await addWordToDictionary(suggestion);
            
            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (!success) {
              throw new Error('Failed to add word');
            }

            // Show success message
            toast.success('Word added to dictionary successfully');
            
            // Close the suggestions popup
            document.body.removeChild(popup);
            
          } catch (error) {
            toast.error('Failed to add word to dictionary');
            console.error('Error adding word:', error);
          }
        });

        scrollContainer.appendChild(suggestionContainer);  // Append to scrollContainer instead of popup
      });
    }

    document.body.appendChild(popup);

    const handleClickOutside = (e: MouseEvent) => {
      if (!popup.contains(e.target as Node) && document.body.contains(popup)) {
        document.body.removeChild(popup);
        document.removeEventListener('click', handleClickOutside);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  };

  const handleSuggestionClick = (suggestion: string, originalWord: string, startPosition: number) => {
    if (!editorRef.current) return;
    const spans = editorRef.current.querySelectorAll(`span.misspelled[data-word="${originalWord}"]`);
    let targetSpan: Element | null = null;
    for (const span of spans) {
      const spanPosition = parseInt(span.getAttribute('data-start') || '0', 10);
      if (spanPosition === startPosition) {
        targetSpan = span;
        break;
      }
    }
    if (targetSpan) {
      // Preserve the original casing by replacing with the suggestion as-is
      targetSpan.outerHTML = suggestion;
      setText(editorRef.current.innerText);
      setSpellingResults(prev => 
        prev.filter(result => !(result.word.toLowerCase() === originalWord.toLowerCase() && result.index === startPosition))
      );
      const misspelledElements = editorRef.current.getElementsByClassName('misspelled');
      Array.from(misspelledElements).forEach(element => {
        element.addEventListener('click', handleMisspelledWordClick);
      });
    }
  };

  const handleCharacterInsert = (character: string) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const textNode = document.createTextNode(character);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    setText(editorRef.current.innerText);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const focusEditor = (event: React.MouseEvent) => {
    if (
      event.target instanceof Node && 
      (event.target.closest('.custom-dropdown') || 
       event.target.closest('.loginCard') ||
       event.target.closest('.ant-select-dropdown'))
    ) {
      return;
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const currentSpecialCharacters = SPECIAL_CHARACTERS[selectedOption.value] || [];

  const handleCopy = async () => {
    if (editorRef.current) {
      try {
        await navigator.clipboard.writeText(editorRef.current.innerText);
        toast.success('Text copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy text');
      }
    }
  };

  const handleCut = async () => {
    if (editorRef.current) {
      try {
        await navigator.clipboard.writeText(editorRef.current.innerText);
        editorRef.current.innerHTML = '';
        setText('');
        setSpellingResults([]);
        toast.success('Text cut to clipboard');
      } catch (error) {
        toast.error('Failed to cut text');
      }
    }
  };

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  const userControls = (
    <div className={styles.userControls}>
      <div className={styles.buttonWrapper}>
        <FaUser className={styles.profileIcon} />
        {isLoading ? (
          <div className={styles.profileCard}>Loading...</div>
        ) : (
          user && (
            <div className={styles.profileCard}>
              <div className={styles.profileInfo}>
                <p>
                  <span>Username:</span>
                  <span>{user.username}</span>
                </p>
                <p>
                  <span>Email:</span>
                  <span>{user.email}</span>
                </p>
              </div>
            </div>
          )
        )}
      </div>
      <button className={styles.logoutButton} onClick={logout}>
        Logout
      </button>
    </div>
  );

  return (
    <div ref={containerRef} style={inlineStyles.container} onClick={focusEditor}>
      <div className={styles.buttonWrapper}>
        {isAuthenticated ? userControls : (
          <button className={styles.loginButton} onClick={handleLoginClick}>
            <FaUser /> Login
          </button>
        )}
      </div>
      <div style={inlineStyles.content}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '10px',
          position: 'relative'
        }}>
          <h1 style={inlineStyles.title}>Hunspell Live</h1>
        </div>
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "24px" }}>
          <div style={inlineStyles.controlsContainer}>
            <div style={inlineStyles.buttonGroup}>
              <div className={styles.buttonWrapper}>
                <button onClick={handleCheckSpelling} className={styles.checkButton}>
                  <FaCheck />
                </button>
                <span className={styles.tooltip}>Check Spelling</span>
              </div>
              <div className={styles.buttonWrapper}>
                <button onClick={handleClearText} className={styles.clearButton}>
                  <FaTrashAlt />
                </button>
                <span className={styles.tooltip}>Clear</span>
              </div>
              <div className={styles.buttonWrapper}>
                <button onClick={handlePaste} className={styles.pasteButton}>
                  <FaPaste />
                </button>
                <span className={styles.tooltip}>Paste</span>
              </div>
              <div className={styles.buttonWrapper}>
                <button onClick={handleCopy} className={styles.copyButton}>
                  <FaCopy />
                </button>
                <span className={styles.tooltip}>Copy</span>
              </div>
              <div className={styles.buttonWrapper}>
                <button onClick={handleCut} className={styles.cutButton}>
                  <FaCut />
                </button>
                <span className={styles.tooltip}>Cut</span>
              </div>
              <div className={styles.buttonWrapper}>
                <button className={styles.helpButton}>
                  <FaQuestion />
                </button>
                <div className={styles.helpCard}>
                  <h3>Instructions</h3>
                  <ul>
                    <li>Select your language from the dropdown menu</li>
                    <li>Type or paste your text in the editor</li>
                    <li>Click the check (✓) button to check spelling</li>
                    <li>Click on underlined words to see suggestions</li>
                    <li>Click suggested word to replace</li>
                  </ul>
                </div>
              </div>
            </div>
            <div style={inlineStyles.dropdownContainer}>
              <Dropdown options={options} value={selectedOption} onChange={handleSelectChange} />
            </div>
          </div>
          <VisualKeyboard onCharacterClick={handleCharacterInsert} characters={currentSpecialCharacters} />
          <div 
            ref={editorRef} 
            contentEditable 
            onInput={handleTextChange} 
            style={{
              ...inlineStyles.editor,
              direction: TEXT_DIRECTION_MAP[selectedOption.value] || 'ltr',
              textAlign: TEXT_DIRECTION_MAP[selectedOption.value] === 'rtl' ? 'right' : 'left'
            }} 
            data-placeholder="Enter or paste your text here to check spelling" 
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;