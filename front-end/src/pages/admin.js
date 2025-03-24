import { useEffect } from 'react';
import Header from '../components/header-admin';
import Footer from '../components/footer-admin';

export default function Admin() {
  useEffect(() => {
    console.log('Área Admin');
  }, []);

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