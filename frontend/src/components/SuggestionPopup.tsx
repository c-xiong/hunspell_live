import React, { useEffect, useRef } from "react";
import { FaBan, FaBook, FaStar } from "react-icons/fa";
import { useIsMobile } from "../hooks/useIsMobile";

export interface PopupTarget {
  word: string;
  start: number;
  rect: { left: number; bottom: number; width: number };
}

interface SuggestionPopupProps {
  target: PopupTarget;
  /** null while loading */
  suggestions: string[] | null;
  onReplace: (suggestion: string) => void;
  onStar: (suggestion: string) => void;
  onIgnore: () => void;
  onAddToDictionary: () => void;
  onClose: () => void;
}

// Suggestion list for a misspelled word: anchored popup on desktop,
// bottom sheet on mobile.
const SuggestionPopup: React.FC<SuggestionPopupProps> = ({
  target,
  suggestions,
  onReplace,
  onStar,
  onIgnore,
  onAddToDictionary,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  const desktopPosition: React.CSSProperties = isMobile
    ? {}
    : {
        left: Math.min(
          Math.max(target.rect.left - 40, 10),
          window.innerWidth - 290
        ),
        top: target.rect.bottom + 8,
      };

  return (
    <div
      ref={ref}
      style={desktopPosition}
      className={
        isMobile
          ? "fixed inset-x-0 bottom-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-popup dark:border-slate-700 dark:bg-slate-800"
          : "fixed z-50 max-h-80 w-72 overflow-y-auto rounded-card border border-slate-200 bg-white shadow-popup dark:border-slate-700 dark:bg-slate-800"
      }
      onClick={(e) => e.stopPropagation()}
    >
      {isMobile && (
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
      )}

      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-700">
        <span className="truncate text-sm font-semibold text-red-500">
          {target.word}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onIgnore}
            title="Ignore this word"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <FaBan />
          </button>
          <button
            type="button"
            onClick={onAddToDictionary}
            title="Add to my dictionary (stored in this browser)"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <FaBook />
          </button>
        </div>
      </div>

      {suggestions === null ? (
        <div className="px-4 py-6 text-center text-sm italic text-slate-400">
          Loading suggestions…
        </div>
      ) : suggestions.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm italic text-slate-400">
          No suggestions available
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion}
              className="flex items-center gap-1 border-b border-slate-100 last:border-b-0 dark:border-slate-700/50"
            >
              <button
                type="button"
                onClick={() => onReplace(suggestion)}
                className="flex min-h-touch flex-1 items-center px-4 py-2 text-left text-lg font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                {suggestion}
              </button>
              <button
                type="button"
                onClick={() => onStar(suggestion)}
                title="Star this word (stored in this browser)"
                className="mr-2 flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-amber-500 dark:hover:bg-slate-700"
              >
                <FaStar />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SuggestionPopup;
