import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

import enStrings from './en';
import arStrings from './ar';

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

// RTL configuration
export const RTL_LANGUAGES: Language[] = ['ar'];

// Default to 'en' - detect device language lazily to avoid native module errors at import time
const defaultLanguage: Language = 'en';

// Initialize i18n synchronously with default language
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enStrings,
      },
      ar: {
        translation: arStrings,
      },
    },
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Detect device language asynchronously after init
const detectAndApplyLanguage = async (): Promise<void> => {
  try {
    const locales = Localization.getLocales?.();
    const deviceLocale = locales?.[0]?.languageCode;
    if (deviceLocale && SUPPORTED_LANGUAGES.includes(deviceLocale as Language)) {
      const lang = deviceLocale as Language;
      const isRTL = RTL_LANGUAGES.includes(lang);
      if (isRTL !== I18nManager.isRTL) {
        I18nManager.forceRTL(isRTL);
      }
      await i18n.changeLanguage(lang);
    }
  } catch {
    // Localization API unavailable, keep default
  }
};

// Fire and forget - will apply on next render cycle
detectAndApplyLanguage();

export default i18n;

// Helper function to change language
export const changeLanguage = async (lang: Language) => {
  await i18n.changeLanguage(lang);
  const shouldBeRTL = RTL_LANGUAGES.includes(lang);
  if (shouldBeRTL !== I18nManager.isRTL) {
    I18nManager.forceRTL(shouldBeRTL);
  }
};

// Re-export for convenience
export { enStrings, arStrings };
