import { useEffect } from 'react';
import Header from '../components/header-admin';
import Footer from '../components/footer-admin';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

export default function Admin() {
  const user = useAuth();
  const router = useRouter();
 
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace('/');
    }
  }, [user, router]);
 
  if (!user) return null;

  return (
    <div>
      {/* Cabeçalho */}
      <Header />

      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#B3090F]">Bem-vindo à Área Admin</h1>
          <p className="mt-4 text-lg">Aqui você pode gerenciar tudo de sua atlética!</p>
        </div>
      </div>

      {/* Rodapé */}
      <Footer />
    </div>
  );
}