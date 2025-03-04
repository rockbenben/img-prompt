import React, { FC, useState, useEffect, useCallback, useMemo } from "react";
import { Button, Input, message, Tooltip, Typography, Space, Flex, Tag } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { CONSTANT_BUTTONS, NEGATIVE_TEXT, colorArray } from "@/app/data/constants";
import { translateText } from "@/app/utils/translateAPI";
import { normalizeString } from "@/app/utils/normalizeString";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import { TagItem } from "./types";

const { Paragraph, Text } = Typography;

interface ResultSectionProps {
  selectedTags: TagItem[];
  setSelectedTags: (tags: TagItem[]) => void;
  tagsData: TagItem[];
}

const getRandomColor = () => colorArray[Math.floor(Math.random() * colorArray.length)];

const ResultSection: FC<ResultSectionProps> = ({ selectedTags = [], setSelectedTags, tagsData }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { copyToClipboard } = useCopyToClipboard();
  const t = useTranslations("ResultSection");
  const [resultText, setResultText] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<TagItem[]>([]);
  const [exactMatchTag, setExactMatchTag] = useState<TagItem | null>(null);
  const [inputText, setInputText] = useState("");
  const [isComposing, setIsComposing] = useState(false); // 中、日、韩输入法状态
  const { theme } = useTheme();

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
          object: undefined,
          attribute: undefined,
          langName: undefined,
          displayName: undefined,
        }
      );
    };
  }, [tagsData]);

  // 仅在文字输入时触发
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
    [findTagData, setSelectedTags]
  );

  // 仅在失去焦点时触发（直接选择标签不会触发）
  const handleBlur = useCallback(() => {
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
  }, [resultText, findTagData, setSelectedTags]);

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
  }, [resultText, tagsData]);

  // functions
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
      messageApi.success(t(successMessageKey));
    },
    [resultText, findTagData, setSelectedTags, t]
  );

  const handleClear = useCallback(() => {
    setSelectedTags([]);
    setResultText("");
    messageApi.open({
      type: "success",
      content: t("clearSuccess"),
    });
  }, [setSelectedTags, t]);

  const handleTranslate = async () => {
    try {
      const translatedText = await translateText(inputText, "auto", "en");
      if (translatedText.trim()) {
        handleConstantText(translatedText, "translateSuccess");
        setInputText("");
      } else {
        messageApi.open({
          type: "error",
          content: t("translateEmptyError"),
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: t("translateFailError"),
      });
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
      messageApi.open({
        type: "success",
        content: `Successfully replaced ${matches.length} color matches.`,
      });
    } else {
      messageApi.open({
        type: "info",
        content: "No color matches found to replace.",
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Space wrap>
        {CONSTANT_BUTTONS.map(({ text, type, tooltipKey, promptKey }) => (
          <Tooltip key={tooltipKey} title={t(tooltipKey)}>
            <Button type={type as "primary"} onClick={() => handleConstantText(text, "insertSuccess")}>
              {t(promptKey)}
            </Button>
          </Tooltip>
        ))}
        <Tooltip title={t("tooltip-negative")}>
          <Button type="dashed" onClick={() => copyToClipboard(NEGATIVE_TEXT, messageApi, t("prompt-negative"))}>
            {t("prompt-negative")}
          </Button>
        </Tooltip>
        <Button onClick={() => copyToClipboard(resultText, messageApi, t("prompt"))}>{t("button-copy")}</Button>
        <Button danger onClick={handleClear}>
          {t("button-clear")}
        </Button>
      </Space>
      <Input.TextArea
        value={resultText}
        count={{
          show: true,
          max: 380,
        }}
        onChange={handleResultTextChange}
        onBlur={handleBlur}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        rows={10}
        className={`w-full mt-2 mb-5 ${theme === "light" ? "bg-gray-50 text-gray-600" : "bg-gray-800 text-gray-300"}`}
      />
      <Flex gap="4px 0" wrap>
        {exactMatchTag && (
          <Tag icon={<CheckCircleOutlined />} color="success" style={{ pointerEvents: "none" }}>
            <Text ellipsis={{ tooltip: exactMatchTag.displayName }} className="max-w-[200px] truncate">
              {exactMatchTag.displayName}
            </Text>
            <Text type="secondary" className="ml-1">
              {exactMatchTag.langName}{" "}
            </Text>
          </Tag>
        )}
        {suggestedTags.map((tag, index) => {
          const tagLangName = normalizeString(tag.langName) !== normalizeString(tag.displayName) ? tag.langName : "";
          return (
            <Tag key={index} color="processing" className="cursor-pointer" onClick={() => handleSuggestTagClick(tag)}>
              <Text ellipsis={{ tooltip: tag.displayName }} className="max-w-[200px] truncate">
                {tag.displayName}
              </Text>
              <Text type="secondary" className="ml-1">
                {tagLangName}
              </Text>
            </Tag>
          );
        })}
      </Flex>

      <Tooltip title={t("tooltip-translate")}>
        <Space.Compact className="w-full mt-2">
          <Input value={inputText} onChange={(e) => setInputText(e.target.value)} onPressEnter={handleTranslate} placeholder={t("tooltip-translate")} />
          <Button type="primary" onClick={handleTranslate}>
            {t("button-translate")}
          </Button>
        </Space.Compact>
      </Tooltip>
      <Paragraph type="secondary" className="mt-2">
        {t("title-other")}
      </Paragraph>
      <Tooltip title={t("tooltip-randomColor")}>
        <Button onClick={handleColorReplace}>{t("button-randomcolor")}</Button>
      </Tooltip>
    </>
  );
};

export default ResultSection;
