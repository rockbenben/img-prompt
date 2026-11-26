import { FC, ReactNode } from "react";
import { Input, Button, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";

interface TemplateAction {
  key: string;
  label?: string;
  icon?: ReactNode;
  tooltip?: string;
  ariaLabel?: string;
  onClick: () => void;
}

interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onFocus?: () => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  onCopy: () => void;
  onClear: () => void;
  templateActions?: TemplateAction[];
  negativeAction?: TemplateAction;
  suggestionsSlot?: ReactNode;
  t: (key: string) => string;
}

export const PromptInput: FC<PromptInputProps> = ({
  value,
  onChange,
  onBlur,
  onFocus,
  onCompositionStart,
  onCompositionEnd,
  onCopy,
  onClear,
  templateActions = [],
  negativeAction,
  suggestionsSlot,
  t,
}) => {
  const actionButton = (action: TemplateAction, opts?: { ghost?: boolean; extraIcon?: ReactNode }) => {
    const btn = (
      <Button
        key={action.key}
        size="small"
        className={opts?.ghost ? "pp-preset-btn pp-ghost" : "pp-preset-btn"}
        icon={action.icon ?? opts?.extraIcon}
        onClick={action.onClick}
        aria-label={action.ariaLabel}>
        {action.label}
      </Button>
    );
    return action.tooltip ? (
      <Tooltip key={action.key} title={action.tooltip}>
        {btn}
      </Tooltip>
    ) : (
      btn
    );
  };

  return (
    <>
      {/* dir=ltr：产出永远是英文 prompt。跟随页面 dir 时阿拉伯语下整段右对齐，
          且逗号/括号/权重数字会被 bidi 重排，显示顺序与复制出去的字符串不一致 */}
      <Input.TextArea
        dir="ltr"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        autoSize={{ minRows: 4, maxRows: 10 }}
        spellCheck={false}
        placeholder={t("placeholder-prompt")}
        aria-label={t("prompt")}
      />

      {suggestionsSlot}

      <div className="pp-presets">
        <span className="pp-presets-label">{t("quickPresets")}</span>
        <div className="pp-presets-list">
          {templateActions.map((action) => actionButton(action))}
          {negativeAction && actionButton(negativeAction, { ghost: true, extraIcon: <CopyOutlined /> })}
        </div>
      </div>

      <div className="pp-cta-row">
        <Button type="primary" className="pp-cta-copy" onClick={onCopy} icon={<CopyOutlined />}>
          {t("button-copy")}
        </Button>
        <Button className="pp-ghost" disabled={!value.trim()} onClick={onClear}>
          {t("button-clear")}
        </Button>
      </div>
    </>
  );
};
