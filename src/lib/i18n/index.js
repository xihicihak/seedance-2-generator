import en from "./locales/en";
import zhCN from "./locales/zh-CN";
import zhTW from "./locales/zh-TW";
import ja from "./locales/ja";
import ko from "./locales/ko";
import { LANGUAGES, DEFAULT_LOCALE } from "./languages";

export const translations = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  ja,
  ko,
};

export function getTranslation(locale, keyPath, params = {}) {
  const selectedLocale = translations[locale] ? locale : DEFAULT_LOCALE;
  const dict = translations[selectedLocale] || translations[DEFAULT_LOCALE] || translations.en;
  const fallbackDict = translations.en;

  const resolveKey = (source, path) => {
    if (!source || !path) return undefined;
    const parts = path.split(".");
    let current = source;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  };

  let value = resolveKey(dict, keyPath);
  if (value === undefined) {
    value = resolveKey(fallbackDict, keyPath);
  }

  if (value === undefined) {
    return keyPath;
  }

  if (typeof value === "string" && params && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
  }

  return value;
}

export { LANGUAGES, DEFAULT_LOCALE };
