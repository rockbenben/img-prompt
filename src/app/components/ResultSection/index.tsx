import { FC } from "react";
import { Button, Input, Tooltip, Flex, Card, Space } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";
import { useLocale } from "next-intl";
import { CONSTANT_BUTTONS, NEGATIVE_TEXT } from "@/app/data/constants";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import { TagItem } from "../types";
import { usePromptLogic } from "./usePromptLogic";
import { PromptInput } from "./PromptInput";
import { TagSuggestions } from "./TagSuggestions";
import { TranslationResult } from "./TranslationResult";

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
    translatedText,
    isTranslating,
    suggestedTags,
    exactMatchTag,
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

  const templateActions = CONSTANT_BUTTONS.map(({ text, tooltipKey, promptKey }) => ({
    key: promptKey,
    label: t(promptKey),
    tooltip: t(tooltipKey),
    onClick: () => handleConstantText(text, "insertSuccess"),
  }));

  const negativeAction = {
    key: "negative",
    label: t("prompt-negative"),
    tooltip: t("tooltip-negative"),
    onClick: () => copyToClipboard(NEGATIVE_TEXT, t("prompt-negative")),
  };

  return (
    <Card variant="outlined" styles={{ body: { padding: 16 } }}>
      {/* Main Prompt Input + inline template actions + negative row */}
      <PromptInput
        value={resultText}
        onChange={handleResultTextChange}
        onBlur={handleBlur}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onCopy={() => copyToClipboard(resultText, t("prompt"))}
        onClear={handleClear}
        templateActions={templateActions}
        negativeAction={negativeAction}
        t={t}
      />

      {/* Tag Suggestions */}
      <TagSuggestions suggestedTags={suggestedTags} exactMatchTag={exactMatchTag} onTagClick={handleSuggestTagClick} />

      {/* Manual Translation Input + inline aux (Random Color) */}
      <Flex gap={6} align="center" style={{ marginTop: 12 }}>
        <Space.Compact size="small" style={{ flex: 1, minWidth: 0 }}>
          <Input
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
            onPressEnter={handleTranslate}
            placeholder={t("tooltip-translate")}
            aria-label={t("tooltip-translate")}
            disabled={isTranslating}
          />
          <Button onClick={handleTranslate} loading={isTranslating}>
            {t("button-translate")}
          </Button>
        </Space.Compact>
        <Tooltip title={t("tooltip-randomColor")}>
          <Button size="small" icon={<BgColorsOutlined />} onClick={handleColorReplace} aria-label={t("button-randomcolor")} />
        </Tooltip>
      </Flex>

      {/* Logic-based Translation Result */}
      <TranslationResult translatedText={translatedText} isTranslating={isTranslating} isVisible={locale !== "en"} t={t} />
    </Card>
  );
};

export default PromptResults;
