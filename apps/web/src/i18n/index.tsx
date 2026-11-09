import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { Locale, TranslationDictionary } from './types';
import { en } from './en';
import { hi } from './hi';

const LOCALE_STORAGE_KEY = 'epaper_studio_locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDictionary;
  formatString: (template: string, params: Record<string, string | number>) => string;
}

const dictionaries: Record<Locale, TranslationDictionary> = { en, hi };

const I18nContext = createContext<I18nContextValue | null>(null);

function formatStringHelper(template: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce((str, [k, v]) => {
    return str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }, template);
}

const defaultI18nValue: I18nContextValue = {
  locale: 'en',
  setLocale: () => {},
  t: dictionaries.en,
  formatString: formatStringHelper,
};

export interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored === 'en' || stored === 'hi') return stored;
    }
    return 'hi';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
      formatString: formatStringHelper,
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  return context ?? defaultI18nValue;
}

export * from './types';
