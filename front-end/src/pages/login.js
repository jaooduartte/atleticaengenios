import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Banner from '../components/banner';
import Link from 'next/link';
import { Eye, EyeSlash, UserCircle, Lock, Envelope, GenderIntersex, Cake, Student } from 'phosphor-react';

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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push('/home');
    } else {
      showBannerMessage("Usuário ou senha incorretos!", "error", "Verifique suas credenciais e tente novamente");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
    <div className="flex justify-center items-center h-screen bg-[#B3090F]">
      <div className="w-full max-w-xl p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center mb-8">
          <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={150} height={150} />
        </div>

        {showBanner && <Banner message={bannerMessage} description={bannerDescription} type={bannerType} />}

        <div className="relative overflow-hidden">
          {/* Formulário Login */}
          <div className={`transition-opacity duration-500 ease-in-out ${isRegistering ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 relative'}`}>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="relative">
                <UserCircle size={30}  className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#B3090F]" />
                <input
                  id="emailLogin"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="w-full p-3 pl-12 border border-gray-300 rounded-xl"
                  required
                />
              </div>
              <div className="relative">
                <Lock size={30} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#B3090F]" />
                <input
                  id="passwordLogin"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full p-3 pl-12 pr-10 border border-gray-300 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                </button>
                </div>
                <div className="text-center mt-2">
                  <Link href="/forgot-password" legacyBehavior>
                    <a className="text-sm text-[#B3090F] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3090F] rounded">
                      Esqueceu sua senha?
                    </a>
                  </Link>
                </div>
              <button type="submit" className="w-full py-3 bg-[#B3090F] text-white rounded-xl font-semibold">ENTRAR</button>
              <div className="text-center">
                <p className="text-sm text-gray-700">
                  Não é um usuário?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }} className="text-[#B3090F] hover:underline">Cadastre-se!</a>
                </p>
              </div>
            </form>
          </div>

          {/* Formulário Registro */}
          <div className={`transition-opacity duration-500 ease-in-out ${isRegistering ? 'opacity-100 relative' : 'opacity-0 pointer-events-none absolute'}`}>
            <form className="grid grid-cols-2 gap-4" onSubmit={handleRegister}>
              <div className="col-span-2 relative">
                <UserCircle size={30} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#B3090F]" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="w-full p-3 pl-12 border border-gray-300 rounded-xl"
                  required
                />
              </div>
              <div className="relative">
                <Envelope size={30} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#B3090F]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="w-full p-3 pl-12 border border-gray-300 rounded-xl"
                  required
                />
              </div>
              <div>
                <div className="relative">
                  <Student size={30} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#B3090F]" />
                  <select id="course" value={course} className="w-full p-3 pl-12 border border-gray-300 rounded-xl text-gray-400" onChange={(e) => { setCourse(e.target.value); e.target.classList.remove('text-gray-400'); e.target.classList.add('text-black'); }} required>
                    <option disabled value="">Selecione o curso</option>
                    <option>Engenharia de Software</option>
                    <option>Engenharia Civil</option>
                    <option>Engenharia de Produção</option>
                    <option>Engenharia Elétrica</option>
                    <option>Engenharia Mecânica</option>
                    <option>Arquitetura</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="relative">
                  <GenderIntersex size={30} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#B3090F]" />
                  <select id="sex" value={sex} className="w-full p-3 pl-12 border border-gray-300 rounded-xl text-gray-400" onChange={(e) => { setSex(e.target.value); e.target.classList.remove('text-gray-400'); e.target.classList.add('text-black'); }} required>
                    <option disabled value="">Selecione o sexo</option>
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="relative">
                  <Cake size={30} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#B3090F]" />
                  <input
                    id="birthday"
                    type="date"
                    className="w-full p-3 pl-12 border border-gray-300 rounded-xl text-gray-400"
                    onChange={(e) => {
                      setBirthday(e.target.value);
                      e.target.classList.remove('text-gray-400');
                      e.target.classList.add('text-black');
                    }}
                    required
                  />
                </div>
              </div>
              <div className='col-span-2'>
                <div className="relative">
                  <Lock size={30} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#B3090F]" />
                  <input
                    id="password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full p-3 pl-12 pr-10 border border-gray-300 rounded-xl"
                    required
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
              <button type="submit" className="col-span-2 py-3 bg-[#B3090F] text-white rounded-xl font-semibold">CADASTRAR</button>
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