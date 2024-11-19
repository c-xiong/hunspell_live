import React from 'react';
import { Select } from 'antd';

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: Option;
  onChange: (option: Option, event?: React.MouseEvent) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange }) => {
  const handleChange = (selectedValue: string, option: any) => {
    const selectedOption = options.find(opt => opt.value === selectedValue);
    if (selectedOption) {
      onChange(selectedOption);
    }
  };

  return (
    <div 
      style={{ padding: '0 0 16px 0', width: '280px' }}
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        showSearch
        value={value.value}
        onChange={handleChange}
        placeholder="Select Language"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label as string).toLowerCase().includes(input.toLowerCase())
        }
        options={options.map(option => ({
          label: option.label,
          value: option.value,
        }))}
        style={{ width: '100%', height: '45px'}}
        dropdownStyle={{ zIndex: 1001 }}
        getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
      />
    </div>
  );
};

export default CustomDropdown;

