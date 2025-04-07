import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Banner from '../components/banner';
import Image from 'next/image';
import Link from 'next/link';
import CustomField from '../components/custom-field'
import CustomButton from '../components/custom-buttom'
import { Lock, Eye, EyeSlash } from 'phosphor-react';

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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl relative z-10">
        <div className="flex justify-center mb-8">
          <Image src="/Logo-Engenios.png" alt="Logo Engênios" width={150} height={150} />
        </div>
        <h2 className="text-center text-2xl font-semibold mb-4">Redefinir sua senha</h2>

        {showBanner && <Banner message={bannerMessage} type={bannerType} />}

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
              isInvalid={isNewPasswordInvalid}
              className="pr-10"
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
              isInvalid={isConfirmPasswordInvalid}
              className="pr-10"
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

          <div>
            <CustomButton type="submit" className={'bg-red-800 hover:bg-[#B3090F]'}>Redefinir senha</CustomButton>
          </div>

          <div className="text-center">
            <Link href="/login" legacyBehavior><a className="text-sm text-[#B3090F] hover:underline">Voltar ao login</a></Link>
          </div>
        </form>
      </div>
    </div>
  );
}