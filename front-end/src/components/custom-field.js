import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

const RenderIcon = ({ Icon }) => Icon ? (
  <Icon
    size={30}
    className="absolute z-10 top-1/2 left-3 transform -translate-y-1/2 text-[#B3090F] dark:text-red-400"
  />
) : null;

RenderIcon.propTypes = {
  Icon: PropTypes.elementType,
};

const RenderPrefix = ({ prefix }) => prefix ? (
  <span className="absolute z-30 left-12 top-1/2 transform -translate-y-1/2 text-gray-500">{prefix}</span>
) : null;

RenderPrefix.propTypes = {
  prefix: PropTypes.string,
};

export default function CustomField({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  className,
  isInvalid,
  prefix,
  ...props
}) {
  const inputClassName = twMerge(
    "w-full border rounded-xl text-sm p-3 transition-colors focus:outline-none",
    isInvalid ? "border-2 border-red-500" : "border border-transparent",
    "bg-gray-100 dark:bg-white/5 backdrop-blur-md",
    type === 'date' && !value ? "text-gray-400 dark:text-gray-400" : "text-black dark:text-white",
    Icon && prefix ? "pl-16" : Icon ? "pl-12" : prefix ? "pl-8" : "pl-4",
    className
  );

  return (
    <div className="relative w-full">
      {Icon && (
        <Icon
          size={30}
          className="absolute z-20 top-1/2 left-3 transform -translate-y-1/2 text-[#B3090F] dark:text-red-400"
        />
      )}
      {type === 'select' ? (
        <>
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={twMerge(
              "text-sm w-full p-3 pl-12 rounded-xl transition-colors appearance-none focus:outline-none",
              isInvalid ? "border-2 border-red-500" : "border border-transparent",
              value ? "text-black" : "text-gray-400",
              "bg-gray-100 dark:bg-white/5 backdrop-blur-md",
              className
            )}
            {...props}
          >
            {props.children}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B3090F] dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </>
      ) : (
        <div className="relative w-full">
          <RenderIcon Icon={Icon} />
          <RenderPrefix prefix={prefix} />
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClassName}
            {...props}
          />
          {props.clearable && value && (
            <button
              type="button"
              onClick={props.onClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}

CustomField.propTypes = {
  icon: PropTypes.elementType,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  name: PropTypes.string,
  className: PropTypes.string,
  isInvalid: PropTypes.bool,
  children: PropTypes.node,
  clearable: PropTypes.bool,
  onClear: PropTypes.func,
  prefix: PropTypes.string,
};