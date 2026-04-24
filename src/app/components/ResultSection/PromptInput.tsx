import { FC } from "react";
import { Input, Button, Flex, Tooltip, Typography } from "antd";

const { Text } = Typography;

interface TemplateAction {
  key: string;
  label: string;
  tooltip?: string;
  onClick: () => void;
}

interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
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
  onCompositionStart,
  onCompositionEnd,
  onCopy,
  onClear,
  templateActions = [],
  negativeAction,
  t,
}) => {
  return (
    <>
      <Input.TextArea
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        autoSize={{ minRows: 6, maxRows: 14 }}
        spellCheck={false}
        aria-label={t("prompt")}
      />

      <Flex justify="space-between" align="center" gap={8} wrap style={{ marginTop: 6, marginBottom: 8 }}>
        <Flex align="center" gap={6} wrap>
          {value.length > 0 && (
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
              {value.length} / 380
            </Text>
          )}
          {templateActions.map((action) => {
            const btn = (
              <Button key={action.key} size="small" onClick={action.onClick}>
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
          })}
        </Flex>
        <Flex gap={8}>
          <Button size="small" onClick={onClear}>
            {t("button-clear")}
          </Button>
          <Button size="small" type="primary" onClick={onCopy}>
            {t("button-copy")}
          </Button>
        </Flex>
      </Flex>

      {negativeAction &&
        (negativeAction.tooltip ? (
          <Tooltip title={negativeAction.tooltip}>
            <Button size="small" block onClick={negativeAction.onClick}>
              {negativeAction.label}
            </Button>
          </Tooltip>
        ) : (
          <Button size="small" block onClick={negativeAction.onClick}>
            {negativeAction.label}
          </Button>
        ))}
    </>
  );
};
