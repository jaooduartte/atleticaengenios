import { useState, useRef, useEffect } from 'react';
import { CaretDown } from 'phosphor-react';

export default function CustomDropdown({ icon: Icon, options, value, onChange, placeholder = 'Selecione', isInvalid, onFilterApplied }) {
  const [isOpen, setIsOpen] = useState(false);
  const [iconChanged, setIconChanged] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setIconChanged(true);
    if (onFilterApplied) onFilterApplied(option);
  };

  return (
    <div className="relative w-full" ref={ref}>
      {Icon && (
        <Icon size={30} className="absolute top-1/2 left-3 transform -translate-y-1/2 dark:text-red-400 text-[#B3090F]" />
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 ${Icon ? 'pl-12' : 'pl-4'} pr-10 bg-gray-100 dark:bg-white/5 text-left rounded-xl transition-colors focus:outline-none ${isInvalid ? 'border-2 border-red-500' : 'border border-transparent'}`}
      >
        <span className={`block truncate whitespace-nowrap !text-sm ${value ? 'text-black dark:text-white' : 'text-gray-400'}`}>
          {value || placeholder}
        </span>
        {iconChanged ? <CaretDown className="absolute dark:text-white right-3 top-1/2 transform -translate-y-1/2" size={16} /> : <CaretDown className="absolute dark:text-white right-3 top-1/2 transform -translate-y-1/2" size={16} />}
      </button>
      {isOpen && (
        <ul className="absolute z-50 mt-1 w-full bg-white/30 dark:bg-white/5 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-xl shadow-md max-h-60 overflow-auto text-sm text-black dark:text-white">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => handleSelect(option)}
              className="px-4 py-2 hover:bg-red-800 hover:text-white dark:hover:bg-[#0e1117] cursor-pointer whitespace-nowrap"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}