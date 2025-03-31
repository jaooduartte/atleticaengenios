import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Banner from '../components/banner';
import Image from 'next/image';
import Link from 'next/link';
import CustomField from '../components/custom-field'
import CustomButton from '../components/custom-buttom'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [isNewPasswordInvalid, setIsNewPasswordInvalid] = useState(false);
  const [isConfirmPasswordInvalid, setIsConfirmPasswordInvalid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.query.token) {
      setToken(router.query.token);
    }
  }, [router.query.token]);

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
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl">
        <div className="flex justify-center mb-8">
          <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={150} height={150} />
        </div>
        <h2 className="text-center text-2xl font-semibold mb-4">Redefinir sua senha</h2>

        {showBanner && <Banner message={bannerMessage} type={bannerType} />}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <CustomField
            icon={Lock}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Digite a nova senha"
            name="newPassword"
            isInvalid={isNewPasswordInvalid}
          />

          <CustomField
            icon={Lock}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a nova senha"
            name="confirmPassword"
            isInvalid={isConfirmPasswordInvalid}
          />

          <div>
            <CustomButton type="submit" label="Redefinir senha" />
          </div>

          <div className="text-center">
            <Link href="/login" legacyBehavior><a className="text-sm text-[#B3090F] hover:underline">Voltar ao login</a></Link>
          </div>
        </form>
      </div>
    </div>
  );
}