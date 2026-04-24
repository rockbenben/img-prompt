import { useCallback, useMemo, useSyncExternalStore } from "react";

export const loadFromLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  const storedValue = localStorage.getItem(key);
  if (storedValue === null) return null;

  try {
    return JSON.parse(storedValue);
  } catch {
    return null; // 避免返回无法解析的原始字符串
  }
};

export const saveToLocalStorage = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key "${key}" to localStorage:`, error);
  }
};

// useSyncExternalStore 订阅函数：监听 key 对应的 localStorage 变化（含同 tab 通过手动 dispatch 通知）
const createSubscribe = (key: string) => (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === null || e.key === key) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  }, [key]);

  const getServerSnapshot = useCallback(() => null, []);

  const subscribe = useMemo(() => createSubscribe(key), [key]);

  const storedString = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<T>(() => {
    if (storedString === null) return defaultValue;
    try {
      return JSON.parse(storedString) as T;
    } catch {
      return defaultValue;
    }
  }, [storedString, defaultValue]);

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      if (typeof window === "undefined") return;
      const finalValue = newValue instanceof Function ? newValue(value) : newValue;
      try {
        const serialized = JSON.stringify(finalValue);
        localStorage.setItem(key, serialized);
        // 原生 storage 事件仅跨 tab 触发；手动 dispatch 通知同 tab 订阅者
        window.dispatchEvent(new StorageEvent("storage", { key, newValue: serialized }));
      } catch (error) {
        console.error(`Error saving key "${key}" to localStorage:`, error);
      }
    },
    [key, value],
  );

  return [value, setValue] as const;
}
