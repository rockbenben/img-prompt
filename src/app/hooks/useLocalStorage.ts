import { useCallback, useEffect, useState } from "react";

// SSG 安全：首屏一律渲染 defaultValue，挂载后再读存档（避免 hydration 不一致）。
// 写入放在 setter 里而非 effect：effect 写会在读回存档前先把默认值刷回去。
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw === null) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(JSON.parse(raw) as T);
    } catch {
      /* 损坏的存档直接忽略 */
    }
  }, [key]);

  const store = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* 配额/隐私模式下静默放弃 */
      }
    },
    [key],
  );

  return [value, store] as const;
}
