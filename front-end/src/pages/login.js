import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Banner from '../components/banner';

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
  const [isLoading, setIsLoading] = useState(false);

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
      showBannerMessage(data.error || 'Usuário ou senha incorretos.', 'error');
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
      showBannerMessage(data.message, 'error');
    } else {
      showBannerMessage(data.message, 'success');
      setIsRegistering(false);
    }

    setIsLoading(false);
  };

  const showBannerMessage = (message, type) => {
    setBannerMessage(message);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 5000);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#B3090F]">
      <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-8">
          <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={150} height={150} />
        </div>

        {showBanner && <Banner message={bannerMessage} type={bannerType} />}

        <div className="relative overflow-hidden">
          {/* Formulário Login */}
          <div className={`transition-opacity duration-500 ease-in-out ${isRegistering ? 'opacity-0 pointer-events-none absolute' : 'opacity-100 relative'}`}>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="emailLogin" className="block text-gray-700">Usuário</label>
                <input id="emailLogin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="w-full p-3 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <div className='flex justify-between'>
                  <label htmlFor="passwordLogin" className="block text-gray-700">Senha</label>
                  <a href="/forgot-password" className="text-sm text-[#B3090F] hover:underline mt-1 text-xs">
                    Esqueceu sua senha?
                  </a>
                </div>
                <input id="passwordLogin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="w-full p-3 border border-gray-300 rounded-lg" required />
              </div>
              <button type="submit" className="w-full py-3 bg-[#B3090F] text-white rounded-lg font-semibold">ENTRAR</button>
              <div className="text-center">
                <p className="text-sm text-gray-700">
                  Não é um usuário?{' '}
                  <a href="#" className="text-[#B3090F] hover:underline" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }}>
                    Cadastre-se!
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Formulário Registro */}
          <div className={`transition-opacity duration-500 ease-in-out ${isRegistering ? 'opacity-100 relative' : 'opacity-0 pointer-events-none absolute'}`}>
            <form className="grid grid-cols-2 gap-4" onSubmit={handleRegister}>
              <div className="col-span-2">
                <label htmlFor="name" className="block text-gray-700">Nome Completo</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Digite seu nome" className="w-full p-3 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700">E-mail</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu e-mail" className="w-full p-3 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label htmlFor="course" className="block text-gray-700">Curso</label>
              <select id="course" value={course} className="w-full p-3 border border-gray-300 rounded-lg text-gray-400" onChange={(e) => { setCourse(e.target.value); e.target.classList.remove('text-gray-400'); e.target.classList.add('text-black'); }} required>
                  <option disabled value="">Selecione</option>
                  <option>Engenharia de Software</option>
                  <option>Engenharia Civil</option>
                  <option>Engenharia de Produção</option>
                  <option>Engenharia Elétrica</option>
                  <option>Engenharia Mecânica</option>
                  <option>Arquitetura</option>
                </select>
              </div>
              <div>
                <label htmlFor="sex" className="block text-gray-700">Sexo</label>
              <select id="sex" value={sex} className="w-full p-3 border border-gray-300 rounded-lg text-gray-400" onChange={(e) => { setSex(e.target.value); e.target.classList.remove('text-gray-400'); e.target.classList.add('text-black'); }} required>
                  <option disabled value="">Selecione</option>
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label htmlFor="birthday" className="block text-gray-700">Data de Nascimento</label>
                <input
                  id="birthday"
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-400"
                  onChange={(e) => {
                    setBirthday(e.target.value);
                    e.target.classList.remove('text-gray-400');
                    e.target.classList.add('text-black');
                  }}
                  required
                />
              </div>
              <div className='col-span-2'>
                <label htmlFor="password" className="block text-gray-700">Senha</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="w-full p-3 border border-gray-300 rounded-lg" required />
              </div>
              <button type="submit" className="col-span-2 py-3 bg-[#B3090F] text-white rounded-lg font-semibold">CADASTRAR</button>
              <p className="col-span-2 text-center text-sm text-gray-700">
                Já tem um cadastro?{' '}
                <a href="#" className="col-span-2 text-center text-sm text-[#B3090F] hover:underline" onClick={(e) => { e.preventDefault(); setIsRegistering(false); }}>
                  Faça login!
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}