import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { App } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { TagItem } from "../types";
import { normalizeString } from "@/app/utils/normalizeString";
import { translateText } from "@/app/utils/translateAPI";
import { colorArray } from "@/app/data/constants";

// Helper for translation normalization
const normalizeForTranslation = (text: string) => text.trim().replace(/[,，]\s*$/, "");
const getRandomColor = () => colorArray[Math.floor(Math.random() * colorArray.length)];

interface UsePromptLogicProps {
  selectedTags: TagItem[];
  setSelectedTags: (tags: TagItem[]) => void;
  tagsData: TagItem[];
}

export function usePromptLogic({ selectedTags, setSelectedTags, tagsData }: UsePromptLogicProps) {
  const { message } = App.useApp();
  const t = useTranslations("ResultSection");
  const locale = useLocale();

  const [resultText, setResultText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<TagItem[]>([]);
  const [exactMatchTag, setExactMatchTag] = useState<TagItem | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const lastTranslatedSource = useRef<string>("");

  // Tag Search Logic
  const findTagData = useMemo(() => {
    const tagMap = new Map(tagsData.map((tag) => [normalizeString(tag.displayName || ""), tag]));

    return (displayName: string) => {
      const normalizedDisplayName = normalizeString(displayName);
      let foundTag = tagMap.get(normalizedDisplayName);

      if (!foundTag) {
        const modifiedDisplayName = normalizedDisplayName.replace(/ /g, "_");
        foundTag = tagMap.get(modifiedDisplayName);
      }

      return (
        foundTag || {
          object: "",
          attribute: "",
          langName: "",
          displayName: "",
        }
      );
    };
  }, [tagsData]);

  // Sync selectedTags to resultText (when tags change externally or via click)
  useEffect(() => {
    if (!isComposing && selectedTags.length > 0) {
      const newText = selectedTags
        .map((tag) => tag.displayName)
        .filter(Boolean)
        .join(", ");
      setResultText(newText);
    } else if (selectedTags.length === 0) {
      setResultText("");
    }
  }, [selectedTags, isComposing]);

  // Auto Translate Logic (Debounced)
  useEffect(() => {
    const normalizedText = normalizeForTranslation(resultText);
    if (!normalizedText || normalizedText === lastTranslatedSource.current) return;

    if (locale === "en") {
      setTranslatedText(resultText);
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (!resultText.trim()) {
        setTranslatedText("");
        return;
      }

      try {
        setIsTranslating(true);
        const translated = await translateText(resultText, "en", locale);
        setTranslatedText(translated);
        lastTranslatedSource.current = normalizeForTranslation(resultText);
      } catch (error) {
        console.warn("自动翻译失败:", error);
        setTranslatedText("");
      } finally {
        setIsTranslating(false);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [resultText, locale]);

  // Tag Suggestion Logic
  useEffect(() => {
    const lastTagName = normalizeString(resultText.split(", ").pop()?.trim() || "");
    if (!lastTagName) {
      setSuggestedTags([]);
      setExactMatchTag(null);
      return;
    }
    if (exactMatchTag) {
      setExactMatchTag(null);
    }

    const getRecommendedTags = (searchField: keyof TagItem) =>
      tagsData
        .filter((tag) => {
          const normalizedField = normalizeString((tag[searchField] as string) || "");
          if (normalizedField === lastTagName) {
            setExactMatchTag(tag);
            return false;
          }
          return normalizedField.includes(lastTagName);
        })
        .sort((a, b) => {
          const aNormalized = normalizeString((a[searchField] as string) || "");
          const bNormalized = normalizeString((b[searchField] as string) || "");
          const aStartsWithTag = aNormalized.startsWith(lastTagName);
          const bStartsWithTag = bNormalized.startsWith(lastTagName);

          if (aStartsWithTag !== bStartsWithTag) {
            return aStartsWithTag ? -1 : 1;
          }
          return aNormalized.localeCompare(bNormalized);
        });

    let recommendedTags = getRecommendedTags("displayName");
    if (recommendedTags.length === 0) {
      recommendedTags = getRecommendedTags("langName");
    }

    setSuggestedTags(recommendedTags.slice(0, 10));
  }, [resultText, tagsData, exactMatchTag]);

  // Handlers
  const handleResultTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let newText = e.target.value;
      if (newText.endsWith(",") || newText.endsWith("，")) {
        newText = newText.slice(0, -1).replace(/,\s*$/g, "") + ", ";
        setResultText(newText);
        return;
      }

      setResultText(newText);

      const newSelectedTags = newText
        .split(", ")
        .filter((displayName) => displayName?.trim())
        .map((displayName) => ({
          ...findTagData(displayName),
          displayName,
        }));

      setSelectedTags(newSelectedTags);
    },
    [findTagData, setSelectedTags],
  );

  const handleBlur = useCallback(() => {
    let replacedText = resultText
      .replace(/，/g, ", ")
      .replace(/\s+,\s*/g, ", ")
      .replace(/\s+/g, " ");

    const displayNames = replacedText.split(", ").filter((name) => name.trim() !== "");
    const uniqueDisplayNames = Array.from(new Set(displayNames.map((displayName) => normalizeString(displayName))));

    const selectedTags = uniqueDisplayNames.map((displayName) => {
      const { object, attribute, langName, displayName: foundDisplayName } = findTagData(displayName);
      return {
        object,
        displayName: foundDisplayName || displayName,
        attribute,
        langName,
      };
    });

    setSelectedTags(selectedTags);
    setResultText(selectedTags.map((tag) => tag.displayName).join(", "));
    setIsComposing(false);
  }, [resultText, findTagData, setSelectedTags]);

  const handleSuggestTagClick = useCallback(
    (tag: TagItem) => {
      // Note: accessing selectedTags directly here might be stale if strict mode, but usually fine in event handler if deps correct.
      // However, since we need proper accumulated tags, we should probably rely on proper state update patterns or refs if needed.
      // For now, mirroring original logic which used state directly.

      // We need to use the functional update or the prop
      // But since selectedTags is passed in, we depend on it.

      const newSelectedTags = [...selectedTags];
      if (newSelectedTags.length > 0) {
        newSelectedTags[newSelectedTags.length - 1] = tag;
      } else {
        newSelectedTags.push(tag);
      }

      setSelectedTags(newSelectedTags);
      setResultText(newSelectedTags.map((t) => t.displayName).join(", "));
    },
    [selectedTags, setSelectedTags],
  );

  const handleConstantText = useCallback(
    (constantText: string, successMessageKey: string) => {
      const newText = resultText ? resultText + ", " + constantText : constantText;
      const displayNames = newText.split(", ").filter(Boolean);
      const uniqueDisplayNames = Array.from(new Set(displayNames));

      const newSelectedTags = uniqueDisplayNames.map((displayName) => {
        const { object, attribute, langName, displayName: foundDisplayName } = findTagData(displayName);
        return {
          object,
          displayName: foundDisplayName || displayName,
          attribute,
          langName,
        };
      });

      setSelectedTags(newSelectedTags);
      setResultText(uniqueDisplayNames.join(", "));
      message.success(t(successMessageKey));
    },
    [resultText, findTagData, setSelectedTags, message, t],
  );

  const handleClear = useCallback(() => {
    setSelectedTags([]);
    setResultText("");
    message.success(t("clearSuccess"));
  }, [setSelectedTags, message, t]);

  const handleColorReplace = useCallback(() => {
    let updatedText = resultText;
    const combinedColorRegex = new RegExp(`\\b(${colorArray.join("|")})\\b`, "gi");
    const matches = updatedText.match(combinedColorRegex);
    if (matches && matches.length > 0) {
      updatedText = updatedText.replace(combinedColorRegex, (match) => {
        const newColor = getRandomColor();
        return newColor;
      });
      setResultText(updatedText);
      message.success(`Successfully replaced ${matches.length} color matches.`);
    } else {
      message.info("No color matches found to replace.");
    }
  }, [resultText, message]);

  // Manual Translate Logic
  const [inputText, setInputText] = useState("");

  const handleTranslate = useCallback(async () => {
    try {
      const translatedText = await translateText(inputText, "auto", "en");
      if (translatedText.trim()) {
        handleConstantText(translatedText, "translateSuccess");
        setInputText("");
      } else {
        message.error(t("translateEmptyError"));
      }
    } catch (error) {
      message.error(t("translateFailError"));
    }
  }, [inputText, t, handleConstantText, message]);

  return {
    resultText,
    setResultText,
    translatedText,
    isTranslating,
    suggestedTags,
    exactMatchTag,
    isComposing,
    setIsComposing,
    handleResultTextChange,
    handleBlur,
    handleSuggestTagClick,
    handleConstantText,
    handleClear,
    handleColorReplace,
    t,
    inputText,
    setInputText,
    handleTranslate,
  };
}
