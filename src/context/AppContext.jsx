import React, { createContext, useContext, useState, useEffect } from 'react';

export const CURRENCY_MAP = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  PKR: { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee (Rs / PKR)' },
  SAR: { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal (SR / SAR)' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc (Fr)' },
};

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('app-currency') || 'USD';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('app-currency', newCurrency);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const currencySymbol = CURRENCY_MAP[currency]?.symbol || '$';

  const value = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    currency,
    currencySymbol,
    setCurrency,
    theme,
    setTheme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);


