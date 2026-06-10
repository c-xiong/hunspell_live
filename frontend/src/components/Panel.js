import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useIsMobile } from "../hooks/useIsMobile";
// Small floating panel below the header on desktop, bottom sheet on mobile.
const Panel = ({ title, onClose, children }) => {
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
    return (_jsxs("div", { ref: ref, "data-panel": true, className: isMobile
            ? "fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-popup dark:border-slate-700 dark:bg-slate-800"
            : "fixed right-4 top-16 z-50 max-h-[70vh] w-80 overflow-y-auto rounded-card border border-slate-200 bg-white p-4 shadow-popup dark:border-slate-700 dark:bg-slate-800", onClick: (e) => e.stopPropagation(), children: [isMobile && (_jsx("div", { className: "mx-auto mb-2 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" })), _jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("h3", { className: "m-0 text-base font-semibold text-slate-800 dark:text-slate-100", children: title }), _jsx("button", { type: "button", onClick: onClose, "aria-label": "Close", className: "flex min-h-touch min-w-touch items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200", children: _jsx(FaTimes, {}) })] }), children] }));
};
export default Panel;
