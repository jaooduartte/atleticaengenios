import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { Envelope, Desktop, Sun, Moon } from 'phosphor-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Banner from '../components/banner';
import Image from 'next/image';
import Link from 'next/link';
import CustomField from '../components/custom-field';
import CustomButton from '../components/custom-buttom';
import Head from 'next/head';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme, setTheme } = useTheme();

  const renderBackgroundImage = () => (
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
  );

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const renderThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="absolute top-4 right-4 z-50 backdrop-blur-3xl bg-white/20 dark:bg-[#0e1117]/70 p-2 rounded-full shadow hover:scale-105 transition-transform"
      title="Alternar tema"
    >
      {theme === 'system' && <Desktop size={20} className="text-gray-700 dark:text-gray-300" />}
      {theme === 'light' && <Sun size={20} className="text-yellow-500" />}
      {theme === 'dark' && <Moon size={20} className="text-blue-300" />}
    </button>
  );

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setBannerMessage('Erro ao enviar e-mail.');
      setBannerDescription('Verifique se o email foi digitado corretamente');
      setBannerType('error');
      setIsSending(false);
    } else {
      setBannerMessage('Link enviado!');
      setBannerDescription('Verifique seu e-mail para redefinir a senha.');
      setBannerType('success');
      setTimeout(() => {
        router.push('/login');
        setIsSending(false);
      }, 4500);
    }
    setShowBanner(true);
  };

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Redefinir Senha | Atlética Engênios</title>
      </Head>
      <div className="flex justify-center items-center h-screen relative">
        {renderThemeToggle()}

        {renderBackgroundImage()}
        {showBanner && <Banner message={bannerMessage} description={bannerDescription} type={bannerType} />}

        <div className="w-full max-w-md p-6 rounded-xl shadow-xl relative z-10 bg-white dark:bg-[#0e1117] transition-all backdrop-blur-xl">
          <div className="flex justify-center mb-8">
            <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={150} height={150} />
          </div>

          <h2 className="text-center text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Redefinir senha
          </h2>


          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-sm">
                <CustomField
                  icon={Envelope}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  name="email"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <CustomButton
                type="submit"
                className={`bg-red-800 ${isSending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#B3090F]'}`}
                disabled={isSending}
              >
                {isSending ? 'Enviando...' : 'ENVIAR LINK'}
              </CustomButton>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-[#B3090F] dark:text-red-400 hover:underline"
              >
                Voltar ao login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}