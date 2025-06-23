'use client'

import * as React from 'react'
import PropTypes from 'prop-types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import clsx from 'clsx'

import { Calendar } from './ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover'

export default function CustomCalendar({
  value,
  onChange,
  disabled,
  placeholder = 'Selecione a data',
  label,
  name,
  className,
  isInvalid,
  ...props
}) {
  const [open, setOpen] = React.useState(false)
  const date = value ? parseISO(value) : undefined

  const handleSelect = (selected) => {
    setOpen(false)
    if (onChange) {
      onChange(selected ? selected.toISOString().split('T')[0] : '')
    }
  }

  return (
    <div className={clsx('w-full', className)} {...props}>
      {label && (
        <label htmlFor={name} className="block mb-2 font-semibold pl-2 dark:text-white/70">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={name}
            disabled={disabled}
            className={clsx(
              'w-full p-3 pr-10 rounded-xl text-sm text-left backdrop-blur-md flex justify-between items-center',
              isInvalid ? 'border-2 border-red-500' : 'border border-transparent',
              'bg-gray-100 dark:bg-white/5',
              date ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-400',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
            <CalendarIcon className="absolute right-3 h-4 w-4 text-black dark:text-white" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            locale={ptBR}
            captionLayout="dropdown"
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

CustomCalendar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  isInvalid: PropTypes.bool,
}