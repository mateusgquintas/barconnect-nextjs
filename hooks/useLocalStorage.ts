import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {

  const isClient = typeof window !== 'undefined';
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (isClient) {
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item ? JSON.parse(item) : initialValue);
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}