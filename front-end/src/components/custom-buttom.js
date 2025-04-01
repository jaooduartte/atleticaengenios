export default function CustomButton({ children, ...props }) {
    return (
      <button
        className="mx-auto block w-36 py-2.5 bg-[#B3090F] text-white rounded-xl font-semibold hover:scale-[1.03] hover:bg-[#d01018] transition dark:bg-red-800 text-sm"
        {...props}
      >
        {children}
      </button>
    );
  }