import { FC } from "react";
import { Input, Button, Flex, Typography } from "antd";

const { Text } = Typography;

interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  onCopy: () => void;
  onClear: () => void;
  t: (key: string) => string;
}

export const PromptInput: FC<PromptInputProps> = ({ value, onChange, onBlur, onCompositionStart, onCompositionEnd, onCopy, onClear, t }) => {
  return (
    <>
      <Input.TextArea
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        rows={10}
        spellCheck={false}
        aria-label={t("prompt")}
      />

      <Flex justify="space-between" align="center" style={{ marginTop: 4, marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {value.length} / 380
        </Text>
        <Flex gap={8}>
          <Button danger onClick={onClear}>
            {t("button-clear")}
          </Button>
          <Button type="primary" onClick={onCopy}>
            {t("button-copy")}
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
