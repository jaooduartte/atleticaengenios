import '../styles/globals.css';  // Importe o arquivo global de estilos
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;  // Impede o "flash" de renderização
  }

  return <Component {...pageProps} />;
}

export default MyApp;