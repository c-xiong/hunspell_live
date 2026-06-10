import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaCheck,
  FaTrashAlt,
  FaPaste,
  FaCopy,
  FaCut,
  FaQuestion,
  FaGithub,
  FaMoon,
  FaSun,
  FaStar,
  FaCog,
  FaSpinner,
  FaUndo,
} from "react-icons/fa";
import Dropdown from "../components/Dropdown";
import Panel from "../components/Panel";
import SuggestionPopup, { PopupTarget } from "../components/SuggestionPopup";
import UploadDictionaryModal from "../components/UploadDictionaryModal";
import { useApi, getParticipantId, setParticipantId } from "../hooks/useApi";
import { useSessionDictionaries } from "../hooks/useSessionDictionaries";
import { useUserData } from "../hooks/useUserData";
import { apiRequest } from "../config/api";
import { LanguageOption, SpellingResult } from "../types/spelling";
import { LANGUAGE_OPTIONS, TEXT_DIRECTION_MAP } from "../constants/language";

type PanelName = "settings" | "starlist" | "help" | null;

const GITHUB_URL = "https://github.com/c-xiong/hunspell_live";

const iconButtonClass =
  "flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200";

const toolbarButtonClass =
  "flex min-h-touch min-w-touch items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200";

const HomePage: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<LanguageOption>(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    return savedLanguage
      ? JSON.parse(savedLanguage)
      : { label: "English (US)", value: "en_US" };
  });
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [text, setText] = useState(
    () => localStorage.getItem("editorContent") || ""
  );
  const [spellingResults, setSpellingResults] = useState<SpellingResult[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [ignoredWords, setIgnoredWords] = useState<Set<string>>(new Set());
  const [isChecking, setIsChecking] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelName>(null);
  const [participantIdInput, setParticipantIdInput] = useState(() =>
    getParticipantId()
  );
  const [replacementLogging, setReplacementLogging] = useState<boolean | null>(
    null
  );
  const [popupTarget, setPopupTarget] = useState<PopupTarget | null>(null);
  const [popupSuggestions, setPopupSuggestions] = useState<string[] | null>(
    null
  );
  const [changeHistory, setChangeHistory] = useState<
    Array<{
      originalWord: string;
      replacement: string;
      position: number;
      spellingResult: SpellingResult;
    }>
  >([]);

  const { checkSpelling, getSuggestions, recordReplacement } = useApi(
    selectedOption.value
  );

  const {
    starListWords,
    getDictionaryWords,
    addToDictionary,
    addToStarList,
    removeFromStarList,
    dictionaryWords,
    removeFromDictionary,
  } = useUserData();

  const { sessionDictionaries, addSessionDictionary, removeSessionDictionary } =
    useSessionDictionaries();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const options: LanguageOption[] = [
    ...LANGUAGE_OPTIONS,
    ...sessionDictionaries.map((d) => ({
      label: `${d.name} (this session)`,
      value: d.id,
    })),
  ];
  const sessionDict = sessionDictionaries.find(
    (d) => d.id === selectedOption.value
  );
  const textDirection =
    sessionDict?.direction ?? TEXT_DIRECTION_MAP[selectedOption.value] ?? "ltr";

  // ----- theme -----
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      localStorage.setItem("theme", prev ? "light" : "dark");
      return !prev;
    });
  };

  // ----- server status (HF Space may be waking from sleep) -----
  useEffect(() => {
    let finished = false;
    const slowTimer = setTimeout(() => {
      if (!finished) {
        toast.info(
          "The demo server may be waking up from sleep — the first request can take a little while.",
          { autoClose: 6000 }
        );
      }
    }, 3000);
    apiRequest("/api/config/")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setReplacementLogging(Boolean(data.replacement_logging));
      })
      .catch(() => setReplacementLogging(null))
      .finally(() => {
        finished = true;
        clearTimeout(slowTimer);
      });
    return () => clearTimeout(slowTimer);
  }, []);

  // ----- editor content persistence -----
  useEffect(() => {
    if (editorRef.current && text) {
      editorRef.current.innerHTML = text;
      updateCounts(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("editorContent", text);
  }, [text]);

  const updateCounts = (value: string) => {
    setCharCount(value.trim() ? value.length : 0);
    setWordCount(value.trim().split(/\s+/).filter(Boolean).length);
  };

  const resetEditorState = () => {
    setSpellingResults([]);
    setChangeHistory([]);
    setPopupTarget(null);
  };

  // ----- language -----
  const handleSelectChange = (
    option: LanguageOption,
    event?: React.MouseEvent
  ) => {
    event?.stopPropagation();
    localStorage.setItem("selectedLanguage", JSON.stringify(option));
    setSelectedOption(option);
    setText("");
    resetEditorState();
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    updateCounts("");
  };

  // ----- toolbar actions -----
  const handleClearText = () => {
    localStorage.removeItem("editorContent");
    if (editorRef.current) editorRef.current.innerHTML = "";
    setText("");
    resetEditorState();
    updateCounts("");
  };

  const handlePaste = async () => {
    try {
      const pastedText = await navigator.clipboard.readText();
      if (editorRef.current) {
        editorRef.current.innerText = pastedText;
        setText(pastedText);
        resetEditorState();
        updateCounts(pastedText);
      }
    } catch {
      toast.error("Unable to access clipboard");
    }
  };

  const handleCopy = async () => {
    if (!editorRef.current) return;
    try {
      await navigator.clipboard.writeText(editorRef.current.innerText);
      toast.success("Text copied to clipboard");
    } catch {
      toast.error("Failed to copy text");
    }
  };

  const handleCut = async () => {
    if (!editorRef.current) return;
    try {
      await navigator.clipboard.writeText(editorRef.current.innerText);
      editorRef.current.innerHTML = "";
      setText("");
      resetEditorState();
      updateCounts("");
      toast.success("Text cut to clipboard");
    } catch {
      toast.error("Failed to cut text");
    }
  };

  // ----- typing -----
  const handleTextChange = (event: React.FormEvent<HTMLDivElement>) => {
    const newText = event.currentTarget.innerText;
    setText(newText);
    resetEditorState();
    updateCounts(newText);

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

  // ----- spell checking -----
  const handleMisspelledWordClick = useCallback((event: Event) => {
    const element = event.target as HTMLSpanElement;
    const word = element.dataset.word;
    const start = parseInt(element.dataset.start || "0", 10);
    if (!word) return;
    const rect = element.getBoundingClientRect();
    setPopupSuggestions(null);
    setPopupTarget({
      word,
      start,
      rect: { left: rect.left, bottom: rect.bottom, width: rect.width },
    });
  }, []);

  // Load suggestions whenever the popup opens on a new word
  useEffect(() => {
    if (!popupTarget) return;
    let cancelled = false;
    (async () => {
      const result = await getSuggestions(popupTarget.word);
      let list = result.suggestions;
      if (list.length === 0) {
        const lower = await getSuggestions(popupTarget.word.toLowerCase());
        list = lower.suggestions.filter(
          (s) => s.toLowerCase() !== popupTarget.word.toLowerCase()
        );
      }
      if (!cancelled) setPopupSuggestions(list);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupTarget?.word, popupTarget?.start]);

  const attachMisspelledHandlers = () => {
    if (!editorRef.current) return;
    const misspelledElements =
      editorRef.current.getElementsByClassName("misspelled");
    Array.from(misspelledElements).forEach((element) => {
      element.addEventListener("click", handleMisspelledWordClick);
    });
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
      html += `<span class="misspelled" data-word="${misspelledWord}" data-start="${wordStart}" style="text-decoration: solid underline #ef4444 3px; text-underline-offset: 0.25em; cursor: pointer;">${misspelledWord}</span>`;
      lastIndex = wordEnd;
    });
    html += textContent.slice(lastIndex);
    editorRef.current.innerHTML = html;
    setSpellingResults(results);
    attachMisspelledHandlers();
  };

  const handleCheckSpelling = async () => {
    if (!text.trim()) {
      toast.warning("Please enter some text to check spelling");
      return;
    }
    setIsChecking(true);
    try {
      const userDictionaryWords = getDictionaryWords(selectedOption.value);
      const results = await checkSpelling(text, userDictionaryWords);
      const newResults = results.filter(
        (result) => !ignoredWords.has(result.word.toLowerCase())
      );

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
      if ((error as Error & { code?: string }).code === "SESSION_EXPIRED") {
        toast.error((error as Error).message);
        removeSessionDictionary(selectedOption.value);
        handleSelectChange({ label: "English (US)", value: "en_US" });
      } else {
        toast.error("Error checking spelling");
      }
    } finally {
      setIsChecking(false);
    }
  };

  // ----- popup actions -----
  const removeHighlight = (word: string, start: number) => {
    if (!editorRef.current) return;
    const spans = editorRef.current.querySelectorAll(
      `span.misspelled[data-word="${CSS.escape(word)}"]`
    );
    for (const span of spans) {
      if (parseInt(span.getAttribute("data-start") || "0", 10) === start) {
        span.outerHTML = word;
        break;
      }
    }
    setSpellingResults((prev) =>
      prev.filter(
        (result) =>
          !(
            result.word.toLowerCase() === word.toLowerCase() &&
            result.index === start
          )
      )
    );
  };

  const handleIgnore = () => {
    if (!popupTarget) return;
    const { word, start } = popupTarget;
    setIgnoredWords((prev) => new Set(prev).add(word.toLowerCase()));
    removeHighlight(word, start);
    setPopupTarget(null);
  };

  const handleAddToDictionary = () => {
    if (!popupTarget) return;
    const { word, start } = popupTarget;
    addToDictionary(word, selectedOption.value);
    removeHighlight(word, start);
    toast.success("Word added to your dictionary (stored in this browser)");
    setPopupTarget(null);
  };

  const handleStarSuggestion = (suggestion: string) => {
    addToStarList(suggestion, selectedOption.value);
    toast.success("Word starred (stored in this browser)");
    setPopupTarget(null);
  };

  const handleReplace = async (suggestion: string) => {
    if (!popupTarget || !editorRef.current) return;
    const { word, start } = popupTarget;

    recordReplacement(word, suggestion);

    const originalSpellingResult = spellingResults.find(
      (result) => result.word === word && result.index === start
    ) || { word, index: start, length: word.length };

    setChangeHistory((prev) => [
      ...prev,
      {
        originalWord: word,
        replacement: suggestion,
        position: start,
        spellingResult: originalSpellingResult,
      },
    ]);

    const spans = editorRef.current.querySelectorAll(
      `span.misspelled[data-word="${CSS.escape(word)}"]`
    );
    for (const span of spans) {
      if (parseInt(span.getAttribute("data-start") || "0", 10) === start) {
        span.parentNode?.replaceChild(
          document.createTextNode(suggestion),
          span
        );
        break;
      }
    }

    setText(editorRef.current.innerText);
    setSpellingResults((prev) =>
      prev.filter(
        (result) =>
          !(
            result.word.toLowerCase() === word.toLowerCase() &&
            result.index === start
          )
      )
    );
    attachMisspelledHandlers();
    setPopupTarget(null);
  };

  // ----- undo -----
  const handleUndo = useCallback(() => {
    if (changeHistory.length === 0 || !editorRef.current) return;

    const { originalWord, replacement, position, spellingResult } =
      changeHistory[changeHistory.length - 1];

    const content = editorRef.current.innerText;
    const newContent =
      content.slice(0, position) +
      originalWord +
      content.slice(position + replacement.length);

    editorRef.current.innerText = newContent;
    setText(newContent);
    setChangeHistory((prev) => prev.slice(0, -1));
    highlightMisspelledWords([...spellingResults, spellingResult]);
    toast.success("Last change undone");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeHistory, spellingResults]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

  // ----- panels -----
  const saveParticipantId = () => {
    setParticipantId(participantIdInput);
    toast.success(
      participantIdInput.trim()
        ? `Participant ID set to "${participantIdInput.trim()}"`
        : "Participant ID cleared"
    );
    setActivePanel(null);
  };

  const currentStarWords = starListWords[selectedOption.value] || [];
  const currentDictWords = dictionaryWords[selectedOption.value] || [];

  const focusEditor = (event: React.MouseEvent) => {
    const target = event.target as Element;
    if (
      target?.closest?.(".dropdown") ||
      target?.closest?.("[data-panel]") ||
      target?.closest?.("button") ||
      target?.closest?.("a")
    ) {
      return;
    }
    editorRef.current?.focus();
  };

  return (
    <div
      className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950"
      onClick={focusEditor}
    >
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Hunspell <span className="text-primary-600 dark:text-primary-400">Live</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={iconButtonClass}
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkMode ? "Light mode" : "Dark mode"}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button
              type="button"
              className={iconButtonClass}
              onClick={() =>
                setActivePanel(activePanel === "starlist" ? null : "starlist")
              }
              aria-label="My words"
              title="My words (dictionary & stars)"
            >
              <FaStar />
            </button>
            <button
              type="button"
              className={iconButtonClass}
              onClick={() =>
                setActivePanel(activePanel === "settings" ? null : "settings")
              }
              aria-label="Settings"
              title="Settings"
            >
              <FaCog />
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={iconButtonClass}
              aria-label="GitHub repository"
              title="GitHub"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden px-4 py-4 sm:py-6">
        <div className="flex flex-1 flex-col overflow-hidden rounded-card border border-slate-200 bg-white p-3 shadow-card sm:p-4 dark:border-slate-800 dark:bg-slate-900">
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCheckSpelling}
              disabled={isChecking}
              className="flex min-h-touch items-center gap-2 rounded-lg bg-primary-600 px-4 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isChecking ? <FaSpinner className="animate-spin" /> : <FaCheck />}
              <span className="hidden sm:inline">
                {isChecking ? "Checking…" : "Check spelling"}
              </span>
            </button>
            <div className="flex items-center gap-1">
              <button type="button" onClick={handleClearText} className={toolbarButtonClass} title="Clear text" aria-label="Clear text">
                <FaTrashAlt />
              </button>
              <button type="button" onClick={handlePaste} className={toolbarButtonClass} title="Paste" aria-label="Paste">
                <FaPaste />
              </button>
              <button type="button" onClick={handleCopy} className={toolbarButtonClass} title="Copy" aria-label="Copy">
                <FaCopy />
              </button>
              <button type="button" onClick={handleCut} className={toolbarButtonClass} title="Cut" aria-label="Cut">
                <FaCut />
              </button>
              <button
                type="button"
                onClick={() => setActivePanel(activePanel === "help" ? null : "help")}
                className={toolbarButtonClass}
                title="How it works"
                aria-label="How it works"
              >
                <FaQuestion />
              </button>
            </div>
            <div className="ml-auto w-full sm:w-auto">
              <Dropdown
                options={options}
                value={selectedOption}
                onChange={handleSelectChange}
                onUploadClick={() => setShowUploadModal(true)}
              />
            </div>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            spellCheck="false"
            onInput={handleTextChange}
            className="spell-editor"
            style={{
              direction: textDirection,
              textAlign: textDirection === "rtl" ? "right" : "left",
            }}
            data-placeholder="Select a language, then type or paste your text here…"
          />

          {/* Status bar */}
          <div className="mt-2 flex items-center justify-between text-sm text-slate-400 dark:text-slate-500">
            <span>
              {charCount} characters · {wordCount} words
            </span>
            {changeHistory.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Undo last replacement (Cmd/Ctrl + Z)"
              >
                <FaUndo /> Undo
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 text-sm text-slate-400 dark:text-slate-500">
          <span>© {new Date().getFullYear()} Hunspell Live</span>
          <div className="flex items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="GitHub repository"
            >
              <FaGithub />
            </a>
            <a
              href="https://spylls.readthedocs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
            >
              Powered by Spylls
            </a>
          </div>
        </div>
      </footer>

      {/* Panels */}
      {activePanel === "settings" && (
        <Panel title="Settings" onClose={() => setActivePanel(null)}>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Participant ID (optional)
          </label>
          <p className="mb-2 text-xs text-slate-400 dark:text-slate-500">
            For research studies: attached to your "error → correction" reports
            if the server has replacement logging enabled.
          </p>
          <input
            type="text"
            value={participantIdInput}
            onChange={(e) => setParticipantIdInput(e.target.value)}
            placeholder="e.g. P01"
            className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 outline-none focus:border-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={saveParticipantId}
            className="min-h-touch rounded-lg bg-primary-600 px-4 font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Save
          </button>
          <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
            {replacementLogging === null
              ? "Could not determine whether this server records replacement data."
              : replacementLogging
                ? "This instance records anonymous \"error → correction\" pairs for dictionary research."
                : "This server does not record your replacement data."}
          </div>
        </Panel>
      )}

      {activePanel === "starlist" && (
        <Panel
          title={`My words — ${selectedOption.label}`}
          onClose={() => setActivePanel(null)}
        >
          <h4 className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            Starred words
          </h4>
          {currentStarWords.length === 0 ? (
            <p className="mb-3 text-sm text-slate-400 dark:text-slate-500">
              Star a suggestion from the spell-check popup to save it here
              (stored in this browser).
            </p>
          ) : (
            <ul className="m-0 mb-3 list-none p-0">
              {currentStarWords.map((word) => (
                <li
                  key={word}
                  className="flex items-center justify-between border-b border-slate-100 py-1.5 text-base dark:border-slate-700/50"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => removeFromStarList(word, selectedOption.value)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <h4 className="mb-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            My dictionary
          </h4>
          {currentDictWords.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Words you add to your dictionary will not be marked as misspelled
              (stored in this browser).
            </p>
          ) : (
            <ul className="m-0 list-none p-0">
              {currentDictWords.map((word) => (
                <li
                  key={word}
                  className="flex items-center justify-between border-b border-slate-100 py-1.5 text-base dark:border-slate-700/50"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() =>
                      removeFromDictionary(word, selectedOption.value)
                    }
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {activePanel === "help" && (
        <Panel title="How it works" onClose={() => setActivePanel(null)}>
          <ul className="m-0 list-disc space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>Select your language from the dropdown menu</li>
            <li>Type or paste your text in the editor</li>
            <li>Click "Check spelling"</li>
            <li>Click a red-underlined word to see suggestions</li>
            <li>Click a suggestion to replace the word</li>
            <li>
              Words you add to your dictionary are stored in this browser and
              will not be marked as incorrect
            </li>
          </ul>
        </Panel>
      )}

      {/* Upload dictionary modal */}
      {showUploadModal && (
        <UploadDictionaryModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={(result) => {
            addSessionDictionary(
              result.dictionary_id,
              result.name,
              result.text_direction,
              result.expires_in_seconds
            );
            setShowUploadModal(false);
            handleSelectChange({
              label: `${result.name} (this session)`,
              value: result.dictionary_id,
            });
            toast.success(
              `"${result.name}" is ready — available for this session only.`
            );
          }}
        />
      )}

      {/* Suggestion popup */}
      {popupTarget && (
        <SuggestionPopup
          target={popupTarget}
          suggestions={popupSuggestions}
          onReplace={handleReplace}
          onStar={handleStarSuggestion}
          onIgnore={handleIgnore}
          onAddToDictionary={handleAddToDictionary}
          onClose={() => setPopupTarget(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
