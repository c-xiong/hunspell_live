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
  FaGithub,
  FaMoon,
  FaSun,
  FaStar,
  FaCog,
} from "react-icons/fa";
import { useApi, getParticipantId, setParticipantId } from "../hooks/useApi";
import { useUserData } from "../hooks/useUserData";
import { styles as inlineStyles } from "../styles/HomePage.styles";
import { LanguageOption, SpellingResult } from "../types/spelling";
import styles from "../styles/HomePage.module.css";
import { LANGUAGE_OPTIONS, TEXT_DIRECTION_MAP } from "../constants/language";

const HomePage: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<LanguageOption>(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    return savedLanguage
      ? JSON.parse(savedLanguage)
      : { label: "English (US)", value: "en_US" };
  });
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [text, setText] = useState(() => {
    const savedContent = localStorage.getItem("editorContent") || "";
    setTimeout(() => {
      setCharCount(savedContent.trim() ? savedContent.length : 0);
      setWordCount(savedContent.trim().split(/\s+/).filter(Boolean).length);
    }, 0);
    return savedContent;
  });
  const [spellingResults, setSpellingResults] = useState<SpellingResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const [ignoredWords, setIgnoredWords] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showStarList, setShowStarList] = useState(false);
  const [participantIdInput, setParticipantIdInput] = useState(() =>
    getParticipantId()
  );
  const [changeHistory, setChangeHistory] = useState<Array<{
    originalWord: string;
    replacement: string;
    position: number;
    spellingResult: SpellingResult
  }>>([]);
  const [showUndo, setShowUndo] = useState(false);

  const { checkSpelling, getSuggestions, recordReplacement } = useApi(
    selectedOption.value
  );

  const {
    starListWords,
    getDictionaryWords,
    addToDictionary,
    addToStarList,
    removeFromStarList,
  } = useUserData();

  const options: LanguageOption[] = [...LANGUAGE_OPTIONS];

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

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
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
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

        setCharCount(pastedText.length);
        setWordCount(pastedText.trim().split(/\s+/).filter(Boolean).length);

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);

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

    setCharCount(newText.trim() ? newText.length : 0);
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
      const userDictionaryWords = getDictionaryWords(selectedOption.value);
      const results = await checkSpelling(text, userDictionaryWords);
      const newResults = results.filter(
        (result) => !ignoredWords.has(result.word.toLowerCase())
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

    const suggestions = await getSuggestions(word);

    if (suggestions.suggestions.length === 0) {
      const lowercaseSuggestions = await getSuggestions(word.toLowerCase());
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
    popup.style.zIndex = "1000";
    const wordWidth = rect.width;
    const minWidth = Math.max(wordWidth + 200, 250);
    popup.style.minWidth = `${minWidth}px`;
    popup.style.overflow = "visible";
    popup.style.backgroundColor = isDarkMode ? "#1f2937" : "#ffffff";
    popup.style.border = isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb";
    popup.style.borderRadius = "12px";
    popup.style.boxShadow = isDarkMode
      ? "0 4px 12px rgba(0, 0, 0, 0.5)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)";

    const scrollContainer = document.createElement("div");
    scrollContainer.style.minHeight = "60px";
    scrollContainer.style.maxHeight = "300px";
    scrollContainer.style.overflowY = "auto";
    scrollContainer.style.overflowX = "auto";
    scrollContainer.style.padding = "0 0 8px 0";
    scrollContainer.style.backgroundColor = isDarkMode ? "#1f2937" : "#ffffff";
    popup.appendChild(scrollContainer);

    const ignoreContainer = document.createElement("div");
    ignoreContainer.style.display = "flex";
    ignoreContainer.style.justifyContent = "flex-end";
    ignoreContainer.style.padding = "8px 16px";
    ignoreContainer.style.gap = "8px";
    ignoreContainer.style.backgroundColor = isDarkMode ? "#1f2937" : "#ffffff";
    ignoreContainer.style.borderBottom = isDarkMode
      ? "1px solid #374151"
      : "1px solid #e5e7eb";

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

    // Ignore button
    const ignoreButton = document.createElement("button");
    ignoreButton.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 8C119.034 8 8 119.033 8 256s111.034 248 248 248 248-111.034 248-248S392.967 8 256 8zm130.108 117.892c65.448 65.448 70 165.481 20.677 235.637L150.47 105.216c70.204-49.356 170.226-44.735 235.638 20.676zM125.892 386.108c-65.448-65.448-70-165.481-20.677-235.637L361.53 406.784c-70.203 49.356-170.226 44.736-235.638-20.676z"></path></svg>`;
    Object.assign(ignoreButton.style, buttonStyles);

    // Add-to-local-dictionary button
    const dictionaryButton = document.createElement("button");
    dictionaryButton.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M448 360V24c0-13.3-10.7-24-24-24H96C43 0 0 43 0 96v320c0 53 43 96 96 96h328c13.3 0 24-10.7 24-24v-16c0-7.5-3.5-14.3-8.9-18.7-4.2-15.4-4.2-59.3 0-74.7 5.4-4.3 8.9-11.1 8.9-18.6zM128 134c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm0 64c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm253.4 250H96c-17.7 0-32-14.3-32-32 0-17.6 14.4-32 32-32h285.4c-1.9 17.1-1.9 46.9 0 64z"/></svg>`;
    Object.assign(dictionaryButton.style, buttonStyles);

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
      tooltip.style.bottom = "-30px";
      tooltip.style.fontSize = "14px";
      tooltip.style.whiteSpace = "nowrap";
      tooltip.style.pointerEvents = "none";
      tooltip.style.opacity = "0";
      tooltip.style.transition = "opacity 0.2s ease-in-out";
      return tooltip;
    };

    const ignoreTooltip = createTooltip("Ignore this word");
    const dictionaryTooltip = createTooltip("Add to my dictionary (stored in this browser)");

    ignoreButton.style.position = "relative";
    dictionaryButton.style.position = "relative";
    ignoreButton.appendChild(ignoreTooltip);
    dictionaryButton.appendChild(dictionaryTooltip);

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

    ignoreButton.addEventListener("click", () => {
      if (element && editorRef.current) {
        element.outerHTML = word;
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

    dictionaryButton.addEventListener("click", (e) => {
      e.stopPropagation();
      addToDictionary(word, selectedOption.value);

      if (element && editorRef.current) {
        element.outerHTML = word;
        setSpellingResults((prev) =>
          prev.filter(
            (result) =>
              !(result.word === word && result.index === startPosition)
          )
        );
      }

      toast.success("Word added to your dictionary (stored in this browser)");
      document.body.removeChild(popup);
    });

    ignoreContainer.appendChild(ignoreButton);
    ignoreContainer.appendChild(dictionaryButton);
    scrollContainer.appendChild(ignoreContainer);

    const itemHeight = 44;
    const headerHeight = 52;
    const padding = 24;
    const numItems = suggestions.suggestions.length;
    const calculatedHeight =
      numItems === 0 ? 60 : numItems * itemHeight + headerHeight + padding;
    const maxHeight = 300;

    scrollContainer.style.minHeight = `${Math.min(
      calculatedHeight,
      maxHeight
    )}px`;
    scrollContainer.style.maxHeight = `${maxHeight}px`;

    if (suggestions.suggestions.length === 0) {
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

        suggestionContainer.addEventListener("click", () => {
          handleSuggestionClick(suggestion, word, startPosition);
          document.body.removeChild(popup);
        });

        addButton.addEventListener("click", (e) => {
          e.stopPropagation();
          addToStarList(suggestion, selectedOption.value);
          toast.success("Word added to star list (stored in this browser)");
          document.body.removeChild(popup);
        });

        scrollContainer.appendChild(suggestionContainer);
      });
    }

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

    document.body.appendChild(popup);

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
      (result) => result.word === originalWord && result.index === startPosition
    );

    setChangeHistory((prev) => [
      ...prev,
      {
        originalWord,
        replacement: suggestion,
        position: startPosition,
        spellingResult: originalSpellingResult || {
          word: originalWord,
          index: startPosition,
          length: originalWord.length,
        },
      },
    ]);
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
      const textNode = document.createTextNode(suggestion);
      targetSpan.parentNode?.replaceChild(textNode, targetSpan);

      setText(editorRef.current.innerText);

      setSpellingResults((prev) =>
        prev.filter(
          (result) =>
            !(
              result.word.toLowerCase() === originalWord.toLowerCase() &&
              result.index === startPosition
            )
        )
      );

      const misspelledElements =
        editorRef.current.getElementsByClassName("misspelled");
      Array.from(misspelledElements).forEach((element) => {
        element.addEventListener("click", handleMisspelledWordClick);
      });
    }
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
        target.closest?.(".dropdown") ||
        target.closest?.("[data-panel]"))
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

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("editorContent", text);
  }, [text]);

  useEffect(() => {
    if (editorRef.current && text) {
      editorRef.current.innerHTML = text;
      setCharCount(text.length);
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  }, []); // Run only on mount

  useEffect(() => {
    if (text) {
      setSaveStatus("saving");
      const saveTimeout = setTimeout(() => {
        localStorage.setItem("editorContent", text);
        setSaveStatus("saved");
      }, 1000);

      return () => clearTimeout(saveTimeout);
    } else {
      setSaveStatus(null);
    }
  }, [text]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (text) {
        localStorage.setItem("editorContent", text);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [text]);

  const handleUndo = () => {
    if (changeHistory.length === 0) {
      setShowUndo(false);
      return;
    }

    const lastChange = changeHistory[changeHistory.length - 1];
    const { originalWord, replacement, position, spellingResult } = lastChange;

    if (!editorRef.current) return;

    const content = editorRef.current.innerText;
    const beforeReplacement = content.slice(0, position);
    const afterReplacement = content.slice(position + replacement.length);
    const newContent = beforeReplacement + originalWord + afterReplacement;

    editorRef.current.innerText = newContent;
    setText(newContent);

    setChangeHistory((prev) => prev.slice(0, -1));
    setSpellingResults((prev) => [...prev, spellingResult]);
    highlightMisspelledWords([...spellingResults, spellingResult]);

    toast.success("Last change undone");

    if (changeHistory.length <= 1) {
      setShowUndo(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeHistory, spellingResults]);

  const saveParticipantId = () => {
    setParticipantId(participantIdInput);
    toast.success(
      participantIdInput.trim()
        ? `Participant ID set to "${participantIdInput.trim()}"`
        : "Participant ID cleared"
    );
    setShowSettings(false);
  };

  const settingsPanel = showSettings && (
    <div
      data-panel
      style={{
        position: "fixed",
        top: "70px",
        right: "16px",
        zIndex: 1100,
        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
        color: isDarkMode ? "#e5e7eb" : "#1f2937",
        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        padding: "16px",
        width: "300px",
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>Settings</h3>
      <label style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>
        Participant ID (optional)
      </label>
      <p style={{ fontSize: "12px", margin: "0 0 8px", opacity: 0.8 }}>
        For research studies: attached to your "error → correction" reports if
        the server has replacement logging enabled.
      </p>
      <input
        type="text"
        value={participantIdInput}
        onChange={(e) => setParticipantIdInput(e.target.value)}
        placeholder="e.g. P01"
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #9ca3af",
          backgroundColor: isDarkMode ? "#374151" : "#ffffff",
          color: "inherit",
          marginBottom: "8px",
          boxSizing: "border-box",
        }}
      />
      <button
        onClick={saveParticipantId}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );

  const currentStarWords = starListWords[selectedOption.value] || [];

  const starListPanel = showStarList && (
    <div
      data-panel
      style={{
        position: "fixed",
        top: "70px",
        right: "16px",
        zIndex: 1100,
        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
        color: isDarkMode ? "#e5e7eb" : "#1f2937",
        border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        padding: "16px",
        width: "300px",
        maxHeight: "60vh",
        overflowY: "auto",
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>
        Starred words — {selectedOption.label}
      </h3>
      {currentStarWords.length === 0 ? (
        <p style={{ fontSize: "14px", opacity: 0.8 }}>
          No starred words yet. Star a suggestion from the spell-check popup to
          save it here (stored in this browser).
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {currentStarWords.map((word) => (
            <li
              key={word}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 0",
                borderBottom: isDarkMode
                  ? "1px solid #374151"
                  : "1px solid #f3f4f6",
              }}
            >
              <span>{word}</span>
              <button
                onClick={() => removeFromStarList(word, selectedOption.value)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#ef4444",
                  fontSize: "14px",
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const footer = (
    <footer className={styles.footer}>
      <div className={styles.footerLeft}>
        <span style={{ fontSize: "14px", opacity: 0.8 }}>
          © {new Date().getFullYear()} Hunspell Live
        </span>
      </div>
      <div className={styles.footerRight}>
        <a
          href="https://github.com/imred42/hunspell_live"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
          aria-label="GitHub repository"
        >
          <FaGithub />
        </a>
        <a
          href="https://spylls.readthedocs.io/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "14px" }}
        >
          Powered by Spylls
        </a>
      </div>
    </footer>
  );

  return (
    <div
      ref={containerRef}
      style={inlineStyles.container}
      onClick={focusEditor}
      className={isDarkMode ? styles.darkMode : ""}
    >
      <header
        className={`${styles.header} ${isDarkMode ? styles.darkMode : ""}`}
      >
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>Hunspell Live</div>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>
            <button
              className={styles.themeToggle}
              onClick={() => {
                setShowStarList((v) => !v);
                setShowSettings(false);
              }}
              aria-label="Starred words"
            >
              <FaStar size={18} />
            </button>
            <button
              className={styles.themeToggle}
              onClick={() => {
                setShowSettings((v) => !v);
                setShowStarList(false);
              }}
              aria-label="Settings"
            >
              <FaCog size={18} />
            </button>
            <a
              href="https://github.com/imred42/hunspell_live"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.themeToggle}
              aria-label="GitHub repository"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <FaGithub size={18} />
            </a>
          </div>
        </div>
      </header>

      <div style={inlineStyles.content}>
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
                    <li>
                      Words you add to your dictionary are stored in this
                      browser and will not be marked as incorrect
                    </li>
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
      {settingsPanel}
      {starListPanel}
      {showUndo && (
        <div className={styles.buttonWrapper}>
          <button
            onClick={handleUndo}
            className={`${styles.undoButton} ${
              isDarkMode ? styles.darkMode : ""
            }`}
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
