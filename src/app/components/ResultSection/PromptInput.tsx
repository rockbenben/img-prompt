import { FC, ReactNode } from "react";
import { Input, Button, Flex, Tooltip } from "antd";
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
  t,
}) => {
  const actionButton = (action: TemplateAction, opts?: { ghost?: boolean; extraIcon?: ReactNode }) => {
    const btn = (
      <Button
        key={action.key}
        size="small"
        className={opts?.ghost ? "pp-ghost" : undefined}
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
      <Input.TextArea
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        autoSize={{ minRows: 5, maxRows: 14 }}
        spellCheck={false}
        aria-label={t("prompt")}
      />

      {/* 模板插入/随机颜色 = 白色药丸；负面词/清空 = 安静 ghost（与设计稿层级一致） */}
      <Flex wrap gap={7} style={{ marginTop: 10 }}>
        {templateActions.map((action) => actionButton(action))}
        {negativeAction && actionButton(negativeAction, { ghost: true, extraIcon: <CopyOutlined /> })}
        <Button size="small" className="pp-ghost" onClick={onClear}>
          {t("button-clear")}
        </Button>
      </Flex>

      {/* 主 CTA：复制 —— 整宽蛋黄按钮 */}
      <Button block type="primary" onClick={onCopy} style={{ marginTop: 12 }} icon={<CopyOutlined />}>
        {t("button-copy")}
      </Button>
    </>
  );
};
