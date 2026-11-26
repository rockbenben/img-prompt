import { type Dispatch, type FC, type PropsWithChildren, type SetStateAction, useEffect, useRef, useState } from "react";
import { Button, Checkbox, Collapse, Input, Space } from "antd";
import { BgColorsOutlined, CopyOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import { CONSTANT_BUTTONS, NEGATIVE_TEXT } from "@/app/data/constants";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import { type UseFullTagsDataResult } from "@/app/hooks/useFullTagsData";
import SelectedTagsSection from "../SelectedTagsSection";
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
  setSelectedTags: Dispatch<SetStateAction<TagItem[]>>;
  onRemoveTag: (tag: TagItem) => void;
  fullTags: Pick<UseFullTagsDataResult, "scanEntries" | "findTagData" | "ensureLoaded">;
  customTags: TagItem[];
  libraryId: string | null;
  libraryReady: boolean;
  hasLibrary: boolean;
}

const PromptResults: FC<PropsWithChildren<ResultSectionProps>> = (props) => {
  const { copyToClipboard } = useCopyToClipboard();
  const locale = useLocale();
  const tTool = useTranslations("ToolPage");

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
  } = usePromptLogic({
    selectedTags: props.selectedTags,
    setSelectedTags: props.setSelectedTags,
    fullTags: props.fullTags,
    customTags: props.customTags,
    libraryId: props.libraryId,
    libraryReady: props.libraryReady,
  });

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

  const isOverLimit = resultText.length > PROMPT_SOFT_LIMIT;
  const lengthRatio = Math.min(100, (resultText.length / PROMPT_SOFT_LIMIT) * 100);
  const hasPrompt = resultText.trim().length > 0 || props.selectedTags.length > 0;
  const panelRef = useRef<HTMLElement>(null);
  const [isBeforeEditor, setIsBeforeEditor] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    // 编辑区进入视野后使用编辑区自己的复制按钮，也避免遮挡下方的 FAQ 和页脚。
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.rootBounds) setIsBeforeEditor(panel.getBoundingClientRect().top > entry.rootBounds.bottom);
    }, { rootMargin: "0px 0px -80px" });
    observer.observe(panel);
    // 回顶可能一次跨过整个编辑区，工作台重新进入视野时也需要同步。
    const workbench = panel.closest(".pp-workbench");
    if (workbench) observer.observe(workbench);
    return () => observer.disconnect();
  }, []);

  const toolItems = [
    {
      key: "translate",
      label: (
        <span className="pp-tool-label">
          <span>{t("translateLabel")}</span>
          {autoTranslate && <span className="pp-tool-dot" aria-hidden="true" />}
        </span>
      ),
      children: (
        <div>
          <p className="pp-translation-privacy">{t("translationPrivacy")}</p>
          {locale !== "en" && (
            <Checkbox checked={autoTranslate} onChange={(e) => setAutoTranslate(e.target.checked)}>
              {t("autoTranslate")}
            </Checkbox>
          )}
          <Space.Compact size="small" style={{ display: "flex", marginTop: 8 }}>
            <Input
              value={inputText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
              onPressEnter={handleTranslate}
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
      ),
    },
    {
      key: "library",
      label: (
        <span className="pp-tool-label">
          <span>{t("localLibraryLabel")}</span>
          {props.hasLibrary && <span className="pp-tool-dot" aria-hidden="true" />}
        </span>
      ),
      children: props.children,
    },
  ];

  return (
    <>
      <aside ref={panelRef} className="pp-workbench-panel" id="pp-prompt" tabIndex={-1} aria-label={t("prompt")}>
        <div className="pp-mixer-head">
          <span className="pp-mixer-title">
            <span className="pp-live-dot" aria-hidden="true" />
            {t("prompt")}
          </span>
          {/* dir=ltr：阿拉伯语页面里「数字 / 数字」会被 bidi 整体翻转 */}
          <span dir="ltr" className={`pp-count${isOverLimit ? " pp-count-over" : ""}`}>
            <b>{resultText.length}</b> / {PROMPT_SOFT_LIMIT}
          </span>
        </div>
        <div className="pp-length-track" aria-hidden="true">
          <div className={`pp-length-bar${isOverLimit ? " is-over" : ""}`} style={{ width: `${lengthRatio}%` }} />
        </div>
        {isOverLimit && <p className="pp-count-hint">{t("promptLengthHint")}</p>}

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
          suggestionsSlot={<TagSuggestions suggestedTags={suggestedTags} exactMatchTag={exactMatchTag} onTagClick={handleSuggestTagClick} />}
          t={t}
        />

        <div className="pp-panel-divider" />

        <SelectedTagsSection selectedTags={props.selectedTags} onTagClick={props.onRemoveTag} />

        <div className="pp-panel-divider" />

        <Collapse ghost size="small" className="pp-tools-collapse" defaultActiveKey={[]} items={toolItems} />
      </aside>

      {hasPrompt && isBeforeEditor && (
        <div className="pp-mobile-dock" role="region" aria-label={t("prompt")}>
          <div className="pp-mobile-dock-info">
            <span className="pp-mobile-dock-count">
              <span className="pp-mobile-dock-label">{tTool("currentSelection")} </span><b>{props.selectedTags.length}</b>
            </span>
            <span dir="ltr" className={`pp-count${isOverLimit ? " pp-count-over" : ""}`}>
              <b>{resultText.length}</b>/{PROMPT_SOFT_LIMIT}
            </span>
          </div>
          <div className="pp-mobile-dock-actions">
            <Button
              onClick={() => {
                const el = panelRef.current;
                el?.scrollIntoView({ block: "start" });
                el?.focus({ preventScroll: true });
              }}>
              {tTool("viewPrompt")}
            </Button>
            <Button type="primary" icon={<CopyOutlined />} onClick={() => copyToClipboard(resultText, t("prompt"))}>
              {t("button-copy")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default PromptResults;
