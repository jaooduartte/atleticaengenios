import clsx from 'clsx';
import PropTypes from 'prop-types';

export default function CustomButton({ children, className, ...props }) {
  return (
    <button
      className={clsx(
        'mx-auto block w-36 py-2.5 text-white rounded-xl font-semibold hover:scale-[1.03] transition text-sm',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};
