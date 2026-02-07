import { FC } from "react";
import { Input, Typography } from "antd";

const { Text } = Typography;

interface TranslationResultProps {
  translatedText: string;
  isVisible: boolean;
  t: (key: string) => string;
}

export const TranslationResult: FC<TranslationResultProps> = ({ translatedText, isVisible, t }) => {
  if (!isVisible || !translatedText) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
        {t("prompt-translation")}
      </Text>
      <Input.TextArea value={translatedText} readOnly rows={4} variant="filled" aria-label={t("prompt-translation")} />
    </div>
  );
};
