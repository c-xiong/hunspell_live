import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { FaBan, FaBook, FaStar } from "react-icons/fa";
import { useIsMobile } from "../hooks/useIsMobile";
// Suggestion list for a misspelled word: anchored popup on desktop,
// bottom sheet on mobile.
const SuggestionPopup = ({ target, suggestions, onReplace, onStar, onIgnore, onAddToDictionary, onClose, }) => {
    const ref = useRef(null);
    const isMobile = useIsMobile();
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
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
    const desktopPosition = isMobile
        ? {}
        : {
            left: Math.min(Math.max(target.rect.left - 40, 10), window.innerWidth - 290),
            top: target.rect.bottom + 8,
        };
    return (_jsxs("div", { ref: ref, style: desktopPosition, className: isMobile
            ? "fixed inset-x-0 bottom-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-popup dark:border-slate-700 dark:bg-slate-800"
            : "fixed z-50 max-h-80 w-72 overflow-y-auto rounded-card border border-slate-200 bg-white shadow-popup dark:border-slate-700 dark:bg-slate-800", onClick: (e) => e.stopPropagation(), children: [isMobile && (_jsx("div", { className: "mx-auto mt-2 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" })), _jsxs("div", { className: "flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-700", children: [_jsx("span", { className: "truncate text-sm font-semibold text-red-500", children: target.word }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { type: "button", onClick: onIgnore, title: "Ignore this word", className: "flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200", children: _jsx(FaBan, {}) }), _jsx("button", { type: "button", onClick: onAddToDictionary, title: "Add to my dictionary (stored in this browser)", className: "flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200", children: _jsx(FaBook, {}) })] })] }), suggestions === null ? (_jsx("div", { className: "px-4 py-6 text-center text-sm italic text-slate-400", children: "Loading suggestions\u2026" })) : suggestions.length === 0 ? (_jsx("div", { className: "px-4 py-6 text-center text-sm italic text-slate-400", children: "No suggestions available" })) : (_jsx("ul", { className: "m-0 list-none p-0", children: suggestions.map((suggestion) => (_jsxs("li", { className: "flex items-center gap-1 border-b border-slate-100 last:border-b-0 dark:border-slate-700/50", children: [_jsx("button", { type: "button", onClick: () => onReplace(suggestion), className: "flex min-h-touch flex-1 items-center px-4 py-2 text-left text-lg font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700", children: suggestion }), _jsx("button", { type: "button", onClick: () => onStar(suggestion), title: "Star this word (stored in this browser)", className: "mr-2 flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-amber-500 dark:hover:bg-slate-700", children: _jsx(FaStar, {}) })] }, suggestion))) }))] }));
};
export default SuggestionPopup;
