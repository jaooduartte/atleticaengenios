import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Banner from '../components/banner';
import Link from 'next/link';
import { Lock, Eye, EyeSlash, Desktop, Moon, Sun } from 'phosphor-react';
import CustomField from '../components/custom-field'
import CustomButton from '../components/custom-buttom'
import { useTheme } from 'next-themes';

export default function ResetPassword() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [themeIcon, setThemeIcon] = useState('system');
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNewPasswordInvalid, setIsNewPasswordInvalid] = useState(false);
  const [isConfirmPasswordInvalid, setIsConfirmPasswordInvalid] = useState(false);

  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [bannerType, setBannerType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (router.query.token) {
      setToken(router.query.token);
    }
  }, [router]);

  useEffect(() => {
    setThemeIcon(theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  if (!mounted) return null;

  const showBannerMessage = (message, type, description = '') => {
    setBannerMessage(message);
    setBannerDescription(description);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 4500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    if (!newPassword) {
      setIsNewPasswordInvalid(true);
      hasError = true;
    } else {
      setIsNewPasswordInvalid(false);
    }

    if (!confirmPassword) {
      setIsConfirmPasswordInvalid(true);
      hasError = true;
    } else {
      setIsConfirmPasswordInvalid(false);
    }

    if (hasError) return;

    if (newPassword !== confirmPassword) {
      showBannerMessage('As senhas não coincidem!', 'error', 'Digite novamente os campos corretamente.');
      return;
    }

    setIsLoading(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: token, newPassword }),
    });

    const data = await response.json();
    setIsLoading(false);

    if (response.ok) {
      showBannerMessage(data.message, 'success', 'Você será redirecionado ao login em instantes.');
      setTimeout(() => {
        router.push('/login');
      }, 4500);
    } else {
      showBannerMessage(data.error || 'Erro ao redefinir senha.', 'error', '');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen relative">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-50 backdrop-blur-3xl bg-white/20 dark:bg-[#0e1117]/70 p-2 rounded-full shadow hover:scale-105 transition-transform"
        title="Alternar tema"
      >
        {theme === 'system' && <Desktop size={20} className="text-gray-700 dark:text-gray-300" />}
        {theme === 'light' && <Sun size={20} className="text-yellow-500" />}
        {theme === 'dark' && <Moon size={20} className="text-blue-300" />}
      </button>

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

      <div className="w-full max-w-2xl p-6 bg-white dark:bg-[#0e1117] rounded-xl shadow-xl relative z-10">
        <div className="flex justify-center mb-8">
          <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={150} height={150} />
        </div>
        <h2 className="text-center text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Redefinir sua senha</h2>

        {showBanner && <Banner message={bannerMessage} description={bannerDescription} type={bannerType} />}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-sm">
              <CustomField
                icon={Lock}
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                name="newPassword"
                className="pr-10"
                isInvalid={isNewPasswordInvalid}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
              >
                {showNewPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-sm">
              <CustomField
                icon={Lock}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                name="confirmPassword"
                className="pr-10"
                isInvalid={isConfirmPasswordInvalid}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <CustomButton type="submit" className={'bg-red-800 hover:bg-[#B3090F]'}>
              Redefinir senha
            </CustomButton>
          </div>

          <div className="text-center">
            <Link href="/login" legacyBehavior>
              <a className="text-sm text-[#B3090F] dark:text-red-400 hover:underline">Voltar ao login</a>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}