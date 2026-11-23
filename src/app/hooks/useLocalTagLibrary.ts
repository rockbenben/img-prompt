import { useMemo, useSyncExternalStore } from "react";
import type { TagItem } from "@/app/components/types";

const STORAGE_KEY = "imgprompt-local-tag-library";
const CHANGE_EVENT = "imgprompt-local-tag-library-change";
export const LEGACY_LIBRARY_ID = "legacy";
export const MAX_LIBRARY_BYTES = 2 * 1024 * 1024;

export interface LocalLibraryTag extends TagItem {
  objectIndex?: number;
  attributeIndex?: number;
}

interface StoredLibrary {
  id: string;
  tags: LocalLibraryTag[];
}

function parseTags(entries: unknown, stored = false): LocalLibraryTag[] {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error("Empty tag library");

  const tags = new Map<string, LocalLibraryTag>();
  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Invalid tag");
    const { object, attribute, displayName, langName, description, preview } = entry as Record<string, unknown>;
    if (typeof object !== "string" || !object.trim()
      || typeof attribute !== "string" || !attribute.trim()
      || typeof displayName !== "string" || !displayName.trim() || /，|, /.test(displayName)
      || (langName !== undefined && typeof langName !== "string")
      || (description !== undefined && typeof description !== "string")
      || (preview !== undefined && typeof preview !== "string")) {
      throw new Error("Invalid tag fields");
    }
    const tag: LocalLibraryTag = {
      object: object.trim(),
      attribute: attribute.trim(),
      displayName: displayName.trim(),
      langName: typeof langName === "string" ? langName.trim() : "",
    };
    if (description) tag.description = description;
    // 私有词库的预览只用内嵌位图，避免悬停时访问文件里的外部地址。
    if (preview && /^data:image\/(?:png|jpeg|gif|webp|avif);base64,[A-Za-z0-9+/]+=*$/.test(preview)) {
      tag.preview = preview;
    }
    if (stored) {
      const { objectIndex, attributeIndex } = entry as Record<string, unknown>;
      if (typeof objectIndex === "number" && Number.isSafeInteger(objectIndex) && objectIndex >= 0) tag.objectIndex = objectIndex;
      if (typeof attributeIndex === "number" && Number.isSafeInteger(attributeIndex) && attributeIndex >= 0) tag.attributeIndex = attributeIndex;
    }
    tags.set(JSON.stringify([tag.object, tag.attribute, tag.displayName]), tag);
  }
  return Array.from(tags.values());
}

export function parseLocalTagLibrary(text: string): TagItem[] {
  return parseTags(JSON.parse(text.replace(/^\uFEFF/, "")));
}

function readLibrary(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function saveLocalTagLibrary(tags: LocalLibraryTag[]) {
  if (tags.length > 0) {
    const id = Array.from(crypto.getRandomValues(new Uint32Array(4)), (part) => part.toString(16).padStart(8, "0")).join("");
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, tags } satisfies StoredLibrary));
  } else localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useLocalTagLibrary() {
  // 使用原始字符串做快照，避免每次读存储都产生新数组。
  const stored = useSyncExternalStore(subscribe, readLibrary, () => undefined);
  const library = useMemo<StoredLibrary | null>(() => {
    if (!stored) return null;
    try {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return { id: LEGACY_LIBRARY_ID, tags: parseTags(parsed) };
      if (!parsed || typeof parsed !== "object") return null;
      const { id, tags } = parsed as Record<string, unknown>;
      return typeof id === "string" && id ? { id, tags: parseTags(tags, true) } : null;
    } catch {
      return null;
    }
  }, [stored]);
  return { library, libraryReady: stored !== undefined };
}
