import { useState, useRef, useEffect } from 'react';
import { CaretDown } from 'phosphor-react';
import PropTypes from 'prop-types';

export default function CustomDropdown({ icon: Icon, options, value, onChange, placeholder = 'Selecione', isInvalid, onFilterApplied }) {
  const [isOpen, setIsOpen] = useState(false);
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
    const selected = typeof option === 'object' ? option : { label: option, value: option };
    onChange(selected.value);
    setIsOpen(false);
    if (onFilterApplied) onFilterApplied(selected);
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
          {options.find(opt => (opt.value || opt) === value)?.label || placeholder}
        </span>
        <CaretDown className="absolute dark:text-white right-3 top-1/2 transform -translate-y-1/2" size={16} />
      </button>
      {isOpen && (
        <ul className="absolute z-50 mt-1 w-full bg-white/30 dark:bg-white/5 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-xl shadow-md max-h-60 overflow-auto text-sm text-black dark:text-white">
          {Array.isArray(options) && options.map((option) => {
            const label = option.label || option;
            const value = option.value || option;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full text-left px-4 py-2 hover:bg-red-800 hover:text-white dark:hover:bg-[#0e1117] cursor-pointer whitespace-nowrap"
              >
                {label}
              </button>
            );
          })}
        </ul>
      )}
    </div>
  );
}

CustomDropdown.propTypes = {
  icon: PropTypes.elementType,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }),
    ])
  ).isRequired, options: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isInvalid: PropTypes.bool,
  onFilterApplied: PropTypes.func,
};