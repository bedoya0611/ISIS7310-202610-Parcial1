"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "es" | "en";

type LocaleContextValue = {
  locale: Locale;
  isSpanish: boolean;
  formatDate: (value: string, options?: Intl.DateTimeFormatOptions) => string;
  translateNationality: (value: string) => string;
  translatePrizeStatus: (value: string) => string;
};

const nationalityLabels: Record<string, Record<Locale, string>> = {
  American: { es: "Estadounidense", en: "American" },
  Spanish: { es: "Espanola", en: "Spanish" },
  Danish: { es: "Danesa", en: "Danish" },
  Colombian: { es: "Colombiana", en: "Colombian" },
  French: { es: "Francesa", en: "French" },
  Mexican: { es: "Mexicana", en: "Mexican" },
  Argentinian: { es: "Argentina", en: "Argentinian" },
};

const prizeStatusLabels: Record<string, Record<Locale, string>> = {
  won: { es: "ganado", en: "won" },
  nominated: { es: "nominado", en: "nominated" },
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function resolveLocale(languages: readonly string[] | undefined): Locale {
  if (!languages || languages.length === 0) {
    return "es";
  }

  for (const language of languages) {
    const normalized = language.toLowerCase();

    if (normalized.startsWith("es")) {
      return "es";
    }

    if (normalized.startsWith("en")) {
      return "en";
    }
  }

  return "es";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es");

  useEffect(() => {
    const updateLocale = () => {
      const languages =
        typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : undefined;
      setLocale(resolveLocale(languages));
    };

    updateLocale();
    window.addEventListener("languagechange", updateLocale);

    return () => {
      window.removeEventListener("languagechange", updateLocale);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const localeTag = locale === "es" ? "es-CO" : "en-US";

    return {
      locale,
      isSpanish: locale === "es",
      formatDate: (value, options = { dateStyle: "long" }) => {
        const parsed = new Date(value);

        if (Number.isNaN(parsed.getTime())) {
          return value;
        }

        return new Intl.DateTimeFormat(localeTag, options).format(parsed);
      },
      translateNationality: (value) => nationalityLabels[value]?.[locale] ?? value,
      translatePrizeStatus: (value) => prizeStatusLabels[value]?.[locale] ?? value,
    };
  }, [locale]);

  return (
    <LocaleContext.Provider value={value}>
      <a href="#main-content" className="skip-link">
        {value.isSpanish ? "Saltar al contenido principal" : "Skip to main content"}
      </a>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
