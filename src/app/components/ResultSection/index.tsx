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
    // pp-side：桌面上整栏 sticky（见 globals.css），滚到已选/FAQ 时提示词仍在视野里
    <Flex vertical gap={16} className="pp-side">
      {/* tabIndex=-1：跳转链接的落点，锚点跳过来时焦点真的落在这里，
          下一次 Tab 就进输入框（只设 id 的话焦点还留在链接上） */}
      <div className="pp-mixer" id="pp-prompt" tabIndex={-1}>
        <div className="pp-mixer-head">
          <span className="pp-mixer-title">{t("prompt")}</span>
          {/* dir=ltr：阿拉伯语页面里「数字 / 数字」会被 bidi 整体翻转成 “380 / 0”，
              计数器读反 */}
          <span dir="ltr" className={`pp-count${resultText.length > PROMPT_SOFT_LIMIT ? " pp-count-over" : ""}`}>
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
            // 标题已写着「翻译并插入」，placeholder 再复述一遍功能是重复，且那句
            // 描述在窄栏里必被截断。改成举例示范用法；完整说明留给 aria-label。
            placeholder={t("placeholder-translate")}
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
