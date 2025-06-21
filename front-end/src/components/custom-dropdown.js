import PropTypes from 'prop-types'
import { CaretDown } from 'phosphor-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'

export default function CustomDropdown({ icon: Icon, options, value, onChange, placeholder = 'Selecione', isInvalid, onFilterApplied }) {
  const selectedOption = options.find(opt => (opt.value || opt) === value)
  const selectedLabel = selectedOption
    ? typeof selectedOption === 'object'
      ? selectedOption.label
      : selectedOption
    : placeholder

  const handleSelect = (option) => {
    const { value: val } = typeof option === 'object' ? option : { value: option }
    onChange(val)
    if (onFilterApplied) onFilterApplied(option)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`relative w-full p-3 ${Icon ? 'pl-12' : 'pl-4'} pr-10 bg-gray-100 dark:bg-white/5 text-left rounded-xl transition-colors focus:outline-none ${isInvalid ? 'border-2 border-red-500' : 'border border-transparent'}`}
        >
          {Icon && (
            <Icon size={30} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#B3090F] dark:text-red-400" />
          )}
          <span className={`block truncate whitespace-nowrap !text-sm ${value ? 'text-black dark:text-white' : 'text-gray-400'}`}>{selectedLabel}</span>
          <CaretDown className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-white" size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        {Array.isArray(options) && options.map(option => {
          const label = option.label || option
          const val = option.value || option
          return (
            <DropdownMenuItem key={val} onSelect={() => handleSelect(option)}>
              {label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isInvalid: PropTypes.bool,
  onFilterApplied: PropTypes.func,
}
