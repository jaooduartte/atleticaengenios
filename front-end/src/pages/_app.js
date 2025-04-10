import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import Modal from 'react-modal';

if (typeof window !== 'undefined') {
  Modal.setAppElement('#__next');
}

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}