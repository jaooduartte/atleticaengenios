import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { Eye, EyeSlash, UserCircle, Lock, Envelope, GenderIntersex, Cake, Student, Desktop, Moon, Sun } from 'phosphor-react';
import Image from 'next/image';
import Banner from '../components/banner';
import Link from 'next/link';
import CustomField from '../components/custom-field'
import CustomButton from '../components/custom-buttom'
import CustomDropdown from '../components/custom-dropdown';
import PasswordRequirements from '../components/password-requirements';
import Head from 'next/head';

const renderTogglePasswordButton = (show, setShow) => (
  <button
    type="button"
    onClick={() => setShow(!show)}
    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
  >
    {show ? <Eye size={20} /> : <EyeSlash size={20} />}
  </button>
);

const capitalizeName = (name) => {
  return name
    .split(' ')
    .map((word) => {
      if (word.length > 2) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      } else {
        return word.toLowerCase();
      }
    })
    .join(' ');
};

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [, setThemeIcon] = useState('system');

  const [isSexInvalid, setIsSexInvalid] = useState(false);

  useEffect(() => {
    setThemeIcon(theme);
  }, [theme]);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [sex, setSex] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegisteringLoading, setIsRegisteringLoading] = useState(false);
  const router = useRouter();

  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [isNameInvalid, setIsNameInvalid] = useState(false);
  const [isEmailInvalid, setIsEmailInvalid] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [isCourseInvalid, setIsCourseInvalid] = useState(false);
  const [isBirthdayInvalid, setIsBirthdayInvalid] = useState(false);
  const [isEmailTaken, setIsEmailTaken] = useState(false);
  const showBannerMessage = (message, type, description = '') => {
    setBannerMessage(message);
    setBannerDescription(description);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 4500);
  };

  useEffect(() => {
    setMounted(true);
    if (router.query.confirmed === 'true') {
      showBannerMessage('E-mail confirmado!', 'success', 'Você já pode fazer login normalmente.');
      router.replace('/login', undefined, { shallow: true });
    }
  }, [router]);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });


    const data = await response.json();

    if (!response.ok) {
      if (data?.type === 'inactive_user') {
        showBannerMessage('Acesso negado', 'error', 'Sua conta está inativa. Entre em contato com a diretoria.');
      } else {
        showBannerMessage(data.error || 'Erro ao fazer login', 'error', data.description || '');
      }
      setIsLoggingIn(false);
      return;
    }

    localStorage.setItem('token', data.token);
    const payload = JSON.parse(atob(data.token.split('.')[1]));
    localStorage.setItem('token_exp', payload.exp);

    router.push('/home');
    setIsLoggingIn(false);
  };

  const validateRegisterFields = () => {
    let isValid = true;

    if (!name) {
      setIsNameInvalid(true);
      isValid = false;
    }
    if (!email) {
      setIsEmailInvalid(true);
      isValid = false;
    }
    if (!password || password.length < 6) {
      setIsPasswordInvalid(true);
      isValid = false;
    }
    if (!course) {
      setIsCourseInvalid(true);
      isValid = false;
    }
    if (!sex) {
      setIsSexInvalid(true);
      isValid = false;
    }
    if (!birthday) {
      setIsBirthdayInvalid(true);
      isValid = false;
    }
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterFields()) {
      return;
    }
    const checkEmail = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const emailCheck = await checkEmail.json();
    if (emailCheck.exists) {
      setIsEmailTaken(true);
      showBannerMessage('E-mail já cadastrado', 'error', 'Tente recuperar a senha ou use outro e-mail.');
      return;
    } else {
      setIsEmailTaken(false);
    }

    setIsRegisteringLoading(true);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name,
        course,
        sex,
        birthday,
      }),
    });

    const data = await response.json();

    if (data.error?.message?.includes('you can only request this after')) {
      showBannerMessage(
        'Aguarde 30 segundos antes de tentar novamente',
        'error',
        'Por segurança, o banco de dados limita a criação de contas seguidas.'
      );
    }

    if (!response.ok) {
      showBannerMessage(data.error || 'Erro ao cadastrar usuário.', 'error', '');
    } else {
      showBannerMessage('Cadastro realizado com sucesso!', 'success', 'Verifique seu e-mail para confirmar.');
      setIsRegistering(false);
    }

    setIsRegisteringLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login | Atlética Engênios</title>
      </Head>
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
        <div
          className={`w-full max-w-2xl p-6 bg-white dark:bg-[#0e1117]  rounded-xl shadow-xl relative z-10 transition-all duration-500 ease-in-out ${isRegistering ? 'min-h-[640px]' : 'min-h-[500px]'
            }`}
        >
          <div className="flex justify-center mb-8">
            <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={150} height={150} />
          </div>

          {showBanner && <Banner message={bannerMessage} description={bannerDescription} type={bannerType} />}

          <div className={`relative flex flex-col justify-center transition-all duration-500 ease-in-out ${isRegistering ? 'min-h-[360px]' : 'min-h-[260px]'}`}>
            <div className={`absolute w-full top-0 left-0 transition-opacity duration-500 ease-in-out ${isRegistering ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-sm">
                    <CustomField
                      icon={UserCircle}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setIsEmailInvalid(false);
                      }}
                      placeholder="Digite seu e-mail"
                      name="emailLogin"
                      isInvalid={isEmailInvalid}
                    />
                  </div>
                </div>
                <div className="w-full flex justify-center">
                  <div className="relative w-full max-w-sm">
                    <CustomField
                      icon={Lock}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setIsPasswordInvalid(false);
                      }}
                      placeholder="Digite sua senha"
                      name="passwordLogin"
                      className="pr-10"
                      isInvalid={isPasswordInvalid}
                    />
                    {renderTogglePasswordButton(showPassword, setShowPassword)}
                  </div>
                </div>
                <div className="text-center mt-2">
                  <Link href="/forgot-password" className="text-sm text-[#B3090F] dark:text-red-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3090F] rounded">
                    Esqueceu sua senha?
                  </Link>
                </div>
                <div className="flex justify-center">
                  <CustomButton
                    type="submit"
                    className={`bg-red-800 ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#B3090F]'}`}
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? 'Entrando...' : 'ENTRAR'}
                  </CustomButton>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    Não é um usuário?{' '}
                    <button type="button" onClick={() => setIsRegistering(true)} className="text-[#B3090F] dark:text-red-400 hover:underline">
                      Cadastre-se!
                    </button>
                  </p>
                </div>
              </form>
            </div>

            <div className={`absolute w-full top-0 left-0 transition-opacity duration-500 ease-in-out ${isRegistering ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <form className="grid grid-cols-2 gap-4 " onSubmit={handleRegister}>
                <div className='col-span-2'>
                  <CustomField
                    icon={UserCircle}
                    name="name"
                    placeholder="Digite seu nome"
                    value={name}
                    onChange={(e) => {
                      setName(capitalizeName(e.target.value));
                      setIsNameInvalid(false);
                    }}
                    isInvalid={isNameInvalid}
                  />
                </div>
                <CustomField
                  icon={Envelope}
                  type="email"
                  value={email}
                  onChange={async (e) => {
                    const inputEmail = e.target.value;
                    setEmail(inputEmail);
                    setIsEmailInvalid(false);

                    if (inputEmail.length > 5 && inputEmail.includes('@')) {
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-email`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: inputEmail }),
                        });
                        const result = await res.json();
                        setIsEmailTaken(result.exists);
                      } catch (error) {
                        console.error('Erro ao verificar e-mail:', error);
                      }
                    } else {
                      setIsEmailTaken(false);
                    }
                  }}
                  placeholder="Digite seu e-mail"
                  name="email"
                  isInvalid={isEmailInvalid}
                />
                <div className="col-span-2 sm:col-span-1">
                  <CustomDropdown
                    icon={Student}
                    value={course}
                    onChange={(value) => {
                      setCourse(value);
                      setIsCourseInvalid(false);
                    }}
                    options={[
                      'Engenharia de Software',
                      'Engenharia Civil',
                      'Engenharia de Produção',
                      'Engenharia Elétrica',
                      'Engenharia Mecânica',
                      'Arquitetura'
                    ]}
                    placeholder="Selecione o curso"
                    isInvalid={isCourseInvalid}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <CustomDropdown
                    icon={GenderIntersex}
                    value={sex}
                    onChange={(value) => {
                      setSex(value);
                      setIsSexInvalid(false);
                    }}
                    options={['Masculino', 'Feminino', 'Outro']}
                    placeholder="Selecione o sexo"
                    isInvalid={isSexInvalid}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <CustomField
                    icon={Cake}
                    type="date"
                    value={birthday}
                    onChange={(e) => {
                      setBirthday(e.target.value);
                      setIsBirthdayInvalid(false);
                    }}
                    name="birthday"
                    isInvalid={isBirthdayInvalid}
                    className={!birthday ? 'text-gray-400' : 'text-black'}
                  />
                </div>
                <div className='col-span-2'>
                  <div className="relative w-full">
                    <CustomField
                      icon={Lock}
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setIsPasswordInvalid(false);
                      }}
                      placeholder="Digite sua senha"
                      name="password"
                      className="pr-10"
                      isInvalid={isPasswordInvalid}
                    />
                    {renderTogglePasswordButton(showRegisterPassword, setShowRegisterPassword)}
                  </div>
                  <PasswordRequirements className='justify-center' password={password} isEmailTaken={isEmailTaken} />
                </div>
                <div className="col-span-2 flex justify-center">
                  <CustomButton
                    type="submit"
                    className={`bg-red-800 ${isRegisteringLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#B3090F]'}`}
                    disabled={isRegisteringLoading}
                  >
                    {isRegisteringLoading ? 'Cadastrando...' : 'CADASTRAR'}
                  </CustomButton>
                </div>
                <p className="col-span-2 text-center text-sm text-gray-700 dark:text-gray-400">
                  Já tem um cadastro?{' '}
                  <button type="button" onClick={() => setIsRegistering(false)} className="col-span-2 text-center text-sm text-[#B3090F] dark:text-red-400 hover:underline">
                    Faça login!
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}