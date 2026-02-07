import { FC } from "react";
import { Button, Input, Tooltip, Tag, Flex, Card, Divider, Space, Typography } from "antd";
import { useLocale } from "next-intl";
import { CONSTANT_BUTTONS, NEGATIVE_TEXT } from "@/app/data/constants";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import { TagItem } from "../types";
import { usePromptLogic } from "./usePromptLogic";
import { PromptInput } from "./PromptInput";
import { TagSuggestions } from "./TagSuggestions";
import { TranslationResult } from "./TranslationResult";

const { Text } = Typography;

interface ResultSectionProps {
  selectedTags: TagItem[];
  setSelectedTags: (tags: TagItem[]) => void;
  tagsData: TagItem[];
}

const PromptResults: FC<ResultSectionProps> = (props) => {
  const { copyToClipboard } = useCopyToClipboard();
  const locale = useLocale();

  const {
    resultText,
    setResultText, // Exposed mostly for manual overrides if needed, but logic handles it
    translatedText,
    // isTranslating, unused in UI currently but available
    suggestedTags,
    exactMatchTag,
    // isComposing, Internal
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
  } = usePromptLogic(props);

  return (
    <Card variant="borderless" styles={{ body: { padding: 16 } }}>
      {/* Template prompts */}
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

      {/* Main Prompt Input */}
      <PromptInput
        value={resultText}
        onChange={handleResultTextChange}
        onBlur={handleBlur}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onCopy={() => copyToClipboard(resultText, t("prompt"))}
        onClear={handleClear}
        t={t}
      />

      {/* Tag Suggestions */}
      <TagSuggestions suggestedTags={suggestedTags} exactMatchTag={exactMatchTag} onTagClick={handleSuggestTagClick} />

      <Divider style={{ margin: "12px 0" }} />

      {/* Manual Translation Input */}
      <Tooltip title={t("tooltip-translate")}>
        <Space.Compact className="w-full" size="small">
          <Input
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
            onPressEnter={handleTranslate}
            placeholder={t("tooltip-translate")}
            aria-label={t("tooltip-translate")}
          />
          <Button onClick={handleTranslate}>{t("button-translate")}</Button>
        </Space.Compact>
      </Tooltip>

      {/* Auxiliary Actions */}
      <Flex align="center" gap="4px 8px" wrap style={{ marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
          {t("label-auxiliary")}
        </Text>
        <Tooltip title={t("tooltip-randomColor")}>
          <Tag className="cursor-pointer" onClick={handleColorReplace} style={{ margin: 0 }}>
            {t("button-randomcolor")}
          </Tag>
        </Tooltip>
      </Flex>

      {/* Logic-based Translation Result */}
      <TranslationResult translatedText={translatedText} isVisible={locale !== "en"} t={t} />
    </Card>
  );
};

export default PromptResults;
