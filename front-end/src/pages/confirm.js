import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { CheckCircle } from 'phosphor-react';

export default function Confirm() {
  const router = useRouter();
  const [, setRedirecting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRedirecting(true);
      router.push({
        pathname: '/login',
        query: { confirmed: 'true' }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen relative">
      <div className="absolute inset-0 z-0">
        <Image
          src="/photos-login/1.png"
          alt="Plano de fundo"
          layout="fill"
          objectFit="cover"
          className="brightness-[.20]"
          priority
        />
      </div>
      <div className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl relative z-10 text-center transition-all duration-500 ease-in-out">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle size={64} className="text-green-600 dark:text-green-400" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            E-mail confirmado com sucesso!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Você será redirecionado em instantes para a tela de login.
          </p>
        </div>
      </div>
    </div>
  );
}