import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Banner from '../components/banner';
import Link from 'next/link';
import { Eye, EyeSlash, UserCircle, Lock, Envelope, GenderIntersex, Cake, Student, Gear, Moon, Sun } from 'phosphor-react';
import CustomField from '../components/custom-field'
import CustomButton from '../components/custom-buttom'
import CustomDropdown from '../components/custom-dropdown';
import { useTheme } from 'next-themes';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient();

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [themeIcon, setThemeIcon] = useState('system');
  
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
  const router = useRouter();

  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [isNameInvalid, setIsNameInvalid] = useState(false);
  const [isEmailInvalid, setIsEmailInvalid] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [isCourseInvalid, setIsCourseInvalid] = useState(false);
  const [isBirthdayInvalid, setIsBirthdayInvalid] = useState(false);

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
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error?.message === 'Email not confirmed') {
      showBannerMessage(
        "E-mail não confirmado!",
        "error",
        "Verifique sua caixa de entrada para confirmar seu e-mail antes de entrar."
      );
      setIsLoading(false);
      return;
    }

    if (error) {
      showBannerMessage("Usuário ou senha incorretos!", "error", "Verifique suas credenciais de acesso e tente novamente");
      setIsLoading(false);
      return;
    }

    router.push('/home');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
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
  
    if (!response.ok) {
      showBannerMessage(data.error || 'Erro ao cadastrar usuário.', 'error', '');
    } else {
      showBannerMessage('Cadastro realizado com sucesso!', 'success', 'Verifique seu e-mail para confirmar.');
      setIsRegistering(false);
    }
  
    setIsLoading(false);
  };

  const showBannerMessage = (message, type, description = '') => {
    setBannerMessage(message);
    setBannerDescription(description);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 4500);
  };

  return (
    <div className="flex justify-center items-center h-screen relative">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-full shadow hover:scale-105 transition-transform"
        title="Alternar tema"
      >
        {theme === 'system' && <Gear size={20} className="text-gray-700 dark:text-gray-300" />}
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
        className="w-full max-w-2xl p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl relative z-10 transition-all duration-500 ease-in-out"
      >
        <div className="flex justify-center mb-8">
          <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={150} height={150} />
        </div>

        {showBanner && <Banner message={bannerMessage} description={bannerDescription} type={bannerType} />}

        <div className={`relative flex flex-col justify-center transition-all duration-500 ease-in-out ${isRegistering ? 'min-h-[360px]' : 'min-h-[260px]'}`}>
          {/* Formulário Login */}
          <div className={`absolute w-full top-0 left-0 transition-opacity duration-500 ease-in-out ${isRegistering ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="w-full flex justify-center">
                <div className="w-full max-w-sm">
                  <CustomField
                    icon={UserCircle}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    name="passwordLogin"
                    className="pr-10"
                    isInvalid={isPasswordInvalid}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </button>
                </div>
              </div>
              <div className="text-center mt-2">
                <Link href="/forgot-password" legacyBehavior>
                  <a className="text-sm text-[#B3090F] dark:text-red-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3090F] rounded">
                    Esqueceu sua senha?
                  </a>
                </Link>
              </div>
              <div className="flex justify-center">
                <CustomButton type="submit" className={'bg-red-800 hover:bg-[#B3090F]'}>
                  ENTRAR
                </CustomButton>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Não é um usuário?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }} className="text-[#B3090F] dark:text-red-400 hover:underline">Cadastre-se!</a>
                </p>
              </div>
            </form>
          </div>

          {/* Formulário Registro */}
          <div className={`absolute w-full top-0 left-0 transition-opacity duration-500 ease-in-out ${isRegistering ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <form className="grid grid-cols-2 gap-4 " onSubmit={handleRegister}>
              <div className='col-span-2'>
                <CustomField
                  icon={UserCircle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  name="name"
                  isInvalid={isNameInvalid}
                />
              </div>
              <CustomField
                icon={Envelope}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                name="email"
              />
              <div className="col-span-2 sm:col-span-1">
                <CustomDropdown
                  icon={Student}
                  value={course}
                  onChange={setCourse}
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
                  onChange={setSex}
                  options={['Masculino', 'Feminino', 'Outro']}
                  placeholder="Selecione o sexo"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <CustomField
                  icon={Cake}
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    name="password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                  >
                    {showRegisterPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </button>
                </div>
              </div>
              <div className="col-span-2 flex justify-center">
                <CustomButton type="submit" className={'bg-red-800 hover:bg-[#B3090F]'}>
                  CADASTRAR
                </CustomButton>
              </div>
              <p className="col-span-2 text-center text-sm text-gray-700 dark:text-gray-400">
                Já tem um cadastro?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(false); }} className="col-span-2 text-center text-sm text-[#B3090F] dark:text-red-400 hover:underline">Faça login!</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}