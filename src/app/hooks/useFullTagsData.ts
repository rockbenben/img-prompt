"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { TagItem } from "@/app/components/types";
import { normalizeString } from "@/app/utils/normalizeString";
import { fetchChunk } from "./promptChunks";

const EMPTY_TAG: TagItem = { object: "", attribute: "", langName: "", displayName: "" };

export interface ScanEntry {
  tag: TagItem;
  dn: string;
  ln: string;
}

export interface UseFullTagsDataResult {
  scanEntries: ScanEntry[] | null;
  findTagData: (name: string) => TagItem;
  ensureLoaded: (immediate?: boolean) => void;
  status: "idle" | "loading" | "ready" | "error";
}

function indexTags(tags: TagItem[]) {
  const exact = new Map<string, TagItem>();
  const entries: ScanEntry[] = [];
  for (const tag of tags) {
    const dn = normalizeString(tag.displayName);
    const ln = normalizeString(tag.langName);
    exact.set(dn, tag);
    entries.push({ tag, dn, ln });
  }
  return { exact, entries };
}

// objectCount = 分块总数（每个 object 一块，由 sliceData.js 保证）。
// 必须由调用方从 bootstrap.objects 传入，写死常量会在数据加长后静默漏掉尾块。
// 全量拉取（~900KB raw / 语言）默认推迟到浏览器空闲（3s 兜底），并用 2 并发队列逐个取；
// 用户聚焦全局搜索框时传 immediate=true 立即启动，不白等 idle。
const scheduleIdle = (cb: () => void) => {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(cb, { timeout: 3000 });
  } else {
    setTimeout(cb, 200);
  }
};

export function useFullTagsData(locale: string, firstChunk: TagItem[], objectCount: number, customTags: TagItem[]): UseFullTagsDataResult {
  const [builtInIndex, setBuiltInIndex] = useState<ReturnType<typeof indexTags> | null>(null);
  const [status, setStatus] = useState<UseFullTagsDataResult["status"]>("idle");
  const firstChunkIndex = useMemo(() => indexTags(firstChunk), [firstChunk]);
  const customIndex = useMemo(() => indexTags(customTags), [customTags]);
  // 本地词库与首屏词条即时可搜，全量分块就绪后自动切到全库索引。
  const scanEntries = useMemo(() => {
    if (builtInIndex) return [...builtInIndex.entries, ...customIndex.entries];
    if (firstChunkIndex.entries.length || customIndex.entries.length) {
      return [...firstChunkIndex.entries, ...customIndex.entries];
    }
    return null;
  }, [builtInIndex, firstChunkIndex, customIndex]);
  const startedRef = useRef(false);
  const loadedRef = useRef(false);
  const idleScheduledRef = useRef(false);

  const runFetch = useCallback(() => {
    if (startedRef.current || loadedRef.current) return;
    startedRef.current = true;
    setStatus("loading");
    // 0..n-1 全走共享 fetchChunk：index 0 通常已被 useObjectTags 拉全或在途，这里零额外网络。
    const queue = Array.from({ length: Math.max(0, objectCount) }, (_, i) => i);
    const results = new Map<number, TagItem[]>();
    const worker = async (): Promise<void> => {
      for (;;) {
        const i = queue.shift();
        if (i === undefined) return;
        results.set(i, await fetchChunk(locale, i));
      }
    };
    // 等两个工作队列都结束再开放重试，避免上一次尚未结束的队列与重试重叠。
    void Promise.allSettled([worker(), worker()]).then((outcomes) => {
      const failure = outcomes.find((result) => result.status === "rejected");
      if (failure) {
        console.warn("[useFullTagsData] failed", failure.reason);
        startedRef.current = false; // 允许重试
        setStatus("error");
        return;
      }
      const merged = Array.from({ length: objectCount }, (_, i) => results.get(i) ?? []).flat();
      loadedRef.current = true;
      setBuiltInIndex(indexTags(merged));
      setStatus("ready");
    });
  }, [locale, objectCount]);

  const ensureLoaded = useCallback(
    (immediate = false) => {
      if (loadedRef.current || startedRef.current) return;
      if (immediate) {
        runFetch();
        return;
      }
      if (idleScheduledRef.current) return;
      idleScheduledRef.current = true;
      scheduleIdle(() => {
        idleScheduledRef.current = false;
        runFetch();
      });
    },
    [runFetch],
  );

  const findTagData = useCallback(
    (name: string): TagItem => {
      const normalized = normalizeString(name);
      const builtInExact = builtInIndex?.exact ?? firstChunkIndex.exact;
      return customIndex.exact.get(normalized) ?? builtInExact.get(normalized) ?? EMPTY_TAG;
    },
    [builtInIndex, customIndex, firstChunkIndex],
  );

  return { scanEntries, findTagData, ensureLoaded, status };
}
