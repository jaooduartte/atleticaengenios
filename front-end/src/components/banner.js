import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function Banner({ message, description, type }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [hideClass, setHideClass] = useState('translate-y-[-100%] opacity-0');

  useEffect(() => {
    setTimeout(() => setHideClass('translate-y-0 opacity-100'), 10);

    const interval = setInterval(() => {
      setProgress((prev) => (prev > 0 ? prev - 2 : 0));
    }, 100);

    const timeout = setTimeout(() => {
      setHideClass('translate-y-[-100%] opacity-0');
    }, 4300);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  let bannerClass = 'border bg-background text-foreground';
  if (type === 'error') {
    bannerClass = 'border-red-900 bg-red-900 text-white';
  } else if (type === 'success') {
    bannerClass = 'border-green-900 bg-green-900 text-white';
  }

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 py-3 z-[999] px-4 pr-6 w-96 rounded-md ${bannerClass} shadow-lg transition-all duration-500 ease-in-out ${hideClass}`}
    >
      <div className="flex justify-center items-start text-center">
        <div>
          <p className="font-semibold">{message}</p>
          {description && <p className="text-xs mt-1 opacity-90">{description}</p>}
        </div>
      </div>
      <div className="absolute bottom-0.5 right-1 h-1 bg-white rounded-xl opacity-50" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} />
    </div>
  );
}

Banner.propTypes = {
  message: PropTypes.string.isRequired,
  description: PropTypes.string,
  type: PropTypes.string
};
