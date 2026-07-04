import { createContext, useContext, useState } from 'react';
import translations from '../i18n/translations';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('bms-lang') || 'en');

  const toggle = () => {
    const next = lang === 'en' ? 'si' : 'en';
    setLang(next);
    localStorage.setItem('bms-lang', next);
  };

  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);