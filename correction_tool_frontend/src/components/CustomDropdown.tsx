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
      style={{ position: 'relative', width: '100%',padding:'20px 0px' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '20%',
          padding: '2%',
          height:'45px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        {value ? value.label : "English"}
        <ChevronDown />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          zIndex: 10,
          width: '20%',
          marginTop: '4px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}>
          <div style={{
            padding: '0 8px',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            height: '45px',
          }}>
            <input
              type="text"
              placeholder=" Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'white',
                color: 'black',
                padding: '2%',
                border: 'none',
                borderRadius: '2px',
                height: '70%',
              }}
            />
          </div>
          <ul style={{ maxHeight: '300px', overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '4px 12px',
                  cursor: 'pointer',
                  height: '45px',
                  display:'flex',
                  alignItems:'center',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.cursor = '';
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

