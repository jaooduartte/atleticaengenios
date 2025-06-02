import { useEffect } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    console.log('Home');
  }, []);

  return (
    <div>
      <Header />
      <Head>
        <title>Inicio</title>
      </Head>
      <div className="flex justify-center dark:bg-[#0e1117] items-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#B3090F]">Bem-vindo à Área de Membros</h1>
          <p className="mt-4 dark:text-white text-lg">Aqui você pode visualizar tudo de sua atlética!</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}