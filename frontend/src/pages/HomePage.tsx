import React, { useState, useRef, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaTrashAlt,
  FaPaste,
  FaCopy,
  FaCut,
  FaCheck,
  FaQuestion,
  FaUser,
  FaGithub,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useApi } from "../hooks/useApi";
import { useUserData } from "../hooks/useUserData";
import { styles as inlineStyles } from "../styles/HomePage.styles";
import { LanguageOption, SpellingResult } from "../types/spelling";
import styles from "../styles/HomePage.module.css";
import { useAuth } from "../hooks/useAuth";
import { LANGUAGE_OPTIONS, TEXT_DIRECTION_MAP } from "../constants/language";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";


const HomePage: React.FC = () => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const { accessToken } = useAuthContext();
  const [selectedOption, setSelectedOption] = useState<LanguageOption>(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    return savedLanguage
      ? JSON.parse(savedLanguage)
      : { label: "English", value: "en" };
  });
  const [text, setText] = useState(() => {
    return localStorage.getItem("editorContent") || "";
  });
  const [spellingResults, setSpellingResults] = useState<SpellingResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const [ignoredWords, setIgnoredWords] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(() => {
    return !localStorage.getItem("cookieConsent");
  });
  const [changeHistory, setChangeHistory] = useState<Array<{
    originalWord: string;
    replacement: string;
    position: number;
    spellingResult: SpellingResult
  }>>([]);
  const [showUndo, setShowUndo] = useState(false);

  const {
    checkSpelling,
    getSuggestions,
    addWordToDictionary,
    addWordToStarList,
    recordReplacement,
  } = useApi(selectedOption.value);

  const { fetchDictionaryWords, dictionaryWords } = useUserData();

  const options: LanguageOption[] = [...LANGUAGE_OPTIONS];

  useEffect(() => {
    if (isAuthenticated) {
      // Perform actions when the user is authenticated
    }
  }, [isAuthenticated]);

  // Add theme toggle handler
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  // Add this near the top of your return statement, after the login button
  const themeToggle = (
    <div className={styles.buttonWrapper}>
      <button
        onClick={toggleTheme}
        className={`${styles.themeButton} ${isDarkMode ? styles.darkMode : ""}`}
      >
        {isDarkMode ? <FaSun /> : <FaMoon />}
      </button>
      <span className={styles.tooltip}>
        {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      </span>
    </div>
  );

  const handleSelectChange = (
    option: LanguageOption,
    event?: React.MouseEvent
  ) => {
    event?.stopPropagation();
    localStorage.setItem("selectedLanguage", JSON.stringify(option));
    setSelectedOption(option);
    setText("");
    setSpellingResults([]);
    setChangeHistory([]);
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      editorRef.current.style.direction =
        TEXT_DIRECTION_MAP[option.value] || "ltr";
      editorRef.current.style.textAlign =
        TEXT_DIRECTION_MAP[option.value] === "rtl" ? "right" : "left";
    }
  };

  const handleClearText = () => {
    localStorage.removeItem("editorContent");
    editorRef.current.innerHTML = "";
    setText("");
    setSpellingResults([]);
    setCharCount(0);
    setWordCount(0);
    setChangeHistory([]);
    setShowUndo(false);
    toast.success("Text cleared successfully.");
  };

  const handlePaste = async () => {
    try {
      const pastedText = await navigator.clipboard.readText();
      if (editorRef.current) {
        editorRef.current.innerHTML = pastedText;
        setText(pastedText);
        setSpellingResults([]);
        setChangeHistory([]);
        setShowUndo(false);

        // Update counts for pasted text
        setCharCount(pastedText.length);
        setWordCount(pastedText.trim().split(/\s+/).filter(Boolean).length);

        // Move cursor to end of text
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false); // false means collapse to end
        selection?.removeAllRanges();
        selection?.addRange(range);

        // Add success toast
        toast.success("Text pasted successfully");
      }
    } catch (error) {
      toast.error("Unable to access clipboard");
    }
  };

  const handleTextChange = (event: React.FormEvent<HTMLDivElement>) => {
    const newText = event.currentTarget.innerText;
    setText(newText);
    setSpellingResults([]);
    setShowUndo(false);
    setChangeHistory([]);

    // Update character and word count
    setCharCount(newText.length);
    setWordCount(newText.trim().split(/\s+/).filter(Boolean).length);

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parentSpan = range.startContainer.parentElement;
      if (
        parentSpan?.classList.contains("misspelled") ||
        range.startContainer.previousSibling?.nodeName === "SPAN" ||
        range.startContainer.nextSibling?.nodeName === "SPAN" ||
        newText.length === 0
      ) {
        const textNode = document.createTextNode(newText);
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
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
      toast.warning("Please enter some text to check spelling");
      return;
    }

    const loadingToast = toast.loading("Checking spelling...");

    try {
      // Fetch user's dictionary words for the selected language
      await fetchDictionaryWords(selectedOption.value);
      const userDictionaryWords = dictionaryWords[selectedOption.value] || [];

      const results = await checkSpelling(text);
      // Filter out ignored words and words in the user's dictionary
      const newResults = results.filter(
        (result) =>
          !ignoredWords.has(result.word.toLowerCase()) &&
          !userDictionaryWords.includes(result.word)
      );

      toast.dismiss(loadingToast);

      if (newResults.length > 0) {
        highlightMisspelledWords(newResults);
        toast.error(
          `Found ${newResults.length} spelling error${
            newResults.length === 1 ? "" : "s"
          }`
        );
      } else {
        toast.success("No spelling errors found!");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error checking spelling");
    }
  };

  const highlightMisspelledWords = (results: SpellingResult[]) => {
    if (!editorRef.current) return;
    const textContent = editorRef.current.innerText;
    let html = "";
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
    const misspelledElements =
      editorRef.current.getElementsByClassName("misspelled");
    Array.from(misspelledElements).forEach((element) => {
      element.addEventListener("click", handleMisspelledWordClick);
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
    const startPosition = parseInt(element.dataset.start || "0", 10);
    if (!word) return;

    // Keep suggestion functionality available for all users
    const suggestions = await getSuggestions(word);

    // If no suggestions are returned for the exact case, try lowercase
    if (suggestions.suggestions.length === 0) {
      const lowercaseSuggestions = await getSuggestions(word.toLowerCase());
      // Filter suggestions to only include ones that differ from the original word
      suggestions.suggestions = lowercaseSuggestions.suggestions.filter(
        (suggestion) => suggestion.toLowerCase() !== word.toLowerCase()
      );
    }

    const rect = element.getBoundingClientRect();

    // Create popup container
    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.left = `${Math.max(rect.left - 70, 10)}px`;
    popup.style.top = `${rect.bottom + 8}px`;
    popup.style.backgroundColor = isDarkMode ? "#1f2937" : "#ffffff";
    popup.style.border = isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = isDarkMode
      ? "0 4px 12px rgba(0, 0, 0, 0.5)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
    popup.style.zIndex = "1000";
    const wordWidth = rect.width;
    const minWidth = Math.max(wordWidth + 200, 250);
    popup.style.minWidth = `${minWidth}px`;
    popup.style.overflow = "visible";

    // Create scroll container
    const scrollContainer = document.createElement("div");
    scrollContainer.style.minHeight = "60px";
    scrollContainer.style.maxHeight = "300px";
    scrollContainer.style.overflowY = "auto";
    scrollContainer.style.overflowX = "auto";
    scrollContainer.style.padding = "12px 0 12px 0";
    scrollContainer.style.backgroundColor = isDarkMode ? "#1f2937" : "#ffffff";
    popup.appendChild(scrollContainer);

    // Create ignore/dictionary buttons container
    const ignoreContainer = document.createElement("div");
    ignoreContainer.style.display = "flex";
    ignoreContainer.style.justifyContent = "flex-end";
    ignoreContainer.style.padding = "8px 16px";
    ignoreContainer.style.gap = "8px";
    ignoreContainer.style.borderBottom = isDarkMode
      ? "1px solid #374151"
      : "1px solid #e5e7eb";

    // Create ignore button with icon
    const ignoreButton = document.createElement("button");
    ignoreButton.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 8C119.034 8 8 119.033 8 256s111.034 248 248 248 248-111.034 248-248S392.967 8 256 8zm130.108 117.892c65.448 65.448 70 165.481 20.677 235.637L150.47 105.216c70.204-49.356 170.226-44.735 235.638 20.676zM125.892 386.108c-65.448-65.448-70-165.481-20.677-235.637L361.53 406.784c-70.203 49.356-170.226 44.736-235.638-20.676z"></path></svg>`;
    const buttonStyles = {
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: "20px",
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      padding: "8px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "50%",
      transition: "color 0.2s, background-color 0.2s",
      borderRadius: "4px",
    };

    Object.assign(ignoreButton.style, buttonStyles);

    // Create dictionary button with icon
    const dictionaryButton = document.createElement("button");
    dictionaryButton.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M448 360V24c0-13.3-10.7-24-24-24H96C43 0 0 43 0 96v320c0 53 43 96 96 96h328c13.3 0 24-10.7 24-24v-16c0-7.5-3.5-14.3-8.9-18.7-4.2-15.4-4.2-59.3 0-74.7 5.4-4.3 8.9-11.1 8.9-18.6zM128 134c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm0 64c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm253.4 250H96c-17.7 0-32-14.3-32-32 0-17.6 14.4-32 32-32h285.4c-1.9 17.1-1.9 46.9 0 64z"/></svg>`;
    Object.assign(dictionaryButton.style, buttonStyles);

    // Add hover effects
    const addButtonHoverEffect = (button: HTMLButtonElement) => {
      button.addEventListener("mouseover", () => {
        button.style.backgroundColor = isDarkMode ? "#374151" : "#f3f4f6";
        button.style.color = isDarkMode ? "#e5e7eb" : "#4b5563";
      });

      button.addEventListener("mouseout", () => {
        button.style.backgroundColor = "transparent";
        button.style.color = isDarkMode ? "#9ca3af" : "#6b7280";
      });
    };

    addButtonHoverEffect(ignoreButton);
    addButtonHoverEffect(dictionaryButton);

    // Add tooltips
    const createTooltip = (text: string) => {
      const tooltip = document.createElement("span");
      tooltip.textContent = text;
      tooltip.style.visibility = "hidden";
      tooltip.style.backgroundColor = isDarkMode ? "#4b5563" : "#333";
      tooltip.style.color = "#fff";
      tooltip.style.textAlign = "center";
      tooltip.style.padding = "5px 10px";
      tooltip.style.borderRadius = "6px";
      tooltip.style.position = "absolute";
      tooltip.style.zIndex = "1002";
      tooltip.style.left = "50%";
      tooltip.style.transform = "translateX(-50%)";
      tooltip.style.bottom = "-30px"; // Position below the button
      tooltip.style.fontSize = "14px";
      tooltip.style.whiteSpace = "nowrap";
      tooltip.style.pointerEvents = "none";
      tooltip.style.opacity = "0";
      tooltip.style.transition = "opacity 0.2s ease-in-out";
      return tooltip;
    };

    const ignoreTooltip = createTooltip("Ignore this word");
    const dictionaryTooltip = createTooltip("Add to dictionary");

    ignoreButton.style.position = "relative";
    dictionaryButton.style.position = "relative";

    ignoreButton.appendChild(ignoreTooltip);
    dictionaryButton.appendChild(dictionaryTooltip);

    // Add tooltip visibility handlers
    const addTooltipHandlers = (
      button: HTMLButtonElement,
      tooltip: HTMLSpanElement
    ) => {
      button.addEventListener("mouseover", () => {
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
      });

      button.addEventListener("mouseout", () => {
        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "0";
      });
    };

    addTooltipHandlers(ignoreButton, ignoreTooltip);
    addTooltipHandlers(dictionaryButton, dictionaryTooltip);

    // Add click handlers
    ignoreButton.addEventListener("click", () => {
      if (element && editorRef.current) {
        element.outerHTML = word;
        // Add word to ignored words
        const newIgnoredWords = new Set(ignoredWords);
        newIgnoredWords.add(word.toLowerCase());
        setIgnoredWords(newIgnoredWords);

        setSpellingResults((prev) =>
          prev.filter(
            (result) =>
              !(
                result.word.toLowerCase() === word.toLowerCase() &&
                result.index === startPosition
              )
          )
        );
      }
      document.body.removeChild(popup);
    });

    dictionaryButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!isAuthenticated) {
        toast.warning("Please login to add words to dictionary");
        document.body.removeChild(popup);
        return;
      }

      try {
        const loadingToast = toast.loading("Adding word to dictionary...");
        const success = await addWordToDictionary(word);
        toast.dismiss(loadingToast);

        if (!success) {
          throw new Error("Failed to add word");
        }

        // Remove the word from spelling results and update the display
        if (element && editorRef.current) {
          // Remove the underline by replacing the span with plain text
          element.outerHTML = word;

          // Update spelling results to remove this word
          setSpellingResults((prev) =>
            prev.filter(
              (result) =>
                !(result.word === word && result.index === startPosition)
            )
          );
        }

        toast.success("Word added to dictionary successfully");
        document.body.removeChild(popup);
      } catch (error) {
        toast.error("Failed to add word to dictionary");
        console.error("Error adding word:", error);
      }
    });

    ignoreContainer.appendChild(ignoreButton);
    ignoreContainer.appendChild(dictionaryButton);
    scrollContainer.appendChild(ignoreContainer);

    // Style the popup more like a card
    popup.style.backgroundColor = "#ffffff";
    popup.style.border = "1px solid #e5e7eb";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow =
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";

    // Add some spacing between sections
    scrollContainer.style.paddingTop = "0";
    scrollContainer.style.paddingBottom = "8px";

    // Calculate dynamic height based on number of items
    const itemHeight = 44; // Height of each suggestion item in pixels
    const headerHeight = 52; // Height of ignore/dictionary buttons section
    const padding = 24; // Extra padding
    const numItems = suggestions.suggestions.length;
    const calculatedHeight =
      numItems === 0 ? 60 : numItems * itemHeight + headerHeight + padding;
    const maxHeight = 300; // Maximum height before scrolling

    scrollContainer.style.minHeight = `${Math.min(
      calculatedHeight,
      maxHeight
    )}px`;
    scrollContainer.style.maxHeight = `${maxHeight}px`;

    if (suggestions.suggestions.length === 0) {
      // Create no suggestions message
      const noSuggestionsContainer = document.createElement("div");
      noSuggestionsContainer.style.display = "flex";
      noSuggestionsContainer.style.justifyContent = "center";
      noSuggestionsContainer.style.alignItems = "center";
      noSuggestionsContainer.style.padding = "8px";
      noSuggestionsContainer.style.margin = "5px 0";

      const noSuggestionsText = document.createElement("span");
      noSuggestionsText.textContent = "No suggestions available";
      noSuggestionsText.style.fontSize = "21px";
      noSuggestionsText.style.fontStyle = "italic";
      noSuggestionsText.style.fontWeight = "bold";
      noSuggestionsText.style.color = isDarkMode ? "#9ca3af" : "#6b7280";

      noSuggestionsContainer.appendChild(noSuggestionsText);
      scrollContainer.appendChild(noSuggestionsContainer);
    } else {
      // Existing suggestions code
      suggestions.suggestions.forEach((suggestion) => {
        const suggestionContainer = document.createElement("div");
        suggestionContainer.style.display = "flex";
        suggestionContainer.style.justifyContent = "flex-start";
        suggestionContainer.style.alignItems = "center";
        suggestionContainer.style.padding = "8px 16px";
        suggestionContainer.style.margin = "0";
        suggestionContainer.style.cursor = "pointer";
        suggestionContainer.style.minWidth = "100px";
        suggestionContainer.style.gap = "12px";
        suggestionContainer.style.backgroundColor = isDarkMode
          ? "#1f2937"
          : "#ffffff";

        const addButton = document.createElement("button");
        addButton.textContent = "★";
        addButton.style.position = "relative";
        Object.assign(addButton.style, {
          marginLeft: "10px",
          marginRight: "10px",
          padding: "2px 8px",
          borderRadius: "4px",
          backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "normal",
          width: "28px",
          minWidth: "28px",
          color: isDarkMode ? "#9ca3af" : "#666",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        });

        const starTooltip = document.createElement("span");
        starTooltip.textContent = "Add to your star list";
        Object.assign(starTooltip.style, {
          visibility: "hidden",
          backgroundColor: isDarkMode ? "#4b5563" : "#333",
          color: "#fff",
          textAlign: "center",
          padding: "5px 10px",
          borderRadius: "6px",
          position: "absolute",
          zIndex: "1002",
          right: "-100px",
          top: "-40px",
          fontSize: "14px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: "0",
          transition: "opacity 0.2s ease-in-out",
          transform: "translateX(0)",
        });

        addButton.appendChild(starTooltip);

        addButton.addEventListener("mouseover", () => {
          addButton.style.backgroundColor = isDarkMode ? "#4b5563" : "#d1d5db";
          addButton.style.color = isDarkMode ? "#e5e7eb" : "#333";
          starTooltip.style.visibility = "visible";
          starTooltip.style.opacity = "1";
        });

        addButton.addEventListener("mouseout", () => {
          addButton.style.backgroundColor = isDarkMode ? "#374151" : "#e5e7eb";
          addButton.style.color = isDarkMode ? "#9ca3af" : "#666";
          starTooltip.style.visibility = "hidden";
          starTooltip.style.opacity = "0";
        });

        const suggestionElement = document.createElement("div");
        suggestionElement.textContent = suggestion;
        suggestionElement.style.fontSize = "20px";
        suggestionElement.style.fontWeight = "bold";
        suggestionElement.style.color = isDarkMode ? "#e5e7eb" : "#374151";

        suggestionContainer.appendChild(addButton);
        suggestionContainer.appendChild(suggestionElement);

        suggestionContainer.addEventListener("mouseover", () => {
          suggestionContainer.style.backgroundColor = isDarkMode
            ? "#374151"
            : "#f3f4f6";
          suggestionElement.style.color = isDarkMode ? "#ffffff" : "#000000";
        });
        suggestionContainer.addEventListener("mouseout", () => {
          suggestionContainer.style.backgroundColor = isDarkMode
            ? "#1f2937"
            : "#ffffff";
          suggestionElement.style.color = isDarkMode ? "#e5e7eb" : "#374151";
        });

        // Click handlers
        suggestionContainer.addEventListener("click", () => {
          handleSuggestionClick(suggestion, word, startPosition);
          document.body.removeChild(popup);
        });

        addButton.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!isAuthenticated) {
            toast.warning("Please login to add words to star list");
            document.body.removeChild(popup);
            return;
          }

          try {
            const loadingToast = toast.loading("Adding word to star list...");
            const success = await addWordToStarList(suggestion);
            toast.dismiss(loadingToast);

            if (!success) {
              throw new Error("Failed to add word");
            }

            toast.success("Word added to star list successfully");
            document.body.removeChild(popup);
          } catch (error) {
            toast.error("Failed to add word to star list");
            console.error("Error adding word:", error);
          }
        });

        scrollContainer.appendChild(suggestionContainer); // Append to scrollContainer instead of popup
      });
    }

    // Update scrollbar styles for dark mode
    if (isDarkMode) {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = `
        .suggestion-scroll {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
        }
        .suggestion-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .suggestion-scroll::-webkit-scrollbar-track {
          background: #1f2937;
        }
        .suggestion-scroll::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 4px;
          border: 2px solid #1f2937;
        }
      `;
      document.head.appendChild(styleSheet);
      scrollContainer.classList.add("suggestion-scroll");
    }

    // Update popup container styles
    popup.style.backgroundColor = isDarkMode ? "#1f2937" : "#ffffff";
    popup.style.border = isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = isDarkMode
      ? "0 4px 12px rgba(0, 0, 0, 0.5)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)";

    // Update ignore/dictionary section styles
    ignoreContainer.style.backgroundColor = isDarkMode ? "#1f2937" : "#ffffff";
    ignoreContainer.style.borderBottom = isDarkMode
      ? "1px solid #374151"
      : "1px solid #e5e7eb";

    // Append popup to document body
    document.body.appendChild(popup);

    // Add click outside handler
    const handleClickOutside = (e: MouseEvent) => {
      if (!popup.contains(e.target as Node) && document.body.contains(popup)) {
        document.body.removeChild(popup);
        document.removeEventListener("click", handleClickOutside);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
  };

  const handleSuggestionClick = async (
    suggestion: string,
    originalWord: string,
    startPosition: number
  ) => {
    if (!editorRef.current) return;

    await recordReplacement(originalWord, suggestion);

    const originalSpellingResult = spellingResults.find(
      result => result.word === originalWord && result.index === startPosition
    );

    setChangeHistory(prev => [...prev, {
      originalWord,
      replacement: suggestion,
      position: startPosition,
      spellingResult: originalSpellingResult || {
        word: originalWord,
        index: startPosition,
        length: originalWord.length
      }
    }]);
    setShowUndo(true);

    const spans = editorRef.current.querySelectorAll(
      `span.misspelled[data-word="${originalWord}"]`
    );
    let targetSpan: Element | null = null;
    for (const span of spans) {
      const spanPosition = parseInt(span.getAttribute("data-start") || "0", 10);
      if (spanPosition === startPosition) {
        targetSpan = span;
        break;
      }
    }
    if (targetSpan) {
      // Create a text node with the suggestion
      const textNode = document.createTextNode(suggestion);
      // Replace the span with the text node
      targetSpan.parentNode?.replaceChild(textNode, targetSpan);

      // Update the text state with the current content
      setText(editorRef.current.innerText);

      // Update spelling results to remove the replaced word
      setSpellingResults((prev) =>
        prev.filter(
          (result) =>
            !(
              result.word.toLowerCase() === originalWord.toLowerCase() &&
              result.index === startPosition
            )
        )
      );

      // Reattach click handlers to remaining misspelled words
      const misspelledElements =
        editorRef.current.getElementsByClassName("misspelled");
      Array.from(misspelledElements).forEach((element) => {
        element.addEventListener("click", handleMisspelledWordClick);
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
    const target = event.target as Element;
    if (
      target &&
      (target.closest?.(".custom-dropdown") ||
        target.closest?.(".loginCard") ||
        target.closest?.(".ant-select-dropdown"))
    ) {
      return;
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleCopy = async () => {
    if (editorRef.current) {
      try {
        await navigator.clipboard.writeText(editorRef.current.innerText);
        toast.success("Text copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy text");
      }
    }
  };

  const handleCut = async () => {
    if (editorRef.current) {
      try {
        await navigator.clipboard.writeText(editorRef.current.innerText);
        editorRef.current.innerHTML = "";
        setText("");
        setSpellingResults([]);
        setCharCount(0);
        setWordCount(0);
        setChangeHistory([]);
        setShowUndo(false);
        toast.success("Text cut to clipboard");
      } catch (error) {
        toast.error("Failed to cut text");
      }
    }
  };

  const handleLoginClick = () => {
    window.location.href = "/login";
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const userControls = (
    <div className={styles.userControls}>
      <div className={styles.buttonWrapper}>
        <FaUser
          className={styles.profileIcon}
          onClick={handleProfileClick}
          style={{ cursor: "pointer" }}
        />
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

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  // Add useEffect to save content whenever it changes
  useEffect(() => {
    localStorage.setItem("editorContent", text);
  }, [text]);

  // Add initialization of editor content from localStorage
  useEffect(() => {
    if (editorRef.current && text) {
      editorRef.current.innerHTML = text;
      setCharCount(text.length);
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  }, []); // Run only on mount

  // Add auto-save functionality
  useEffect(() => {
    // Only show saving status if there is content
    if (text) {
      setSaveStatus("saving");
      const saveTimeout = setTimeout(() => {
        localStorage.setItem("editorContent", text);
        setSaveStatus("saved");
        console.log("Content auto-saved");
      }, 1000);

      return () => clearTimeout(saveTimeout);
    } else {
      // Clear save status when content is empty
      setSaveStatus(null);
    }
  }, [text]);

  // Add save on page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (text) {
        localStorage.setItem("editorContent", text);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [text]);

  const cookieConsent = showCookieConsent && (
    <div
      className={`${styles.cookieConsent} ${isDarkMode ? styles.darkMode : ""}`}
    >
      <p>🍪 This website uses cookies.</p>
      <div className={styles.cookieButtons}>
        <button
          onClick={() => {
            localStorage.setItem("cookieConsent", "true");
            setShowCookieConsent(false);
          }}
          className={styles.acceptButton}
        >
          Accept
        </button>
        <button
          onClick={() => setShowCookieConsent(false)}
          className={styles.declineButton}
        >
          Decline
        </button>
      </div>
    </div>
  );

  const handleAboutClick = () => {
    navigate("/about");
  };

  const footer = (
    <footer className={styles.footer}>
      <div className={styles.footerLeft}>
        <a
          href="https://github.com/imred42/hunspell_live"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
        >
          <FaGithub />
        </a>
        <a
          href="https://buymeacoffee.com/imred42"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.coffeeLink}
        >
          ☕ Buy me a coffee
        </a>
      </div>

      <div className={styles.footerRight}>
        <a
          href="/about#contact"
          className={styles.contactLink}
          onClick={(e) => {
            e.preventDefault();
            navigate("/about#contact");
            setTimeout(() => {
              const element = document.getElementById("contact");
              element?.scrollIntoView({ behavior: "auto" });
            }, 50);
          }}
        >
          Contact Us
        </a>
        <a
          href="/about#privacy"
          className={styles.privacyLink}
          onClick={(e) => {
            e.preventDefault();
            navigate("/about#privacy");
            setTimeout(() => {
              const element = document.getElementById("privacy");
              element?.scrollIntoView({ behavior: "auto" });
            }, 50);
          }}
        >
          Privacy Policy
        </a>
        <a
          href="/about#terms"
          className={styles.termsLink}
          onClick={(e) => {
            e.preventDefault();
            navigate("/about#terms");
            setTimeout(() => {
              const element = document.getElementById("terms");
              element?.scrollIntoView({ behavior: "auto" });
            }, 50);
          }}
        >
          Terms of Service
        </a>
      </div>
    </footer>
  );

  const handleUndo = () => {
    if (changeHistory.length === 0) {
      setShowUndo(false);
      return;
    }

    const lastChange = changeHistory[changeHistory.length - 1];
    const { originalWord, replacement, position, spellingResult } = lastChange;

    if (!editorRef.current) return;

    // Get the current text content
    let content = editorRef.current.innerText;
    
    // Find the position of the replacement word
    const beforeReplacement = content.slice(0, position);
    const afterReplacement = content.slice(position + replacement.length);
    
    // Replace back with the original word
    const newContent = beforeReplacement + originalWord + afterReplacement;
    
    // Update the editor content
    editorRef.current.innerText = newContent;
    setText(newContent);

    // Remove the last change from history
    setChangeHistory(prev => prev.slice(0, -1));

    // Re-highlight the word as misspelled using the original spelling result
    setSpellingResults(prev => [...prev, spellingResult]);

    // Re-highlight misspelled words with complete info
    highlightMisspelledWords([...spellingResults, spellingResult]);

    // Show success message
    toast.success('Last change undone');

    // Update showUndo based on remaining history
    if (changeHistory.length <= 1) {
      setShowUndo(false);
    }
  };

  // Add useEffect for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [changeHistory, spellingResults]);

  return (
    <div
      ref={containerRef}
      style={inlineStyles.container}
      onClick={focusEditor}
      className={isDarkMode ? styles.darkMode : ""}
    >
      <div className={styles.topControls}>
        <span onClick={handleAboutClick} className={styles.aboutLink}>
          About
        </span>
        {accessToken ? (
          <>
            {themeToggle}
            {userControls}
          </>
        ) : (
          <>
            {themeToggle}
            <button className={styles.loginButton} onClick={handleLoginClick}>
              <FaUser /> Login
            </button>
          </>
        )}
      </div>
      <div style={inlineStyles.content}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>
            <span className={styles.titleMain}>Hunspell</span>
            <span className={styles.titleSub}>Live</span>
          </h1>
        </div>
        <div
          style={{
            ...inlineStyles.editorContainer,
            backgroundColor: isDarkMode
              ? "#1f2937"
              : inlineStyles.editorContainer.backgroundColor,
          }}
        >
          <div style={inlineStyles.controlsContainer}>
            <div style={inlineStyles.buttonGroup}>
              <div className={styles.buttonWrapper}>
                <button
                  onClick={handleCheckSpelling}
                  className={styles.checkButton}
                >
                  <FaCheck />
                </button>
                <span className={styles.tooltip}>Check Spelling</span>
              </div>
              <div className={styles.buttonWrapper}>
                <button
                  onClick={handleClearText}
                  className={styles.clearButton}
                >
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
                    <li>Click on red underlined words to see suggestions</li>
                    <li>Click suggested word to replace</li>
                    <li>Words in your dictionary will not be marked as incorrect</li>
                  </ul>
                </div>
              </div>
            </div>
            <div style={inlineStyles.dropdownContainer}>
              <Dropdown
                options={options}
                value={selectedOption}
                onChange={handleSelectChange}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          <div
            ref={editorRef}
            contentEditable
            spellCheck="false"
            onInput={handleTextChange}
            style={{
              ...inlineStyles.editor,
              backgroundColor: isDarkMode ? "#374151" : "#ffffff",
              color: isDarkMode ? "#ffffff" : "inherit",
              direction: TEXT_DIRECTION_MAP[selectedOption.value] || "ltr",
              textAlign:
                TEXT_DIRECTION_MAP[selectedOption.value] === "rtl"
                  ? "right"
                  : "left",
            }}
            data-placeholder="Enter or paste your text here to check spelling"
          />
          <div className={styles.countDisplay}>
            <span>Characters: {charCount}</span>
            <span>Words: {wordCount}</span>
            {saveStatus && (
              <span
                className={`${styles.saveStatus} ${
                  saveStatus === "saved" ? styles.saved : styles.saving
                }`}
              >
                {saveStatus === "saved" ? "Saved" : "Saving..."}
              </span>
            )}
          </div>
        </div>
      </div>
      {footer}
      {cookieConsent}
      {showUndo && (
        <div className={styles.buttonWrapper}>
          <button 
            onClick={handleUndo} 
            className={`${styles.undoButton} ${isDarkMode ? styles.darkMode : ''}`}
            title="Undo last replacement (Cmd/Ctrl + Z)"
          >
            <span className={styles.undoIcon}>↩️</span>
            <span className={styles.undoText}>Undo</span>
          </button>
          <span className={styles.tooltip}>
            Undo last word replacement (Cmd/Ctrl + Z)
          </span>
        </div>
      )}
    </div>
  );
};

export default HomePage;
