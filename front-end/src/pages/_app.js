import '../styles/globals.css'
import { ThemeProvider } from 'next-themes'
import Modal from 'react-modal'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import ModalDesconected from '../components/modals/modal-desconected'
import GlobalLoader from '../components/global-loader'
import { LoadingProvider } from '../context/LoadingContext'
import { AuthProvider } from '../context/AuthContext'
import RouteLoaderHandler from '../components/RouteLoaderHandler'
import PropTypes from 'prop-types'

if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

export default function App({ Component, pageProps }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const publicRoutes = ['/login', '/confirm', '/forgot-password', '/reset-password'];
    const currentPath = router.asPath.split(/[?#]/)[0];
    if (publicRoutes.includes(currentPath) || publicRoutes.includes(router.pathname)) return;

    const checkToken = async () => {
      const token = localStorage.getItem('token');
      const tokenExp = localStorage.getItem('token_exp');

      if (!token || !tokenExp) {
        setShowModal(true);
        return;
      }

      const now = Date.now();
      const expTime = Number(tokenExp) * 1000;

      if (now > expTime) {
        setShowModal(true);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok || data?.is_active === false) {
        localStorage.removeItem('token');
        localStorage.removeItem('token_exp');
        setShowModal(true);
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [router, router.pathname]);

  useEffect(() => {
    (function (h, o, t, j, a, r) {
      if (!h.hj) {
        const queue = h.hj?.q || [];
        h.hj = function () {
          queue.push(arguments);
        };
        h.hj.q = queue;
      }
      h._hjSettings = { hjid: 6412924, hjsv: 6 };

      const head = o.getElementsByTagName('head')[0];
      const script = o.createElement('script');
      script.async = true;
      script.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      head.appendChild(script);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
  }, []);

  return (
    <ThemeProvider attribute="class" enableSystem={true} defaultTheme="system">
      <AuthProvider>
        <LoadingProvider>
          <RouteLoaderHandler />
          <>
            <GlobalLoader />
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
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};