import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Banner from '../components/banner';
import Link from 'next/link';
import { Eye, EyeSlash, UserCircle, Lock, Envelope, GenderIntersex, Cake, Student } from 'phosphor-react';
import CustomField from '../components/custom-field'
import CustomButton from '../components/custom-buttom'
import CustomDropdown from '../components/custom-dropdown';

export default function Login() {
  const [mounted, setMounted] = useState(false);
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
  const [isEmailInvalid, setIsEmailInvalid] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [isCourseInvalid, setIsCourseInvalid] = useState(false);
  const [isBirthdayInvalid, setIsBirthdayInvalid] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let hasError = false;
    if (!email) {
      setIsEmailInvalid(true);
      hasError = true;
    } else {
      setIsEmailInvalid(false);
    }

    if (!password) {
      setIsPasswordInvalid(true);
      hasError = true;
    } else {
      setIsPasswordInvalid(false);
    }

    if (hasError) {
      setIsLoading(false);
      return;
    }

    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    localStorage.setItem('token', data.token);

    if (res.ok) {
      router.push('/home');
    } else {
      showBannerMessage("Usuário ou senha incorretos!", "error", "Verifique suas credenciais e tente novamente");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let hasError = false;
    if (!course) {
      setIsCourseInvalid(true);
      hasError = true;
    } else {
      setIsCourseInvalid(false);
    }

    if (!birthday) {
      setIsBirthdayInvalid(true);
      hasError = true;
    } else {
      setIsBirthdayInvalid(false);
    }

    if (hasError) return;

    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, course, sex, birthday }),
    });

    const data = await response.json();

    if (!response.ok) {
      showBannerMessage(data.message, 'error', data.description || '');
    } else {
      showBannerMessage(data.message, 'success', data.description || '');
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
        className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-xl relative z-10 transition-all duration-500 ease-in-out"
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
                  <a className="text-sm text-[#B3090F] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3090F] rounded">
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
                <p className="text-sm text-gray-700">
                  Não é um usuário?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }} className="text-[#B3090F] hover:underline">Cadastre-se!</a>
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
              <p className="col-span-2 text-center text-sm text-gray-700">
                Já tem um cadastro?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(false); }} className="col-span-2 text-center text-sm text-[#B3090F] hover:underline">Faça login!</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}