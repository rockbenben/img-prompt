"use client";
import { BASE_PATH } from "@/app/utils/basePath";
import { TagItem } from "@/app/components/types";

// 模块级缓存：按 locale + objectIndex 组合键，避免「切语言一定整路由重挂载」这一隐式假设。
// 模块级而非 useRef 的原因见 useObjectTags 头注释（渲染期可读、跨实例共享）。
// useObjectTags（分类视图）与 useFullTagsData（推荐全量）共用这一份，
// inflight 让两条路径并发要同一块时只发一次请求。
export const tagCache = new Map<string, TagItem[]>();
const inflight = new Map<string, Promise<TagItem[]>>();

export const cacheKey = (locale: string, objectIndex: number) => `${locale}:${objectIndex}`;

export function fetchChunk(locale: string, objectIndex: number): Promise<TagItem[]> {
  const key = cacheKey(locale, objectIndex);
  const hit = tagCache.get(key);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(key);
  if (pending) return pending;
  const p = fetch(`${BASE_PATH}/data/prompt-chunks/${locale}/${objectIndex}.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} for chunk ${objectIndex}`);
      return r.json() as Promise<TagItem[]>;
    })
    .then((data) => {
      tagCache.set(key, data);
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });
  inflight.set(key, p);
  return p;
}
