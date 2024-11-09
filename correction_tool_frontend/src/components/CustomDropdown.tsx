import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from './Icons';

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: Option;
  onChange: (option: Option) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={dropdownRef}
      className="custom-dropdown"
      style={{ 
        position: 'relative',
        width: '100%',
        padding: '0 0 16px 0'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '140px',
          padding: '8px 12px',
          height: '40px',
          backgroundColor: 'white',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: '500',
          transition: 'border-color 0.2s',
          ':hover': {
            borderColor: '#cbd5e1',
          }
        }}
      >
        {value ? value.label : "English"}
        <ChevronDown />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          zIndex: 10,
          width: '200px',
          marginTop: '4px',
          backgroundColor: 'white',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{
            padding: '8px',
            borderBottom: '2px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            height: '40px',
          }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'white',
                color: '#1e293b',
                padding: '6px 8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                height: '28px',
                fontSize: '16px'
              }}
            />
          </div>
          <ul style={{ 
            maxHeight: '300px',
            overflowY: 'auto',
            margin: 0,
            padding: '4px 0',
            listStyle: 'none'
          }}>
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '18px',
                  color: '#1e293b',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.paddingLeft = '20px';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.paddingLeft = '14px';
                  e.currentTarget.style.color = '#1e293b';
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;

