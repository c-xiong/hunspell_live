import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
const Dropdown = ({ options, value, onChange, isDarkMode = false }) => {
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
    const darkModeStyles = {
        button: {
            backgroundColor: isDarkMode ? '#1f2937' : 'white',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#374151'}`,
            color: isDarkMode ? '#e5e7eb' : 'inherit',
        },
        dropdownMenu: {
            backgroundColor: isDarkMode ? '#1f2937' : 'white',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#dee2e6'}`,
        },
        searchInput: {
            backgroundColor: isDarkMode ? '#374151' : 'white',
            color: isDarkMode ? '#e5e7eb' : 'inherit',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#ced4da'}`,
            '::placeholder': {
                color: isDarkMode ? '#f4f5f8' : '#6c757d',
            },
        },
        dropdownItem: {
            color: isDarkMode ? '#e5e7eb' : 'inherit',
            backgroundColor: isDarkMode ? '#1f2937' : 'white',
            '&:hover': {
                backgroundColor: isDarkMode ? '#374151' : '#f8f9fa',
            },
        },
    };
    const displayValue = value || options[0] || { label: "Select...", value: "" };
    const style = {
        fontSize: '18px',
        padding: '10px 12px',
        height: '45px',
        lineHeight: '24px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#1f2937' : 'white',
        color: isDarkMode ? '#e5e7eb' : 'inherit',
    };
    return (_jsxs("div", Object.assign({ ref: dropdownRef, className: "dropdown", style: { padding: "8px 0", width: "240px", position: "relative" }, onClick: (e) => e.stopPropagation() }, { children: [_jsxs("button", Object.assign({ className: "btn btn-light w-100 d-flex justify-content-between align-items-center", type: "button", onClick: () => setIsOpen(!isOpen), style: Object.assign({ height: "40px", borderRadius: "8px", fontSize: "18px", fontWeight: "500" }, darkModeStyles.button) }, { children: [_jsx("span", { children: displayValue.label }), _jsx(FaChevronDown, { style: {
                            transition: "transform 0.2s",
                            transform: isOpen ? "rotate(180deg)" : "none",
                            fontSize: "18px",
                            height: "30px",
                        } })] })), isOpen && (_jsxs("div", Object.assign({ className: "dropdown-menu show w-100", style: Object.assign({ maxHeight: "300px", overflow: "auto" }, darkModeStyles.dropdownMenu) }, { children: [_jsx("div", Object.assign({ className: "px-3 py-2" }, { children: _jsx("input", { ref: searchInputRef, type: "text", className: "form-control", placeholder: "Search...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), style: Object.assign({ fontSize: "18px", padding: "2px 8px", height: "40px" }, darkModeStyles.searchInput) }) })), filteredOptions.map((option) => (_jsx("button", Object.assign({ className: "dropdown-item", onClick: (e) => {
                            onChange(option, e);
                            setIsOpen(false);
                            setSearchTerm("");
                        }, style: {
                            fontSize: "18px",
                            padding: "12px 16px",
                            height: "48px",
                            lineHeight: "24px",
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: isDarkMode ? '#1f2937' : 'white',
                            color: isDarkMode ? '#e5e7eb' : 'inherit',
                        }, onMouseOver: (e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f8f9fa';
                            e.currentTarget.style.color = isDarkMode ? '#ffffff' : 'inherit';
                        }, onMouseOut: (e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : 'white';
                            e.currentTarget.style.color = isDarkMode ? '#e5e7eb' : 'inherit';
                        } }, { children: option.label }), option.value)))] })))] })));
};
export default Dropdown;
