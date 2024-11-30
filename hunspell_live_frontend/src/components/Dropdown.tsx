import React, { useRef, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { CSSProperties } from 'react';

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: Option[];
  value?: Option;
  onChange: (option: Option, event?: React.MouseEvent) => void;
  isDarkMode?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, isDarkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
    fontSize: '14px',
    padding: '8px 12px',
    height: '40px',
    lineHeight: '24px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1f2937' : 'white',
    color: isDarkMode ? '#e5e7eb' : 'inherit',
    '&:hover': {
      backgroundColor: isDarkMode ? '#374151' : '#f3f4f6'
    }
  } as CSSProperties;

  return (
    <div
      ref={dropdownRef}
      className="dropdown"
      style={{ padding: "8px 0", width: "240px", position: "relative" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="btn btn-light w-100 d-flex justify-content-between align-items-center"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: "40px",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "500",
          ...darkModeStyles.button,
        }}
      >
        <span>{displayValue.label}</span>
        <FaChevronDown
          style={{
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "none",
            fontSize: "18px",
            height: "30px",
          }}
        />
      </button>

      {isOpen && (
        <div
          className="dropdown-menu show w-100"
          style={{ 
            maxHeight: "300px", 
            overflow: "auto",
            ...darkModeStyles.dropdownMenu,
          }}
        >
          <div className="px-3 py-2">
            <input
              ref={searchInputRef}
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                fontSize: "18px",
                padding: "8px 12px",
                height: "40px",
                ...darkModeStyles.searchInput,
              }}
            />
          </div>
          {filteredOptions.map((option) => (
            <button
              key={option.value}
              className="dropdown-item"
              onClick={(e) => {
                onChange(option, e);
                setIsOpen(false);
                setSearchTerm("");
              }}
              style={style}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f8f9fa';
                e.currentTarget.style.color = isDarkMode ? '#ffffff' : 'inherit';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#1f2937' : 'white';
                e.currentTarget.style.color = isDarkMode ? '#e5e7eb' : 'inherit';
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
