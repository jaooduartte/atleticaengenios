import { useEffect } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

export default function Home() {
  useEffect(() => {
    console.log('Home');
  }, []);

  return (
    <div>
      {/* Cabeçalho */}
      <Header />

      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#B3090F]">Bem-vindo à Área de Membros</h1>
          <p className="mt-4 text-lg">Aqui você pode visualizar tudo de sua atlética!</p>
        </div>
      </div>

      {/* Rodapé */}
      <Footer />
    </div>
  );
}