import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}