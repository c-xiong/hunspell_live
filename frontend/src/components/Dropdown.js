import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
import { FaChevronDown, FaUpload } from "react-icons/fa";
const Dropdown = ({ options, value, onChange, onUploadClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);
    const displayValue = value || options[0] || { label: "Select…", value: "" };
    return (_jsxs("div", { ref: dropdownRef, className: "dropdown relative w-full sm:w-64", onClick: (e) => e.stopPropagation(), children: [_jsxs("button", { type: "button", onClick: () => setIsOpen(!isOpen), className: "flex min-h-touch w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-medium text-slate-800 transition-colors hover:border-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100", "aria-haspopup": "listbox", "aria-expanded": isOpen, children: [_jsx("span", { className: "truncate", children: displayValue.label }), _jsx(FaChevronDown, { className: `shrink-0 text-sm text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}` })] }), isOpen && (_jsxs("div", { className: "absolute z-40 mt-1 flex max-h-80 w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-popup dark:border-slate-700 dark:bg-slate-800", children: [_jsx("div", { className: "p-2", children: _jsx("input", { ref: searchInputRef, type: "text", placeholder: "Search languages\u2026", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 outline-none focus:border-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100" }) }), _jsxs("ul", { role: "listbox", className: "m-0 flex-1 list-none overflow-y-auto p-0", children: [filteredOptions.length === 0 && (_jsx("li", { className: "px-4 py-3 text-sm italic text-slate-400", children: "No languages match" })), filteredOptions.map((option) => (_jsx("li", { children: _jsx("button", { type: "button", role: "option", "aria-selected": option.value === displayValue.value, onClick: (e) => {
                                        onChange(option, e);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }, className: `flex min-h-touch w-full items-center px-4 py-2 text-left text-base transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${option.value === displayValue.value
                                        ? "font-semibold text-primary-600 dark:text-primary-400"
                                        : "text-slate-700 dark:text-slate-200"}`, children: option.label }) }, option.value)))] }), onUploadClick && (_jsxs("button", { type: "button", onClick: () => {
                            setIsOpen(false);
                            setSearchTerm("");
                            onUploadClick();
                        }, className: "flex min-h-touch w-full items-center gap-2 border-t border-slate-200 px-4 py-3 text-left text-base font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-slate-700 dark:text-primary-400 dark:hover:bg-slate-700", children: [_jsx(FaUpload, { className: "text-sm" }), "Upload my dictionary\u2026"] }))] }))] }));
};
export default Dropdown;
