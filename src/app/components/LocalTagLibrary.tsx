import { useRef, useState, type ChangeEvent } from "react";
import { Button, Flex } from "antd";
import { useTranslations } from "next-intl";
import { MAX_LIBRARY_BYTES, parseLocalTagLibrary, saveLocalTagLibrary } from "@/app/hooks/useLocalTagLibrary";
import type { TagItem } from "./types";

interface LocalTagLibraryProps {
  hasLibrary: boolean;
  ready: boolean;
  objects: string[];
  attributes: Record<string, string[]>;
  onImported: (firstTag: TagItem) => void;
}

export default function LocalTagLibrary({ hasLibrary, ready, objects, attributes, onImported }: LocalTagLibraryProps) {
  const t = useTranslations("ToolPage.localLibrary");
  const fileInput = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [feedback, setFeedback] = useState<"invalid" | "tooLarge" | "storageError" | "imported" | "cleared" | null>(null);

  async function importLibrary(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || hasLibrary || reading) return;
    setFeedback(null);
    if (file.size > MAX_LIBRARY_BYTES) {
      setFeedback("tooLarge");
      return;
    }
    setReading(true);
    try {
      let source: TagItem[];
      try {
        source = parseLocalTagLibrary(await file.text());
      } catch {
        setFeedback("invalid");
        return;
      }
      // 分类由 JSON 提供。命中内置分类时记录索引，切换界面语言后仍能找到。
      const tags = source.map((tag) => {
        const objectIndex = objects.indexOf(tag.object);
        const attributeIndex = objectIndex >= 0 ? attributes[tag.object]?.indexOf(tag.attribute) ?? -1 : -1;
        return {
          ...tag,
          objectIndex: objectIndex >= 0 ? objectIndex : undefined,
          attributeIndex: attributeIndex >= 0 ? attributeIndex : undefined,
        };
      });
      try {
        saveLocalTagLibrary(tags);
      } catch {
        setFeedback("storageError");
        return;
      }
      onImported(tags[0]);
      setFeedback("imported");
    } finally {
      setReading(false);
    }
  }

  function chooseFile() {
    setFeedback(null);
    fileInput.current?.click();
  }

  function clearLibrary() {
    try {
      saveLocalTagLibrary([]);
      setFeedback("cleared");
    } catch {
      setFeedback("storageError");
    }
  }

  return (
    <Flex wrap align="center" gap={8} className="pp-lib-row">
      <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={importLibrary} />
      <Button size="small" disabled={!ready} loading={reading} onClick={hasLibrary ? clearLibrary : chooseFile}>
        {t(hasLibrary ? "clear" : "import")}
      </Button>
      {feedback && (
        <span className="pp-lib-status" role="status">
          {t(feedback)}
        </span>
      )}
    </Flex>
  );
}
