import { useEffect, useRef, useState, type FC, type PropsWithChildren } from "react";
import { Button, Checkbox, Input, Flex, Space } from "antd";
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
  customTags: TagItem[];
  libraryId: string | null;
  libraryReady: boolean;
}

const PromptResults: FC<PropsWithChildren<ResultSectionProps>> = (props) => {
  const { copyToClipboard } = useCopyToClipboard();
  const locale = useLocale();
  const panelRef = useRef<HTMLElement>(null);
  const [fitsViewport, setFitsViewport] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const update = () => setFitsViewport(panel.getBoundingClientRect().height + 32 <= window.innerHeight);
    const observer = new ResizeObserver(update);
    observer.observe(panel);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const {
    resultText,
    translatedText,
    isAutoTranslating,
    autoTranslate,
    setAutoTranslate,
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
    <Flex ref={panelRef} vertical gap={16} className="pp-side" data-fits-viewport={fitsViewport}>
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
        {/* 超过建议长度时说明 380 是什么：计数器转珊瑚色是唯一信号，界面上却没
            任何地方交代 380 的含义，用户分不清「稍长」和「坏了」。触屏没有 hover，
            提示必须常驻可见，不能塞进 tooltip。 */}
        {resultText.length > PROMPT_SOFT_LIMIT && <p className="pp-count-hint">{t("promptLengthHint")}</p>}
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
        <p className="pp-translation-privacy">{t("translationPrivacy")}</p>
        {locale !== "en" && <Checkbox checked={autoTranslate} onChange={(e) => setAutoTranslate(e.target.checked)}>{t("autoTranslate")}</Checkbox>}
        <Space.Compact size="small" style={{ display: "flex", marginTop: 8 }}>
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

        <TranslationResult translatedText={translatedText} isTranslating={isAutoTranslating} isVisible={locale !== "en" && autoTranslate} t={t} />
      </div>
      {props.children}
    </Flex>
  );
};

export default PromptResults;
