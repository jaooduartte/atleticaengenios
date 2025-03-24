import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Banner from '../components/banner'; // Importe o componente de Banner

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // Hook de roteamento
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setMounted(true); // Garanta que o componente seja renderizado apenas no cliente
  }, []);

  if (!mounted) {
    return null; // Retorna null ou um componente de carregamento
  }

  // Função de login
  const handleLogin = (e) => {
    e.preventDefault();

    // Lógica simples de validação de credenciais (apenas para demonstração)
    if (username === 'admin' && password === '1234') {
      router.push('/home'); // Redireciona para a página home se as credenciais estiverem corretas
    } else {
      setError('Usuário ou senha incorretos. Tente novamente.');
      setShowBanner(true); // Exibe o banner de erro
      setTimeout(() => setShowBanner(false), 5000); // Esconde o banner após 5 segundos
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#B3090F]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/Logo-Engenios.png"  // Logo que está na pasta public
            alt="Logo Engênios"
            width={150}  // Ajuste o tamanho conforme necessário
            height={150}
          />
        </div>

        {/* Banner de erro */}
        {showBanner && <Banner message={error} type="error" />}

        {/* Formulário de Login */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="block text-gray-700">Usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu e-mail"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Botão de Login */}
          <div>
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-[#B3090F] text-white rounded-lg font-semibold"
            >
              ENTRAR
            </button>
          </div>
        </form>

        {/* Link de cadastro */}
        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-[#B3090F] hover:underline">
            Não é um usuário? Cadastre-se!
          </a>
        </div>
      </div>
    </div>
  );
}