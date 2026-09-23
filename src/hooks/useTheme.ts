import { useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark';
const storageKey = 'padel-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  );
  const manualChoice = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      manualChoice.current = saved === 'light' || saved === 'dark';
    } catch { /* Theme switching also works when storage is unavailable. */ }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncSystemTheme = () => {
      if (!manualChoice.current) setTheme(media.matches ? 'dark' : 'light');
    };
    syncSystemTheme();
    media.addEventListener('change', syncSystemTheme);
    return () => media.removeEventListener('change', syncSystemTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    manualChoice.current = true;
    setTheme(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Keep in-memory choice. */ }
  }

  return { theme, toggleTheme };
}
