import React, { useRef, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: Option[];
  value: Option;
  onChange: (option: Option, event?: React.MouseEvent) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange }) => {
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

  return (
    <div
      ref={dropdownRef}
      className="dropdown"
      style={{ padding: "0 0 16px 0", width: "280px", position: "relative" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="btn btn-light w-100 d-flex justify-content-between align-items-center"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: "40px",
          border: "2px solid #374151",
          borderRadius: "8px",
          backgroundColor: "white",
          fontSize: "18px",
          fontWeight: "500",
        }}
      >
        <span>{value.label}</span>
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
          style={{ maxHeight: "300px", overflow: "auto" }}
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
                height: "40px"
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
              style={{ 
                fontSize: "18px",
                padding: "12px 16px",
                height: "48px",
                lineHeight: "24px",
                display: "flex",
                alignItems: "center"
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
