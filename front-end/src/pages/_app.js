import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import Modal from 'react-modal';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ModalDesconected from '../components/modals/modal-desconected';

if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

export default function App({ Component, pageProps }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (['/login', '/confirm'].includes(router.pathname)) return;
  
    const checkToken = () => {
      const token = localStorage.getItem('token');
      const tokenExp = localStorage.getItem('token_exp');
    
      if (!token || !tokenExp) return;
    
      const now = Date.now(); // em milissegundos
      const expTime = Number(tokenExp) * 1000; // converter para ms
    
      if (now > expTime) {
        setShowModal(true);
      }
    };
  
    checkToken();
    const interval = setInterval(checkToken, 60000); // verifica a cada 1 minuto
    return () => clearInterval(interval);
  }, [router.pathname]);

  return (
    <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
      <>
        <Component {...pageProps} />
        <ModalDesconected
          isOpen={showModal}
          onConfirm={() => {
            setShowModal(false);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
          }}
        />
      </>
    </ThemeProvider>
  );
}