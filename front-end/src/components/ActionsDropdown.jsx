import PropTypes from 'prop-types'
import { DotsThreeVerticalIcon } from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu'

export default function ActionsDropdown({ items }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="p-1">
          <DotsThreeVerticalIcon size={24} className="text-gray-700 dark:text-white" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end">
          {items.map(({ label, onClick, icon: Icon, disabled }, idx) => (
            <DropdownMenuItem
              key={idx}
              disabled={disabled}
              onSelect={() => !disabled && onClick()}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

ActionsDropdown.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      icon: PropTypes.elementType,
      disabled: PropTypes.bool
    })
  ).isRequired
}
