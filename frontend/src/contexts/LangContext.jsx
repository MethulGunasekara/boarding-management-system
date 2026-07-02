import { createContext, useContext, useState } from 'react';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('bms-lang') || 'en');

  const toggleLang = () => {
    setLang(prev => {
      const next = prev === 'en' ? 'si' : 'en';
      localStorage.setItem('bms-lang', next);
      return next;
    });
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
