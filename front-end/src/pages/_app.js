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
    if (router.pathname === '/login') return;  // Impede execução na tela de login
  
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowModal(true);
        return;
      }
  
      try {
        const res = await fetch('http://localhost:3001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const data = await res.json();
  
        if (!res.ok && data?.type === 'session_expired') {
          setShowModal(true);
        }
      } catch (err) {
        setShowModal(true);
      }
    };
  
    checkToken();
    const interval = setInterval(checkToken, 60000);
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