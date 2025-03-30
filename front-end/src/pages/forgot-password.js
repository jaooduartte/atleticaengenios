import { useState } from 'react';
import { useRouter } from 'next/router';
import Banner from '../components/banner';
import Image from 'next/image';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      setBannerMessage(data.message);
      setBannerType('success');
      setShowBanner(true);

      setTimeout(() => {
        router.push('/login');
      }, 5000);
    } else {
      setBannerMessage(data.error || 'Erro ao enviar e-mail.');
      setBannerType('error');
      setShowBanner(true);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#B3090F]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-8">
          <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={150} height={150} />
        </div>
        <h2 className="text-center text-2xl font-semibold mb-4">Redefinir senha</h2>

        {showBanner && <Banner message={bannerMessage} type={bannerType} />}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-gray-700">Digite seu e-mail cadastrado</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <button type="submit" className="w-full py-3 bg-[#B3090F] text-white rounded-lg font-semibold">
              Enviar link de redefinição
            </button>
          </div>

          <div className="text-center">
            <a href="/login" className="text-sm text-[#B3090F] hover:underline">
              Voltar ao login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}