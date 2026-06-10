var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrashAlt, FaPaste, FaCopy, FaCut, FaCheck, FaQuestion, FaGithub, FaMoon, FaSun, FaStar, FaCog, } from "react-icons/fa";
import { useApi, getParticipantId, setParticipantId } from "../hooks/useApi";
import { useUserData } from "../hooks/useUserData";
import { styles as inlineStyles } from "../styles/HomePage.styles";
import styles from "../styles/HomePage.module.css";
import { LANGUAGE_OPTIONS, TEXT_DIRECTION_MAP } from "../constants/language";
const HomePage = () => {
    const [selectedOption, setSelectedOption] = useState(() => {
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
    const [spellingResults, setSpellingResults] = useState([]);
    const containerRef = useRef(null);
    const editorRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme === "dark";
    });
    const [ignoredWords, setIgnoredWords] = useState(new Set());
    const [saveStatus, setSaveStatus] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showStarList, setShowStarList] = useState(false);
    const [participantIdInput, setParticipantIdInput] = useState(() => getParticipantId());
    const [changeHistory, setChangeHistory] = useState([]);
    const [showUndo, setShowUndo] = useState(false);
    const { checkSpelling, getSuggestions, recordReplacement } = useApi(selectedOption.value);
    const { starListWords, getDictionaryWords, addToDictionary, addToStarList, removeFromStarList, } = useUserData();
    const options = [...LANGUAGE_OPTIONS];
    const toggleTheme = () => {
        setIsDarkMode((prev) => {
            const newTheme = !prev;
            localStorage.setItem("theme", newTheme ? "dark" : "light");
            return newTheme;
        });
    };
    const handleSelectChange = (option, event) => {
        event === null || event === void 0 ? void 0 : event.stopPropagation();
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
    const handlePaste = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const pastedText = yield navigator.clipboard.readText();
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
                selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
                selection === null || selection === void 0 ? void 0 : selection.addRange(range);
                toast.success("Text pasted successfully");
            }
        }
        catch (error) {
            toast.error("Unable to access clipboard");
        }
    });
    const handleTextChange = (event) => {
        var _a, _b;
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
            if ((parentSpan === null || parentSpan === void 0 ? void 0 : parentSpan.classList.contains("misspelled")) ||
                ((_a = range.startContainer.previousSibling) === null || _a === void 0 ? void 0 : _a.nodeName) === "SPAN" ||
                ((_b = range.startContainer.nextSibling) === null || _b === void 0 ? void 0 : _b.nodeName) === "SPAN" ||
                newText.length === 0) {
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
    const handleCheckSpelling = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!text.trim()) {
            toast.warning("Please enter some text to check spelling");
            return;
        }
        const loadingToast = toast.loading("Checking spelling...");
        try {
            const userDictionaryWords = getDictionaryWords(selectedOption.value);
            const results = yield checkSpelling(text, userDictionaryWords);
            const newResults = results.filter((result) => !ignoredWords.has(result.word.toLowerCase()));
            toast.dismiss(loadingToast);
            if (newResults.length > 0) {
                highlightMisspelledWords(newResults);
                toast.error(`Found ${newResults.length} spelling error${newResults.length === 1 ? "" : "s"}`);
            }
            else {
                toast.success("No spelling errors found!");
            }
        }
        catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Error checking spelling");
        }
    });
    const highlightMisspelledWords = (results) => {
        if (!editorRef.current)
            return;
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
        const misspelledElements = editorRef.current.getElementsByClassName("misspelled");
        Array.from(misspelledElements).forEach((element) => {
            element.addEventListener("click", handleMisspelledWordClick);
        });
        if (editorRef.current) {
            const newRange = document.createRange();
            const lastChild = editorRef.current.lastChild;
            if (lastChild) {
                newRange.setStartAfter(lastChild);
                newRange.setEndAfter(lastChild);
                selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
                selection === null || selection === void 0 ? void 0 : selection.addRange(newRange);
            }
        }
    };
    const handleMisspelledWordClick = (event) => __awaiter(void 0, void 0, void 0, function* () {
        const element = event.target;
        const word = element.dataset.word;
        const startPosition = parseInt(element.dataset.start || "0", 10);
        if (!word)
            return;
        const suggestions = yield getSuggestions(word);
        if (suggestions.suggestions.length === 0) {
            const lowercaseSuggestions = yield getSuggestions(word.toLowerCase());
            suggestions.suggestions = lowercaseSuggestions.suggestions.filter((suggestion) => suggestion.toLowerCase() !== word.toLowerCase());
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
        const addButtonHoverEffect = (button) => {
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
        const createTooltip = (text) => {
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
        const addTooltipHandlers = (button, tooltip) => {
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
                setSpellingResults((prev) => prev.filter((result) => !(result.word.toLowerCase() === word.toLowerCase() &&
                    result.index === startPosition)));
            }
            document.body.removeChild(popup);
        });
        dictionaryButton.addEventListener("click", (e) => {
            e.stopPropagation();
            addToDictionary(word, selectedOption.value);
            if (element && editorRef.current) {
                element.outerHTML = word;
                setSpellingResults((prev) => prev.filter((result) => !(result.word === word && result.index === startPosition)));
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
        const calculatedHeight = numItems === 0 ? 60 : numItems * itemHeight + headerHeight + padding;
        const maxHeight = 300;
        scrollContainer.style.minHeight = `${Math.min(calculatedHeight, maxHeight)}px`;
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
        }
        else {
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
        const handleClickOutside = (e) => {
            if (!popup.contains(e.target) && document.body.contains(popup)) {
                document.body.removeChild(popup);
                document.removeEventListener("click", handleClickOutside);
            }
        };
        setTimeout(() => {
            document.addEventListener("click", handleClickOutside);
        }, 0);
    });
    const handleSuggestionClick = (suggestion, originalWord, startPosition) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!editorRef.current)
            return;
        yield recordReplacement(originalWord, suggestion);
        const originalSpellingResult = spellingResults.find((result) => result.word === originalWord && result.index === startPosition);
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
        const spans = editorRef.current.querySelectorAll(`span.misspelled[data-word="${originalWord}"]`);
        let targetSpan = null;
        for (const span of spans) {
            const spanPosition = parseInt(span.getAttribute("data-start") || "0", 10);
            if (spanPosition === startPosition) {
                targetSpan = span;
                break;
            }
        }
        if (targetSpan) {
            const textNode = document.createTextNode(suggestion);
            (_a = targetSpan.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(textNode, targetSpan);
            setText(editorRef.current.innerText);
            setSpellingResults((prev) => prev.filter((result) => !(result.word.toLowerCase() === originalWord.toLowerCase() &&
                result.index === startPosition)));
            const misspelledElements = editorRef.current.getElementsByClassName("misspelled");
            Array.from(misspelledElements).forEach((element) => {
                element.addEventListener("click", handleMisspelledWordClick);
            });
        }
    });
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);
    const focusEditor = (event) => {
        var _a, _b, _c;
        const target = event.target;
        if (target &&
            (((_a = target.closest) === null || _a === void 0 ? void 0 : _a.call(target, ".custom-dropdown")) ||
                ((_b = target.closest) === null || _b === void 0 ? void 0 : _b.call(target, ".dropdown")) ||
                ((_c = target.closest) === null || _c === void 0 ? void 0 : _c.call(target, "[data-panel]")))) {
            return;
        }
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };
    const handleCopy = () => __awaiter(void 0, void 0, void 0, function* () {
        if (editorRef.current) {
            try {
                yield navigator.clipboard.writeText(editorRef.current.innerText);
                toast.success("Text copied to clipboard");
            }
            catch (error) {
                toast.error("Failed to copy text");
            }
        }
    });
    const handleCut = () => __awaiter(void 0, void 0, void 0, function* () {
        if (editorRef.current) {
            try {
                yield navigator.clipboard.writeText(editorRef.current.innerText);
                editorRef.current.innerHTML = "";
                setText("");
                setSpellingResults([]);
                setCharCount(0);
                setWordCount(0);
                setChangeHistory([]);
                setShowUndo(false);
                toast.success("Text cut to clipboard");
            }
            catch (error) {
                toast.error("Failed to cut text");
            }
        }
    });
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        }
        else {
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
        }
        else {
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
        if (!editorRef.current)
            return;
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
        const handleKeyDown = (e) => {
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
        toast.success(participantIdInput.trim()
            ? `Participant ID set to "${participantIdInput.trim()}"`
            : "Participant ID cleared");
        setShowSettings(false);
    };
    const settingsPanel = showSettings && (_jsxs("div", Object.assign({ "data-panel": true, style: {
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
        } }, { children: [_jsx("h3", Object.assign({ style: { margin: "0 0 8px", fontSize: "16px" } }, { children: "Settings" })), _jsx("label", Object.assign({ style: { fontSize: "14px", display: "block", marginBottom: "4px" } }, { children: "Participant ID (optional)" })), _jsx("p", Object.assign({ style: { fontSize: "12px", margin: "0 0 8px", opacity: 0.8 } }, { children: "For research studies: attached to your \"error \u2192 correction\" reports if the server has replacement logging enabled." })), _jsx("input", { type: "text", value: participantIdInput, onChange: (e) => setParticipantIdInput(e.target.value), placeholder: "e.g. P01", style: {
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #9ca3af",
                    backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                    color: "inherit",
                    marginBottom: "8px",
                    boxSizing: "border-box",
                } }), _jsx("button", Object.assign({ onClick: saveParticipantId, style: {
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    cursor: "pointer",
                } }, { children: "Save" }))] })));
    const currentStarWords = starListWords[selectedOption.value] || [];
    const starListPanel = showStarList && (_jsxs("div", Object.assign({ "data-panel": true, style: {
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
        } }, { children: [_jsxs("h3", Object.assign({ style: { margin: "0 0 8px", fontSize: "16px" } }, { children: ["Starred words \u2014 ", selectedOption.label] })), currentStarWords.length === 0 ? (_jsx("p", Object.assign({ style: { fontSize: "14px", opacity: 0.8 } }, { children: "No starred words yet. Star a suggestion from the spell-check popup to save it here (stored in this browser)." }))) : (_jsx("ul", Object.assign({ style: { listStyle: "none", margin: 0, padding: 0 } }, { children: currentStarWords.map((word) => (_jsxs("li", Object.assign({ style: {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: isDarkMode
                            ? "1px solid #374151"
                            : "1px solid #f3f4f6",
                    } }, { children: [_jsx("span", { children: word }), _jsx("button", Object.assign({ onClick: () => removeFromStarList(word, selectedOption.value), style: {
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                color: "#ef4444",
                                fontSize: "14px",
                            } }, { children: "Remove" }))] }), word))) })))] })));
    const footer = (_jsxs("footer", Object.assign({ className: styles.footer }, { children: [_jsx("div", Object.assign({ className: styles.footerLeft }, { children: _jsxs("span", Object.assign({ style: { fontSize: "14px", opacity: 0.8 } }, { children: ["\u00A9 ", new Date().getFullYear(), " Hunspell Live"] })) })), _jsxs("div", Object.assign({ className: styles.footerRight }, { children: [_jsx("a", Object.assign({ href: "https://github.com/imred42/hunspell_live", target: "_blank", rel: "noopener noreferrer", className: styles.githubLink, "aria-label": "GitHub repository" }, { children: _jsx(FaGithub, {}) })), _jsx("a", Object.assign({ href: "https://spylls.readthedocs.io/", target: "_blank", rel: "noopener noreferrer", style: { fontSize: "14px" } }, { children: "Powered by Spylls" }))] }))] })));
    return (_jsxs("div", Object.assign({ ref: containerRef, style: inlineStyles.container, onClick: focusEditor, className: isDarkMode ? styles.darkMode : "" }, { children: [_jsx("header", Object.assign({ className: `${styles.header} ${isDarkMode ? styles.darkMode : ""}` }, { children: _jsxs("div", Object.assign({ className: styles.headerContent }, { children: [_jsx("div", Object.assign({ className: styles.headerLeft }, { children: _jsx("div", Object.assign({ className: styles.logo }, { children: "Hunspell Live" })) })), _jsxs("div", Object.assign({ className: styles.headerRight }, { children: [_jsx("button", Object.assign({ className: styles.themeToggle, onClick: toggleTheme, "aria-label": "Toggle theme" }, { children: isDarkMode ? _jsx(FaSun, { size: 18 }) : _jsx(FaMoon, { size: 18 }) })), _jsx("button", Object.assign({ className: styles.themeToggle, onClick: () => {
                                        setShowStarList((v) => !v);
                                        setShowSettings(false);
                                    }, "aria-label": "Starred words" }, { children: _jsx(FaStar, { size: 18 }) })), _jsx("button", Object.assign({ className: styles.themeToggle, onClick: () => {
                                        setShowSettings((v) => !v);
                                        setShowStarList(false);
                                    }, "aria-label": "Settings" }, { children: _jsx(FaCog, { size: 18 }) })), _jsx("a", Object.assign({ href: "https://github.com/imred42/hunspell_live", target: "_blank", rel: "noopener noreferrer", className: styles.themeToggle, "aria-label": "GitHub repository", style: { display: "inline-flex", alignItems: "center" } }, { children: _jsx(FaGithub, { size: 18 }) }))] }))] })) })), _jsx("div", Object.assign({ style: inlineStyles.content }, { children: _jsxs("div", Object.assign({ style: Object.assign(Object.assign({}, inlineStyles.editorContainer), { backgroundColor: isDarkMode
                            ? "#1f2937"
                            : inlineStyles.editorContainer.backgroundColor }) }, { children: [_jsxs("div", Object.assign({ style: inlineStyles.controlsContainer }, { children: [_jsxs("div", Object.assign({ style: inlineStyles.buttonGroup }, { children: [_jsxs("div", Object.assign({ className: styles.buttonWrapper }, { children: [_jsx("button", Object.assign({ onClick: handleCheckSpelling, className: styles.checkButton }, { children: _jsx(FaCheck, {}) })), _jsx("span", Object.assign({ className: styles.tooltip }, { children: "Check Spelling" }))] })), _jsxs("div", Object.assign({ className: styles.buttonWrapper }, { children: [_jsx("button", Object.assign({ onClick: handleClearText, className: styles.clearButton }, { children: _jsx(FaTrashAlt, {}) })), _jsx("span", Object.assign({ className: styles.tooltip }, { children: "Clear" }))] })), _jsxs("div", Object.assign({ className: styles.buttonWrapper }, { children: [_jsx("button", Object.assign({ onClick: handlePaste, className: styles.pasteButton }, { children: _jsx(FaPaste, {}) })), _jsx("span", Object.assign({ className: styles.tooltip }, { children: "Paste" }))] })), _jsxs("div", Object.assign({ className: styles.buttonWrapper }, { children: [_jsx("button", Object.assign({ onClick: handleCopy, className: styles.copyButton }, { children: _jsx(FaCopy, {}) })), _jsx("span", Object.assign({ className: styles.tooltip }, { children: "Copy" }))] })), _jsxs("div", Object.assign({ className: styles.buttonWrapper }, { children: [_jsx("button", Object.assign({ onClick: handleCut, className: styles.cutButton }, { children: _jsx(FaCut, {}) })), _jsx("span", Object.assign({ className: styles.tooltip }, { children: "Cut" }))] })), _jsxs("div", Object.assign({ className: styles.buttonWrapper }, { children: [_jsx("button", Object.assign({ className: styles.helpButton }, { children: _jsx(FaQuestion, {}) })), _jsxs("div", Object.assign({ className: styles.helpCard }, { children: [_jsx("h3", { children: "Instructions" }), _jsxs("ul", { children: [_jsx("li", { children: "Select your language from the dropdown menu" }), _jsx("li", { children: "Type or paste your text in the editor" }), _jsx("li", { children: "Click the check (\u2713) button to check spelling" }), _jsx("li", { children: "Click on red underlined words to see suggestions" }), _jsx("li", { children: "Click suggested word to replace" }), _jsx("li", { children: "Words you add to your dictionary are stored in this browser and will not be marked as incorrect" })] })] }))] }))] })), _jsx("div", Object.assign({ style: inlineStyles.dropdownContainer }, { children: _jsx(Dropdown, { options: options, value: selectedOption, onChange: handleSelectChange, isDarkMode: isDarkMode }) }))] })), _jsx("div", { ref: editorRef, contentEditable: true, spellCheck: "false", onInput: handleTextChange, style: Object.assign(Object.assign({}, inlineStyles.editor), { backgroundColor: isDarkMode ? "#374151" : "#ffffff", color: isDarkMode ? "#ffffff" : "inherit", direction: TEXT_DIRECTION_MAP[selectedOption.value] || "ltr", textAlign: TEXT_DIRECTION_MAP[selectedOption.value] === "rtl"
                                    ? "right"
                                    : "left" }), "data-placeholder": "Enter or paste your text here to check spelling" }), _jsxs("div", Object.assign({ className: styles.countDisplay }, { children: [_jsxs("span", { children: ["Characters: ", charCount] }), _jsxs("span", { children: ["Words: ", wordCount] }), saveStatus && (_jsx("span", Object.assign({ className: `${styles.saveStatus} ${saveStatus === "saved" ? styles.saved : styles.saving}` }, { children: saveStatus === "saved" ? "Saved" : "Saving..." })))] }))] })) })), footer, settingsPanel, starListPanel, showUndo && (_jsxs("div", Object.assign({ className: styles.buttonWrapper }, { children: [_jsxs("button", Object.assign({ onClick: handleUndo, className: `${styles.undoButton} ${isDarkMode ? styles.darkMode : ""}`, title: "Undo last replacement (Cmd/Ctrl + Z)" }, { children: [_jsx("span", Object.assign({ className: styles.undoIcon }, { children: "\u21A9\uFE0F" })), _jsx("span", Object.assign({ className: styles.undoText }, { children: "Undo" }))] })), _jsx("span", Object.assign({ className: styles.tooltip }, { children: "Undo last word replacement (Cmd/Ctrl + Z)" }))] })))] })));
};
export default HomePage;
