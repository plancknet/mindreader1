import { createContext, useContext, useState, ReactNode } from 'react';
import { DEFAULT_LANGUAGE, languages } from '@/i18n/languages';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'mindreader-language';

const resolveLanguage = (candidate?: string | null): string | null => {
  if (!candidate) return null;
  const normalized = candidate.toLowerCase();

  const exactMatch = languages.find(
    (language) => language.code.toLowerCase() === normalized,
  );
  if (exactMatch) return exactMatch.code;

  const baseCode = normalized.split('-')[0];
  const partialMatch = languages.find((language) =>
    language.code.toLowerCase().startsWith(baseCode),
  );
  return partialMatch?.code ?? null;
};

const loadStoredLanguage = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return resolveLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return null;
  }
};

const detectBrowserLanguage = (): string => {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;

  const candidates: string[] = [];
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    candidates.push(...navigator.languages);
  }
  if (navigator.language) {
    candidates.push(navigator.language);
  }

  for (const candidate of candidates) {
    const match = resolveLanguage(candidate);
    if (match) return match;
  }

  return DEFAULT_LANGUAGE;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<string>(() => {
    const storedLanguage = loadStoredLanguage();
    if (storedLanguage) return storedLanguage;

    return detectBrowserLanguage();
  });

  const setLanguage = (lang: string) => {
    const resolvedLanguage = resolveLanguage(lang) ?? DEFAULT_LANGUAGE;
    setLanguageState(resolvedLanguage);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, resolvedLanguage);
      } catch {
        // ignore storage write errors
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return context;
};
