"use client";
import { useCallback, useRef, useState } from "react";
import { TagItem } from "@/app/components/types";
import { normalizeString } from "@/app/utils/normalizeString";
import { fetchChunk } from "./promptChunks";

const EMPTY_TAG: TagItem = { object: "", attribute: "", langName: "", displayName: "" };

export interface ScanEntry {
  tag: TagItem;
  dn: string;
  ln: string;
}

interface UseFullTagsDataResult {
  fullTags: TagItem[] | null;
  scanEntries: ScanEntry[] | null;
  findTagData: (name: string) => TagItem;
  ensureLoaded: () => void;
}

// objectCount = 分块总数（每个 object 一块，由 sliceData.js 保证）。
// 必须由调用方从 bootstrap.objects 传入，写死常量会在数据加长后静默漏掉尾块。
// 全量拉取（~900KB raw / 语言）不抢跑：推迟到浏览器空闲（3s 兜底），
// 并用 2 并发队列逐个取，避免一次并行 15 个请求挤掉用户正在触发的分类抓取。
// 触发点有两个（见 usePromptLogic）：点进提示词框，或挑下第一个标签。
const scheduleIdle = (cb: () => void) => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(cb, { timeout: 3000 });
  } else {
    setTimeout(cb, 200);
  }
};

export function useFullTagsData(locale: string, firstChunk: TagItem[], objectCount: number): UseFullTagsDataResult {
  const [fullTags, setFullTags] = useState<TagItem[] | null>(null);
  const [scanEntries, setScanEntries] = useState<ScanEntry[] | null>(null);
  const [exactIndex, setExactIndex] = useState<Map<string, TagItem>>(() => {
    const map = new Map<string, TagItem>();
    for (const tag of firstChunk) {
      map.set(normalizeString(tag.displayName), tag);
    }
    return map;
  });
  const loadingRef = useRef(false);

  const ensureLoaded = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    scheduleIdle(() => {
      // 0..n-1 全走共享 fetchChunk：index 0 通常已被 useObjectTags 拉全（截断
      // bootstrap 时代）或在途（去重命中 inflight），这里零额外网络。
      const queue = Array.from({ length: Math.max(0, objectCount) }, (_, i) => i);
      const results = new Map<number, TagItem[]>();
      const worker = async (): Promise<void> => {
        for (;;) {
          const i = queue.shift();
          if (i === undefined) return;
          results.set(i, await fetchChunk(locale, i));
        }
      };
      Promise.all([worker(), worker()])
        .then(() => {
          const merged: TagItem[] = [];
          for (const i of Array.from(results.keys()).sort((a, b) => a - b)) {
            for (const t of results.get(i)!) merged.push(t);
          }
          // 在 idle 调度异步任务中预计算归一化索引与扫描条目，避免在 React 渲染期占用主线程
          const map = new Map<string, TagItem>();
          const entries: ScanEntry[] = [];
          for (const tag of merged) {
            const dn = normalizeString(tag.displayName || "");
            const ln = normalizeString((tag.langName as string) || "");
            map.set(dn, tag);
            entries.push({ tag, dn, ln });
          }
          setExactIndex(map);
          setScanEntries(entries);
          setFullTags(merged);
        })
        .catch((err) => {
          console.warn("[useFullTagsData] failed", err);
          loadingRef.current = false; // 允许重试
        });
    });
  }, [locale, objectCount]);

  const findTagData = useCallback(
    (name: string): TagItem => {
      const normalized = normalizeString(name);
      let found = exactIndex.get(normalized);
      if (!found) found = exactIndex.get(normalized.replace(/ /g, "_"));
      return found ?? EMPTY_TAG;
    },
    [exactIndex],
  );

  return { fullTags, scanEntries, findTagData, ensureLoaded };
}
