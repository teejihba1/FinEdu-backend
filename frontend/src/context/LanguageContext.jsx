import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { storage } from "../utils/helpers";
import { STORAGE_KEYS, LANGUAGES } from "../utils/constants";

// Language context
const LanguageContext = createContext();

// Available languages with metadata
const LANGUAGE_OPTIONS = [
  {
    code: LANGUAGES.EN,
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    direction: "ltr",
  },
  {
    code: LANGUAGES.HI,
    name: "Hindi",
    nativeName: "हिंदी",
    flag: "🇮🇳",
    direction: "ltr",
  },
  {
    code: LANGUAGES.KN,
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flag: "🇮🇳",
    direction: "ltr",
  },
];

// Language provider component
export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(
    storage.get(STORAGE_KEYS.LANGUAGE) || LANGUAGES.EN,
  );
  const [isRTL, setIsRTL] = useState(false);

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        await i18n.changeLanguage(currentLanguage);

        // Set document direction and lang attribute
        const languageOption = LANGUAGE_OPTIONS.find(
          (lang) => lang.code === currentLanguage,
        );
        if (languageOption) {
          document.documentElement.lang = currentLanguage;
          document.documentElement.dir = languageOption.direction;
          setIsRTL(languageOption.direction === "rtl");
        }

        // Store in localStorage
        storage.set(STORAGE_KEYS.LANGUAGE, currentLanguage);
      } catch (error) {
        console.error("Failed to initialize language:", error);
      }
    };

    initializeLanguage();
  }, [currentLanguage, i18n]);

  // Change language function
  const changeLanguage = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);

      // Update document attributes
      const languageOption = LANGUAGE_OPTIONS.find(
        (lang) => lang.code === languageCode,
      );
      if (languageOption) {
        document.documentElement.lang = languageCode;
        document.documentElement.dir = languageOption.direction;
        setIsRTL(languageOption.direction === "rtl");
      }

      // Store preference
      storage.set(STORAGE_KEYS.LANGUAGE, languageCode);

      return { success: true };
    } catch (error) {
      console.error("Failed to change language:", error);
      return { success: false, error: error.message };
    }
  };

  // Get current language details
  const getCurrentLanguage = () => {
    return (
      LANGUAGE_OPTIONS.find((lang) => lang.code === currentLanguage) ||
      LANGUAGE_OPTIONS[0]
    );
  };

  // Get all available languages
  const getAvailableLanguages = () => {
    return LANGUAGE_OPTIONS;
  };

  // Format number according to current locale
  const formatNumber = (number, options = {}) => {
    const locale =
      currentLanguage === LANGUAGES.HI
        ? "hi-IN"
        : currentLanguage === LANGUAGES.KN
          ? "kn-IN"
          : "en-IN";

    return new Intl.NumberFormat(locale, options).format(number);
  };

  // Format currency according to current locale
  const formatCurrency = (amount, currency = "INR") => {
    const locale =
      currentLanguage === LANGUAGES.HI
        ? "hi-IN"
        : currentLanguage === LANGUAGES.KN
          ? "kn-IN"
          : "en-IN";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Format date according to current locale
  const formatDate = (date, options = {}) => {
    const locale =
      currentLanguage === LANGUAGES.HI
        ? "hi-IN"
        : currentLanguage === LANGUAGES.KN
          ? "kn-IN"
          : "en-IN";

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    }).format(new Date(date));
  };

  // Get localized content based on current language
  const getLocalizedContent = (contentObject, fallbackKey = "en") => {
    if (typeof contentObject === "string") return contentObject;

    return (
      contentObject?.[currentLanguage] ||
      contentObject?.[fallbackKey] ||
      contentObject?.en ||
      ""
    );
  };

  // Check if current language is supported
  const isLanguageSupported = (languageCode) => {
    return LANGUAGE_OPTIONS.some((lang) => lang.code === languageCode);
  };

  // Detect browser language and suggest if different from current
  const detectBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.languages?.[0];
    const detectedCode = browserLang?.split("-")[0];

    if (isLanguageSupported(detectedCode) && detectedCode !== currentLanguage) {
      return detectedCode;
    }

    return null;
  };

  // Pluralization helper for different languages
  const plural = (count, singular, plural, zero = null) => {
    if (zero !== null && count === 0) return zero;

    // Hindi and Kannada have different pluralization rules
    if (currentLanguage === LANGUAGES.HI || currentLanguage === LANGUAGES.KN) {
      return count === 1 ? singular : plural;
    }

    // English pluralization
    return count === 1 ? singular : plural;
  };

  // Text direction helpers
  const getTextDirection = () => (isRTL ? "rtl" : "ltr");
  const getTextAlign = (align = "left") => {
    if (!isRTL) return align;
    return align === "left" ? "right" : align === "right" ? "left" : align;
  };

  // Language-specific input validation
  const validateInput = (value, type) => {
    switch (type) {
      case "phone":
        // Indian phone number validation
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(value.replace(/\D/g, ""));

      case "name":
        // Support for Indian names with regional characters
        const nameRegex =
          currentLanguage === LANGUAGES.HI
            ? /^[\u0900-\u097F\s]+$/ // Devanagari
            : currentLanguage === LANGUAGES.KN
              ? /^[\u0C80-\u0CFF\s]+$/ // Kannada
              : /^[a-zA-Z\s]+$/; // English
        return nameRegex.test(value);

      default:
        return true;
    }
  };

  const value = {
    currentLanguage,
    isRTL,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    formatNumber,
    formatCurrency,
    formatDate,
    getLocalizedContent,
    isLanguageSupported,
    detectBrowserLanguage,
    plural,
    getTextDirection,
    getTextAlign,
    validateInput,
    t, // Expose translation function
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
