import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 cursor-pointer hover:border-blue-400 transition-all shadow-sm ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''} ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!selectedOption && !placeholder ? 'text-slate-400' : 'truncate pr-2'}>
          {selectedOption ? selectedOption.label : placeholder || 'Select...'}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option, idx) => (
            <div
              key={idx}
              className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-blue-50 hover:text-blue-700 transition-colors mx-1.5 rounded-lg ${value === option.value ? 'text-blue-700 bg-blue-50 font-bold' : 'text-slate-600 font-medium'}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span className="truncate pr-2">{option.label}</span>
              {value === option.value && <Check size={16} className="shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
