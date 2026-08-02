import { FC } from "react";
import { Button, Input, Flex, Space } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";
import { useLocale } from "next-intl";
import { CONSTANT_BUTTONS, NEGATIVE_TEXT } from "@/app/data/constants";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import { TagItem } from "../types";
import { usePromptLogic } from "./usePromptLogic";
import { PromptInput } from "./PromptInput";
import { TagSuggestions } from "./TagSuggestions";
import { TranslationResult } from "./TranslationResult";

// 建议长度而非硬上限：多数模型对超长提示词的后段权重骤降。
// 越过只提示、不阻断输入。
const PROMPT_SOFT_LIMIT = 380;

interface ResultSectionProps {
  selectedTags: TagItem[];
  setSelectedTags: (tags: TagItem[]) => void;
  firstChunk: TagItem[];
  objectCount: number;
}

const PromptResults: FC<ResultSectionProps> = (props) => {
  const { copyToClipboard } = useCopyToClipboard();
  const locale = useLocale();

  const {
    resultText,
    translatedText,
    isAutoTranslating,
    isManualTranslating,
    suggestedTags,
    exactMatchTag,
    setIsComposing,
    handleResultTextChange,
    handleBlur,
    handleFocus,
    handleSuggestTagClick,
    handleConstantText,
    handleClear,
    handleColorReplace,
    t,
    inputText,
    setInputText,
    handleTranslate,
  } = usePromptLogic(props);

  const templateActions = [
    ...CONSTANT_BUTTONS.map(({ text, tooltipKey, promptKey }) => ({
      key: promptKey,
      label: t(promptKey),
      tooltip: t(tooltipKey),
      onClick: () => handleConstantText(text, "insertSuccess"),
    })),
    {
      key: "randomColor",
      icon: <BgColorsOutlined />,
      tooltip: t("tooltip-randomColor"),
      ariaLabel: t("button-randomcolor"),
      onClick: handleColorReplace,
    },
  ];

  const negativeAction = {
    key: "negative",
    label: t("prompt-negative"),
    tooltip: t("tooltip-negative"),
    onClick: () => copyToClipboard(NEGATIVE_TEXT, t("prompt-negative")),
  };

  return (
    <Flex vertical gap={16}>
      <div className="pp-mixer">
        <div className="pp-mixer-head">
          <span className="pp-mixer-title">{t("prompt")}</span>
          <span className={`pp-count${resultText.length > PROMPT_SOFT_LIMIT ? " pp-count-over" : ""}`}>
            <b>{resultText.length}</b> / {PROMPT_SOFT_LIMIT}
          </span>
        </div>
        <PromptInput
          value={resultText}
          onChange={handleResultTextChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onCopy={() => copyToClipboard(resultText, t("prompt"))}
          onClear={handleClear}
          templateActions={templateActions}
          negativeAction={negativeAction}
          t={t}
        />
        <TagSuggestions suggestedTags={suggestedTags} exactMatchTag={exactMatchTag} onTagClick={handleSuggestTagClick} />
      </div>

      <div className="pp-tray pp-tray-translate">
        <div className="pp-tray-label">
          <span className="pp-swatch" aria-hidden="true" />
          {t("translateLabel")}
        </div>
        <Space.Compact size="small" style={{ display: "flex" }}>
          <Input
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
            onPressEnter={handleTranslate}
            placeholder={t("tooltip-translate")}
            aria-label={t("tooltip-translate")}
            disabled={isManualTranslating}
          />
          <Button type="primary" onClick={handleTranslate} loading={isManualTranslating}>
            {t("button-translate")}
          </Button>
        </Space.Compact>

        <TranslationResult translatedText={translatedText} isTranslating={isAutoTranslating} isVisible={locale !== "en"} t={t} />
      </div>
    </Flex>
  );
};

export default PromptResults;
