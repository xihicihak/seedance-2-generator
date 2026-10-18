"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LANGUAGES, DEFAULT_LOCALE, getTranslation } from "@/lib/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedLocale = localStorage.getItem("pornmake_locale");
        if (savedLocale && LANGUAGES.some((l) => l.code === savedLocale)) {
          setLocaleState(savedLocale);
          document.documentElement.setAttribute("lang", savedLocale);
        } else if (typeof navigator !== "undefined" && navigator.language) {
          const navLang = navigator.language.toLowerCase();
          let detected = DEFAULT_LOCALE;
          if (navLang.includes("tw") || navLang.includes("hk") || navLang.includes("hant")) {
            detected = "zh-TW";
          } else if (navLang.startsWith("zh")) {
            detected = "zh-CN";
          } else if (navLang.startsWith("ja")) {
            detected = "ja";
          } else if (navLang.startsWith("ko")) {
            detected = "ko";
          } else if (navLang.startsWith("en")) {
            detected = "en";
          }
          setLocaleState(detected);
          document.documentElement.setAttribute("lang", detected);
        }
      } catch (e) {
        // LocalStorage access fallback
      }
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const setLocale = useCallback((newLocale) => {
    if (!LANGUAGES.some((l) => l.code === newLocale)) return;
    setLocaleState(newLocale);
    try {
      localStorage.setItem("pornmake_locale", newLocale);
      document.documentElement.setAttribute("lang", newLocale);
    } catch (e) {}
  }, []);

  const t = useCallback(
    (keyPath, params = {}) => {
      return getTranslation(locale, keyPath, params);
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, languages: LANGUAGES, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback if used outside Provider
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (keyPath, params) => getTranslation(DEFAULT_LOCALE, keyPath, params),
      languages: LANGUAGES,
      mounted: false,
    };
  }
  return context;
}
