export default function CustomButton({ children, ...props }) {
    return (
      <button
        className="mx-auto block w-36 py-2.5 bg-[#B3090F] text-white rounded-xl font-semibold hover:scale-[1.03] transition dark:bg-red-800"
        {...props}
      >
        {children}
      </button>
    );
  }