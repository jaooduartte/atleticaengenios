import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import Modal from 'react-modal';
import React from 'react';
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

      const now = Date.now();
      const expTime = Number(tokenExp) * 1000;

      if (now > expTime) {
        setShowModal(true);
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [router.pathname]);

  useEffect(() => {
    (function (h, o, t, j, a, r) {
      h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments) };
      h._hjSettings = { hjid: 6412924, hjsv: 6 };
      a = o.getElementsByTagName('head')[0];
      r = o.createElement('script'); r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
  }, []);

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