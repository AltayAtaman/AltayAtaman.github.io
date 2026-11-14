import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WelcomePage from './components/WelcomePage';
import { Language } from './translations';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

interface PortfolioEntryProps {
  lang: Language;
  toggleLang: () => void;
  latency: number;
}

function PortfolioEntry({ lang, toggleLang, latency }: PortfolioEntryProps) {
  const [welcomeDismissed, setWelcomeDismissed] = useState<boolean>(() =>
    typeof window !== 'undefined' ? Boolean(window.location.hash) : false,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        setIsTransitioning(false);
        setWelcomeDismissed(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const showHomePage = welcomeDismissed || isTransitioning;

  return (
    <>
      {showHomePage && (
        <HomePage
          lang={lang}
          toggleLang={toggleLang}
          latency={latency}
          disableKeyboardNav={!welcomeDismissed}
        />
      )}
      {!welcomeDismissed && (
        <WelcomePage
          lang={lang}
          toggleLang={toggleLang}
          onStartTransition={() => setIsTransitioning(true)}
          onComplete={() => {
            setWelcomeDismissed(true);
            setIsTransitioning(false);
          }}
        />
      )}
    </>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('portfolio_lang') as Language;
    return saved === 'tr' ? 'tr' : 'en';
  });
  const [latency, setLatency] = useState(16);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title =
      lang === 'tr'
        ? 'Ismail Altay Ataman — Yazılım Mühendisi | IoT, Gömülü Sistemler ve Full-Stack'
        : 'Ismail Altay Ataman — Software Engineer | IoT & Full-Stack Systems';
  }, [lang]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(14 + Math.random() * 6));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const toggleLang = () => {
    const nextLang: Language = lang === 'en' ? 'tr' : 'en';
    setLang(nextLang);
    localStorage.setItem('portfolio_lang', nextLang);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={<PortfolioEntry lang={lang} toggleLang={toggleLang} latency={latency} />}
        />
        <Route
          path="*"
          element={<PortfolioEntry lang={lang} toggleLang={toggleLang} latency={latency} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
