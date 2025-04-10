import clsx from 'clsx';

export default function CustomButton({ children, className, ...props }) {
  return (
    <button
      className={clsx(
        'mx-auto block w-36 py-2.5 text-white rounded-xl font-semibold hover:scale-[1.03] transition text-sm',
        className // sobrescreve apenas o que for passado
      )}
      {...props}
    >
      {children}
    </button>
  );
}