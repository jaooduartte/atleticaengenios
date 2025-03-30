import { useState, useEffect } from 'react';

export default function Banner({ message, type }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        setShow(false); // Esconde o banner após 5 segundos
      }, 5000);
    }
  }, [show]);

  // Defina a classe com base no tipo de mensagem (erro, sucesso, etc.)
  const bannerClass = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-yellow-500';

  return (
    show && (
      <div
        className={`fixed top-0 right-0 m-4 p-4 w-96 h-16 rounded-lg ${bannerClass} text-white shadow-lg transition-transform transform-gpu`}
        style={{ transform: show ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.5s ease-out' }}
      >
        <div className="flex justify-between items-center">
          <span>{message}</span>
        </div>
      </div>
    )
  );
}