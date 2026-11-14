import { cn } from "@/lib/utils";
import type { Language } from "@/translations";

interface LanguageToggleProps {
  lang: Language;
  toggleLang: () => void;
  className?: string;
}

/**
 * Minimal text-only EN / TR language switcher shared across pages.
 */
export default function LanguageToggle({
  lang,
  toggleLang,
  className,
}: LanguageToggleProps) {
  return (
    <button
      type="button"
      onClick={toggleLang}
      className={cn(
        "inline-flex items-center gap-1.5 py-1 text-xs font-mono tracking-wider opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded",
        className,
      )}
      aria-label="Switch language"
      title="Switch Language / Dil Değiştir"
    >
      <span
        className={
          lang === "en"
            ? "text-amber-400 font-semibold"
            : "text-zinc-500 hover:text-zinc-300 transition-colors"
        }
      >
        EN
      </span>
      <span className="text-zinc-700">/</span>
      <span
        className={
          lang === "tr"
            ? "text-amber-400 font-semibold"
            : "text-zinc-500 hover:text-zinc-300 transition-colors"
        }
      >
        TR
      </span>
    </button>
  );
}
