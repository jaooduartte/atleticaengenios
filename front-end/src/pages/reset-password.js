import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Banner from '../components/banner';
import Image from 'next/image';
import Link from 'next/link';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (router.query.token) {
      setToken(router.query.token);
    }
  }, [router.query.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setBannerMessage('As senhas não coincidem!');
      setBannerDescription('Digite novamente os campos corretamente.');
      setBannerType('error');
      setShowBanner(true);
      return;
    }

    const response = await fetch('http://localhost:3001/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      setBannerMessage(data.message);
      setBannerDescription('Você será redirecionado ao login em instantes.');
      setBannerType('success');
      setShowBanner(true);

      setTimeout(() => {
        router.push('/login');
      }, 4500);
    } else {
      setBannerMessage(data.error || 'Erro ao redefinir senha.');
      setBannerDescription('');
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
        <h2 className="text-center text-2xl font-semibold mb-4">Redefinir sua senha</h2>

        {showBanner && <Banner message={bannerMessage} type={bannerType} />}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword" className="block text-gray-700">Nova senha</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
              className="w-full p-3 mt-2 border border-gray-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700">Confirme a nova senha</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
              className="w-full p-3 mt-2 border border-gray-300 rounded-xl"
              required
            />
          </div>

          <div>
            <button type="submit" className="w-full py-3 bg-[#B3090F] text-white rounded-xl font-semibold">
              Redefinir senha
            </button>
          </div>

          <div className="text-center">
          <Link href="/login" legacyBehavior><a className="text-sm text-[#B3090F] hover:underline">Voltar ao login</a></Link>
          </div>
        </form>
      </div>
    </div>
  );
}