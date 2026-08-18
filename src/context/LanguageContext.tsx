import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import mmTranslations from '../locales/mm.json';
import { Currency, Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  toggleCurrency: () => void;
  exchangeRate: number; // MMK per 1 THB (e.g. 135)
  setExchangeRate: (rate: number) => void;
  t: (keyPath: string, fallback?: string) => string;
  formatMMK: (amount: number) => string;
  formatTHB: (amount: number) => string;
  formatUSDT: (amount: number) => string;
  convertMMKtoTHB: (amountMMK: number) => number;
  formatPrice: (amountMMK: number, overrideCurrency?: Currency) => string;
  formatDualPrice: (amountMMK: number) => { primary: string; secondary: string };
  isMM: boolean;
}

const dictionaries = {
  en: enTranslations,
  mm: mmTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('gamezay_language');
      if (saved === 'en' || saved === 'mm') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en'; // default English with instant MM switch
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('gamezay_currency');
      if (saved === 'MMK' || saved === 'THB') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'MMK'; // Base Currency MMK
  });

  // Daily exchange rate (e.g., 1 THB = 135 MMK)
  const [exchangeRate, setExchangeRateState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gamezay_exchange_rate');
      if (saved && !isNaN(Number(saved)) && Number(saved) > 0) {
        return Number(saved);
      }
    } catch {
      // ignore
    }
    return 135; // Default 1 THB = 135 MMK
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('gamezay_language', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mm' : 'en');
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem('gamezay_currency', curr);
    } catch {
      // ignore
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'MMK' ? 'THB' : 'MMK');
  };

  const setExchangeRate = (rate: number) => {
    if (rate > 0) {
      setExchangeRateState(rate);
      try {
        localStorage.setItem('gamezay_exchange_rate', rate.toString());
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = language === 'mm' ? 'my' : 'en';
  }, [language]);

  // Nested dictionary resolver e.g. "hero.title" -> "Buy & Sell..."
  const t = (keyPath: string, fallback?: string): string => {
    const dict = dictionaries[language] || dictionaries.en;
    const keys = keyPath.split('.');
    
    let result: any = dict;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        // Fallback to English if missing in MM
        let fallbackResult: any = dictionaries.en;
        for (const fbKey of keys) {
          if (fallbackResult && typeof fallbackResult === 'object' && fbKey in fallbackResult) {
            fallbackResult = fallbackResult[fbKey];
          } else {
            return fallback || keyPath;
          }
        }
        return typeof fallbackResult === 'string' ? fallbackResult : fallback || keyPath;
      }
    }
    return typeof result === 'string' ? result : fallback || keyPath;
  };

  // Convert numbers to Burmese digits if language is MM
  const toBurmeseDigits = (numStr: string): string => {
    const burmeseDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return numStr.replace(/[0-9]/g, (digit) => burmeseDigits[parseInt(digit, 10)]);
  };

  const formatMMK = (amount: number): string => {
    const formatted = new Intl.NumberFormat('en-US').format(Math.round(amount));
    if (language === 'mm') {
      return `${toBurmeseDigits(formatted)} ကျပ်`;
    }
    return `${formatted} MMK`;
  };

  const convertMMKtoTHB = (amountMMK: number): number => {
    const rate = exchangeRate > 0 ? exchangeRate : 135;
    return Math.round((amountMMK / rate) * 10) / 10;
  };

  const formatTHB = (amount: number): string => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `฿${formatted}`;
  };

  const formatUSDT = (amount: number): string => {
    return `$${amount.toFixed(2)} USDT`;
  };

  const formatPrice = (amountMMK: number, overrideCurrency?: Currency): string => {
    const activeCurr = overrideCurrency || currency;
    if (activeCurr === 'THB') {
      const thb = convertMMKtoTHB(amountMMK);
      return formatTHB(thb);
    }
    return formatMMK(amountMMK);
  };

  const formatDualPrice = (amountMMK: number): { primary: string; secondary: string } => {
    if (currency === 'THB') {
      const thb = convertMMKtoTHB(amountMMK);
      return {
        primary: formatTHB(thb),
        secondary: `≈ ${formatMMK(amountMMK)} (1฿ = ${exchangeRate} Ks)`,
      };
    }
    const thb = convertMMKtoTHB(amountMMK);
    return {
      primary: formatMMK(amountMMK),
      secondary: `≈ ${formatTHB(thb)}`,
    };
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        currency,
        setCurrency,
        toggleCurrency,
        exchangeRate,
        setExchangeRate,
        t,
        formatMMK,
        formatTHB,
        formatUSDT,
        convertMMKtoTHB,
        formatPrice,
        formatDualPrice,
        isMM: language === 'mm',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
