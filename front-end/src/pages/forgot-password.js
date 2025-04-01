import { useState } from 'react';
import { useRouter } from 'next/router';
import Banner from '../components/banner';
import Image from 'next/image';
import Link from 'next/link';
import { Envelope } from 'phosphor-react'
import CustomField from '../components/custom-field'
import CustomButton from '../components/custom-buttom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
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
      setBannerDescription('Verifique seu e-mail para redefinir a senha.');
      setBannerType('success');
      setShowBanner(true);

      setTimeout(() => {
        router.push('/login');
      }, 4500);
    } else {
      setBannerMessage(data.error || 'Erro ao enviar e-mail.');
      setBannerDescription('Tente novamente mais tarde ou entre em contato com o suporte.');
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
        <h2 className="text-center text-2xl font-semibold mb-4">Redefinir senha</h2>

        {showBanner && <Banner message={bannerMessage} description={bannerDescription} type={bannerType} />}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="w-full flex justify-center">
            <div className="w-full max-w-sm">
              <CustomField
                icon={Envelope}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                name="email"
              />
            </div>
          </div>
          <div>
            <CustomButton type="submit">ENVIAR LINK</CustomButton>
          </div>

          <div className="text-center">
            <Link href="/login" legacyBehavior><a className="text-sm text-[#B3090F] hover:underline">Voltar ao login</a></Link>
          </div>
        </form>
      </div>
    </div>
  );
}