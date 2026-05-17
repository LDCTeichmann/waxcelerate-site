import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { translations, type Language, type TranslationType } from '@/lib/i18n';

interface LanguageContextType {
  lang: Language;
  t: TranslationType;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem('wx-lang');
    return (stored === 'de' || stored === 'en') ? stored : 'de';
  });

  useEffect(() => {
    localStorage.setItem('wx-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'de' ? 'en' : 'de'));
  }, []);

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
