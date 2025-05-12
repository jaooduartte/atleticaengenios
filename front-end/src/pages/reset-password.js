import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Banner from '../components/banner';
import Link from 'next/link';
import { Lock, Eye, EyeSlash, Desktop, Moon, Sun, WarningCircle } from 'phosphor-react';
import CustomField from '../components/custom-field'
import CustomButton from '../components/custom-buttom'
import { useTheme } from 'next-themes';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ResetPassword() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [themeIcon, setThemeIcon] = useState('system');
  const router = useRouter();
  const [linkInvalido, setLinkInvalido] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    const supabase = createClientComponentClient();
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorCode = urlParams.get('error_code');

    if (error === 'access_denied' && errorCode === 'otp_expired') {
      console.warn('Link de redefinição expirado ou já utilizado.');
      setLinkInvalido(true);
      return;
    }

    if (code) {
      console.log('Iniciando troca do código por sessão...');
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          console.error('Erro ao trocar o código por sessão:', error.message);
        } else {
          console.log('Sessão iniciada com sucesso:', data);
        }
      });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    const supabase = createClientComponentClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setIsLoading(false);

    if (error) {
      showBannerMessage(error.message || 'Erro ao redefinir senha.', 'error');
    } else {
      showBannerMessage('Senha redefinida com sucesso!', 'success', 'Você será redirecionado ao login em instantes.');
      setTimeout(() => {
        router.push('/login');
      }, 4500);
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
        {linkInvalido ? (
          <div className="flex flex-col items-center justify-center text-red-600 dark:text-red-400 font-medium text-center space-y-4">
            <div className="text-5xl">
            <WarningCircle size={64} />
            </div>
            <div className="text-lg max-w-sm">
              Este link de redefinição de senha é inválido ou já foi utilizado. Solicite uma nova redefinição de senha para continuar.
            </div>
            <Link href="/login" legacyBehavior>
              <a className="underline text-sm text-red-700 dark:text-red-300">Voltar ao login</a>
            </Link>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}