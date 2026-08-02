"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { BASE_PATH } from "@/app/utils/basePath";
import { TagItem } from "@/app/components/types";
import { normalizeString } from "@/app/utils/normalizeString";

const EMPTY_TAG: TagItem = { object: "", attribute: "", langName: "", displayName: "" };

interface UseFullTagsDataResult {
  fullTags: TagItem[] | null;
  findTagData: (name: string) => TagItem;
  ensureLoaded: () => void;
}

// objectCount = 分块总数（每个 object 一块，由 sliceData.js 保证）。
// 必须由调用方从 bootstrap.objects 传入，写死常量会在数据加长后静默漏掉尾块。
export function useFullTagsData(locale: string, firstChunk: TagItem[], objectCount: number): UseFullTagsDataResult {
  const [fullTags, setFullTags] = useState<TagItem[] | null>(null);
  const loadingRef = useRef(false);

  const ensureLoaded = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const others = Array.from({ length: Math.max(0, objectCount - 1) }, (_, i) =>
      fetch(`${BASE_PATH}/data/prompt-chunks/${locale}/${i + 1}.json`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} for chunk ${i + 1}`);
        return r.json() as Promise<TagItem[]>;
      }),
    );
    Promise.all(others)
      .then((chunks) => {
        const merged: TagItem[] = [];
        for (const t of firstChunk) merged.push(t);
        for (const chunk of chunks) for (const t of chunk) merged.push(t);
        setFullTags(merged);
      })
      .catch((err) => {
        console.warn("[useFullTagsData] failed", err);
        loadingRef.current = false; // 允许重试
      });
  }, [locale, firstChunk, objectCount]);

  // findTagData：fullTags 优先；未加载时退化到 firstChunk
  const exactIndex = useMemo(() => {
    const map = new Map<string, TagItem>();
    const source = fullTags ?? firstChunk;
    for (const tag of source) {
      map.set(normalizeString(tag.displayName), tag);
    }
    return map;
  }, [fullTags, firstChunk]);

  const findTagData = useCallback(
    (name: string): TagItem => {
      const normalized = normalizeString(name);
      let found = exactIndex.get(normalized);
      if (!found) found = exactIndex.get(normalized.replace(/ /g, "_"));
      return found ?? EMPTY_TAG;
    },
    [exactIndex],
  );

  return { fullTags, findTagData, ensureLoaded };
}
