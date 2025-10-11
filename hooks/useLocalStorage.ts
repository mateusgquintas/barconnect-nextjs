import { useState } from 'react';

/**
 * Hook utilitário para persistência reativa no localStorage.
 * @param key Chave do localStorage
 * @param initialValue Valor inicial (fallback caso não exista no localStorage)
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = () => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Silencioso
    }
  };

  const remove = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      // Silencioso
    }
  };

  return [storedValue, setValue, remove] as const;
}
