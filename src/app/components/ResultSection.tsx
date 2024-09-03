import React, { FC, useState, useEffect, useCallback } from "react";
import { Button, Input, message, Tooltip, Typography, Space, Flex, Tag } from "antd";
import { copyToClipboard } from "./copyToClipboard";
import { translateText } from "./translateAPI";
import { CONSTANT_TEXT_1, CONSTANT_TEXT_2, NEGATIVE_TEXT, TIPS_TEXT_1, TIPS_TEXT_2, colorArray } from "../constants";

interface Tag {
  attribute: string | undefined;
  displayName: string | undefined;
  langName: string | undefined;
  object: string | undefined;
}

interface ResultSectionProps {
  selectedTags: Tag[];
  setSelectedTags: (tags: Tag[]) => void;
  tagsData: Tag[];
}

const normalizeText = (text: string) => {
  return text.toLowerCase().replace(/[_-\s]+/g, " ");
};

const getRandomColor = () => {
  return colorArray[Math.floor(Math.random() * colorArray.length)];
};

const ResultSection: FC<ResultSectionProps> = ({ selectedTags = [], setSelectedTags, tagsData }) => {
  const [resultText, setResultText] = useState(selectedTags.map((tag) => tag.displayName).join(", "));
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
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
    message.success("已清空提示词框");
  }, [setSelectedTags]);

  const findTagData = useCallback(
    (displayName: string) => {
      const normalizedDisplayName = normalizeText(displayName);
      let foundTag = tagsData.find((tag) => normalizeText(tag.displayName || "") === normalizedDisplayName);
      if (!foundTag) {
        const modifiedDisplayName = normalizedDisplayName.replace(/ /g, "_");
        foundTag = tagsData.find((tag) => normalizeText(tag.displayName || "") === modifiedDisplayName);
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
      message.success("已插入指定描述");
    },
    [resultText, findTagData, setSelectedTags]
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

  const handleSuggestTagClick = (tag: Tag) => {
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
    const uniqueDisplayNames = Array.from(new Set(displayNames.map((displayName) => normalizeText(displayName))));

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
    const lastTagName = normalizeText(resultText.split(", ").pop()?.trim() || "");
    if (lastTagName) {
      let recommendedTags = tagsData
        .filter((tag) => normalizeText(tag.displayName || "").includes(lastTagName))
        .sort((a, b) => {
          const aNormalized = normalizeText(a.displayName || "");
          const bNormalized = normalizeText(b.displayName || "");
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
          .filter((tag) => normalizeText(tag.langName || "").includes(lastTagName))
          .sort((a, b) => {
            const aNormalized = normalizeText(a.langName || "");
            const bNormalized = normalizeText(b.langName || "");
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
        message.success("翻译成功并添加到提示词框中");
      } else {
        message.error("翻译内容为空");
      }
    } catch (error) {
      message.error("翻译失败，请重试");
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
      <Space wrap>
        <Tooltip title="插入肖像常用光线">
          <Button type="primary" onClick={() => handleConstantText(CONSTANT_TEXT_1)}>
            肖像光线
          </Button>
        </Tooltip>
        <Tooltip title="插入常用图像润色词">
          <Button type="primary" onClick={() => handleConstantText(CONSTANT_TEXT_2)}>
            常用润色
          </Button>
        </Tooltip>
        <Tooltip title="复制 Negative prompt 常用否定提示词">
          <Button type="dashed" onClick={() => copyToClipboard(NEGATIVE_TEXT, "常用否定提示词")}>
            否定提示
          </Button>
        </Tooltip>
        <Button onClick={() => copyToClipboard(resultText, "结果提示词")}>复制结果</Button>
        <Button danger onClick={handleClear}>
          清空
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
        style={{ backgroundColor: "#333", color: "#d3d3d3" }}
      />
      <Flex gap="4px 0" wrap>
        {suggestedTags.map((tag, index) => (
          <Tag
            key={index}
            onMouseEnter={(e) => {
              e.currentTarget.style.cursor = "pointer";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.cursor = "default";
            }}
            onClick={() => handleSuggestTagClick(tag)}>
            {tag.displayName?.length > 20 ? tag.displayName.slice(0, 40) + "..." : tag.displayName} ({tag.langName})
          </Tag>
        ))}
      </Flex>
      <Space.Compact style={{ width: "100%" }}>
        <Input value={inputText} onChange={(e) => setInputText(e.target.value)} onPressEnter={handleTranslate} placeholder="输入要翻译的文本" />
        <Button type="primary" onClick={handleTranslate}>
          翻译
        </Button>
      </Space.Compact>
      <Typography.Paragraph style={{ color: "#b0b0b0" }} className="mt-2">
        {TIPS_TEXT_1}
        <br />
        {TIPS_TEXT_2}
      </Typography.Paragraph>
      <Tooltip title="随机替换描述中的颜色">
        <Button onClick={handleColorReplace}>随机换色</Button>
      </Tooltip>
    </>
  );
};

export default ResultSection;
