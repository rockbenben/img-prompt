"use client";
import { useCallback, useEffect, useState } from "react";
import { TagItem } from "@/app/components/types";
import { cacheKey, fetchChunk, tagCache } from "./promptChunks";

// seededLocales 只在「firstChunk 是全集」时把它注入 index 0 缓存；
// bootstrap 裁剪后 firstChunk 是子集，必须走真实抓取补全（见下方占位分支）。
const seededLocales = new Set<string>();

export type TagsStatus = "ready" | "loading" | "error";

// 分块 19–163KB，移动网络下抓取要一两秒。此前抓取中一律返回 []，选词区
// 塌成一条空壳，读起来像「这个分类没有标签」而不是「正在加载」；抓取失败
// 更只有一行 console.warn，界面永远停在那个空壳。返回状态让 UI 说得出话。
export function useObjectTags(
  locale: string,
  objectIndex: number,
  firstChunk: TagItem[],
  firstChunkTotal: number,
): { tags: TagItem[]; status: TagsStatus; retry: () => void } {
  const truncatedSeed = firstChunk.length !== firstChunkTotal;
  // 每个 locale 第一次见到时，把 firstChunk 注入该 locale 的 index 0
  if (!seededLocales.has(locale) && !truncatedSeed) {
    seededLocales.add(locale);
    tagCache.set(cacheKey(locale, 0), firstChunk);
  }

  const key = cacheKey(locale, objectIndex);
  // 同步读取缓存：命中即在本次渲染立刻返回，避免切对象时的一帧空白
  const cached = tagCache.get(key);

  // 抓取结果必须经由 state 交出去，不能只靠上面那行读 tagCache。
  //
  // 看起来它是冗余的——tagCache.set 一定在 setState 之前执行，「从 state 取 data」
  // 按普通 React 语义永远走不到。但本项目开了 reactCompiler（next.config.ts），
  // 编译器会把渲染期的 tagCache.get(key) 当成由 key 决定的纯计算记忆化掉：
  // 抓取完成触发重渲染时，读到的仍是记忆化的 undefined，界面永远停在 loading。
  // 实测删掉这个 state 后，除缓存里预置过的分类外，所有分类都转圈。
  const [fetched, setFetched] = useState<{ key: string; data: TagItem[] } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  // 失败后重试：key 没变，靠这个计数把 effect 再踢一次
  const [attempt, setAttempt] = useState(0);

  // 切分类时撤掉失败标记。失败过的分类不会进 tagCache，切走再切回来一定会重新
  // 发起抓取，而 failedKey 仍等于 key —— 界面就在「已经在抓」的时候显示「载入
  // 失败 / 重试」，点一下还会并发再抓一份同样的 19–163KB 分块。
  // 写在渲染期而不是 effect 里：React 会立刻用新 state 重跑本次渲染且不提交，
  // 因此不会先闪一帧错误态（放 effect 里会，且违反 set-state-in-effect）。
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setFailedKey(null);
  }

  useEffect(() => {
    // 已缓存——渲染期的同步读取已经返回了，不必再抓
    if (tagCache.has(key)) return;
    let canceled = false;
    fetchChunk(locale, objectIndex)
      .then((data) => {
        if (canceled) return;
        setFetched({ key, data });
      })
      .catch((err) => {
        if (canceled) return;
        console.warn(`[useObjectTags] failed locale=${locale} index=${objectIndex}`, err);
        setFailedKey(key);
      });
    return () => {
      canceled = true;
    };
  }, [key, locale, objectIndex, attempt]);

  const retry = useCallback(() => {
    setFailedKey(null);
    setAttempt((n) => n + 1);
  }, []);

  if (cached) return { tags: cached, status: "ready", retry };
  if (fetched && fetched.key === key) return { tags: fetched.data, status: "ready", retry };
  if (objectIndex === 0 && truncatedSeed && firstChunk.length > 0 && failedKey !== key) {
    // bootstrap 是截断子集：先占位显示首屏那几十条（效果等同全集时代的 SSG 内联），
    // effect 正在补全量 chunk 0，落地后自动切全量。
    return { tags: firstChunk, status: "ready", retry };
  }
  return { tags: [], status: failedKey === key ? "error" : "loading", retry };
}
