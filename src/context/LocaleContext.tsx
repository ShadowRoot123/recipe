import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n, { SupportedLanguage, isSupportedLanguage } from '../i18n';

interface LocaleContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  language: 'en',
  setLanguage: () => {}
});

const LANGUAGE_STORAGE_KEY = 'language';

const getDeviceLanguage = (): SupportedLanguage => {
  try {
    const locales = Localization.getLocales();
    const code = locales?.[0]?.languageCode;
    if (code && isSupportedLanguage(code)) return code;
  } catch {
    return 'en';
  }
  return 'en';
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && isSupportedLanguage(saved)) {
          setLanguageState(saved);
          await i18n.changeLanguage(saved);
          return;
        }
      } catch {
        // ignore
      }

      const deviceLanguage = getDeviceLanguage();
      setLanguageState(deviceLanguage);
      await i18n.changeLanguage(deviceLanguage);
    };

    loadLanguage();
  }, []);

  const setLanguage = async (next: SupportedLanguage) => {
    setLanguageState(next);
    await i18n.changeLanguage(next);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const value = useMemo<LocaleContextType>(() => ({ language, setLanguage }), [language]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => useContext(LocaleContext);
