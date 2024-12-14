import React, { FC, useState, useEffect, useCallback } from "react";
import { Button, Input, message, Tooltip, Typography, Space, Flex, Tag } from "antd";
import { useTranslations } from "next-intl";
import { CONSTANT_TEXT_1, CONSTANT_TEXT_2, NEGATIVE_TEXT, colorArray } from "@/app/data/constants";
import { copyToClipboard } from "@/app/utils/copyToClipboard";
import { translateText } from "@/app/utils/translateAPI";
import { normalizeString } from "@/app/utils/normalizeString";
import { TagItem } from "./types";

const { Paragraph, Text } = Typography;

interface ResultSectionProps {
  selectedTags: TagItem[];
  setSelectedTags: (tags: TagItem[]) => void;
  tagsData: TagItem[];
}

const getRandomColor = () => {
  return colorArray[Math.floor(Math.random() * colorArray.length)];
};

const ResultSection: FC<ResultSectionProps> = ({ selectedTags = [], setSelectedTags, tagsData }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const t = useTranslations("ResultSection");
  const [resultText, setResultText] = useState(selectedTags.map((tag) => tag.displayName).join(", "));
  const [suggestedTags, setSuggestedTags] = useState<TagItem[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (!isComposing) {
      const newText = selectedTags
        .map((tag) => tag.displayName)
        .filter((displayName) => displayName && displayName.trim() !== "")
        .join(", ");
      setResultText(newText);
    }
  }, [selectedTags, isComposing]);

  const handleClear = useCallback(() => {
    setSelectedTags([]);
    setResultText("");
    messageApi.open({
      type: "success",
      content: t("clearSuccess"),
    });
  }, [setSelectedTags, t]);

  const findTagData = useCallback(
    (displayName: string) => {
      const normalizedDisplayName = normalizeString(displayName);
      let foundTag = tagsData.find((tag) => normalizeString(tag.displayName || "") === normalizedDisplayName);
      if (!foundTag) {
        const modifiedDisplayName = normalizedDisplayName.replace(/ /g, "_");
        foundTag = tagsData.find((tag) => normalizeString(tag.displayName || "") === modifiedDisplayName);
      }
      return (
        foundTag || {
          object: undefined,
          attribute: undefined,
          langName: undefined,
          displayName: undefined,
        }
      );
    },
    [tagsData]
  );

  const handleConstantText = useCallback(
    (constantText: string) => {
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
      messageApi.open({
        type: "success",
        content: t("insertSuccess"),
      });
    },
    [resultText, findTagData, setSelectedTags, t]
  );

  const handleResultTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let newText = e.target.value;

      if (newText.endsWith(",") || newText.endsWith("，")) {
        newText = newText.slice(0, -1) + ", ";
        setResultText(newText);
        return;
      }

      setResultText(newText);

      const newSelectedTags = newText
        .split(", ")
        .filter((displayName) => displayName && displayName.trim() !== "")
        .map((displayName) => {
          const { object, attribute, langName } = findTagData(displayName);
          return { object, displayName, attribute, langName };
        });
      setSelectedTags(newSelectedTags);
    },
    [findTagData, setSelectedTags]
  );

  const handleSuggestTagClick = (tag: TagItem) => {
    setIsComposing(false); // 强制结束当前的输入法状态，避免中文输入法兼容问题

    const newSelectedTags = [...selectedTags];
    if (newSelectedTags.length > 0) {
      newSelectedTags[newSelectedTags.length - 1] = tag;
    } else {
      newSelectedTags.push(tag);
    }

    setSelectedTags(newSelectedTags);
    setResultText(newSelectedTags.map((t) => t.displayName).join(", "));
  };

  const handleBlur = useCallback(() => {
    let replacedText = resultText
      .replace(/，/g, ", ")
      //.replace(/\s*,\s*/g, ", ") //避免组合标签被拆分
      .replace(/\s+/g, " ");

    const displayNames = replacedText.split(", ").filter((name) => name.trim() !== "");
    const uniqueDisplayNames = Array.from(new Set(displayNames.map((displayName) => normalizeString(displayName))));

    const uniqueSelectedTags = uniqueDisplayNames.map((displayName) => {
      const { object, attribute, langName, displayName: foundDisplayName } = findTagData(displayName);
      return {
        object,
        displayName: foundDisplayName || displayName,
        attribute,
        langName,
      };
    });

    const filteredSelectedTags = uniqueSelectedTags.filter((tag) => tag.displayName && tag.displayName.trim() !== "");

    setSelectedTags(filteredSelectedTags);

    const newText = filteredSelectedTags.map((tag) => tag.displayName).join(", ");
    setResultText(newText);
  }, [resultText, findTagData, setSelectedTags]);

  useEffect(() => {
    const lastTagName = normalizeString(resultText.split(", ").pop()?.trim() || "");
    if (lastTagName) {
      let recommendedTags = tagsData
        .filter((tag) => normalizeString(tag.displayName || "").includes(lastTagName))
        .sort((a, b) => {
          const aNormalized = normalizeString(a.displayName || "");
          const bNormalized = normalizeString(b.displayName || "");
          if (aNormalized.startsWith(lastTagName) && !bNormalized.startsWith(lastTagName)) {
            return -1;
          }
          if (!aNormalized.startsWith(lastTagName) && bNormalized.startsWith(lastTagName)) {
            return 1;
          }
          return aNormalized.localeCompare(bNormalized);
        });

      // 如果没有找到推荐标签，使用 langName 搜索
      if (recommendedTags.length === 0) {
        recommendedTags = tagsData
          .filter((tag) => normalizeString(tag.langName || "").includes(lastTagName))
          .sort((a, b) => {
            const aNormalized = normalizeString(a.langName || "");
            const bNormalized = normalizeString(b.langName || "");
            if (aNormalized.startsWith(lastTagName) && !bNormalized.startsWith(lastTagName)) {
              return -1;
            }
            if (!aNormalized.startsWith(lastTagName) && bNormalized.startsWith(lastTagName)) {
              return 1;
            }
            return aNormalized.localeCompare(bNormalized);
          });
      }

      // 只保留前 10 个最相关的标签
      recommendedTags = recommendedTags.slice(0, 10);
      setSuggestedTags(recommendedTags);
    } else {
      setSuggestedTags([]);
    }
  }, [resultText, tagsData]);

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false);
    handleResultTextChange(e as unknown as React.ChangeEvent<HTMLTextAreaElement>);
  };

  const handleTranslate = async () => {
    try {
      const translatedText = await translateText(inputText, "auto", "en");
      if (translatedText.trim()) {
        handleConstantText(translatedText);
        setInputText("");
        messageApi.open({
          type: "success",
          content: t("translateSuccess"),
        });
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
    updatedText = updatedText.replace(combinedColorRegex, (match) => {
      const newColor = getRandomColor();
      console.log(`Replacing ${match} with ${newColor}`);
      return newColor;
    });
    setResultText(updatedText);
  };

  return (
    <>
      {contextHolder}
      <Space wrap>
        {[
          {
            text: CONSTANT_TEXT_1,
            type: "primary",
            tooltipKey: "tooltip-light",
            promptKey: "prompt-light",
          },
          {
            text: CONSTANT_TEXT_2,
            type: "primary",
            tooltipKey: "tooltip-polish",
            promptKey: "prompt-polish",
          },
        ].map(({ text, type, tooltipKey, promptKey }) => (
          <Tooltip key={tooltipKey} title={t(tooltipKey)}>
            <Button type={type as "primary"} onClick={() => handleConstantText(text)}>
              {t(promptKey)}
            </Button>
          </Tooltip>
        ))}
        <Tooltip title={t("tooltip-negative")}>
          <Button type="dashed" onClick={() => copyToClipboard(NEGATIVE_TEXT, messageApi, t("copySuccess"), t("manualCopy"))}>
            {t("prompt-negative")}
          </Button>
        </Tooltip>
        <Button onClick={() => copyToClipboard(resultText, messageApi, t("copySuccess"), t("manualCopy"))}>{t("button-copy")}</Button>
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
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        rows={10}
        className="w-full mt-2 mb-5"
        style={{
          backgroundColor: "#333",
          color: "#d3d3d3",
        }}
      />
      <Flex gap="4px 0" wrap>
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
      <Space.Compact className="w-full mt-2">
        <Input value={inputText} onChange={(e) => setInputText(e.target.value)} onPressEnter={handleTranslate} placeholder={t("placeholder-translate")} />
        <Button type="primary" onClick={handleTranslate}>
          {t("button-translate")}
        </Button>
      </Space.Compact>
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
