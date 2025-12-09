import React, { FC, useState, useEffect, useMemo, useRef } from "react";
import { App, Button, Input, Tooltip, Typography, Space, Flex, Tag, Card, Divider } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useTranslations, useLocale } from "next-intl";
import { CONSTANT_BUTTONS, NEGATIVE_TEXT, colorArray } from "@/app/data/constants";
import { translateText } from "@/app/utils/translateAPI";
import { normalizeString } from "@/app/utils/normalizeString";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import { TagItem } from "./types";

const { Text } = Typography;

interface ResultSectionProps {
  selectedTags: TagItem[];
  setSelectedTags: (tags: TagItem[]) => void;
  tagsData: TagItem[];
}

const getRandomColor = () => colorArray[Math.floor(Math.random() * colorArray.length)];

// 归一化文本用于翻译比较：去除前后空格和尾部逗号
const normalizeForTranslation = (text: string) => text.trim().replace(/[,，]\s*$/, "");

const ResultSection: FC<ResultSectionProps> = ({ selectedTags = [], setSelectedTags, tagsData }) => {
  const { message } = App.useApp();
  const { copyToClipboard } = useCopyToClipboard();
  const t = useTranslations("ResultSection");
  const locale = useLocale(); // 获取当前页面语言
  const [resultText, setResultText] = useState("");
  const [translatedText, setTranslatedText] = useState(""); // 翻译后的文本
  const [isTranslating, setIsTranslating] = useState(false); // 翻译状态
  const [suggestedTags, setSuggestedTags] = useState<TagItem[]>([]);
  const [exactMatchTag, setExactMatchTag] = useState<TagItem | null>(null);
  const [inputText, setInputText] = useState("");
  const [isComposing, setIsComposing] = useState(false); // 中、日、韩输入法状态
  const lastTranslatedSource = useRef<string>(""); // 记录上次翻译的源文本

  // 自动翻译功能
  const autoTranslate = async (text: string) => {
    if (!text.trim()) {
      setTranslatedText("");
      return;
    }

    // 如果当前语言是英文，不需要翻译
    if (locale === "en") {
      setTranslatedText(text);
      return;
    }

    try {
      setIsTranslating(true);
      const translated = await translateText(text, "en", locale);
      setTranslatedText(translated);
      lastTranslatedSource.current = normalizeForTranslation(text); // 记录已翻译的源文本
    } catch (error) {
      console.warn("自动翻译失败:", error);
      setTranslatedText(""); // 翻译失败时清空翻译文本
    } finally {
      setIsTranslating(false);
    }
  };

  // 监听结果文本变化，自动翻译
  useEffect(() => {
    const normalizedText = normalizeForTranslation(resultText);
    // 空文本或与上次翻译相同的文本不触发翻译
    if (!normalizedText || normalizedText === lastTranslatedSource.current) return;

    const timeoutId = setTimeout(() => {
      autoTranslate(resultText);
    }, 5000); // 5s 防抖，避免频繁翻译

    return () => clearTimeout(timeoutId);
  }, [resultText, autoTranslate]);

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

  // 仅在文字输入时触发
  const handleResultTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  };

  // 仅在失去焦点时触发（直接选择标签不会触发）
  const handleBlur = () => {
    let replacedText = resultText
      .replace(/，/g, ", ")
      .replace(/\s+,\s*/g, ", ") //仅去除逗号前空格，避免组合标签被拆分
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
  };

  const handleSuggestTagClick = (tag: TagItem) => {
    // setIsComposing(false); // 强制结束当前的输入法状态，避免中文输入法兼容问题
    const newSelectedTags = [...selectedTags];
    if (newSelectedTags.length > 0) {
      newSelectedTags[newSelectedTags.length - 1] = tag;
    } else {
      newSelectedTags.push(tag);
    }

    setSelectedTags(newSelectedTags);
    setResultText(newSelectedTags.map((t) => t.displayName).join(", "));
  };

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

  // 推荐标签：随着输入的变化而变化
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
          // 如果完全匹配，则不包含在推荐列表中
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
    // 如果没有找到 displayName 的推荐标签，尝试用 langName 查找
    if (recommendedTags.length === 0) {
      recommendedTags = getRecommendedTags("langName");
    }

    // 否则显示最多 10 个推荐标签
    setSuggestedTags(recommendedTags.slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultText, tagsData]);

  // functions
  const handleConstantText = (constantText: string, successMessageKey: string) => {
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
  };

  const handleClear = () => {
    setSelectedTags([]);
    setResultText("");
    message.success(t("clearSuccess"));
  };

  const handleTranslate = async () => {
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
  };

  const handleColorReplace = () => {
    let updatedText = resultText;
    const combinedColorRegex = new RegExp(`\\b(${colorArray.join("|")})\\b`, "gi");
    const matches = updatedText.match(combinedColorRegex);
    if (matches && matches.length > 0) {
      updatedText = updatedText.replace(combinedColorRegex, (match) => {
        const newColor = getRandomColor();
        console.log(`Replacing ${match} with ${newColor}`);
        return newColor;
      });
      setResultText(updatedText);
      message.success(`Successfully replaced ${matches.length} color matches.`);
    } else {
      message.info("No color matches found to replace.");
    }
  };

  return (
    <Card variant="borderless" styles={{ body: { padding: 16 } }}>
      {/* Template prompts - all use Tag style */}
      <Flex gap="4px 8px" wrap align="center" style={{ marginBottom: 8 }}>
        {CONSTANT_BUTTONS.map(({ text, tooltipKey, promptKey }) => (
          <Tooltip key={tooltipKey} title={t(tooltipKey)}>
            <Tag color="blue" className="cursor-pointer" onClick={() => handleConstantText(text, "insertSuccess")} style={{ margin: 0 }}>
              {t(promptKey)}
            </Tag>
          </Tooltip>
        ))}
        <Tooltip title={t("tooltip-negative")}>
          <Tag color="default" className="cursor-pointer" onClick={() => copyToClipboard(NEGATIVE_TEXT, t("prompt-negative"))} style={{ margin: 0 }}>
            {t("prompt-negative")}
          </Tag>
        </Tooltip>
      </Flex>

      {/* Main prompt text area */}
      <Input.TextArea
        value={resultText}
        onChange={handleResultTextChange}
        onBlur={handleBlur}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        rows={10}
        spellCheck={false}
      />

      {/* Character count left, copy button right - close to textarea */}
      <Flex justify="space-between" align="center" style={{ marginTop: 4, marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {resultText.length} / 380
        </Text>
        <Button type="primary" size="small" onClick={() => copyToClipboard(resultText, t("prompt"))}>
          {t("button-copy")}
        </Button>
      </Flex>

      {/* Suggested tags with ellipsis + Tooltip */}
      <Flex gap="4px 4px" wrap>
        {exactMatchTag && (
          <Tooltip title={exactMatchTag.langName !== exactMatchTag.displayName ? `${exactMatchTag.langName} - ${exactMatchTag.displayName}` : exactMatchTag.displayName}>
            <Tag icon={<CheckCircleOutlined />} color="success" className="cursor-pointer" onClick={() => handleSuggestTagClick(exactMatchTag)}>
              <Text type="secondary" ellipsis style={{ maxWidth: 80, display: "inline-block", verticalAlign: "bottom" }}>
                {exactMatchTag.langName}
              </Text>
              <Text ellipsis style={{ marginLeft: 4, maxWidth: 120, display: "inline-block", verticalAlign: "bottom" }}>
                {exactMatchTag.displayName}
              </Text>
            </Tag>
          </Tooltip>
        )}
        {suggestedTags.map((tag, index) => {
          const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";
          return (
            <Tooltip key={index} title={tagLangName ? `${tagLangName} - ${tag.displayName}` : tag.displayName}>
              <Tag color="processing" className="cursor-pointer" onClick={() => handleSuggestTagClick(tag)}>
                {tagLangName && (
                  <Text type="secondary" ellipsis style={{ maxWidth: 80, display: "inline-block", verticalAlign: "bottom" }}>
                    {tagLangName}
                  </Text>
                )}
                <Text ellipsis style={{ marginLeft: tagLangName ? 4 : 0, maxWidth: 120, display: "inline-block", verticalAlign: "bottom" }}>
                  {tag.displayName}
                </Text>
              </Tag>
            </Tooltip>
          );
        })}
      </Flex>

      <Divider style={{ margin: "12px 0" }} />

      {/* Translate input */}
      <Tooltip title={t("tooltip-translate")}>
        <Space.Compact className="w-full" size="small">
          <Input value={inputText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)} onPressEnter={handleTranslate} placeholder={t("tooltip-translate")} />
          <Button onClick={handleTranslate}>{t("button-translate")}</Button>
        </Space.Compact>
      </Tooltip>

      {/* Auxiliary functions - use Tag style for consistency */}
      <Flex align="center" gap="4px 8px" wrap style={{ marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
          {t("label-auxiliary")}
        </Text>
        <Tooltip title={t("tooltip-randomColor")}>
          <Tag className="cursor-pointer" onClick={handleColorReplace} style={{ margin: 0 }}>
            {t("button-randomcolor")}
          </Tag>
        </Tooltip>
        <Tag color="error" className="cursor-pointer" onClick={handleClear} style={{ margin: 0 }}>
          {t("button-clear")}
        </Tag>
      </Flex>

      {/* Translation result area */}
      {locale !== "en" && translatedText && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
            {t("prompt-translation")}
          </Text>
          <Input.TextArea value={translatedText} readOnly rows={4} variant="filled" />
        </div>
      )}
    </Card>
  );
};

export default ResultSection;
