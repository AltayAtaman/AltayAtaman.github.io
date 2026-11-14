import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import GatewayFlow from "@/components/ui/gateway-flow";
import LanguageToggle from "@/components/LanguageToggle";
import { translations, type Language } from "@/translations";

interface WelcomePageProps {
  lang: Language;
  toggleLang: () => void;
  onStartTransition: () => void;
  onComplete: () => void;
}

const EXIT_DURATION_MS = 550;

/**
 * Fullscreen portfolio gateway screen featuring the GatewayFlow backdrop,
 * EN/TR switcher, and animated transition into the main slide portfolio.
 */
export default function WelcomePage({
  lang,
  toggleLang,
  onStartTransition,
  onComplete,
}: WelcomePageProps) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<number | null>(null);
  const t = translations[lang];

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleProceed = () => {
    if (isExiting) return;
    setIsExiting(true);
    onStartTransition();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    timerRef.current = window.setTimeout(() => {
      onComplete();
    }, EXIT_DURATION_MS);
  };

  return (
    <div
      className={`fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-[#0d0f12] text-zinc-200 font-sans selection:bg-amber-500/25 selection:text-amber-200 flex flex-col justify-between transition-all duration-500 ease-out ${
        isExiting ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Converging Bezier particle background */}
      <GatewayFlow
        speed={isExiting ? 5 : 1}
        density={1.1}
        opacity={0.72}
        className="fixed inset-0 z-0"
      />

      {/* Soft center shadow scrim + edge vignette for text legibility */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(13,15,18,0.72)_0%,rgba(13,15,18,0.32)_46%,rgba(13,15,18,0.88)_100%)]"
      />

      {/* Top minimal bar: Text-only EN/TR switcher */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-6 pt-6 flex items-center justify-end">
        <LanguageToggle lang={lang} toggleLang={toggleLang} />
      </header>

      {/* Center Gateway Content */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-6 pt-4 pb-16">
        <div
          className={`w-full max-w-2xl flex flex-col items-center text-center space-y-6 transition-all duration-500 ease-out ${
            isExiting ? "opacity-0 scale-95 blur-[2px]" : "opacity-100 scale-100 blur-0"
          }`}
        >
          <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-amber-400/90 drop-shadow-[0_2px_12px_rgba(13,15,18,0.95)]">
            {t.welcome.role}
          </p>

          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-[0_4px_24px_rgba(13,15,18,0.95)]">
            {t.welcome.name}
          </h1>

          <div
            aria-hidden="true"
            className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent"
          />

          <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed drop-shadow-[0_4px_24px_rgba(13,15,18,0.95)]">
            {t.welcome.taglinePrefix}
            <span className="text-amber-400 font-normal underline decoration-amber-500/60 decoration-2 underline-offset-4">
              {t.welcome.taglineHighlight}
            </span>
            {t.welcome.taglineSuffix}
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleProceed}
              disabled={isExiting}
              className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f12] disabled:opacity-70"
            >
              <span>{t.welcome.cta}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
